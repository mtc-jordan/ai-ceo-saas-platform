# AI CEO SaaS Platform

<p align="center">
  <img src="https://img.shields.io/badge/Version-2.0-blue" alt="Version">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB" alt="React">
  <img src="https://img.shields.io/badge/FastAPI-0.100+-009688" alt="FastAPI">
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6" alt="TypeScript">
</p>

**AI CEO** is a comprehensive, AI-powered SaaS platform designed for modern executives. It provides intelligent insights, automated workflows, and predictive analytics to help leaders make better decisions, faster.

## 🚀 Features

### Core Modules

| Module | Description | Status |
|--------|-------------|--------|
| **Pulse AI** | Executive dashboard with AI-powered daily briefings, real-time KPIs, and intelligent insights | ✅ Complete |
| **Athena** | Strategic planning, scenario modeling, and competitive analysis | ✅ Complete |
| **GovernAI** | Board governance, compliance tracking, and ESG reporting | ✅ Complete |
| **Lean Six Sigma** | Process improvement with DMAIC projects, OEE tracking, and waste elimination | ✅ Complete |

### Additional Features

| Feature | Description | Status |
|---------|-------------|--------|
| **AI Meeting Assistant** | Automatic transcription, summarization, and action item extraction | ✅ Complete |
| **Document Management** | AI-powered document analysis with version control | ✅ Complete |
| **Predictive BI** | Revenue forecasting, churn prediction, and anomaly detection | ✅ Complete |
| **OKR & Goal Tracking** | Company, team, and individual goal management | ✅ Complete |
| **Workflow Automation** | If-then rules, scheduled tasks, and integration triggers | ✅ Complete |
| **Real-Time Notifications** | In-app, push, and email notifications | ✅ Complete |
| **White-Label Support** | Custom branding for enterprise clients | ✅ Complete |
| **Multi-Language** | Interface localization and multi-currency support | ✅ Complete |
| **Super Admin Dashboard** | Platform management for SaaS owners | ✅ Complete |
| **Stripe Billing** | Subscription management and payment processing | ✅ Complete |

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Query** for data fetching
- **Zustand** for state management

### Backend
- **FastAPI** (Python 3.11)
- **PostgreSQL** database
- **SQLAlchemy** ORM
- **Pydantic** for validation
- **JWT** authentication

### AI/ML
- **OpenAI/DeepSeek** for natural language processing
- **Custom ML models** for predictive analytics

### Payments
- **Stripe** for subscription billing

## 📁 Project Structure

```
ai-ceo-platform/
├── apps/
│   ├── api-gateway/          # FastAPI backend
│   │   ├── app/
│   │   │   ├── api/          # API endpoints
│   │   │   ├── core/         # Core utilities
│   │   │   ├── models/       # Database models
│   │   │   ├── schemas/      # Pydantic schemas
│   │   │   ├── services/     # Business logic
│   │   │   └── middleware/   # Custom middleware
│   │   └── requirements.txt
│   │
│   └── pulse-web/            # React frontend
│       ├── src/
│       │   ├── api/          # API clients
│       │   ├── components/   # Reusable components
│       │   ├── pages/        # Page components
│       │   └── App.tsx
│       └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL 14+

### Backend Setup

```bash
cd apps/api-gateway
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd apps/pulse-web
pnpm install
pnpm dev
```

### Environment Variables

Create `.env` files in both `api-gateway` and `pulse-web` directories:

**Backend (.env)**
```
DATABASE_URL=postgresql://user:password@localhost:5432/aiceo
SECRET_KEY=your-secret-key
OPENAI_API_KEY=your-openai-key
STRIPE_SECRET_KEY=your-stripe-key
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:8000
```

## 📊 Platform Overview

### Landing Page
A beautiful, modern landing page with pricing, features, testimonials, and FAQ sections designed to convert visitors into customers.

### Executive Dashboard
Real-time KPIs, AI briefings, and business health indicators in a stunning, customizable dashboard.

### Super Admin Dashboard
Comprehensive platform management with user management, subscription tracking, revenue analytics, and system health monitoring.

## 🔐 Security

- JWT-based authentication
- Role-based access control (RBAC)
- Rate limiting and brute-force protection
- Input sanitization (XSS prevention)
- PCI-compliant payment processing with Stripe

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, please open an issue on GitHub.

---

<p align="center">
  Built with ❤️ by the AI CEO Team
</p>
