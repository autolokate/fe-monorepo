#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TF_DIR="$SCRIPT_DIR/../terraform"

if [ ! -f "$TF_DIR/terraform.tfvars" ]; then
  echo "ERROR: $TF_DIR/terraform.tfvars not found."
  echo "Copy terraform.tfvars.example to terraform.tfvars and fill in values."
  exit 1
fi

echo "==> Initializing Terraform"
terraform -chdir="$TF_DIR" init

echo "==> Planning changes"
terraform -chdir="$TF_DIR" plan -out=tfplan

echo ""
read -rp "Apply these changes? [y/N] " confirm
if [[ "$confirm" =~ ^[Yy]$ ]]; then
  echo "==> Applying"
  terraform -chdir="$TF_DIR" apply tfplan
  echo ""
  echo "==> Outputs"
  terraform -chdir="$TF_DIR" output
else
  echo "Aborted."
  rm -f "$TF_DIR/tfplan"
  exit 0
fi

rm -f "$TF_DIR/tfplan"
