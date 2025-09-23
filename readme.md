# SvaraAI – Task & Project Management System

**Duration:** 22-09-2025 to 24-09-2025  
**Tech Stack:** Next.js 15, React.js, TailwindCSS, Node.js, Express.js, MongoDB  
**Author:** Dhiraj Manoj Bhawsar

---

## 📝 Overview

This project is a **Task & Project Management System** built with a modern tech stack.  
It features:

- User authentication (Signup/Login/Logout) with JWT.
- Project management (Create/List/Delete projects).
- Task management (Create/Edit/Delete tasks, filter & pagination).
- Kanban-style board with drag-and-drop tasks.
- Dashboard with task summary, charts, and overdue tasks.
- Beautiful, responsive UI using TailwindCSS.
- Modular and maintainable code following **SOLID**, **DRY**, and **YAGNI** principles.

---

## 📂 Folder Structure

### Backend (`/backend`)

```
backend/
│── node_modules/
│── src/
│   ├── config/              # Database & config files
│   │   └── db.js
│   │
│   ├── controllers/         # Controllers (C in MVC)
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   └── taskController.js
│   │
│   ├── middlewares/         # Middleware functions
│   │   └── authMiddleware.js
│   │
│   ├── models/              # Models (M in MVC)
│   │   ├── Project.js
│   │   ├── Task.js
│   │   └── User.js
│   │
│   ├── routes/              # Routes (connects routes → controllers)
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   └── taskRoutes.js
│   │
│   ├── utils/               # Helper functions / utilities
│   │   └── generateToken.js
│   │
│   ├── views/ (optional)    # Only if you use templating (e.g., EJS, Handlebars)
│   │   └── ...
│   │
│   └── server.js            # App entry point
│
├── .env                     # Environment variables
├── .gitignore
├── package.json
├── package-lock.json



```



### Frontend (`/frontend`)


```

frontend/
├─ public/
│   └─ favicon.ico
├─ src/
│   ├─ app/
│   │   ├─ auth/
│   │   │   ├─ login/page.tsx
│   │   │   └─ signup/page.tsx
│   │   ├─ projects/
│   │   │   ├─ [id]/kanban/page.tsx
│   │   │   └─ page.tsx
│   │   ├─ globals.css
│   │   ├─ layout.tsx
│   │   └─ page.tsx
│   ├─ components/
│   │   ├─ dashboard/
│   │   │   └─ DashBoard.tsx
│   │   ├─ logoutbutton/
│   │   │   └─ Logout.tsx
│   │   └─ NewProjectFieldSets/
│   │       └─ InputField.tsx
│   ├─ ui/
│   │   ├─ alert.tsx
│   │   ├─ badge.tsx
│   │   ├─ border-beam.tsx
│   │   ├─ button.tsx
│   │   ├─ calendar.tsx
│   │   ├─ card.tsx
│   │   ├─ dialog.tsx
│   │   ├─ dropdown-menu.tsx
│   │   ├─ input.tsx
│   │   ├─ label.tsx
│   │   ├─ popover.tsx
│   │   ├─ progress.tsx
│   │   ├─ select.tsx
│   │   ├─ separator.tsx
│   │   └─ textarea.tsx
│   └─ lib/
│       └─ utils.ts
├─ .gitignore
├─ components.json
├─ eslint.config.mjs
├─ next-env.d.ts
├─ next.config.ts
├─ package.json
├─ package-lock.json
├─ postcss.config.mjs
└─ tsconfig.json

```




---

## ⚙️ Setup Instructions

### Backend Setup
1. Navigate to backend folder:
```bash
cd backend
```
2. Install dependencies:

```bash
npm instal or npm i 
```

3. Create .Env File 

```bash
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
PORT=5000
```
4. Start the server:

```bash 
npm run dev 
```






### Frontend Setup
1. Navigate to Frontend folder:
```bash
cd frontend 
```
2. Install dependencies:

```bash
npm instal or npm i 
```
3. Start the server:

```bash 
npm run dev 
```


---

## 🛠 Features

### Backend
- **Authentication:** JWT-based signup, login, logout.
- **Projects API:** CRUD operations.
- **Tasks API:** CRUD operations with filters (status, priority, deadline) and pagination.
- **Modular Architecture:** Controllers → Services → Repositories.
- **Testing:** Jest unit test for tasks API.

### Frontend
- **Authentication Pages:** Signup/Login with validation.
- **Projects Page:** Create and list projects.
- **Kanban Board:** Drag-and-drop tasks with priority colors.
- **Task Modal:** Add/edit tasks with validation.
- **Dashboard:** Summary of projects, tasks, overdue tasks, charts using Recharts.
- **Responsive UI:** Works on desktop and mobile.

---

## 📊 Architecture Choices
- **Backend:** Separated controllers, services, and repositories for clean code & testability.
- **Frontend:** Reusable components and context API for auth state management.
- **State Management:** React hooks + context for simplicity.
- **Styling:** TailwindCSS v4 for modern, responsive UI.
- **Charting:** Recharts for simple, lightweight task summaries.
- **Code Quality:** Adhered to SOLID, DRY, and YAGNI principles.

---

## ✅ Technologies Used
- **Frontend:** Next.js 15, React.js, TailwindCSS v4, Recharts
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Authentication:** JWT
- **Testing:** Jest (backend unit test)

---

## 📌 Notes
- Ensure MongoDB is running locally or use Atlas.
- All APIs are modular and follow RESTful conventions.
- UI is fully responsive and mobile-friendly.
- Drag-and-drop in Kanban is implemented with modern React patterns.
