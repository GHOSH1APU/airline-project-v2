resource "random_id" "suffix" {
  byte_length = 4
}

resource "aws_acm_certificate" "frontend_cert" {
  domain_name       = "www.ghoshsourav21.in"
  validation_method = "DNS"
  lifecycle { create_before_destroy = true }
}

resource "aws_route53_record" "frontend_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.frontend_cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }
  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = "Z09267793GT7PXEHU3V1M" 
}

resource "aws_acm_certificate_validation" "frontend_cert_validation" {
  certificate_arn         = aws_acm_certificate.frontend_cert.arn
  validation_record_fqdns = [for record in aws_route53_record.frontend_cert_validation : record.fqdn]
}

resource "aws_s3_bucket" "frontend_bucket" {
  bucket = "airline-frontend-app-${random_id.suffix.hex}"
}

resource "aws_s3_bucket_public_access_block" "frontend_public_block" {
  bucket                  = aws_s3_bucket.frontend_bucket.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "airline-frontend-oac-${random_id.suffix.hex}"
  description                       = "OAC for S3 frontend"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_function" "geo_detector" {
  name    = "geo-location-edge-${random_id.suffix.hex}"
  runtime = "cloudfront-js-2.0"
  comment = "Redirects users to country-specific paths natively"
  publish = true
  code    = <<EOF
function handler(event) {
    var request = event.request;
    var uri = request.uri;
    
    // Only redirect if user hits the root URL (/)
    if (uri === '/' || uri === '/index.html') {
        var headers = request.headers;
        
        // Now CloudFront will properly pass these headers!
        var country = headers['cloudfront-viewer-country'] ? headers['cloudfront-viewer-country'].value : 'US';
        var region = headers['cloudfront-viewer-country-region'] ? headers['cloudfront-viewer-country-region'].value : 'Unknown';
        
        var map = { 'IN':'in', 'BD':'bd', 'ES':'es', 'FR':'fr', 'JP':'jp', 'US':'us', 'GB':'uk' };
        var localeCode = map[country] || 'us';
        
        // Custom logic for West Bengal
        if (country === 'IN' && region === 'WB') {
            localeCode = 'bd';
        }
        
        return {
            statusCode: 302,
            statusDescription: 'Found',
            headers: {
                'location': { value: '/' + localeCode + '/' },
                'cache-control': { value: 'no-cache, no-store, must-revalidate' }
            }
        };
    }
    
    return request;
}
EOF
}

resource "aws_cloudfront_distribution" "frontend_cdn" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  aliases             = ["www.ghoshsourav21.in"] 

  origin {
    domain_name              = aws_s3_bucket.frontend_bucket.bucket_regional_domain_name
    origin_id                = "S3-Frontend"
    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-Frontend"
    
    forwarded_values {
      query_string = false
      # 🔥 THE FIX: Whitelisting the Geo-headers so the Edge Function can read them
      headers      = ["CloudFront-Viewer-Country", "CloudFront-Viewer-Country-Region"]
      cookies { forward = "none" }
    }
    
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.geo_detector.arn
    }
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }
  
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.frontend_cert_validation.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

resource "aws_s3_bucket_policy" "frontend_policy" {
  bucket = aws_s3_bucket.frontend_bucket.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action   = "s3:GetObject"
      Effect   = "Allow"
      Resource = "${aws_s3_bucket.frontend_bucket.arn}/*"
      Principal = { Service = "cloudfront.amazonaws.com" }
      Condition = {
        StringEquals = { "AWS:SourceArn" = aws_cloudfront_distribution.frontend_cdn.arn }
      }
    }]
  })
}

resource "aws_route53_record" "frontend_dns" {
  zone_id = "Z09267793GT7PXEHU3V1M" 
  name    = "www.ghoshsourav21.in"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.frontend_cdn.domain_name
    zone_id                = aws_cloudfront_distribution.frontend_cdn.hosted_zone_id
    evaluate_target_health = false
  }
}

output "frontend_bucket_name" { value = aws_s3_bucket.frontend_bucket.bucket }
output "cloudfront_distribution_id" { value = aws_cloudfront_distribution.frontend_cdn.id }

