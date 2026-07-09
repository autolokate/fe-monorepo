# Self-contained staging stack for the Autolokate frontend: its own VPC/box/ECR/S3, its own remote
# state, its own GitHub OIDC deploy role. The only account-scoped AWS object it does NOT create is the
# GitHub OIDC provider (there is exactly one per AWS account) — iam.tf reads it as a `data` source so
# this stack can be applied whether or not it already exists, without ever clashing over ownership.
# Remote state in S3, S3-native locking (use_lockfile — Terraform 1.10+). The state bucket is
# bootstrapped out-of-band and passed at init: `terraform init -backend-config=bucket=...`.
terraform {
  required_version = ">= 1.9"

  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 6.0" }
  }

  backend "s3" {
    key          = "autolokate/fe-staging/terraform.tfstate"
    encrypt      = true
    use_lockfile = true
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Project     = "autolokate"
      Environment = "staging"
      Component   = "frontend"
      ManagedBy   = "terraform"
    }
  }
}

data "aws_caller_identity" "current" {}

locals {
  name = "autolokate-fe-staging"
}
