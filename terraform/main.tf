terraform {
  required_version = ">= 1.5.0"
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.1"
    }
  }
}

provider "docker" {}

resource "docker_network" "dhaba_network" {
  name = var.network_name
}

resource "docker_volume" "mongo_volume" {
  name = "mongo-data-tf"
}

resource "docker_image" "mongo_image" {
  name         = "mongo:7.0"
  keep_locally = true
}

resource "docker_container" "mongodb" {
  name  = "shekhawat-dhaba-db-tf"
  image = docker_image.mongo_image.image_id
  networks_advanced {
    name = docker_network.dhaba_network.name
  }
  volumes {
    volume_name    = docker_volume.mongo_volume.name
    container_path = "/data/db"
  }
  ports {
    internal = 27017
    external = 27017
  }
  restart = "always"
}

resource "docker_container" "app" {
  name  = "shekhawat-dhaba-app-tf"
  image = "shekhawat-dhaba:latest"
  networks_advanced {
    name = docker_network.dhaba_network.name
  }
  env = [
    "PORT=5000",
    "NODE_ENV=production",
    "MONGODB_URI=mongodb://${docker_container.mongodb.name}:27017/shekhawat_dhaba"
  ]
  ports {
    internal = 5000
    external = var.app_port
  }
  restart    = "always"
  depends_on = [docker_container.mongodb]
}
