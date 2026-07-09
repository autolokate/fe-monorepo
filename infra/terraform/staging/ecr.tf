# Only the Next.js `website` app runs as a container (blue/green on the box). admin + qr are static
# builds synced straight to S3 (frontend-static.tf), so they need no image. MUTABLE tag policy: deploys
# push a per-commit SHA tag and the box pulls that exact tag — keep-last-10 caps storage.
resource "aws_ecr_repository" "website" {
  name                 = "${local.name}/website"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
  encryption_configuration {
    encryption_type = "AES256"
  }
  tags = { Name = "${local.name}-ecr-website" }
}

resource "aws_ecr_lifecycle_policy" "website" {
  repository = aws_ecr_repository.website.name
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "keep last 10 images"
      selection    = { tagStatus = "any", countType = "imageCountMoreThan", countNumber = 10 }
      action       = { type = "expire" }
    }]
  })
}

output "ecr_repository_url" {
  description = "Frontend website ECR repo (docker build/push here; docker-compose.yml pulls $${ECR_REGISTRY}/autolokate-fe-staging/website:$${IMAGE_TAG})."
  value       = aws_ecr_repository.website.repository_url
}
