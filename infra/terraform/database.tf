# ==========================================
# 1. SECURITY GROUP & SUBNET GROUP
# ==========================================
resource "aws_security_group" "db_sg" {
  name        = "airline-db-sg"
  description = "Allow EKS nodes to access PostgreSQL"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = module.vpc.private_subnets_cidr_blocks
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "airline-db-sg"
  }
}

resource "aws_db_subnet_group" "db_subnet_group" {
  name       = "airline-db-subnet-group"
  subnet_ids = module.vpc.database_subnets

  tags = {
    Name = "Airline DB Subnet Group"
  }
}

# ==========================================
# 2. SECRETS & CREDENTIALS (AWS Secrets Manager)
# ==========================================
resource "random_password" "db_password" {
  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

resource "aws_secretsmanager_secret" "db_credentials" {
  name                    = "airline/demo-db/credentials"
  recovery_window_in_days = 0 # Immediate deletion (perfect for demo/testing)
}

resource "aws_secretsmanager_secret_version" "db_credentials_version" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = "airline_admin"
    password = random_password.db_password.result
  })
}

# ==========================================
# 3. RELATIONAL DATABASE (Standard RDS PostgreSQL - Demo Optimized)
# ==========================================
resource "aws_db_instance" "demo_postgres" {
  identifier        = "airline-demo-db"
  engine            = "postgres"
  engine_version    = "15"           # Fixed: AWS will automatically pick the latest supported 15.x version
  instance_class    = "db.t4g.micro" # Ultra-low cost / Free tier eligible
  allocated_storage = 20             # Minimum storage for Free tier
  storage_type      = "gp2"
  db_name           = "airlinedb"
  username          = "airline_admin"
  password          = random_password.db_password.result

  db_subnet_group_name   = aws_db_subnet_group.db_subnet_group.name
  vpc_security_group_ids = [aws_security_group.db_sg.id]

  # Demo specific optimizations
  multi_az                = false
  backup_retention_period = 0
  skip_final_snapshot     = true
  apply_immediately       = true
  publicly_accessible     = false

  tags = {
    Environment = "demo"
    Terraform   = "true"
  }
}
# ==========================================
# 4. NOSQL DATABASE (DynamoDB - Serverless / Free Tier)
# ==========================================
resource "aws_dynamodb_table" "user_profiles" {
  name         = "airline-user-profiles"
  billing_mode = "PAY_PER_REQUEST" # Fully covered under Free Tier (up to 25GB)
  hash_key     = "user_id"

  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  attribute {
    name = "user_id"
    type = "S"
  }

  tags = {
    Environment = "demo"
    Terraform   = "true"
  }
}

# ==========================================
# 5. OUTPUTS FOR EKS INTEGRATION
# ==========================================
output "postgres_endpoint" {
  description = "PostgreSQL Database Endpoint for search-offer-svc"
  value       = aws_db_instance.demo_postgres.endpoint
}

output "dynamodb_table_name" {
  description = "DynamoDB Table Name"
  value       = aws_dynamodb_table.user_profiles.name
}
