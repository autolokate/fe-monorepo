variable "region" {
  description = "AWS region (India residency)."
  type        = string
  default     = "ap-south-1"
}

variable "instance_type" {
  description = "EC2 type for the frontend box (Caddy + Next.js website blue/green). Starts at t4g.nano (Graviton, 512 MB) to keep cost minimal; bump to t4g.micro if the brief blue/green double-run (both website slots up during a cutover) causes memory pressure — it's a one-line change + apply, not a rebuild."
  type        = string
  default     = "t4g.nano"
}

variable "vpc_cidr" {
  description = "CIDR for this stack's own VPC. Distinct from any other Autolokate stack so the two never overlap if ever peered."
  type        = string
  default     = "10.41.0.0/16"
}

variable "allowed_ssh_cidr" {
  description = "CIDR allowed to SSH (e.g. your IP/32). Empty (default) opens NO SSH — use SSM Session Manager."
  type        = string
  default     = ""
}

variable "key_name" {
  description = "EC2 key pair for SSH (empty = no SSH key; use SSM Session Manager)."
  type        = string
  default     = ""
}

variable "app_domain" {
  description = "Shared apex/base domain (e.g. autolokate.com). Cloudflare (orange-cloud) fronts edge TLS; Caddy serves staging.<apex> -> website behind it (Full-strict origin cert). Empty = unset."
  type        = string
  default     = ""
}

variable "github_repo" {
  description = "owner/repo allowed to deploy this frontend stack via GitHub OIDC (empty = skip the deploy role). Defaulted (not left empty) so a bare `terraform apply` stays a no-op plan instead of destroying the deployer role/policy — this is a stable repo binding, not a per-run secret."
  type        = string
  default     = "autolokate/fe-monorepo"
}
