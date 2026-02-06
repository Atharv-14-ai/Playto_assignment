# Playto Community Feed Challenge

A complete community feed with threaded discussions and dynamic leaderboard, built for the Playto Engineering Challenge.

## 🚀 Features

- ✅ **User Authentication** - Register, login, logout
- ✅ **Community Feed** - Create and view posts with authors
- ✅ **Nested Comments** - Reddit-style threaded discussions
- ✅ **Gamification** - Post likes = 5 karma, Comment likes = 1 karma
- ✅ **Real-time Leaderboard** - Top 5 users by 24-hour karma
- ✅ **Performance Optimized** - No N+1 queries, thread-safe operations
- ✅ **Responsive Design** - Tailwind CSS for all devices

## 🏗️ Tech Stack

**Backend:**
- Django 4.2.7
- Django REST Framework 3.14.0
- PostgreSQL (production) / SQLite (development)
- Token & Session Authentication

**Frontend:**
- React 18 with Vite
- Tailwind CSS 3.3.0
- Axios for API calls

**Database:**
- PostgreSQL for production
- SQLite for development (included)

## 📦 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL (optional, SQLite works for dev)

### Option 1: Local Development (Recommended)

#### Backend Setup:
```bash
# Clone repository
git clone https://github.com/Atharv-14-ai/Playto_assignment.git
cd playto-community-feed/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup database
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser
# Username: admin
# Email: admin@example.com
# Password: admin123

# Run development server
python manage.py runserver
Frontend Setup:
bash
# Open new terminal
cd playto-community-feed/frontend

# Install dependencies
npm install

# Start development server
npm run dev
Option 2: Docker Setup
bash
# Build and run with Docker Compose
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Admin Panel: http://localhost:8000/admin
🔧 Configuration
Environment Variables (Backend)
Create .env file in backend/ directory:

env
# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (PostgreSQL)
DB_NAME=playto_feed
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
Frontend Configuration
The frontend is pre-configured to connect to http://localhost:8000/api. To change the API URL, update API_BASE_URL in frontend/src/App.jsx.

📱 Application URLs
Frontend Application: http://localhost:5173 (dev) or http://localhost:3000 (Docker)

Backend API: http://localhost:8000/api

API Documentation: http://localhost:8000/api (DRF browsable API)

Admin Panel: http://localhost:8000/admin

Health Check: http://localhost:8000/api/feed/

🧪 Testing
Backend Tests:
bash
cd backend
python manage.py test feed.tests
API Testing with curl:
bash
# Test feed endpoint
curl http://localhost:8000/api/feed/

# Test leaderboard
curl http://localhost:8000/api/leaderboard/

# Test authentication
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
🚀 Deployment
Railway Deployment (Recommended)
Backend to Railway:

bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link and deploy backend
cd backend
railway link
railway up
Frontend to Vercel:

bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel
Manual Deployment
Backend (Gunicorn + Nginx):

bash
# Install Gunicorn
pip install gunicorn

# Collect static files
python manage.py collectstatic

# Run with Gunicorn
gunicorn backend.wsgi:application --bind 0.0.0.0:8000 --workers 4
Frontend (Build & Serve):

bash
cd frontend
npm run build

# Serve with Nginx or any static file server
serve -s dist -l 3000
📊 API Endpoints
Method	Endpoint	Description	Auth Required
GET	/api/feed/	Get all posts with nested comments	No
GET	/api/leaderboard/	Get top 5 users by 24h karma	No
POST	/api/auth/register/	Register new user	No
POST	/api/auth/login/	Login user	No
POST	/api/auth/logout/	Logout user	Yes
GET	/api/auth/user/	Get current user	Yes
GET	/api/posts/	List all posts	No
POST	/api/posts/	Create new post	Yes
POST	/api/posts/{id}/like/	Like/unlike post	Yes
GET	/api/comments/	List comments	No
POST	/api/comments/	Create comment	Yes
POST	/api/comments/{id}/like/	Like/unlike comment	Yes
🔒 Authentication
The system uses dual authentication:

Session Authentication for web interface

Token Authentication for API calls

Default Test Credentials:
Username: admin

Password: admin123

🎯 Technical Highlights
Performance Optimizations:
N+1 Prevention: Single query loads all nested comments

Thread-safe Likes: Row-level locking prevents race conditions

Efficient Leaderboard: Single query with conditional aggregation

Caching: User karma cached in profile table

Database Design:
Posts: Simple model with author and content

Comments: Adjacency list pattern with parent field

Likes: Generic foreign key for both posts and comments

User Profiles: Extended user model with karma tracking

🐛 Troubleshooting
Common Issues:
CORS Errors:

python
# In backend/settings.py
CORS_ALLOW_ALL_ORIGINS = True  # For development
CORS_ALLOW_CREDENTIALS = True
Database Connection:

bash
# Reset database
python manage.py flush
python manage.py migrate
Frontend Not Connecting:

Check browser console for errors

Verify backend is running on port 8000

Check CORS settings

Forms Losing Focus:

This is fixed in the current implementation using memoized components

Logs:
Backend logs: Check terminal running Django server

Frontend logs: Browser Developer Tools (F12)

Database logs: Check PostgreSQL logs or SQLite file

🤝 Contributing
Fork the repository

Create a feature branch

Commit your changes

Push to the branch

Create a Pull Request

📄 License
MIT License - see LICENSE file for details.

🙏 Acknowledgements
Django & Django REST Framework teams

React & Vite communities

Tailwind CSS for amazing utility-first CSS

Playto for the engineering challenge

📞 Support
For issues, please:

Check the troubleshooting section

Search existing GitHub issues

Create a new issue with details
