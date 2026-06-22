variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region for all resources"
  type        = string
  default     = "asia-south1"
}

variable "environment" {
  description = "Deployment environment (staging, production)"
  type        = string
  default     = "staging"
}

variable "fe_image" {
  description = "Full Docker image URI for the FE service"
  type        = string
}

variable "fe_max_instances" {
  description = "Maximum number of FE Cloud Run instances"
  type        = number
  default     = 3
}

variable "fe_min_instances" {
  description = "Minimum number of FE Cloud Run instances (0 = scale to zero)"
  type        = number
  default     = 0
}

variable "fe_cpu" {
  description = "CPU limit for FE container"
  type        = string
  default     = "1000m"
}

variable "fe_memory" {
  description = "Memory limit for FE container"
  type        = string
  default     = "512Mi"
}

variable "fe_concurrency" {
  description = "Max concurrent requests per FE instance"
  type        = number
  default     = 80
}
