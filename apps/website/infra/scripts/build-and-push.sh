#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

PROJECT_ID="${GCP_PROJECT_ID:?Set GCP_PROJECT_ID}"
REGION="${GCP_REGION:-asia-south1}"
ENVIRONMENT="${ENVIRONMENT:-staging}"
TAG="${IMAGE_TAG:-$(git -C "$REPO_ROOT" rev-parse --short HEAD)}"

REGISTRY="${REGION}-docker.pkg.dev/${PROJECT_ID}/autolokate"
FE_IMAGE="${REGISTRY}/fe:${TAG}"

echo "==> Fetching secrets from Secret Manager"
NEXT_PUBLIC_SITE_URL=$(gcloud secrets versions access latest \
  --secret="fe-next-public-site-url-${ENVIRONMENT}" \
  --project="$PROJECT_ID" 2>/dev/null || echo "")

NEXT_PUBLIC_AUTOLOKATE_API_BASE_URL=$(gcloud secrets versions access latest \
  --secret="fe-next-public-autolokate-api-base-url-${ENVIRONMENT}" \
  --project="$PROJECT_ID" 2>/dev/null || echo "")

NEXT_PUBLIC_RAZORPAY_KEY_ID=$(gcloud secrets versions access latest \
  --secret="fe-next-public-razorpay-key-id-${ENVIRONMENT}" \
  --project="$PROJECT_ID" 2>/dev/null || echo "")

if [ -z "$NEXT_PUBLIC_SITE_URL" ] || [ -z "$NEXT_PUBLIC_AUTOLOKATE_API_BASE_URL" ]; then
  echo "WARNING: Some secrets are empty. Ensure secrets are populated in Secret Manager."
  echo "  fe-next-public-site-url-${ENVIRONMENT}"
  echo "  fe-next-public-autolokate-api-base-url-${ENVIRONMENT}"
  echo "  fe-next-public-razorpay-key-id-${ENVIRONMENT}"
fi

echo "==> Building and pushing FE image via Cloud Build"
echo "    Image: ${FE_IMAGE}"

gcloud builds submit "$REPO_ROOT" \
  --project="$PROJECT_ID" \
  --config=/dev/stdin \
  --timeout=900s \
  --quiet <<YAML
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '--build-arg'
      - 'NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}'
      - '--build-arg'
      - 'NEXT_PUBLIC_AUTOLOKATE_API_BASE_URL=${NEXT_PUBLIC_AUTOLOKATE_API_BASE_URL}'
      - '--build-arg'
      - 'NEXT_PUBLIC_RAZORPAY_KEY_ID=${NEXT_PUBLIC_RAZORPAY_KEY_ID}'
      - '-t'
      - '${FE_IMAGE}'
      - '-t'
      - '${REGISTRY}/fe:latest'
      - '-f'
      - 'Dockerfile'
      - '.'
images:
  - '${FE_IMAGE}'
  - '${REGISTRY}/fe:latest'
YAML

echo ""
echo "Done. Use this image URI in terraform.tfvars:"
echo "  fe_image = \"${FE_IMAGE}\""
