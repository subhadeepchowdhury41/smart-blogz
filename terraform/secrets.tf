resource "kubernetes_secret" "app_secrets" {
  metadata {
    name      = "blog-app-secrets"
    namespace = kubernetes_namespace.blog_app.metadata[0].name
  }

  data = {
    "jwt-secret"           = var.jwt_secret
    "google-client-id"     = var.google_client_id
    "google-client-secret" = var.google_client_secret
    "facebook-app-id"      = var.facebook_app_id
    "facebook-app-secret"  = var.facebook_app_secret
  }
}
