# Shekhawat Dhaba - Cloud-Native Full Stack Restaurant Platform

An enterprise-ready, cloud-native full-stack web application for **Shekhawat Dhaba**, serving authentic Rajasthani cuisine in Jagatpura, Jaipur. Engineered with modern micro-service design patterns, real-time event-driven architectures, automated continuous integration/continuous delivery (CI/CD) pipelines, container orchestration, and comprehensive telemetry observability.

---

## Architecture Overview

```
                           +------------------------------------------+
                           |           Client / Browser Layer         |
                           |  - Customer Web App (HTML5/CSS3/ES6/DOM) |
                           |  - Kitchen & Staff Portal (React 18 SPA) |
                           +--------------------+---------------------+
                                                |
                                   HTTP / REST  |  WebSockets (Socket.io)
                                                v
                           +------------------------------------------+
                           |          Node.js Express Server          |
                           |  - RESTful APIs & Middleware Chain       |
                           |  - Real-time Event Broadcaster           |
                           |  - Streamed CSV / Report Exporters       |
                           |  - Prometheus Metrics Exporter           |
                           +---------+----------------------+---------+
                                     |                      |
                    Mongoose Driver  |                      | Scrape Target (/api/metrics)
                                     v                      v
                       +-------------------+   +-------------------------+
                       |  MongoDB Database |   | Prometheus TSDB & Alert |
                       | (Persistent Vol)  |   +------------+------------+
                       +-------------------+                |
                                                            v
                                               +-------------------------+
                                               |    Grafana Dashboards   |
                                               +-------------------------+
```

---

## Core Features

### 🍽️ Customer-Facing Application
- **Dynamic Rajasthani Menu**: Fetched asynchronously with category filtering (Traditional Thalis, Starters, Curries, Breads, Desserts, Beverages).
- **Online Table Reservations**: Instant table booking with validation and status tracking.
- **Interactive Ordering & Cart**: Shopping cart drawer with localStorage persistence and instant checkout.
- **Real-Time Order Tracking**: Live order state verification (Received -> Preparing -> Out for Delivery -> Delivered).
- **Responsive UI/UX**: Mobile-first design featuring Dark/Light mode toggle, dynamic counters, and custom cursor glow.

### 👨‍🍳 Kitchen & Staff Portal (React 18 SPA)
- **Single Page Application (SPA)**: Built with React 18 functional components, JSX, and Redux-pattern state management.
- **Live Kitchen Operations**: Real-time order fulfillment workflow powered by WebSockets.
- **Reservation Management**: Seat guests, confirm bookings, and manage floor capacity.
- **Menu Management**: Controlled form for dynamic menu item insertion and catalog management.
- **Streamed Data Export**: Real-time CSV stream download of customer orders.

### 🚀 DevOps & Cloud-Native Engineering
- **Multi-Stage Docker Containerization**: Optimized Node.js Alpine base image with non-root security execution.
- **Multi-Service Docker Compose**: One-click orchestration of Application, MongoDB, Prometheus, and Grafana.
- **Kubernetes Production Manifests (`k8s/`)**:
  - Zero-downtime rolling update `Deployment` with liveness and readiness health probes.
  - `HorizontalPodAutoscaler` (HPA) for autoscaling under CPU and memory load.
  - Stateful `PersistentVolumeClaim` (PVC) for MongoDB persistence.
  - Decoupled `ConfigMap` and `Secret` configuration.
- **Continuous Integration (CI) Automation**:
  - Declarative `Jenkinsfile` pipeline executing Dependency Installation, Automated Jest Testing, Security Audit, Docker Build, and Staging Rollout.
  - GitHub Actions Workflow (`.github/workflows/ci-cd.yml`) running automated regression tests on push and pull requests.
- **Infrastructure as Code (IaC)**: Modular Terraform specifications (`terraform/`) for repeatable environment provisioning.
- **Observability & Telemetry**:
  - Native Prometheus metric collection via `prom-client` exposing Counters, Gauges, and Latency Histograms at `/api/metrics`.
  - Alertmanager rule definitions (`alert.rules.yml`) for HighLatency and HighErrorRate triggers.
  - Auto-provisioned Grafana dashboards for throughput, p95 latency, and active WebSocket connections.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | HTML5, CSS3, Tailwind CSS, Vanilla JavaScript (ES6+), React 18, Babel, jQuery, Boxicons, ScrollReveal |
