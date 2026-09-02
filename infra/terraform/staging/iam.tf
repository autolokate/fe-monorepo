# GitHub Actions OIDC deploy role for this frontend stack (.github/workflows/deploy-staging.yml).
# The GitHub OIDC provider is a single account-wide object (one per AWS account), so this stack READS
# it as a `data` source instead of creating it — that way the frontend stack can be applied whether or
# not the provider already exists elsewhere in the account, and neither stack "owns"/destroys it.
data "aws_iam_openid_connect_provider" "github" {
  count = var.github_repo == "" ? 0 : 1
  url   = "https://token.actions.githubusercontent.com"
}

# Trust condition uses a `repo:<owner/repo>:*` wildcard (not a branch-scoped ref): the deploy workflow
# fires via `workflow_run`, which GitHub always evaluates from the DEFAULT branch's copy of the workflow
# file — a token's `ref` claim there is unreliably the default branch, not `staging`, so branch-scoping
# would silently break AssumeRoleWithWebIdentity. The real least-privilege boundary is the RESOURCE
# scope of the policy below (this stack's website ECR repo, its two static buckets, this one instance).
resource "aws_iam_role" "deployer" {
  count = var.github_repo == "" ? 0 : 1
  name  = "${local.name}-deployer"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Federated = data.aws_iam_openid_connect_provider.github[0].arn }
      Action    = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = { "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com" }
        StringLike   = { "token.actions.githubusercontent.com:sub" = "repo:${var.github_repo}:*" }
      }
    }]
  })
}

resource "aws_iam_role_policy" "deployer" {
  count = var.github_repo == "" ? 0 : 1
  name  = "${local.name}-deployer"
  role  = aws_iam_role.deployer[0].id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "EcrAuth"
        Effect   = "Allow"
        Action   = ["ecr:GetAuthorizationToken"]
        Resource = "*"
      },
      {
        Sid    = "EcrPushWebsite"
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability", "ecr:InitiateLayerUpload", "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload", "ecr:PutImage", "ecr:BatchGetImage", "ecr:GetDownloadUrlForLayer",
        ]
        Resource = [aws_ecr_repository.website.arn]
      },
      {
        # Static-site publish: sync the admin/qr build output into their buckets (and prune deleted
        # files). Scoped to exactly these two buckets — ListBucket on the bucket ARN, object actions on
        # its contents.
        Sid      = "S3SyncStatic"
        Effect   = "Allow"
        Action   = ["s3:PutObject", "s3:DeleteObject", "s3:GetObject"]
        Resource = [for b in aws_s3_bucket.static : "${b.arn}/*"]
      },
      {
        Sid      = "S3ListStatic"
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = [for b in aws_s3_bucket.static : b.arn]
      },
      {
        # Website redeploy: SendCommand needs BOTH the target instance ARN and the AWS-managed document
        # ARN (SSM authorizes against the pair). The box's OWN instance role (not this one) does the
        # actual `docker compose pull`/ECR login — this role only asks SSM to run the fixed command doc.
        Sid      = "SsmRedeploy"
        Effect   = "Allow"
        Action   = ["ssm:SendCommand"]
        Resource = [aws_instance.box.arn, "arn:aws:ssm:${var.region}::document/AWS-RunShellScript"]
      },
      {
        # GetCommandInvocation/ListCommands take no resource-level permissions — `*` is correct here,
        # not a broadened grant of the action itself.
        Sid      = "SsmPollResult"
        Effect   = "Allow"
        Action   = ["ssm:GetCommandInvocation", "ssm:ListCommands"]
        Resource = "*"
      },
    ]
  })
}

output "deployer_role_arn" {
  description = "IAM role ARN for GitHub Actions OIDC (set as the AWS_FE_STAGING_DEPLOY_ROLE_ARN repo variable)."
  value       = var.github_repo == "" ? null : aws_iam_role.deployer[0].arn
}
