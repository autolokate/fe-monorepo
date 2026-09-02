# ECR repo URL, static bucket names/endpoints, and the deployer role ARN are output next to their own
# resources (ecr.tf / frontend-static.tf / iam.tf). These are the box-level outputs.

output "instance_id" {
  description = "EC2 instance id (set as the AWS_FE_STAGING_INSTANCE_ID repo variable; deploy-staging.yml targets it for the blue/green SSM RunCommand)."
  value       = aws_instance.box.id
}

output "public_ip" {
  description = "Elastic IP — point the Cloudflare A record for staging.<apex> here (orange-cloud, Full-strict)."
  value       = aws_eip.box.public_ip
}
