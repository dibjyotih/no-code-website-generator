# 🎨 WebWeaver AI - No-Code Website Generator

> AI-powered full-stack website generator with intelligent editing, visual customization, and real-time preview. Generate complete, functional e-commerce applications with shopping carts, payment integration, and dynamic state management.

![Version](https://img.shields.io/badge/version-4.0.0-blue) ![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Key Features

### 🤖 **Intelligent AI Generation**
- **Full-Stack Applications** - Generate complete, functional e-commerce sites with working shopping carts
- **Smart Component Generation** - Natural language → Production-ready React components
- **Unique Element IDs** - Every element gets a unique identifier for precise editing/deletion
- **RAG-Powered Templates** - Vector search retrieves relevant examples from knowledge base
- **Context-Aware Modifications** - AI understands your existing code structure

### 🎨 **Visual Editing Suite**
- **Element Selection** - Click any element to edit (images, text, buttons, containers)
- **Property Panel** - Adjust styles, content, images, and backgrounds visually
- **Background Customization** - 4 beautiful background options (Clean, Purple Gradient, Ocean, Mesh)
- **Element Deletion** - Remove any element with smart data array synchronization
- **Live Preview** - Real-time iframe rendering with interactive elements
- **Automatic Reselection** - Keep editing the same element after changes apply

### 🛠️ **Advanced Features**
- **Image Generation** - AI-generated images via Unsplash integration
- **Price Synchronization** - Changes to prices update both display AND data arrays
- **State Management** - Full React useState/useEffect with shopping cart functionality
- **Payment Integration** - UPI, Razorpay, PayPal links in generated apps
- **Code Validation** - Automatic syntax checking and error handling
- **Code Review** - AI-powered code analysis

### 📦 **Project Management** (Optional - Requires MongoDB)
- **User Authentication** - JWT-based secure login
- **Multi-Project Support** - Save and manage multiple projects
- **Project Export** - Download complete Next.js/Vite projects
- **Deployment Tracking** - Monitor deployments to Vercel/Netlify/Railway

---

## 🚀 Quick Start

### Prerequisites

**Required:**
- **Node.js** (v20.17.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v11.3.0 or higher) - Comes with Node.js
- **Google Gemini API Key** - [Get Free Key](https://makersuite.google.com/app/apikey)

**Optional:**
- **MongoDB** (for user accounts and project persistence)
  - Local: [MongoDB Community Edition](https://www.mongodb.com/try/download/community)
  - Cloud: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) (Free M0 tier)

---

### Installation

#### 1️⃣ **Clone Repository**

```bash
git clone https://github.com/dibjyotih/no-code-website-generator.git
cd no-code-website-generator
```

#### 2️⃣ **Install Dependencies**

```bash
# Install all dependencies (frontend + backend)
npm install

# Note: All backend dependencies are included in the root package.json
# No need to run npm install separately in the backend folder
```

**All Dependencies Installed:**

**Frontend:**
- `react` (v19.0.0) - UI framework
- `react-dom` - React rendering
- `axios` - HTTP client for API calls
- `framer-motion` - Animations
- `react-icons` - Icon library
- `react-syntax-highlighter` - Code display with syntax highlighting
- `@monaco-editor/react` - Monaco code editor
- `@codesandbox/sandpack-react` - Live code preview
- `sucrase` - Fast JSX transformation
- `react-markdown` - Markdown rendering

**Backend:**
- `express` - Web server framework
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management
- `body-parser` - Request body parsing
- `@google/generative-ai` - Google Gemini AI integration
- `langchain` + `@langchain/*` - AI orchestration & RAG system
- `@xenova/transformers` - Local embeddings for vector search
- `hnswlib-node` - Vector similarity search (HNSW algorithm)
- `mongoose` - MongoDB object modeling (optional)
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `multer` - File upload handling
- `cheerio` - HTML/XML parsing
- `acorn` + `acorn-jsx` + `acorn-walk` - JavaScript AST parsing
- `uuid` - Unique ID generation

**Build Tools & Development:**
- `vite` - Fast frontend build tool
- `typescript` - Type checking
- `tsx` - TypeScript execution for Node.js
- `eslint` - Code linting
- `tailwindcss` - Utility-first CSS framework
- `nodemon` - Auto-restart on file changes
- `ts-node` - TypeScript execution

#### 3️⃣ **Configure Environment**

```bash
# Copy environment template
cp backend/.env.example backend/.env

# Edit the backend/.env file
nano backend/.env
# or
code backend/.env
```

**Minimum Configuration (Required):**

```env
# backend/.env

# REQUIRED: Get your free API key from https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Server port (default: 3001)
PORT=3001

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
```

**Optional Configuration (For Full Features):**

```env
# OPTIONAL: MongoDB (enables user accounts & project persistence)
# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/webweaver

# OR MongoDB Atlas (Cloud - Free M0 tier available):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/webweaver

# Authentication (generate a random secret key)
JWT_SECRET=your_random_secret_key_change_this_in_production
```

#### 4️⃣ **Start Application**

**Option A: Using npm scripts (Recommended)**

```bash
# Terminal 1: Start backend server
npm run dev:server

# Terminal 2: Start frontend (open a new terminal)
npm run dev
```

**Option B: Manual start**

```bash
# Terminal 1: Backend
tsx --env-file=backend/.env backend/server.ts

# Terminal 2: Frontend (new terminal)
vite
```

#### 5️⃣ **Access Application**

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

**Click "Continue as Guest"** to start without MongoDB!

---

## 🎯 Usage Guide

### **Guest Mode** (No Database Required) ⚡

Perfect for trying out the app without setting up MongoDB.

**Features Available:**
- ✅ AI component generation (unlimited)
- ✅ Visual editing (styles, content, images)
- ✅ Background customization
- ✅ Element deletion
- ✅ Live preview
- ✅ Code view
- ✅ Code review
- ❌ User accounts (login/register)
- ❌ Save projects (lost on refresh)

**How to Use:**
1. Open http://localhost:5173
2. Click **"Continue as Guest"**
3. Type a prompt: *"Generate a simple ecommerce website for apple product listing with payment integration"*
4. Click **Generate** 🚀
5. Edit elements by clicking on them
6. Use Property Panel to customize styles, content, backgrounds

---

### **Full Mode** (With MongoDB) 💎

Unlock project persistence and user accounts.

#### **Setup MongoDB (Choose One):**

**Option A: MongoDB Atlas (Cloud - Free)**

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free M0 cluster (512MB storage, no credit card required)
3. Create a database user (username + password)
4. Add your IP to allowlist (or allow all: `0.0.0.0/0`)
5. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/webweaver`
6. Add to `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/webweaver
   JWT_SECRET=your_random_secret_here
   ```
7. Restart backend: `npm run dev:server`

**Option B: Local MongoDB**

**Install MongoDB:**

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y mongodb-org

# macOS
brew tap mongodb/brew
brew install mongodb-community

# Windows
# Download installer from: https://www.mongodb.com/try/download/community
```

**Start MongoDB:**

```bash
# Linux (systemd)
sudo systemctl start mongod
sudo systemctl enable mongod  # Start on boot

# macOS
brew services start mongodb-community

# Verify it's running
mongosh  # Should connect to mongodb://localhost:27017
```

**Configure:**

```env
# backend/.env
MONGODB_URI=mongodb://localhost:27017/webweaver
JWT_SECRET=your_random_secret_here
```

**Restart backend:** `npm run dev:server`

#### **Features Unlocked:**
- ✅ User registration & login
- ✅ Save unlimited projects
- ✅ Project management dashboard
- ✅ Export projects as downloadable zip files
- ✅ Deployment tracking (Vercel/Netlify/Railway)
- ✅ Version history (coming soon)

---

## 📖 How It Works

### **1. Component Generation**

**Prompt:** *"Generate a simple ecommerce website for apple product listing"*

**Behind the Scenes:**
1. **RAG System** retrieves relevant templates from knowledge base (11 templates indexed with HNSWLib vector search)
2. **AI Model** (Gemini 2.5 Flash with fallback to 1.5 Flash) generates complete React component with:
   - Unique `data-element-id` for every element (e.g., `img-product-1`, `btn-add-cart-2`, `heading-title`)
   - Full state management with `useState` hooks
   - Shopping cart functionality (add, remove, quantity, totals)
   - Payment integration (UPI/Razorpay/PayPal links)
   - 6+ realistic sample products with images
3. **Code Sanitizer** cleans and validates the generated code
4. **Image Enhancer** replaces placeholder images with real Unsplash URLs
5. **Preview Renderer** displays in iframe with click-to-edit functionality

**Generated Component Includes:**
- Product cards with unique IDs
- Shopping cart with state management
- Add to cart buttons
- Dynamic price calculations (subtotal, tax, shipping, total)
- Search and category filtering
- Checkout modal
- Multiple payment options

---

### **2. Visual Editing**

**Select Element:**
- Click any element in the preview (image, button, text, card)
- Property Panel opens on the right side
- Shows element type and unique ID: `<img>` `🆔 img-product-3`

**Property Panel Tabs:**

**Style Tab:**
- Background Color picker
- Text Color picker
- Font Size slider
- Border Radius slider
- Opacity slider

**Content Tab:**
- Edit text content
- Upload images (converts to base64)
- Enter image URL
- Image prompt (AI-generated images)

**Background Tab:**
- Clean (white background)
- Purple Gradient
- Ocean Gradient
- Dark Mesh

**Layout Tab:**
- Padding slider (0-100px)
- Margin slider (0-100px)

**Actions:**
- **Apply Changes** - Regenerates code with modifications using AI
- **Delete Element** - Removes element from both JSX and data arrays

---

### **3. Smart Modifications**

**Price Changes:**
- When you change a price in the UI, AI automatically updates:
  - Display text (e.g., "₹10,900")
  - Data array (`products[0].price = 10900`)
  - All cart calculations (subtotal, tax, total)

**Image Replacements:**
- Upload image → Converts to base64 data URL
- AI uses placeholder system to avoid syntax errors with large data
- Finds correct product by matching context (name, description)
- Updates `image` property in data array
- Preserves all other functionality

**Element Deletion:**
- Extracts item ID from `data-element-id` (e.g., `card-product-5` → ID: 5)
- Removes element from JSX rendering
- Removes item from data array: `products.filter(p => p.id !== 5)`
- Updates counters, totals, and indexes
- Preserves all other elements and functionality

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 19, TypeScript, Vite, Axios |
| **Backend** | Node.js, Express, TypeScript (tsx) |
| **AI** | Google Gemini 2.5 Flash (primary), 1.5 Flash (fallback) |
| **RAG System** | LangChain, HNSWLib, Xenova Transformers (local embeddings) |
| **Database** | MongoDB + Mongoose (optional) |
| **Authentication** | JWT, bcryptjs |
| **Code Processing** | Acorn (AST parsing), Sucrase (JSX transform) |
| **Image Generation** | Unsplash API integration |
| **Code Editor** | Monaco Editor, Sandpack |

---

## 📂 Project Structure

```
no-code-website-generator/
├── backend/
│   ├── .env.example              # Environment variables template
│   ├── server.ts                 # Main Express server
│   ├── generators/
│   │   ├── component-generator.js   # AI component generation with RAG
│   │   ├── page-generator.js        # Full page generation
│   │   └── project-generator.js     # Complete project generation
│   ├── services/
│   │   ├── gemini-service.js        # Google AI API wrapper
│   │   ├── contextual-modifier.js   # AI-based code modification
│   │   ├── code-sanitizer.js        # Code cleaning & validation
│   │   ├── code-validator.js        # Syntax error checking
│   │   ├── image-generator.js       # Unsplash image integration
│   │   ├── auth.js                  # JWT authentication logic
│   │   ├── api-generator.js         # CRUD API generation
│   │   ├── database-generator.js    # Database schema generation
│   │   └── project-exporter.js      # Project zip file export
│   ├── rag-system/
│   │   ├── index.js                 # Main RAG system coordinator
│   │   ├── enhanced-index.js        # Vector store setup
│   │   ├── component-graph.js       # Component relationships
│   │   └── style-system.js          # Style suggestions
│   ├── hnsw-data/                # Vector store index files
│   │   ├── docstore.json           # Document store
│   │   ├── hnswlib.index           # HNSW index
│   │   └── args.json               # Index configuration
│   ├── knowledge-base/
│   │   ├── components.json          # 10 component templates
│   │   ├── fullstack-templates.json # Full e-commerce template (2000+ lines)
│   │   └── app-templates.json       # Application templates
│   ├── models/
│   │   ├── User.js                  # User schema (MongoDB)
│   │   ├── Project.js               # Project schema
│   │   └── Deployment.js            # Deployment tracking
│   └── types/
│       └── express.d.ts             # TypeScript definitions
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── Dashboard/
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── ProjectManager.tsx
│   │   ├── Editor/
│   │   │   ├── EditorWorkspace.tsx     # Main editor with element selection
│   │   │   ├── PropertyPanel.tsx       # Visual property editor with tabs
│   │   │   ├── InteractivePreview.tsx  # Iframe with click-to-edit
│   │   │   ├── CodeView.tsx            # Syntax-highlighted code viewer
│   │   │   └── ComponentTree.tsx       # Component hierarchy viewer
│   │   ├── AIGenerator/
│   │   │   └── index.tsx               # AI generation UI
│   │   ├── AIEditor/
│   │   │   ├── InPlaceEditor.tsx       # Inline editing
│   │   │   ├── PromptInput.tsx         # AI prompt interface
│   │   │   └── ModificationPreview.tsx # Change preview
│   │   ├── Landing/
│   │   │   └── LandingPage.tsx         # Landing page
│   │   └── UI/
│   │       └── Toolbar.tsx             # Editor toolbar
│   ├── contexts/
│   │   ├── AuthContext.tsx          # User authentication state
│   │   ├── CodeContext.tsx          # Generated code state
│   │   └── EditorContext.tsx        # Editor state management
│   ├── hooks/
│   │   ├── useAuth.ts               # Authentication hook
│   │   ├── useComponentSelection.ts # Element selection logic
│   │   ├── useVisualEditing.ts      # Visual editing logic
│   │   └── useLivePreview.ts        # Live preview management
│   ├── styles/
│   │   └── lovable-theme.css        # Custom theme styles
│   ├── App.tsx                      # Main app component
│   └── main.tsx                     # React entry point
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── tsconfig.server.json             # Backend TypeScript config
├── vite.config.ts                   # Vite build configuration
└── README.md                        # This file
```

---

## 🐛 Troubleshooting

### **"Cannot find module" Errors**

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

### **Backend Won't Start**

**Symptom:** `Error: GEMINI_API_KEY is not set`

**Solution:**
1. Verify `backend/.env` file exists
2. Check `GEMINI_API_KEY=your_actual_key` (no quotes, no extra spaces)
3. Get a free API key from: https://makersuite.google.com/app/apikey
4. Restart backend: `npm run dev:server`

---

### **"Port 3001 Already in Use"**

**Solution:**
```bash
# Linux/macOS
lsof -ti:3001 | xargs kill -9

# Or manually
ps aux | grep tsx
kill -9 <PID>

# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

---

### **"Port 5173 Already in Use"**

**Solution:**
```bash
# Linux/macOS
lsof -ti:5173 | xargs kill -9

# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

---

### **MongoDB Connection Failed**

**Symptom:** `MongoServerError: bad auth` or `ECONNREFUSED`

**Solution for Cloud (Atlas):**
1. Verify username/password in connection string
2. IP whitelist: Add `0.0.0.0/0` to Network Access to allow all IPs
3. Ensure database user has `readWrite` permission
4. Test connection in MongoDB Compass first

**Solution for Local:**
```bash
# Check if MongoDB is running
sudo systemctl status mongod  # Linux
brew services list  # macOS

# Start if stopped
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS

# Test connection
mongosh mongodb://localhost:27017/webweaver
```

**Note:** App works perfectly without MongoDB! Just click "Continue as Guest"

---

### **AI Generation Fails**

**Symptom:** `Error generating component` or `API quota exceeded`

**Solution:**
1. Verify API key is correct in `backend/.env` (no extra characters)
2. Check Gemini API quota at: https://makersuite.google.com/app/apikey
3. Free tier limits: 60 requests/minute
4. Wait 1 minute and retry
5. Check backend logs for detailed errors:
   ```bash
   tail -f backend.log
   ```

---

### **Frontend Can't Reach Backend (CORS)**

**Symptom:** `Network Error` or `CORS policy` errors in browser console

**Solution:**
1. Verify backend is running on port 3001: http://localhost:3001
2. Verify frontend is running on port 5173: http://localhost:5173
3. Check `backend/.env` has:
   ```env
   FRONTEND_URL=http://localhost:5173
   ```
4. Restart both servers
5. Clear browser cache (Ctrl+Shift+Delete)

---

### **Images Not Loading**

**Symptom:** Broken image icons in preview

**Solution:**
- Generated images use Unsplash CDN (requires internet connection)
- Check your internet connection
- Unsplash API has rate limits (50 requests/hour for free tier)
- Generated components use cached Unsplash URLs which should work offline

---

### **Code Preview Blank/White Screen**

**Symptom:** Preview iframe shows nothing or white screen

**Solution:**
1. Open browser console (F12) and check for JavaScript errors
2. Look for JSX syntax errors in the generated code
3. Try regenerating the component: Click "Regenerate" button
4. Start with a simpler prompt to test
5. Check if iframe sandbox is blocking scripts

---

### **Changes Not Applying**

**Symptom:** Click "Apply Changes" but nothing updates

**Solution:**
1. Verify backend is running: `npm run dev:server`
2. Check browser console for error messages (F12)
3. Verify selected element has a unique ID (should show `🆔 element-name` in Property Panel)
4. Try refreshing the page (F5) and selecting element again
5. Check backend logs for modification errors

---

## 📚 API Documentation

### **Component Generation**

```bash
POST http://localhost:3001/generate
Content-Type: application/json

{
  "prompt": "Create a hero section with gradient background and CTA button"
}

# Response
{
  "code": "import React from 'react'...",
  "metadata": {
    "componentName": "HeroSection",
    "description": "Hero section component"
  }
}
```

---

### **Code Modification**

```bash
POST http://localhost:3001/modify
Content-Type: application/json

{
  "componentCode": "import React from 'react'...",
  "prompt": "Change button color to blue",
  "context": {
    "elementId": "btn-submit-1",
    "elementType": "button"
  },
  "imageDataUrl": "data:image/png;base64,..." # Optional
}

# Response
{
  "code": "import React from 'react'..." # Modified component
}
```

---

### **Image Upload Generation**

```bash
POST http://localhost:3001/generate
Content-Type: multipart/form-data

prompt: "Create this landing page design"
image: [file.png/jpg]

# Response
{
  "code": "import React from 'react'..." # Component based on image
}
```

---

### **Authentication Endpoints** (Requires MongoDB)

```bash
# Register New User
POST http://localhost:3001/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123"
}

# Response
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "6123...",
    "username": "johndoe",
    "email": "john@example.com"
  }
}

# Login
POST http://localhost:3001/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}

# Response
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}

# Get User Profile
GET http://localhost:3001/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

# Response
{
  "user": {
    "id": "6123...",
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### **Project Management** (Requires MongoDB)

```bash
# List All Projects
GET http://localhost:3001/projects
Authorization: Bearer YOUR_JWT_TOKEN

# Create New Project
POST http://localhost:3001/projects
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "My Awesome Website",
  "description": "A modern e-commerce landing page",
  "code": "import React...",
  "type": "component"
}

# Get Single Project
GET http://localhost:3001/projects/:projectId
Authorization: Bearer YOUR_JWT_TOKEN

# Update Project
PUT http://localhost:3001/projects/:projectId
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Updated Name",
  "code": "import React..."
}

