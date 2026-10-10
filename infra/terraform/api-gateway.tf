resource "aws_acm_certificate" "api_cert" {
  domain_name       = "api.ghoshsourav21.in"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# Automatically create the DNS validation records in Route 53
resource "aws_route53_record" "api_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.api_cert.domain_validation_options : dvo.domain_name => {
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

resource "aws_acm_certificate_validation" "api_cert_validation" {
  certificate_arn         = aws_acm_certificate.api_cert.arn
  validation_record_fqdns = [for record in aws_route53_record.api_cert_validation : record.fqdn]
}

resource "aws_route53_record" "api_cname" {
  zone_id = "Z09267793GT7PXEHU3V1M"
  name    = "api.ghoshsourav21.in"
  type    = "CNAME"
  ttl     = 300
  records = ["k8s-default-airlinea-d84bb14895-524730163.us-east-1.elb.amazonaws.com"]
}
