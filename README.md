# Car Dealership Inventory System

A full-stack car dealership inventory management system for managing vehicles, users, authentication, and role-based administrative operations.

The application provides a RESTful FastAPI backend with MongoDB persistence and a responsive React frontend with JWT-based authentication and protected routes.

---

## 🚀 Features

### Vehicle Management
- Browse available vehicles
- View detailed vehicle information
- Search and filter vehicles
- Track vehicle inventory and stock status
- Admin-only inventory management

### Authentication & Authorization
- User registration and login
- JWT-based authentication
- Secure password hashing using Argon2
- Protected frontend routes
- Role-based access control
- Admin-only routes and operations
- Automatic handling of expired/invalid authentication

### Frontend
- Responsive React interface
- TypeScript for type safety
- Tailwind CSS for styling
- Reusable UI components
- Dashboard layout
- Loading states
- Toast notifications
- Form validation
- Protected and public route layouts

### Backend
- RESTful API built with FastAPI
- Async MongoDB operations
- Pydantic-based request/response validation
- JWT authentication
- Argon2 password hashing
- Role-based authorization
- Centralized error handling
- Health check endpoint
- Interactive API documentation

---

## 🏗️ Architecture

```text
┌──────────────────────────────┐
│          React Frontend      │
│                              │
│ React + TypeScript + Vite    │
│ Tailwind CSS + Zustand       │
└──────────────┬───────────────┘
               │
               │ HTTP / REST API
               │ JWT Bearer Token
               ▼
┌──────────────────────────────┐
│        FastAPI Backend       │
│                              │
│ Authentication               │
│ Authorization                │
│ Vehicle Management           │
│ Request Validation            │
└──────────────┬───────────────┘
               │
               │ Async MongoDB
               ▼
┌──────────────────────────────┐
│           MongoDB            │
│                              │
│ Users                        │
│ Vehicles                     │
│ Inventory Data               │
└──────────────────────────────┘