| **Backend** | Node.js, Express.js, Socket.io, Node.js Streams, CORS, Dotenv |
| **Database & ODM** | MongoDB, Mongoose, Resilient File-based JSON Persistence |
| **Testing** | Jest, Supertest |
| **Containerization & IaC**| Docker, Docker Compose, Kubernetes, Terraform |
| **CI/CD Automation** | Jenkins Pipeline, GitHub Actions |
| **Monitoring & Telemetry**| Prometheus, Grafana, Prom-Client |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (v9 or higher)
- Optional for containerized workflow: [Docker](https://www.docker.com/) & Docker Compose

---

### Option 1: Quick Start with Docker Compose (Recommended)

To spin up the entire ecosystem (Web Application, MongoDB, Prometheus, Grafana) in one command:

```bash
# Clone the repository
git clone https://github.com/yatharthg-sys/Devops-2026-CS-F-20.git
cd Devops-2026-CS-F-20

# Launch all container services
docker-compose up --build -d
```

#### Running Services:
- **Customer Web Application & Staff Portal**: [http://localhost:5000](http://localhost:5000)
- **Staff & Kitchen Portal**: [http://localhost:5000/portal.html](http://localhost:5000/portal.html)
- **Prometheus Dashboard**: [http://localhost:9090](http://localhost:9090)
- **Grafana Observability Dashboard**: [http://localhost:3000](http://localhost:3000) *(Credentials: `admin` / `admin`)*
- **MongoDB**: `localhost:27017`

---

### Option 2: Local Node.js Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yatharthg-sys/Devops-2026-CS-F-20.git
   cd Devops-2026-CS-F-20
   ```

2. **Install Backend Dependencies**:
   ```bash
   cd Backend
   npm install
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:5000`.

4. **Access the Application**:
   - Open [http://localhost:5000](http://localhost:5000) in your browser.
   - Access the React Kitchen & Staff Portal at [http://localhost:5000/portal.html](http://localhost:5000/portal.html).

---

## Running Automated Tests

The backend includes automated integration and unit test suites verifying endpoints, data validation, streaming exports, and Prometheus metric formatting:

```bash
cd Backend
npm test
```

---

## Kubernetes Orchestration

Deploy the application to a local or production Kubernetes cluster (Minikube, Kind, EKS, GKE):

```bash
# Create dedicated namespace
kubectl apply -f k8s/namespace.yaml

# Apply environment configurations
kubectl apply -f k8s/configmap.yaml

# Provision MongoDB stateful database
kubectl apply -f k8s/mongo-pvc.yaml
kubectl apply -f k8s/mongo-deployment.yaml

# Deploy high-availability application pods & load balancer service
kubectl apply -f k8s/app-deployment.yaml
kubectl apply -f k8s/app-service.yaml

# Enable Horizontal Pod Autoscaling
kubectl apply -f k8s/hpa.yaml
```

---

## API & Telemetry Reference

### RESTful Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health check (Liveness / Readiness) |
| `GET` | `/api/metrics` | Prometheus metrics scrape format |
| `GET` | `/api/menu` | List menu items (supports `?category=...`) |
| `GET` | `/api/menu/:id` | Fetch specific menu item |
| `POST` | `/api/menu` | Create a new dish in catalog |
| `PUT` | `/api/menu/:id` | Update an existing menu item |
| `DELETE`| `/api/menu/:id` | Remove a menu item |
| `GET` | `/api/orders` | List customer orders |
| `GET` | `/api/orders/:id` | Retrieve order details & status |
| `POST` | `/api/orders` | Place a new order |
| `PATCH`| `/api/orders/:id/status` | Update order fulfillment status |
| `GET` | `/api/reservations` | List table reservations |
| `POST` | `/api/reservations` | Submit a table reservation |
| `PATCH`| `/api/reservations/:id/status`| Update reservation seating status |
| `GET` | `/api/reports/orders/export-csv` | Stream orders as downloadable CSV |
| `POST` | `/api/contact` | Submit contact inquiry |

### Real-Time WebSocket Events (Socket.io)

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `order:created` | Server -> Client | `Order` object | Broadcast when a customer places an order |
| `order:updated` | Server -> Client | `Order` object | Broadcast on kitchen status transition |
| `reservation:created` | Server -> Client | `Reservation` object | Broadcast when a new table is reserved |
| `join:order` | Client -> Server | `orderId` | Subscribes client to specific order channel |

---

## Collaborators

- **Yatharth Gour** ([@yatharthg-sys](https://github.com/yatharthg-sys)) - Frontend Architecture, UI/UX, Animations & Styling
- **Yashvardhan Singh** ([@Yashv1109](https://github.com/Yashv1109)) - Backend APIs, REST Routers, Data Layer & Integration
