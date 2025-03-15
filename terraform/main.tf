terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

data "aws_eks_cluster" "cluster" {
  name = module.eks.cluster_name
}

data "aws_eks_cluster_auth" "cluster" {
  name = module.eks.cluster_name
}

provider "kubernetes" {
  host                   = data.aws_eks_cluster.cluster.endpoint
  cluster_ca_certificate = base64decode(data.aws_eks_cluster.cluster.certificate_authority[0].data)
  token                  = data.aws_eks_cluster_auth.cluster.token
}

provider "helm" {
  kubernetes {
    host                   = data.aws_eks_cluster.cluster.endpoint
    cluster_ca_certificate = base64decode(data.aws_eks_cluster.cluster.certificate_authority[0].data)
    token                  = data.aws_eks_cluster_auth.cluster.token
  }
}

# VPC for EKS
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "smart-blogz-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["${var.aws_region}a", "${var.aws_region}b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true

  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Environment = var.environment
    Project     = "smart-blogz"
  }
}

# ECR Repositories
resource "aws_ecr_repository" "backend" {
  name                 = "smart-blogz-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "frontend" {
  name                 = "smart-blogz-frontend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

# EKS Cluster
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  cluster_name    = "smart-blogz-cluster"
  cluster_version = "1.27"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  cluster_endpoint_public_access = true

  eks_managed_node_groups = {
    general = {
      desired_size = 2
      min_size     = 1
      max_size     = 3

      instance_types = ["t3.medium"]
      capacity_type  = "ON_DEMAND"
    }
  }

  tags = {
    Environment = var.environment
    Project     = "smart-blogz"
  }
}

resource "kubernetes_namespace" "smart-blogz" {
  metadata {
    name = var.namespace
  }
}

# PostgreSQL Helm Release
resource "helm_release" "postgresql" {
  name       = "postgresql"
  repository = "https://charts.bitnami.com/bitnami"
  chart      = "postgresql"
  namespace  = kubernetes_namespace.blog_app.metadata[0].name

  set {
    name  = "auth.database"
    value = var.database_name
  }

  set {
    name  = "auth.username"
    value = var.database_user
  }

  set_sensitive {
    name  = "auth.password"
    value = var.database_password
  }
}

# Backend Deployment
resource "kubernetes_deployment" "backend" {
  metadata {
    name      = "smart-blogz-backend"
    namespace = kubernetes_namespace.smart-blogz.metadata[0].name
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "smart-blogz-backend"
      }
    }

    template {
      metadata {
        labels = {
          app = "smart-blogz-backend"
        }
      }

      spec {
        container {
          name  = "smart-blogz-backend"
          image = "${aws_ecr_repository.backend.repository_url}:${var.image_tag}"

          env {
            name  = "DATABASE_URL"
            value = "postgresql://${var.database_user}:${var.database_password}@postgresql.${kubernetes_namespace.blog_app.metadata[0].name}.svc.cluster.local:5432/${var.database_name}"
          }

          env {
            name = "JWT_SECRET"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.app_secrets.metadata[0].name
                key  = "jwt-secret"
              }
            }
          }

          env {
            name = "GOOGLE_CLIENT_ID"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.app_secrets.metadata[0].name
                key  = "google-client-id"
              }
            }
          }

          env {
            name = "GOOGLE_CLIENT_SECRET"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.app_secrets.metadata[0].name
                key  = "google-client-secret"
              }
            }
          }

          env {
            name = "FACEBOOK_APP_ID"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.app_secrets.metadata[0].name
                key  = "facebook-app-id"
              }
            }
          }

          env {
            name = "FACEBOOK_APP_SECRET"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.app_secrets.metadata[0].name
                key  = "facebook-app-secret"
              }
            }
          }

          resources {
            limits = {
              cpu    = "500m"
              memory = "512Mi"
            }
            requests = {
              cpu    = "250m"
              memory = "256Mi"
            }
          }

          liveness_probe {
            http_get {
              path = "/health"
              port = 3000
            }
            initial_delay_seconds = 30
            period_seconds       = 10
          }

          readiness_probe {
            http_get {
              path = "/health"
              port = 3000
            }
            initial_delay_seconds = 5
            period_seconds       = 10
          }
        }
      }
    }
  }
}

# Backend Service
resource "kubernetes_service" "backend" {
  metadata {
    name      = "smart-blogz-backend"
    namespace = kubernetes_namespace.smart-blogz.metadata[0].name
  }

  spec {
    selector = {
      app = "smart-blogz-backend"
    }

    port {
      port        = 3000
      target_port = 3000
    }

    type = "ClusterIP"
  }
}

# Frontend Deployment
resource "kubernetes_deployment" "frontend" {
  metadata {
    name      = "smart-blogz-frontend"
    namespace = kubernetes_namespace.blog_app.metadata[0].name
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "smart-blogz-frontend"
      }
    }

    template {
      metadata {
        labels = {
          app = "smart-blogz-frontend"
        }
      }

      spec {
        container {
          name  = "frontend"
          image = "${aws_ecr_repository.frontend.repository_url}:${var.image_tag}"

          env {
            name  = "API_URL"
            value = "http://smart-blogz-backend:3000"
          }

          resources {
            limits = {
              cpu    = "200m"
              memory = "256Mi"
            }
            requests = {
              cpu    = "100m"
              memory = "128Mi"
            }
          }

          liveness_probe {
            http_get {
              path = "/"
              port = 80
            }
            initial_delay_seconds = 30
            period_seconds       = 10
          }

          readiness_probe {
            http_get {
              path = "/"
              port = 80
            }
            initial_delay_seconds = 5
            period_seconds       = 10
          }
        }
      }
    }
  }
}

# Frontend Service
resource "kubernetes_service" "frontend" {
  metadata {
    name      = "smart-blogz-frontend"
    namespace = kubernetes_namespace.smart-blogz.metadata[0].name
  }

  spec {
    selector = {
      app = "smart-blogz-frontend"
    }

    port {
      port        = 80
      target_port = 80
    }

    type = "LoadBalancer"
  }
}
