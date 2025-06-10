# SkillForge - Skill-Sharing Platform

SkillForge is a full-stack web application designed to connect individuals seeking to learn new skills with experts willing to share their knowledge. Users can browse available skills, book sessions with providers, leave reviews, and providers can manage their skill listings and booking requests. The platform also features AI-powered keyword suggestions for skill creation.

---

## ✨ Features

**User Management & Authentication:**
*   User registration and secure login (password hashing, JWT authentication).
*   Protected routes for authenticated users.
*   User profile dashboards.

**Skill Management (Providers):**
*   Create, Read, Update, and Delete (CRUD) skill listings.
*   Set skill title, description, category, and price per hour.
*   AI-powered keyword suggestions for skill listings (using Cohere).
*   View and manage skills they offer.

**Skill Discovery (Students/Guests):**
*   Browse all available skills.
*   Advanced search and filtering for skills (by keyword, category, price range - *backend implemented, basic frontend filter UI*).
*   View detailed information for each skill, including provider details and reviews.

**Booking System:**
*   Students can request to book skill sessions.
*   Providers can view and manage booking requests (confirm, decline, mark as completed, cancel).
*   Students can view their booked sessions and their statuses (and cancel if applicable).
*   Email notifications for booking requests and status updates (using Nodemailer & Gmail).
*   Providers can add a message to students upon booking confirmation (e.g., meeting link).
*   In-app confirmation modals for booking actions.

**Review & Rating System:**
*   Authenticated users can leave reviews (rating + comment) for skills (preventing self-reviews and duplicate reviews per skill).
*   Publicly view reviews and average ratings on skill detail pages.

**User Interface:**
*   Responsive frontend built with Next.js and React-Bootstrap.
*   Custom dark theme for a modern and cool aesthetic.
*   In-app toast notifications for user feedback (using `react-toastify`).

---

## 🛠️ Technologies Used

**Frontend:**
*   **React.js (with Next.js framework)**
*   **React-Bootstrap:** UI component library.
*   **Axios:** HTTP client for API requests.
*   **React Context API:** For global state management (authentication).
*   **react-toastify:** For in-app notifications.
*   **react-icons:** For UI icons.
*   CSS (globals.css for custom styling and dark theme variables).

**Backend:**
*   **Node.js**
*   **Express.js:** Web application framework.
*   **Prisma ORM:** For database interaction with PostgreSQL.
*   **PostgreSQL:** Relational database.
*   **JSON Web Tokens (JWT):** For authentication.
*   **bcryptjs:** For password hashing.
*   **Cohere AI:** For AI-powered keyword suggestions.
*   **Nodemailer:** For sending email notifications (via Gmail SMTP).
*   **cors:** For enabling Cross-Origin Resource Sharing.
*   **dotenv:** For managing environment variables.

**Database:**
*   **PostgreSQL**

**Deployment:**
*   **Database:** Supabase (Managed PostgreSQL)
*   **Backend API:** Render (Node.js Web Service)
*   **Frontend Application:** Vercel (Next.js Hosting)

