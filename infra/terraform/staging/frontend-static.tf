# admin + qr are static SPA builds (Vite) served straight from S3 website hosting, fronted by
# Cloudflare (orange-cloud). S3 website endpoints are HTTP-only, so these two hosts run Cloudflare
# "Flexible" SSL via a per-hostname Configuration Rule (edge TLS to the browser, plain HTTP CF->S3) —
# see outputs.tf for the exact endpoints to point the CNAMEs at. The website app (SSR) is NOT here; it
# runs as a container on the box (docker-compose.yml) behind Caddy in Full-strict.
#
# Bucket name MUST equal the custom domain exactly (docs.aws.amazon.com/AmazonS3/latest/userguide/
# website-hosting-custom-domain-walkthrough.html, Step 2: "These bucket names must match your domain
# name exactly"). Cloudflare's proxy forwards the client's original Host header to the S3 origin
# unchanged — Host-header rewrite (Origin Rules) is Enterprise-only on Cloudflare, unavailable on our
# Free plan — and S3's virtual-hosted-style website routing resolves the bucket FROM that Host header,
# so a bucket named anything other than the exact hostname 404s with NoSuchBucket.
locals {
  static_sites = {
    admin = "admin-staging.${var.app_domain}"
    qr    = "qr-staging.${var.app_domain}"
  }
}

resource "aws_s3_bucket" "static" {
  for_each = local.static_sites
  bucket   = each.value
  tags     = { Name = each.value }
  # Disposable staging infra: deploy-staging.yml fully re-syncs (`--delete`) on every deploy anyway, and
  # this bucket name changing forces a replace — force_destroy lets Terraform delete the old, non-empty
  # bucket instead of failing with BucketNotEmpty.
  force_destroy = true
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
