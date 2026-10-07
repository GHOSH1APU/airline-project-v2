terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "airline-project-tfstate-sourav"
    key            = "global/s3/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "airline-tf-locks-sourav"
    encrypt        = true
  }
}

provider "aws" {
  region = "us-east-1"
  default_tags {
    tags = {
      Project     = "Airline-Platform"
      Environment = "PDC"
      ManagedBy   = "Terraform"
      Owner       = "Sourav Ghosh"
    }
  }
}

# Add this at the bottom of your existing providers.tf file
provider "aws" {
  alias  = "dr"
  region = "us-west-2"
  default_tags {
    tags = {
      Project     = "Airline-Platform"
      Environment = "DR"
      ManagedBy   = "Terraform"
      Owner       = "Sourav Ghosh"
    }
  }
}
