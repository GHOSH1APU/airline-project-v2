module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "sourav-airline-prod-vpc"
  cidr = "10.0.0.0/16"

  # Reduced from 3 to 2 Availability Zones (AZs) to fit standard lab requirements
  azs              = ["us-east-1a", "us-east-1b"]
  private_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets   = ["10.0.101.0/24", "10.0.102.0/24"]
  database_subnets = ["10.0.201.0/24", "10.0.202.0/24"]

  # CRITICAL COST SAVING: 'single_nat_gateway = true' forces Terraform to provision 
  # only 1 NAT Gateway instead of 1 per public subnet. This reduces your NAT Gateway 
  # bill from ~$96/month down to ~$32/month.
  enable_nat_gateway = true
  single_nat_gateway = true
  enable_vpn_gateway = false 

  # Automatically generates the Subnet Group required for your Aurora/RDS deployment
  create_database_subnet_group = true

  tags = {
    Environment = "prod"
    Terraform   = "true"
    Owner       = "Sourav Ghosh"
    Project     = "Airline-Platform"
  }
}
