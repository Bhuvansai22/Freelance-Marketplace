# 🚀 Hirenova — Skill-Verified, Mobile-First Freelance Marketplace

Hirenova is a MERN-stack freelance platform specifically designed to empower students and freshers. By offering unlimited free bidding and automated technical assessments, Hirenova shifts the hiring focus from *experience-based reviews* to *proven technical competency*.

---

## 🌟 Key Pillars & Unique Selling Points (USPs)

*   **🏅 Verified Skills badging**: Freelancers attempt randomized evaluations to earn Gold Badges directly displayed on their dashboards and proposals.
*   **💸 Unlimited Free Bids**: No paid credits or connect costs. Hiring is democratized, letting beginners participate without financial pressure.
*   **📱 Mobile-First Design**: Responsive screens optimized down to 320px, including an adaptive panel-toggle real-time chat interface.
*   **🔒 Hardened Production Security**: Armed with express payload protections, secure whitelist-based CORS controls, and uptime monitors.
*   **✨ Vibrant Modern UI**: Clean backdrop-blur glassmorphism cards, customized animations, and sleek dark modes.

---

## 🛠️ Technological Stack

*   **Frontend**: React.js SPA, Vite compiler, Zustand state management, Tailwind CSS framework, Framer Motion animations.
*   **Backend**: Node.js runtime, Express.js server framework, Socket.io event-based WebSockets, Mongoose ODM.
*   **Database**: MongoDB non-relational document database.
*   **Security**: JSON parser bounds, whitelist-restricted CORS, bcrypt password encryptions, JWT access controls.

---

## 📊 Core Features

### 👨‍💻 For Freelancers
1. **Browse Projects**: Advanced search with skill filters, budget scopes, and recommendations.
2. **Skills Verification Center**: Take interactive JavaScript, React, and HTML/CSS assessments to claim gold badges.
3. **Bidding Engine**: Submit proposal bids with step-by-step milestones.
4. **Real-time Chat**: Continuous messaging with clients featuring an adaptive mobile workspace.

### 👨‍💼 For Clients
1. **Post Projects**: Structured listing form with budget constraints and stage milestones.
2. **Manage Proposals**: Instantly review bids, see verified badge credentials of candidates, and hire.
3. **Milestone Control**: Divvy project scope into stages, verify deliverables, and release funds securely.

---

## 📋 Folder Directory structure

```
Freelance-Marketplace/
├── client/                     # React Frontend Single Page Application
│   ├── src/
│   │   ├── components/         # Reusable UI widgets (Navbar, etc.)
│   │   ├── pages/              # Primary route views (Landing, Dashboard, etc.)
│   │   ├── store/              # Zustand global state (authStore)
│   │   ├── index.css           # Custom Glassmorphic design styles
│   │   └── App.jsx             # React router declaration
│
├── server/                     # Express.js REST & WebSockets Backend API
│   ├── controllers/            # Business logic request handlers
│   ├── models/                 # Mongoose DB schema definitions
│   ├── routes/                 # Express route definitions
│   └── index.js                # Server entrypoint and WebSocket setup
```

---

## ⚙️ Quick Start Installation

Follow these steps to run Hirenova locally:

### Prerequisites
- Node.js installed on your machine.
- MongoDB instance running locally or a MongoDB Atlas URI connection.

### 1. Setup the Database & Backend Server
Navigate to the server directory:
```bash
cd server
```

Create a `.env` file inside the `server/` directory and configure the environment variables:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/hirenova
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
```

Install dependencies and start the API server:
```bash
npm install
npm start
```
*Note: On server boot, 21 technical assessment questions will automatically seed into your database.*

### 2. Setup the Client Application
Open a new terminal window and navigate to the client directory:
```bash
cd client
```

Install dependencies:
```bash
npm install
```

Start the Vite development compiler:
```bash
npm run dev -- --host
```

Access the application in your browser at `http://localhost:5173`.

---

## 🩺 Monitoring & Diagnostics
Hirenova includes a system health endpoint suitable for Render, AWS, or custom uptime checks:
- **Endpoint**: `/health`
- **Response Format**:
  ```json
  {
    "status": "ok",
    "uptime": "128.45s",
    "timestamp": "2026-05-19T10:55:00Z"
  }
  ```

---

## 📄 Documentation Assets
For deeper research and code understanding, refer to:
*   [DEVELOPERS_GUIDE.md](DEVELOPERS_GUIDE.md) — Internal database schemas, API specs, and front-end styling tokens.
*   [IEEE_Project_Report.md](IEEE_Project_Report.md) — Academic-level methodology, responsive layout design math, performance audits, and system sequence charts.
