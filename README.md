# Shekhawat Dhaba - Restaurant Web Application

A full-stack restaurant web application for **Shekhawat Dhaba**, celebrating authentic Rajasthani cuisine in Jagatpura, Jaipur. Built with Node.js, Express, dynamic client-side JavaScript, and responsive modern CSS.

---

## Features

- **Dynamic Menu Showcase**: Real-time menu fetched from Express REST API with categorized traditional specialties.
- **Table Reservations**: Seamless online reservation system with client validation and backend storage.
- **Interactive Ordering**: Browse signature thalis and place orders with instant status updates.
- **Modern Responsive UI**: Mobile-first design with interactive animations, stats counter, dark/light theme toggle, and custom cursor glow.
- **RESTful Backend**: Clean modular architecture powered by Express routers, CORS support, and asynchronous JSON data persistence.

---

## Tech Stack

- **Frontend**: HTML5, CSS3 (Custom properties, Flexbox, CSS Grid), Vanilla ES6+ JavaScript, ScrollReveal, Boxicons
- **Backend**: Node.js, Express.js, CORS, File-based JSON Database Utility
- **Tools**: Git, npm, nodemon

---

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)

### Installation & Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yatharthg-sys/FSD-project.git
   cd FSD-project
   ```

2. **Setup and Run Backend**:
   ```bash
   cd Backend
   npm install
   npm run dev
   ```
   The backend API will run on `http://localhost:5000`.

3. **Open Frontend**:
   Open `Frontend/index.html` in your favorite web browser or serve it through the backend server.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Backend health check |
| GET | `/api/menu` | Retrieve complete menu |
| GET | `/api/menu/:id` | Retrieve item by ID |
| GET | `/api/reservations` | Retrieve reservations |
| POST | `/api/reservations` | Create a new table reservation |
| GET | `/api/orders` | List customer orders |
| POST | `/api/orders` | Place a new order |
| GET | `/api/contact` | Retrieve contact inquiries |
| POST | `/api/contact` | Submit contact message |

---

## Collaborators

- **Yatharth Gour** ([@yatharthg-sys](https://github.com/yatharthg-sys)) - Frontend Architecture, UI/UX, Animations & Styling
- **Yashvardhan Singh** ([@Yashv1109](https://github.com/Yashv1109)) - Backend APIs, REST Routers, Data Layer & Integration
