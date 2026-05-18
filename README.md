# Freelancer Marketplace

A full-stack MERN application that connects clients and freelancers through a secure bidding platform. Clients can post projects, freelancers can bid on them, and both parties can collaborate using real-time chat, milestone tracking, and secure online payments.

---

# 🚀 Features

## 🔐 Authentication & Authorization
- JWT-based authentication
- Secure login and registration
- Password encryption using bcrypt
- Role-based access control
- Protected routes

---

## 👨‍💼 Client Features
- Post new projects
- View freelancer bids
- Accept or reject proposals
- Track project progress
- Release milestone payments
- Chat with freelancers
- Give ratings and reviews

---

## 👨‍💻 Freelancer Features
- Browse available projects
- Place bids on projects
- Submit proposals with pricing and timelines
- Track ongoing projects
- Communicate with clients in real-time
- Receive ratings and reviews
- Manage freelancer profile and skills

---

## 💰 Bidding System
- Freelancers can:
  - Submit bid amount
  - Add proposal description
  - Specify delivery timeline

- Clients can:
  - Compare bids
  - Select the best freelancer
  - Start collaboration instantly

---

## 💬 Real-Time Chat
- Instant messaging using Socket.io
- Real-time communication between clients and freelancers
- Fast project discussions and updates

---

## 💳 Payment Integration
- Razorpay payment gateway integration
- Secure online transactions
- Milestone-based payments
- Payment tracking and status updates

---

## 📌 Milestone Tracking
- Divide projects into milestones
- Track completion stages
- Release payments stage-by-stage
- Better transparency and workflow management

---

## ⭐ Ratings & Reviews
- Clients can review freelancers
- Freelancers can review clients
- Builds trust and credibility in the platform

---

## 📂 Database Collections

### Users
Stores:
- Name
- Email
- Password
- Role
- Skills
- Ratings

### Projects
Stores:
- Title
- Description
- Budget
- Deadline
- Status

### Bids
Stores:
- Bid amount
- Proposal
- Delivery timeline

### Payments
Stores:
- Transaction details
- Payment status

### Messages
Stores:
- Sender/receiver information
- Chat messages

---

# 🛠️ Tech Stack

## Frontend
- React.js
- CSS / Tailwind CSS
- Axios

## Backend
- Node.js
- Express.js

## Database
- MongoDB

## Authentication
- JWT
- bcrypt

## Real-Time Communication
- Socket.io

## Payment Gateway
- Razorpay

---