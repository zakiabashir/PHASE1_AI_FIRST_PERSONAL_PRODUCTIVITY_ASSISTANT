---
title: AI Productivity Assistant API
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: mit
---

# AI Productivity Assistant Backend API

FastAPI backend for the AI Productivity Assistant with JWT authentication, task management, and AI-powered natural language processing.

## Features

- 🔐 JWT Authentication (Register, Login)
- ✅ Task CRUD Operations (Create, Read, Update, Delete, Complete)
- 🤖 AI Chat for Natural Language Task Management
- 📊 Task Summary and Statistics
- 💾 PostgreSQL Database (Neon)
- 🌐 CORS Enabled for Frontend Access

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login and get JWT token

### Tasks
- `GET /api/tasks/` - List all tasks (with optional filters)
- `POST /api/tasks/` - Create new task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `POST /api/tasks/{id}/complete` - Mark task as complete
- `GET /api/tasks/summary/overview` - Get task statistics

### AI Chat
- `POST /api/ai/chat` - Natural language task management

## Environment Variables

Set these in the Space settings:

- `GROQ_API_KEY` - Your Groq API key for AI features
- `DATABASE_URL` - PostgreSQL connection string (e.g., Neon)
- `JWT_SECRET_KEY` - Secret key for JWT tokens (min 32 chars)
- `ACCESS_TOKEN_EXPIRE_MINUTES` - Token expiration time (default: 10080)
- `CORS_ORIGINS` - JSON array of allowed origins (e.g., `["https://your-frontend.vercel.app"]`)

## Usage

### Example Request (Create Task)

```bash
curl -X POST "https://your-space.hf.space/api/tasks/" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Build amazing project",
    "description": "Using AI and FastAPI",
    "priority": "high"
  }'
```

### Example Request (AI Chat)

```bash
curl -X POST "https://your-space.hf.space/api/ai/chat" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Create a task to study React tomorrow"
  }'
```

## Tech Stack

- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database
- **PostgreSQL** - Production database (Neon)
- **JWT** - Authentication
- **Groq SDK** - AI capabilities
- **Docker** - Containerization

## License

MIT License
