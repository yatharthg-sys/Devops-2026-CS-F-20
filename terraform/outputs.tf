output "app_url" {
  description = "Access URL for Shekhawat Dhaba Application"
  value       = "http://localhost:${var.app_port}"
}

output "network_id" {
  description = "ID of the created Docker bridge network"
  value       = docker_network.dhaba_network.id
}
