variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-west-2"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "namespace" {
  description = "Kubernetes namespace for the blog application"
  type        = string
  default     = "blog-app"
}

variable "docker_registry" {
  description = "Docker registry where container images are stored"
  type        = string
}

variable "backend_image" {
  description = "Backend Docker image name"
  type        = string
  default     = "blog-backend"
}

variable "frontend_image" {
  description = "Frontend Docker image name"
  type        = string
  default     = "blog-frontend"
}

variable "image_tag" {
  description = "Docker image tag to deploy"
  type        = string
  default     = "latest"
}

variable "database_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "smart-blogz"
}

variable "database_user" {
  description = "PostgreSQL database user"
  type        = string
  default     = "postgres"
}

variable "database_password" {
  description = "PostgreSQL database password"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret key"
  type        = string
  sensitive   = true
}

variable "google_client_id" {
  description = "Google OAuth client ID"
  type        = string
  sensitive   = true
}

variable "google_client_secret" {
  description = "Google OAuth client secret"
  type        = string
  sensitive   = true
}

variable "facebook_app_id" {
  description = "Facebook App ID"
  type        = string
  sensitive   = true
}

variable "facebook_app_secret" {
  description = "Facebook App Secret"
  type        = string
  sensitive   = true
}
