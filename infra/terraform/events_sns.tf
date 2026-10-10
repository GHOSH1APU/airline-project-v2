# ==========================================
# 1. SNS TOPIC (The Publisher)
# ==========================================
resource "aws_sns_topic" "flight_searched" {
  name = "airline-flight-searched-topic"

  tags = {
    Environment = "demo"
    Terraform   = "true"
  }
}

# ==========================================
# 2. SQS QUEUE (The Consumer)
# ==========================================
resource "aws_sqs_queue" "flight_searched_queue" {
  name = "airline-flight-searched-queue"

  tags = {
    Environment = "demo"
    Terraform   = "true"
  }
}

# ==========================================
# 3. SUBSCRIBE SQS TO SNS
# ==========================================
resource "aws_sns_topic_subscription" "flight_searched_sqs_target" {
  topic_arn = aws_sns_topic.flight_searched.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.flight_searched_queue.arn
}

# ==========================================
# 4. SQS POLICY (Allow SNS to send messages)
# ==========================================
resource "aws_sqs_queue_policy" "flight_searched_queue_policy" {
  queue_url = aws_sqs_queue.flight_searched_queue.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "sns.amazonaws.com" }
        Action    = "sqs:SendMessage"
        Resource  = aws_sqs_queue.flight_searched_queue.arn
        Condition = {
          ArnEquals = { "aws:SourceArn" = aws_sns_topic.flight_searched.arn }
        }
      }
    ]
  })
}

# ==========================================
# OUTPUTS
# ==========================================
output "sns_topic_arn" {
  value = aws_sns_topic.flight_searched.arn
}
output "sqs_queue_url" {
  value = aws_sqs_queue.flight_searched_queue.url
}
