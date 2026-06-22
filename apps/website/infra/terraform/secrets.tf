locals {
  secret_ids = [
    "NEXT_PUBLIC_SITE_URL",
    "NEXT_PUBLIC_AUTOLOKATE_API_BASE_URL",
    "NEXT_PUBLIC_RAZORPAY_KEY_ID",
  ]
}

resource "google_secret_manager_secret" "fe_secrets" {
  for_each  = toset(local.secret_ids)
  secret_id = "fe-${lower(replace(each.value, "_", "-"))}-${var.environment}"

  labels = {
    environment = var.environment
    app         = "autolokate-fe"
  }

  replication {
    auto {}
  }

  depends_on = [google_project_service.required_apis]
}

resource "google_service_account" "cloud_run_fe" {
  account_id   = "autolokate-fe-run-${var.environment}"
  display_name = "Autolokate FE Cloud Run SA (${var.environment})"
}

resource "google_secret_manager_secret_iam_member" "fe_secret_accessor" {
  for_each  = toset(local.secret_ids)
  secret_id = google_secret_manager_secret.fe_secrets[each.value].id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run_fe.email}"
}