**Development Tools:**
*   Git & GitHub: Version control.
*   VS Code: Code editor.
*   Postman: API testing.
*   npm: Package management.

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   **Node.js:** (v18.x or later recommended) - Download from [nodejs.org](https://nodejs.org/)
*   **npm:** (Usually comes with Node.js)
*   **Git:** - Download from [git-scm.com](https://git-scm.com/)
*   **PostgreSQL:** Installed locally or access to a PostgreSQL instance.

### Installation & Setup

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/atharv-pdarshi/skill-forge.git
    cd skill-forge
    ```

2.  **Backend Setup:**
    *   Navigate to the backend directory:
        ```bash
        cd backend
        ```
    *   Install dependencies:
        ```bash
        npm install
        ```
    *   **Database Setup (Local PostgreSQL):**
        *   Ensure PostgreSQL is running.
        *   Connect to `psql` (e.g., `sudo -i -u postgres` then `psql`).
        *   Create a database user:
            ```sql
            CREATE USER your_db_user WITH PASSWORD 'your_db_password';
            ```
        *   Create a database:
            ```sql
            CREATE DATABASE skill_share_db; -- Or your preferred name
            ```
        *   Grant privileges:
            ```sql
            GRANT ALL PRIVILEGES ON DATABASE skill_share_db TO your_db_user;
            ```
        *   Exit `psql` and the postgres user session.
    *   **Create and Configure `.env` File:**
        *   In the `backend` directory, create a `.env` file.
        *   Add the following environment variables, replacing placeholder values:
            ```env
            DATABASE_URL="postgresql://your_db_user:your_db_password@localhost:5432/skill_share_db?schema=public"
            PORT=4000
            TOKEN_KEY="YOUR_VERY_STRONG_AND_UNIQUE_JWT_SECRET_KEY"
            EMAIL_USER="your_gmail_address@gmail.com"
            EMAIL_PASS="your_gmail_app_password" # For Nodemailer via Gmail
            COHERE_API_KEY="your_cohere_api_key"
            # NODE_ENV=development (optional, defaults to development if not set)
            ```
    *   **Run Database Migrations:**
        ```bash
        npx prisma migrate dev
        ```
        (This will also generate the Prisma Client)
    *   **Start the Backend Server:**
        ```bash
        npm start
        ```
        The backend should be running on `http://localhost:4000`.

3.  **Frontend Setup:**
    *   Open a new terminal.
    *   Navigate to the frontend directory:
        ```bash
        cd frontend 
        # (If you are in skill-forge/backend, use: cd ../frontend)
        ```
    *   Install dependencies:
        ```bash
        npm install
        ```
    *   **Create and Configure `.env.local` File:**
        *   In the `frontend` directory, create a `.env.local` file.
        *   Add the following environment variable:
            ```env
            NEXT_PUBLIC_API_URL=http://localhost:4000/api 
            ```
            (This points to your locally running backend)
    *   **Start the Frontend Development Server:**
        ```bash
        npm run dev
        ```
        The frontend should be accessible at `http://localhost:3000`.

---

## 📖 API Endpoints Overview

The backend API provides the following groups of endpoints (all prefixed with `/api`):

*   **/users/**
    *   `POST /register`: User registration.
    *   `POST /login`: User login.
    *   `GET /profile`: Get authenticated user's profile (Protected).
*   **/skills/**
    *   `POST /`: Create a new skill (Protected).
    *   `GET /`: Get all skills (Public, supports search/filter query params: `search`, `category`, `minPrice`, `maxPrice`, `userId`, `sortBy`, `sortOrder`).
    *   `GET /:id`: Get a single skill by ID (Public).
    *   `PUT /:id`: Update a skill (Protected, owner only).
    *   `DELETE /:id`: Delete a skill (Protected, owner only).
*   **/skills/:skillId/reviews/**
    *   `POST /`: Create a review for a skill (Protected).
    *   `GET /`: Get all reviews for a specific skill (Public).
*   **/bookings/**
    *   `POST /`: Student creates a booking request (Protected).
    *   `GET /student`: Get bookings made by current student (Protected).
    *   `GET /provider`: Get bookings for skills of current provider (Protected).
    *   `PATCH /:bookingId/status`: Provider or Student updates booking status (Protected, specific logic for who can set which status).
*   **/ai/**
    *   `POST /suggest-keywords`: Suggests keywords for a skill title/description (Protected).

---

## ☁️ Deployment

This application has been successfully deployed using the following services:

*   **Database (PostgreSQL):** Supabase
*   **Backend API (Node.js/Express):** Render
*   **Frontend (Next.js):** Vercel

**General Deployment Steps:**
1.  Set up the Supabase database and run Prisma migrations against it (`npx prisma migrate deploy`).
2.  Deploy the `backend` to Render, ensuring all environment variables (including the Supabase `DATABASE_URL`) are correctly configured.
3.  Deploy the `frontend` to Vercel, ensuring the `NEXT_PUBLIC_API_URL` environment variable points to the deployed Render backend URL.
4.  Configure CORS on the backend to accept requests from the Vercel frontend domain.

---

## 📂 Project Structure
skill-sharing-platform/
├── backend/
│ ├── prisma/ # Prisma schema and migrations
│ ├── controllers/ # Route handling logic
│ ├── middleware/ # Custom middleware (e.g., auth)
│ ├── routes/ # API route definitions
│ ├── utils/ # Utility functions (e.g., emailService)
│ ├── .env # Environment variables (local, gitignored)
│ ├── index.js # Express server entry point
│ └── package.json
├── frontend/
│ ├── components/ # Reusable React components
│ ├── context/ # React Context API (e.g., AuthContext)
│ ├── pages/ # Next.js pages (routes)
│ ├── services/ # API service client (axios)
│ ├── styles/ # Global CSS and styles
│ ├── public/ # Static assets
│ ├── .env.local # Environment variables (local, gitignored)
│ ├── next.config.js
│ └── package.json
└── README.md # This file


---

## 💡 Future Enhancements (Potential V2 Features)

*   **Image Uploads:** For user profiles and skill listings (e.g., using Cloudinary or Supabase Storage).
*   **Advanced AI Features:**
    *   AI-powered semantic search for skills.
    *   Personalized skill recommendations.
*   **Real-time In-App Notifications:** Using WebSockets (e.g., Socket.IO).
*   **Pagination:** For skill listings and other long lists.
*   **Public User/Provider Profiles:** Dedicated pages to showcase providers and their skills/reviews.
*   **Payment Integration:** For paid skill sessions (e.g., using Stripe).
*   **Calendar Integration:** For managing booking schedules.
*   **Admin Dashboard:** For platform administration.
*   **More Robust Form Validation & UI Feedback.**

---