# Delete Project
DELETE http://localhost:3001/projects/:projectId
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🚀 Deployment

### **Backend Deployment (Railway / Render / Heroku)**

1. **Push code to GitHub**
2. **Connect repository** to your hosting platform
3. **Set environment variables:**
   ```
   GEMINI_API_KEY=your_gemini_api_key
   MONGODB_URI=your_mongodb_connection_string (optional)
   JWT_SECRET=your_random_secret_key
   PORT=3001 (or platform default)
   FRONTEND_URL=https://your-frontend-domain.com
   NODE_ENV=production
   ```
4. **Build command:** `npm run build:server` (optional)
5. **Start command:** `npm run dev:server` or `tsx backend/server.ts`
6. **Deploy!**

---

### **Frontend Deployment (Vercel / Netlify)**

**Build and Deploy:**

```bash
# Build for production
npm run build

# The dist/ folder will contain the production build
# Deploy this folder to your hosting platform
```

**Update API URL for Production:**

Edit `src/contexts/CodeContext.tsx` and `src/contexts/AuthContext.tsx`:

```typescript
// Change this:
const API_URL = 'http://localhost:3001';

// To your production backend URL:
const API_URL = 'https://your-backend-url.railway.app';
```

**Vercel Deployment (Recommended):**
1. Push code to GitHub
2. Import project to Vercel
3. Vercel auto-detects Vite
4. Set `VITE_API_URL` environment variable
5. Deploy automatically

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-new-feature
   ```
3. **Make your changes** and commit:
   ```bash
   git commit -m 'Add amazing new feature'
   ```
4. **Push to your fork:**
   ```bash
   git push origin feature/amazing-new-feature
   ```
5. **Open a Pull Request** on GitHub

**Contribution Guidelines:**
- Follow existing code style
- Add tests for new features
- Update documentation
- Keep commits atomic and well-described

---

## 📝 License

MIT License - See [LICENSE](LICENSE) file for details

---

## 🙏 Credits & Acknowledgments

This project is built with incredible open-source technologies:

- **[React](https://react.dev/)** by Meta - UI framework
- **[Vite](https://vitejs.dev/)** by Evan You - Fast build tool
- **[Google Generative AI](https://ai.google.dev/)** - Gemini AI models
- **[LangChain](https://js.langchain.com/)** - AI orchestration framework
- **[HNSWLib](https://github.com/nmslib/hnswlib)** - Vector similarity search
- **[MongoDB](https://www.mongodb.com/)** - NoSQL database
- **[Express.js](https://expressjs.com/)** - Web framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Unsplash](https://unsplash.com/)** - Free high-quality images
- **[Monaco Editor](https://microsoft.github.io/monaco-editor/)** - VS Code's editor
- And many more amazing open-source libraries! ❤️

Special thanks to all contributors and the open-source community.

---

## 💬 Support & Community

- **GitHub Issues**: [Report bugs or request features](https://github.com/dibjyotih/no-code-website-generator/issues)
- **GitHub Discussions**: [Ask questions and share ideas](https://github.com/dibjyotih/no-code-website-generator/discussions)
- **Documentation**: This README + inline code comments
- **Email**: support@webweaverai.com (coming soon)

---

## 🗺️ Roadmap

**Coming Soon:**
- [ ] Version history and undo/redo
- [ ] Real-time collaboration
- [ ] Custom component templates
- [ ] Theme marketplace
- [ ] One-click deployment
- [ ] Mobile app support
- [ ] Plugin system
- [ ] AI code optimization
- [ ] Performance analytics

---

**Made with ❤️ using AI**

Start building amazing websites today! 🚀

**Happy Coding!** 💻✨
