# 🌟 PulseNode: HTC Community Platform

A fully featured, full-stack community and club operations platform tailored for universities. It provides a beautiful, modern, and high-performance interface for managing role-based access control, announcements, and college-wide physical resources securely.

## 🚀 Key Features

* **Role-Based Access Control (RBAC):** Five distinct hierarchy levels (`STUDENT`, `CLUB_MEMBER`, `COORDINATOR`, `PRESIDENT`, `FACULTY`). Features and visibility dynamically adapt to the user's role.
* **Granular Announcements:** Broadcast updates globally, or limit scope strictly to a specific club or a specific student cohort (e.g., Target Year students). 
* **Club & College Resource Management:** View real-time availability of club-specific hardware, manage bookings, and execute permission workflows right from the app.
* **Modern UI:** A stunning, frosted "Light Glassmorphism" aesthetic built with Tailwind CSS, Framer Motion animations, and Phosphor Icons for an extremely premium UX.
* **Real-time Event Planning:** Conflict detection for scheduling events across diverse campus venues and equipment.

## 🛠️ Tech Stack

### Frontend
- **React (Vite) + TypeScript:** High-performance reactive UI.
- **Tailwind CSS & Framer Motion:** Fluid animations, responsive layouts, and a pure frosted glassmorphism theme.
- **Phosphor Icons:** Thin-line duotone modern iconography.

### Backend
- **Node.js & Express:** Lightweight, fast, and scalable API backend.
- **Prisma & PostgreSQL:** Type-safe database ORM managing complex relational structures (Clubs, Memberships, Inventories, Event Bookings).
- **JWT & bcrypt:** Securing user authentication and strict route authorization.

## 📦 Getting Started

### 1. Prerequisites
Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v16+ recommended)
* [PostgreSQL](https://www.postgresql.org/) (Running locally or via Docker)

### 2. Setup Environment Variables
Create a `.env` file in the root directory and add the following keys:
```env
# Database connection string to PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/htc_community?schema=public"

# JWT Auth Secret
JWT_SECRET="your_super_secret_jwt_key_here"
```

### 3. Install Dependencies
Install packages for both the backend and frontend:
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 4. Database Migration
Deploy the schema to your PostgreSQL instance and generate the Prisma Client:
```bash
npx prisma db push
npx prisma generate
```

### 5. Running the Application

**Run Backend API** (Starts Express on Port 4000)
```bash
npm run dev
```

**Run Frontend Client** (Starts Vite on Port 5173)
```bash
cd client
npm run dev
```
*(The backend serves the API on `localhost:4000` and the frontend proxy routes `/api` calls accordingly).*

---
Built with ❤️ for University Clubs and Communities.