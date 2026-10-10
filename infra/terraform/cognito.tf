# ==========================================
# B2C USER POOL (Travelers)
# ==========================================
resource "aws_cognito_user_pool" "b2c_pool" {
  name = "airline-b2c-pool"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  schema {
    name                     = "home_region"
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    required                 = false
  }
  schema {
    name                     = "currency_preference"
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    required                 = false
  }
  schema {
    name                     = "loyalty_tier"
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    required                 = false
  }

  # THIS FIXES THE AWS/TERRAFORM SCHEMA BUG
  lifecycle {
    ignore_changes = [
      schema,
      password_policy
    ]
  }
}

# ==========================================
# B2B USER POOL (Corporate Travel Agencies)
# ==========================================
resource "aws_cognito_user_pool" "b2b_pool" {
  name = "airline-b2b-pool"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 12
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  admin_create_user_config {
    allow_admin_create_user_only = true
  }

  schema {
    name                     = "tenant_id"
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = false
    required                 = true
  }

  # THIS FIXES THE AWS/TERRAFORM SCHEMA BUG
  lifecycle {
    ignore_changes = [
      schema,
      password_policy
    ]
  }
}

# ==========================================
# APP CLIENTS
# ==========================================
resource "aws_cognito_user_pool_client" "b2c_client" {
  name         = "airline-web-client"
  user_pool_id = aws_cognito_user_pool.b2c_pool.id

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_CUSTOM_AUTH",
    "ALLOW_ADMIN_USER_PASSWORD_AUTH"
  ]

  supported_identity_providers = ["COGNITO"]

  access_token_validity  = 60
  id_token_validity      = 60
  refresh_token_validity = 30

  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "days"
  }
}

resource "aws_cognito_user_pool_client" "b2b_client" {
  name         = "airline-agent-portal-client"
  user_pool_id = aws_cognito_user_pool.b2b_pool.id

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]

  supported_identity_providers = ["COGNITO"]
}

# ==========================================
# OUTPUTS
# ==========================================
output "b2c_user_pool_id" {
  value = aws_cognito_user_pool.b2c_pool.id
}

output "b2c_app_client_id" {
  value = aws_cognito_user_pool_client.b2c_client.id
}

output "b2b_user_pool_id" {
  value = aws_cognito_user_pool.b2b_pool.id
}

output "b2b_app_client_id" {
  value = aws_cognito_user_pool_client.b2b_client.id
}
