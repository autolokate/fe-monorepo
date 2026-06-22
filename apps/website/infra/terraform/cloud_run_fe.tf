resource "google_cloud_run_v2_service" "fe" {
  name     = "autolokate-fe-${var.environment}"
  location = var.region

  template {
    service_account = google_service_account.cloud_run_fe.email

    scaling {
      min_instance_count = var.fe_min_instances
      max_instance_count = var.fe_max_instances
    }

    max_instance_request_concurrency = var.fe_concurrency

    containers {
      image = var.fe_image

      ports {
        container_port = 3000
      }

      resources {
        limits = {
          cpu    = var.fe_cpu
          memory = var.fe_memory
        }
        cpu_idle = true
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "HOSTNAME"
        value = "0.0.0.0"
      }

      startup_probe {
        http_get {
          path = "/"
          port = 3000
        }
        initial_delay_seconds = 5
        period_seconds        = 5
        failure_threshold     = 10
        timeout_seconds       = 3
      }

      liveness_probe {
        http_get {
          path = "/"
          port = 3000
        }
        period_seconds    = 30
        failure_threshold = 3
        timeout_seconds   = 3
      }
    }
  }

  depends_on = [
    google_project_service.required_apis,
    google_secret_manager_secret_iam_member.fe_secret_accessor,
  ]
}

resource "google_cloud_run_v2_service_iam_member" "fe_public" {
  name     = google_cloud_run_v2_service.fe.name
  location = var.region
  role     = "roles/run.invoker"
  member   = "allUsers"
}
