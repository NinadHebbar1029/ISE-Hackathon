# 🏥 VerboCare - AI-Powered Telehealth Platform

![VerboCare Banner](https://img.shields.io/badge/VerboCare-Healthcare%20Platform-6366f1?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-20-green?style=flat-square&logo=node.js)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange?style=flat-square&logo=mysql)

> A modern, AI-powered telehealth platform designed to bridge healthcare gaps in underserved communities through intelligent case triage, multi-language support, and seamless patient-doctor communication.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [AI Triage System](#-ai-triage-system)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**VerboCare** is a comprehensive telehealth platform that leverages AI to provide intelligent medical case triage, enabling healthcare workers to efficiently manage and prioritize patient cases in resource-limited settings.

### 🎯 Problem Statement

In many underserved communities, healthcare access is limited by:
- ❌ Shortage of medical professionals
- ❌ Language barriers
- ❌ Lack of immediate medical assessment
- ❌ Inefficient case prioritization

### ✅ Our Solution

VerboCare addresses these challenges through:
- ✨ **AI-Powered Triage** - Intelligent urgency classification (Critical/Urgent/Moderate/Low)
- 🌍 **Multi-Language Support** - English, Spanish, French, Hindi, Chinese
- 🎤 **Voice-to-Text Input** - Accessibility for patients with literacy challenges
- 👥 **Role-Based Access** - Patient, Health Worker, Doctor, Administrator
- 📊 **Real-Time Analytics** - Dashboard insights for case management

---

## 🚀 Features

### For Patients 👤
- 📝 **Voice-enabled case submission** with real-time transcription
- 🤖 **Instant AI triage** with urgency classification
- 📱 **Track case status** and receive AI-powered recommendations
- 🌐 **Multi-language interface** for accessibility
- 💬 **Secure messaging** with healthcare providers

### For Health Workers 🩺
- 📋 **Case management dashboard** with advanced filtering
- 🚨 **Priority-based case lists** (Critical/Urgent alerts)
- ✍️ **Submit cases on behalf of patients**
- 📊 **Workload analytics** by urgency level
- 🔍 **Search and sort** by urgency, status, area

### For Doctors ⚕️
- 👨‍⚕️ **Review assigned cases** with AI triage insights
- 💊 **Provide medical advice** and treatment plans
- 🔄 **Case status management** (In Progress → Completed)
- 📈 **Performance metrics** and case statistics

### For Administrators ⚙️
- 👥 **User management** (Create/Edit/Delete users)
- 🗺️ **Area management** (Define service regions)
- 📊 **System-wide analytics** (Cases by status, urgency, area)
- 🔧 **Worker-to-area assignments**
- 📈 **Platform health monitoring**

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Voice Input**: Web Speech API

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL 8.0
- **ORM**: mysql2 (raw queries)
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs, CORS

### AI Service
- **Rule-Based Engine**: VerboCare-SmartTriage-v1.0
- **Symptom Analysis**: Keyword-based urgency classification
- **Language**: TypeScript
- **Framework**: Express.js

### DevOps
- **Process Manager**: ts-node-dev (development)
- **Database Migration**: SQL scripts
- **Scripts**: Batch scripts for Windows (start.bat, stop.bat)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│                    http://localhost:3000                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌──────────────┐  │
│  │ Patient │  │  Worker │  │  Doctor │  │ Admin Panel  │  │
│  └─────────┘  └─────────┘  └─────────┘  └──────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API (JWT Auth)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Express.js)                       │
│                    http://localhost:5000                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │   Auth   │  │  Cases   │  │  Users   │  │   Areas   │  │
│  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes   │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────┘  │
└────────────┬───────────────────────────┬────────────────────┘
             │                           │
             ▼                           ▼
┌─────────────────────┐     ┌─────────────────────────────────┐
│   MySQL Database    │     │  AI Service (Express.js)        │
│   verbocare DB      │     │  http://localhost:5001          │
│  ┌───────────────┐  │     │  ┌──────────────────────────┐  │
│  │ users         │  │     │  │ VerboCare-SmartTriage    │  │
│  │ areas         │  │     │  │ - Symptom Analysis       │  │
│  │ cases         │  │     │  │ - Urgency Classification │  │
│  │ case_triage   │  │     │  │ - Risk Assessment        │  │
│  │ assignments   │  │     │  └──────────────────────────┘  │
│  │ messages      │  │     └─────────────────────────────────┘
│  └───────────────┘  │
└─────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.x or higher
- **MySQL** 8.0 or higher
- **Git**
- **Windows** (for batch scripts) or Unix-like system

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/NinadHebbar1029/ISE-Hackathon.git
   cd ISE-Hackathon
   ```

2. **Install dependencies**
   ```bash
   # Root (Frontend)
   npm install

   # Backend
   cd server
   npm install
   cd ..

   # AI Service
   cd ai-service
   npm install
   cd ..
   ```

3. **Configure environment variables**

   **Backend** (`server/.env`):
   ```env
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=verbocare
   PORT=5000
   JWT_SECRET=your_secret_key_change_in_production
   ```

   **AI Service** (`ai-service/.env`):
   ```env
   PORT=5001
   CORS_ORIGIN=http://localhost:3000
   ```

   **Frontend** (`.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:5001
   NODE_ENV=development
   ```

4. **Setup MySQL Database**
   ```bash
   # Create database
   mysql -u root -p -e "CREATE DATABASE verbocare;"

   # Import schema
   mysql -u root -p verbocare < server/src/db/schema.sql
   ```

5. **Start all services**

   **Option 1: Using batch script (Windows)**
   ```bash
   start.bat
   ```

   **Option 2: Manual start (3 terminals)**
   ```bash
   # Terminal 1 - Frontend
   npm run dev

   # Terminal 2 - Backend
   cd server
   npm run dev

   # Terminal 3 - AI Service
   cd ai-service
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - AI Service: http://localhost:5001

### Stop Services

```bash
stop.bat  # Windows
```

---

## 📁 Project Structure

```
ISE-Hackathon/
├── 📂 src/                          # Frontend source
│   ├── 📂 app/                      # Next.js app router pages
│   │   ├── 📂 (auth)/               # Auth pages (login, register)
│   │   ├── 📂 patient/              # Patient role pages
│   │   ├── 📂 worker/               # Health worker pages
│   │   ├── 📂 doctor/               # Doctor pages
│   │   └── 📂 admin/                # Admin panel pages
│   ├── 📂 components/               # Reusable UI components
│   │   └── 📂 ui/                   # UI components
│   ├── 📂 context/                  # React context providers
│   │   └── AuthContext.tsx          # Authentication context
│   └── 📂 lib/                      # Utility libraries
│       └── api-client.ts            # Axios API client
│
├── 📂 server/                       # Backend Express server
│   └── 📂 src/
│       ├── 📂 db/                   # Database layer
│       │   ├── 📂 queries/          # SQL query builders
│       │   ├── connection.ts        # MySQL connection pool
│       │   └── schema.sql           # Database schema
│       ├── 📂 middleware/           # Express middleware
│       │   └── auth.middleware.ts   # JWT authentication
│       ├── 📂 routes/               # API routes
│       │   ├── auth.routes.ts       # Auth endpoints
│       │   ├── cases.routes.ts      # Case management
│       │   ├── users.routes.ts      # User management
│       │   └── areas.routes.ts      # Area management
│       ├── 📂 services/             # Business logic
│       │   ├── AIService.ts         # AI triage integration
│       │   ├── CaseService.ts       # Case operations
│       │   └── UserService.ts       # User operations
│       └── index.ts                 # Server entry point
│
├── 📂 ai-service/                   # AI Triage Service
│   └── 📂 src/
│       └── index.ts                 # VerboCare-SmartTriage-v1.0
│
├── 📂 shared/                       # Shared TypeScript types
│   └── 📂 types/
│       ├── user.types.ts            # User interfaces
│       ├── case.types.ts            # Case interfaces
│       └── area.types.ts            # Area interfaces
│
├── 📂 scripts/                      # Utility scripts
│   ├── test-triage.js               # AI triage test
│   └── test-retriage.js             # Retriage test
│
├── start.bat                        # Start all services (Windows)
├── stop.bat                         # Stop all services (Windows)
├── package.json                     # Frontend dependencies
└── README.md                        # This file
```

---

## 📡 API Documentation

### Authentication
```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Cases
```http
GET    /api/cases                    # List all cases (role-based)
GET    /api/cases/:id                # Get case details
POST   /api/cases                    # Create new case
PUT    /api/cases/:id                # Update case
DELETE /api/cases/:id                # Delete case
POST   /api/cases/:id/retriage       # Retry AI triage
GET    /api/cases/:id/messages       # Get case messages
GET    /api/cases/stats              # Case statistics
PUT    /api/cases/:id/assign         # Assign case to worker (admin)
```

### Users
```http
GET    /api/users                    # List users (admin)
GET    /api/users/:id                # Get user details
POST   /api/users                    # Create user (admin)
PUT    /api/users/:id                # Update user
DELETE /api/users/:id                # Delete user (admin)
GET    /api/users/search             # Search users by role/area
```

### Areas
```http
GET    /api/areas                    # List all areas
GET    /api/areas/:id                # Get area details
POST   /api/areas                    # Create area (admin)
PUT    /api/areas/:id                # Update area (admin)
DELETE /api/areas/:id                # Delete area (admin)
```

### AI Triage
```http
POST   /ai/triage                    # Perform AI triage
POST   /ai/translate                 # Translate text
POST   /ai/draft-advice              # Generate medical advice
GET    /ai/health                    # AI service health check
```

---

## 🤖 AI Triage System

### VerboCare-SmartTriage-v1.0

Our rule-based AI engine analyzes patient symptoms and assigns urgency levels:

#### Urgency Levels

| Level | Color | Criteria | Response Time |
|-------|-------|----------|---------------|
| 🔴 **Critical** | Red | Severe bleeding, chest pain, unconsciousness, stroke symptoms | Immediate (< 15 min) |
| 🟠 **Urgent** | Orange | High fever, severe pain, difficulty breathing, injuries | Within 1 hour |
| 🟡 **Moderate** | Yellow | Persistent symptoms, moderate pain, infections | Within 4 hours |
| 🔵 **Low** | Blue | Minor ailments, routine checkups, mild symptoms | Within 24 hours |

#### AI Analysis Output

```typescript
{
  urgencyLevel: 'critical' | 'urgent' | 'moderate' | 'low',
  structuredSymptoms: {
    primarySymptoms: string[],
    duration: string,
    severity: string
  },
  riskFlags: string[],
  summary: string,
  recommendations: string[],
  aiModel: 'VerboCare-SmartTriage-v1.0'
}
```

#### Keyword Detection

**Critical Keywords**: chest pain, severe bleeding, unconscious, stroke, heart attack, seizure, suicide, overdose

**Urgent Keywords**: high fever, difficulty breathing, severe pain, broken bone, head injury, allergic reaction

**Moderate Keywords**: fever, pain, infection, vomiting, diarrhea, rash, cough, wound

---

## 📸 Screenshots

### Patient Dashboard
![Patient Dashboard](https://via.placeholder.com/800x450/6366f1/ffffff?text=Patient+Dashboard)

### Voice-Enabled Case Submission
![New Case](https://via.placeholder.com/800x450/8b5cf6/ffffff?text=Voice-to-Text+Case+Submission)

### Health Worker Case Management
![Worker Cases](https://via.placeholder.com/800x450/ec4899/ffffff?text=Worker+Case+Management)

### Admin Analytics Dashboard
![Admin Dashboard](https://via.placeholder.com/800x450/10b981/ffffff?text=Admin+Analytics+Dashboard)

---

## 🧪 Testing

### Run Tests

```bash
# Test AI triage
node scripts/test-triage.js

# Test case creation and triage
node scripts/test-create-case.js

# Test retriage functionality
node scripts/test-retriage.js
```

### Manual Testing Checklist

- [ ] User registration (all roles)
- [ ] User login and JWT authentication
- [ ] Patient case submission (with voice input)
- [ ] AI triage generation
- [ ] Worker case filtering and sorting
- [ ] Doctor case assignment
- [ ] Admin user/area management
- [ ] Case status updates
- [ ] Retry AI triage functionality

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- Use TypeScript strict mode
- Follow ESLint configuration
- Use Prettier for code formatting
- Write descriptive commit messages

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Authors

- **Ninad Hebbar** - *Project Lead* - [GitHub](https://github.com/NinadHebbar1029)

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Express.js community
- MySQL database
- All open-source contributors

---

## 📞 Support

For support, email ninadhebbar@example.com or open an issue in the GitHub repository.

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Real-time chat with WebSockets
- [ ] Video consultation integration
- [ ] Advanced AI using Hugging Face models
- [ ] Multi-tenancy support
- [ ] Appointment scheduling
- [ ] Prescription management
- [ ] Lab results integration
- [ ] Push notifications
- [ ] Analytics dashboard enhancements

---

<div align="center">

**Built with ❤️ for ISE Hackathon**

[![GitHub](https://img.shields.io/github/stars/NinadHebbar1029/ISE-Hackathon?style=social)](https://github.com/NinadHebbar1029/ISE-Hackathon)

</div>
