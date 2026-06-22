output "fe_url" {
  description = "URL of the deployed FE Cloud Run service"
  value       = google_cloud_run_v2_service.fe.uri
}

output "fe_service_account" {
  description = "Service account email for the FE Cloud Run service"
  value       = google_service_account.cloud_run_fe.email
}
