# 🎨 WebWeaver AI - No-Code Website Generator

> AI-powered React component generator with live preview, code review, and full-stack project export capabilities.

![Version](https://img.shields.io/badge/version-4.0.0-blue) ![License](https://img.shields.io/badge/license-MIT-green)

---

## 🚀 Quick Start (5 Minutes)

### 1. Setup Environment

```bash
# Install dependencies
npm install
cd backend && npm install && cd ..

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env and add your GEMINI_API_KEY
```

### 2. Start Servers

```bash
# Terminal 1: Backend
npm run dev:server

# Terminal 2: Frontend  
npm run dev
```

### 3. Access Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Click "Continue as Guest"** to start generating components!

---

## ✨ Features

### 🤖 AI-Powered Generation
- **Component Generation** - Natural language → React components with inline styles
- **Database Schema Design** - Generate PostgreSQL/Prisma schemas
- **API Route Generation** - Auto-generate CRUD APIs with authentication
- **Code Review** - AI-powered code analysis and suggestions
- **Code Modification** - Context-aware code updates

### 🎨 Development Tools
- **Live Preview** - Real-time component rendering in iframe
- **Visual Editor** - Component tree and property panel
- **Code Editor** - Syntax highlighting and validation
- **Image Upload** - Generate components from wireframes/mockups

### 📦 Project Management (Requires MongoDB)
- **Multi-Project Support** - Manage multiple projects
- **User Authentication** - JWT-based auth with bcrypt
- **Version History** - Track component changes
- **Team Collaboration** - Ready for multi-user workflows

### 🚀 Deployment & Export
- **Full-Stack Export** - Complete Next.js or Vite projects
- **Deployment Tracking** - Vercel, Netlify, Railway, AWS
- **One-Click Deploy** - (Coming soon)

---

## 🛠️ Tech Stack

**Frontend**: React 18 • TypeScript • Vite • Axios  
**Backend**: Node.js • Express • TypeScript  
**AI**: Google Generative AI (Gemini 2.0)  
**Database**: MongoDB + Mongoose (optional)  
**Auth**: JWT • bcrypt  

---

## 📋 Environment Variables

### Required (Minimum Setup)

```bash
# backend/.env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
```

### Optional (Full Features)

```bash
# Database (enables user accounts & project persistence)
MONGODB_URI=mongodb://localhost:27017/webweaver
# or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/webweaver

# Authentication
JWT_SECRET=your-secret-key-change-in-production
```

---

## 🎯 Usage Guide

### Guest Mode (No Database Required)

1. Start the servers (see Quick Start)
2. Open http://localhost:5173
3. Click **"Continue as Guest"**
4. Start generating components!

**Available Features:**
- ✅ AI component generation
- ✅ Code review and modification
- ✅ Live preview
- ❌ User accounts
- ❌ Project persistence

### Full Mode (With MongoDB)

**Setup MongoDB:**

**Option A: MongoDB Atlas (Free Cloud - Recommended)**

1. Go to https://mongodb.com/cloud/atlas/register
2. Create free M0 cluster
3. Get connection string
4. Add to `backend/.env`:
   ```bash
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/webweaver
   ```
5. Restart backend server

**Option B: Local MongoDB**

```bash
# Install MongoDB
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS  
brew install mongodb-community

# Start MongoDB
sudo systemctl start mongodb  # Linux
brew services start mongodb-community  # macOS

# Add to backend/.env
MONGODB_URI=mongodb://localhost:27017/webweaver
```

**Features Unlocked:**
- ✅ User registration & login
- ✅ Multi-project management
- ✅ Project persistence
- ✅ Team collaboration
- ✅ Deployment tracking

---

## 📖 API Documentation

### Authentication Endpoints

```bash
# Register
POST http://localhost:3001/auth/register
Content-Type: application/json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepass123"
}

# Login
POST http://localhost:3001/auth/login
Content-Type: application/json
{
  "email": "john@example.com",
  "password": "securepass123"
}

# Get Profile (Protected)
GET http://localhost:3001/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

### Component Generation

```bash
# Generate Component
POST http://localhost:3001/generate
Content-Type: application/json
{
  "prompt": "Create a hero section with gradient background and CTA button"
}

# With Image
POST http://localhost:3001/generate
Content-Type: multipart/form-data
prompt: "Create this landing page"
image: [file upload]
```

### Project Management (Protected)

```bash
# List Projects
GET http://localhost:3001/projects
Authorization: Bearer YOUR_JWT_TOKEN

# Create Project
POST http://localhost:3001/projects
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
{
  "name": "My Awesome Website",
  "description": "A modern landing page"
}

# Get Project
GET http://localhost:3001/projects/:id
Authorization: Bearer YOUR_JWT_TOKEN

# Update Project
PUT http://localhost:3001/projects/:id
Authorization: Bearer YOUR_JWT_TOKEN

# Delete Project
DELETE http://localhost:3001/projects/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

### AI Generation (Protected)

```bash
# Generate Database Schema
POST http://localhost:3001/generate/database-schema
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
{
  "prompt": "Create an e-commerce schema with products, orders, and customers"
}

# Generate API Routes
POST http://localhost:3001/generate/api-routes
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
{
  "model": "Product",
  "options": {
    "includeAuth": true,
    "includePagination": true
  }
}

# Generate Auth System
POST http://localhost:3001/generate/auth-system
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
{
  "appType": "nextjs"
}
```

### Export & Deployment (Protected)

```bash
# Export Project
POST http://localhost:3001/projects/:id/export
Authorization: Bearer YOUR_JWT_TOKEN

# Deploy Project
POST http://localhost:3001/projects/:id/deploy
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
{
  "platform": "vercel"
}

# List Deployments
GET http://localhost:3001/deployments
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 💎 Subscription Tiers (Future Feature)

### Free Tier
- 50 components/month
- 5 projects max
- Guest mode unlimited

### Pro Tier - $9.99/month
- 1,000 components/month
- Unlimited projects
- Priority AI processing
- Advanced features

### Enterprise Tier - $49.99/month
- Unlimited everything
- Custom integrations
- Team collaboration
- 24/7 support

---

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Symptom**: "Database not available" errors

**Solution**: The app works without MongoDB! Click "Continue as Guest" or set up MongoDB:

1. **Free MongoDB Atlas**: https://mongodb.com/cloud/atlas
2. **Local MongoDB**: `sudo apt-get install mongodb`
3. Add `MONGODB_URI` to `backend/.env`
4. Restart backend

### CORS Errors

**Symptom**: Frontend can't reach backend

**Solution**:
- Ensure backend runs on port 3001
- Ensure frontend runs on port 5173
- Check both servers are running

### Gemini API Errors

**Symptom**: Component generation fails

**Solution**:
1. Verify `GEMINI_API_KEY` in `backend/.env`
2. Get key from: https://makersuite.google.com/app/apikey
3. Check API quota limits

### Port Already in Use

**Symptom**: "EADDRINUSE" error

**Solution**:
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Kill process on port 5173  
lsof -ti:5173 | xargs kill -9
```

---

## 📂 Project Structure

```
no-code-website-generator/
├── backend/
│   ├── models/              # MongoDB schemas
│   │   ├── User.js          # User authentication
│   │   ├── Project.js       # Project storage
│   │   └── Deployment.js    # Deployment tracking
│   ├── services/
│   │   ├── auth.js          # JWT authentication
│   │   ├── database-generator.js  # AI DB schema
│   │   ├── api-generator.js       # AI API routes
│   │   ├── project-exporter.js    # Project export
│   │   ├── code-validator.js      # Code review
│   │   └── gemini-service.js      # AI wrapper
│   ├── generators/
│   │   └── component-generator.js # AI component gen
│   ├── rag-system/          # Vector search
│   │   ├── index.js
│   │   └── enhanced-index.js
│   ├── types/
│   │   └── express.d.ts     # TypeScript types
│   └── server.ts            # Main server
├── src/
│   ├── components/
│   │   ├── Auth/            # Login/Register/Guest
│   │   ├── Dashboard/       # Project management
│   │   ├── Editor/          # Code editor
│   │   ├── Preview/         # Live preview
│   │   └── Layout/          # App layout
│   ├── contexts/
│   │   ├── AuthContext.tsx  # Auth state
│   │   └── CodeContext.tsx  # Code state
│   └── hooks/               # Custom React hooks
├── README.md                # This file
└── package.json
```

---

## 🚢 Deployment

### Backend (Railway/Render/Heroku)

1. Push to Git repository
2. Connect to platform
3. Set environment variables:
   - `GEMINI_API_KEY`
   - `MONGODB_URI` (optional)
   - `JWT_SECRET`
   - `PORT` (usually auto-set)
4. Deploy!

### Frontend (Vercel/Netlify)

```bash
npm run build
# Deploy dist/ folder
```

Or connect Git repository for automatic deployments.

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🙏 Credits

Built with:
- React by Meta
- Vite by Evan You
- Google Generative AI
- MongoDB
- Express.js
- And many amazing open-source projects

---

## 💬 Support

- **Issues**: GitHub Issues
- **Documentation**: This README
- **Email**: support@webweaverai.com

---

**Made with ❤️ using AI**

Start building amazing websites today! 🚀
