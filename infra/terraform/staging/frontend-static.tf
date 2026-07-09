# admin + qr are static SPA builds (Vite) served straight from S3 website hosting, fronted by
# Cloudflare (orange-cloud). S3 website endpoints are HTTP-only, so these two hosts run Cloudflare
# "Flexible" SSL via a per-hostname Configuration Rule (edge TLS to the browser, plain HTTP CF->S3) —
# see outputs.tf for the exact endpoints to point the CNAMEs at. The website app (SSR) is NOT here; it
# runs as a container on the box (docker-compose.yml) behind Caddy in Full-strict.
locals {
  static_sites = toset(["admin", "qr"])
}

resource "aws_s3_bucket" "static" {
  for_each = local.static_sites
  bucket   = "${local.name}-${each.value}"
  tags     = { Name = "${local.name}-${each.value}" }
}

resource "aws_s3_bucket_website_configuration" "static" {
  for_each = aws_s3_bucket.static
  bucket   = each.value.id

  index_document {
    suffix = "index.html"
  }
  # SPA client-side routing: any unmatched path falls back to index.html (the router then resolves it).
  error_document {
    key = "index.html"
  }
}

# Public read is intentional — these are public marketing/app shells, and S3 website hosting requires
# anonymous s3:GetObject. Cloudflare fronts them, but the origin itself must serve public objects.
resource "aws_s3_bucket_public_access_block" "static" {
  for_each                = aws_s3_bucket.static
  bucket                  = each.value.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "static" {
  for_each = aws_s3_bucket.static
  bucket   = each.value.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "PublicReadGetObject"
      Effect    = "Allow"
      Principal = "*"
      Action    = "s3:GetObject"
      Resource  = "${each.value.arn}/*"
    }]
  })
  # A bucket policy that grants public access is rejected until the public-access-block above allows it.
  depends_on = [aws_s3_bucket_public_access_block.static]
}

output "static_bucket_names" {
  description = "S3 bucket names for the static SPA sites (deploy-staging.yml runs `aws s3 sync <build>/ s3://<bucket>`)."
  value       = { for k, v in aws_s3_bucket.static : k => v.bucket }
}

output "static_website_endpoints" {
  description = "S3 website endpoints (HTTP) — point the Cloudflare CNAMEs (admin-staging.<apex>, qr-staging.<apex>) here and set a Flexible-SSL Configuration Rule for them."
  value       = { for k, v in aws_s3_bucket_website_configuration.static : k => v.website_endpoint }
}
