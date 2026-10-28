variable "network_name" {
  type        = string
  description = "Docker bridge network name for Shekhawat Dhaba"
  default     = "dhaba-network-tf"
}

variable "app_port" {
  type        = number
  description = "Host port exposed for Dhaba web service"
  default     = 5000
}
