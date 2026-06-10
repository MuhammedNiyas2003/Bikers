# MotoEscape 🏍️

**MotoEscape** is a modern, high-performance web application designed for booking premium motorcycle tours. Rebranded from RideQuest, it features a dynamic, responsive customer landing page and a secure standalone admin configuration panel.

---

## 🌟 Key Features

1. **Dynamic Customer Experience**:
   - Modern, high-performance dark user interface with smooth animations (powered by `Framer Motion`).
   - Dynamic **Featured Rides** display that automatically transitions into a smooth horizontal scroll-snap slider when more than 3 rides exist in the database.
   - Real-time booking requests sent via customized WhatsApp templates.

2. **Standalone Admin Panel**:
   - Hosted separately under `/admin` (production) or `/Bikers/admin` (development), fully hidden from normal users.
   - Secure authentication gate using username and password validation.
   - Logged sessions persist securely using `sessionStorage` with a clean "Log Out" action.
   - Complete CRUD management for rides (Add, Edit, Delete) and real-time viewing of customer bookings.

3. **Optimized Asset Uploads**:
   - Native client-side JPEG image compression using HTML5 Canvas (resizes images to a maximum of 800px width at 70% quality before database insertion).
   - Supports selecting from gorgeous visual presets or pasting external image URLs.

4. **Robust Database Integration**:
   - Dual-database compatibility: automatically runs on local **SQLite** (`motoescape.db`) by default, and seamlessly connects to secure cloud **PostgreSQL** databases (e.g. Neon) if a `DATABASE_URL` is supplied in the environment.

5. **Production Docker Containerization**:
   - A multi-stage `Dockerfile` and `docker-compose.yml` orchestrate a lightweight production container serving the compiled React frontend directly from the Express API layer.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite, Framer Motion, HSL CSS variables, Canvas API)
- **Backend**: Node.js (Express, CORS)
- **Databases**: SQLite3 / PostgreSQL (PG)
- **Deployment**: Docker, docker-compose, Render Cloud

---

## 🚀 Local Development Setup

### Prerequisites
Make sure you have Node.js (version 18+) installed on your machine.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/MuhammedNiyas2003/Bikers.git
   cd Bikers
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Configuration
Create a `.env` file in the root directory:
```env
# Optional: Provide a Postgres connection string. If omitted, SQLite will be used.
DATABASE_URL=your_postgresql_connection_url

# Optional: Custom admin credentials (default username is 'admin', password is 'motoescape123')
ADMIN_USERNAME=admin
ADMIN_PASSWORD=motoescape123
```

### Running the App
Start both the Express backend API (Port 5000) and the Vite frontend dev server (Port 5173 with proxy configuration) in parallel:
```bash
npm run dev
```
- Customer Homepage: `http://localhost:5173/Bikers/`
- Admin Login Portal: `http://localhost:5173/Bikers/admin`

---

## 🐳 Docker Production Setup

To run the application locally inside a Docker container:

1. Build and run the container:
   ```bash
   docker-compose up -d --build
   ```

2. The application will be live at `http://localhost:5000/`.
   - Customer Homepage: `http://localhost:5000/`
   - Admin Login Portal: `http://localhost:5000/admin`
