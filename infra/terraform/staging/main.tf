# Latest Amazon Linux 2023 arm64 AMI (Graviton).
data "aws_ssm_parameter" "al2023_arm" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-arm64"
}

# --- Minimal network: 1 public subnet for the single box ---
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags                 = { Name = local.name }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = local.name }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 4, 0)
  map_public_ip_on_launch = true
  tags                    = { Name = "${local.name}-public" }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  tags = { Name = local.name }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

resource "aws_security_group" "box" {
  name        = local.name
  description = "Frontend staging box: :443 from Cloudflare edge only (orange-cloud origin pull), SSH from allowed cidr, all egress."
  vpc_id      = aws_vpc.main.id

  # Clients hit Cloudflare (orange-cloud); CF terminates edge TLS and proxies to Caddy over :443
  # (Full-strict, CF Origin Cert). Only Cloudflare's published IPv4 ranges may reach the origin — this
  # kills direct-to-EIP bypass of the CF edge. No :80 (CF's edge does HTTP->HTTPS).
  ingress {
    description = "HTTPS from Cloudflare edge only"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = local.cloudflare_ipv4
  }
  # SSH only when an operator CIDR is explicitly set; default access is SSM Session Manager (no open 22).
  dynamic "ingress" {
    for_each = var.allowed_ssh_cidr == "" ? [] : [1]
    content {
      description = "SSH"
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = [var.allowed_ssh_cidr]
    }
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = { Name = local.name }
}

# --- Instance role: read this stack's SSM params, pull from ECR, SSM Session Manager ---
resource "aws_iam_role" "box" {
  name = local.name
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.box.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy_attachment" "ecr_read" {
  role       = aws_iam_role.box.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_role_policy" "ssm_params" {
  name = "${local.name}-ssm-params"
  role = aws_iam_role.box.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["ssm:GetParametersByPath", "ssm:GetParameters", "ssm:GetParameter"]
      Resource = "arn:aws:ssm:${var.region}:${data.aws_caller_identity.current.account_id}:parameter/${local.name}/*"
    }]
  })
}

resource "aws_iam_instance_profile" "box" {
  name = local.name
  role = aws_iam_role.box.name
}

# --- Frontend box config in SSM Parameter Store (values populated out-of-band; TF must not own them).
#     Named for the exact key so the box's bootstrap maps them 1:1. ---
locals {
  # Box-level config only. The website's NEXT_PUBLIC_* are inlined into the image at BUILD time (Next.js
  # bakes them into the client bundle), so they are passed as Docker build args by the deploy workflow —
  # NOT stored here as runtime params. APP_DOMAIN is consumed by Caddy; CF_ORIGIN_* by TLS.
  fe_params = [
    "APP_DOMAIN",
    # Cloudflare Origin Certificate (base64 PEM cert + key) — Caddy serves these so CF validates the
    # origin in Full-strict. Written to files by the bootstrap (NOT the env_file .env); base64 to survive
    # transit intact.
    "CF_ORIGIN_CERT", "CF_ORIGIN_KEY",
  ]

  # Cloudflare's published IPv4 egress ranges (https://www.cloudflare.com/ips-v4). The box's :443 admits
  # ONLY these — clients reach CF (orange-cloud), CF proxies to the EIP. Refresh if CF updates the list.
  cloudflare_ipv4 = [
    "173.245.48.0/20", "103.21.244.0/22", "103.22.200.0/22", "103.31.4.0/22",
    "141.101.64.0/18", "108.162.192.0/18", "190.93.240.0/20", "188.114.96.0/20",
    "197.234.240.0/22", "198.41.128.0/17", "162.158.0.0/15", "104.16.0.0/13",
    "104.24.0.0/14", "172.64.0.0/13", "131.0.72.0/22",
  ]
}

resource "aws_ssm_parameter" "app" {
  for_each = toset(local.fe_params)
  name     = "/${local.name}/${each.value}"
  type     = "SecureString"
  value    = "PLACEHOLDER" # populated out-of-band; TF must not own the value
  tags     = { Name = "${local.name}-${each.value}" }

  lifecycle {
    ignore_changes = [value]
  }
}

resource "aws_instance" "box" {
  ami                    = data.aws_ssm_parameter.al2023_arm.value
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.box.id]
  iam_instance_profile   = aws_iam_instance_profile.box.name
  key_name               = var.key_name == "" ? null : var.key_name

  user_data = templatefile("${path.module}/../../staging/user_data.sh.tftpl", {
    name       = local.name
    region     = var.region
    account_id = data.aws_caller_identity.current.account_id
    compose    = file("${path.module}/../../staging/docker-compose.yml")
    caddyfile  = file("${path.module}/../../staging/Caddyfile")
  })
  user_data_replace_on_change = true

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
    encrypted   = true
  }

  metadata_options {
    http_tokens                 = "required" # IMDSv2
    http_put_response_hop_limit = 2          # docker containers are 1 hop from the host — reach IMDS for the instance role
  }

  tags = { Name = local.name }
}

resource "aws_eip" "box" {
  instance = aws_instance.box.id
  domain   = "vpc"
  tags     = { Name = local.name }
}
