# ArenaMind AI - Volunteer Co-Pilot & Command Center

ArenaMind AI is a state-of-the-art stadium operations platform designed for large-scale events like the FIFA World Cup. It provides real-time heatmap diagnostics, dynamic crowd density tracking, AI-powered operational recommendations, and a centralized Field Operations command network.

## Features
- **Dynamic Heatmap & Diagnostics**: Interactive stadium visualization with live risk monitoring.
- **Premium AI Operations**: Context-aware recommendations for congestion, medical, and security incidents.
- **Field Operations Network**: Centralized command dispatch to connected devices (Volunteer, Medical, Security, Transport).
- **MatchDay Operations Ingestion**: Upload scheduling datasets (CSV, Excel, JSON) or manually enter incidents.
- **Executive Dashboard**: Real-time metrics, simulation controls (weather, crowd surges), and AI summaries.

## Screenshots
*(Insert Screenshots Here)*
- `![Dashboard](link-to-image)`
- `![Field Operations](link-to-image)`
- `![Heatmap](link-to-image)`

## Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Framer Motion, Zustand
- **Backend**: Python, FastAPI, Pandas, Pydantic
- **AI Integration**: Google Gemini API
- **Deployment**: Docker, Google Cloud Run

## Architecture
ArenaMind AI uses a decoupled client-server architecture:
1. **Frontend (React)**: Handles state management (Zustand), fluid animations (Framer Motion), and dynamic visualizations.
2. **Backend (FastAPI)**: Ingests datasets, sanitizes inputs via Pandas, and exposes AI generation endpoints.
3. **Cloud Run Deployment**: Both services are containerized via multi-stage Docker builds and deployed independently.

## Local Development Setup

### 1. Environment Variables
Copy the `.env.example` file and configure it:
```bash
cp .env.example .env
```
Ensure you add your `GEMINI_API_KEY`.

### 2. Run with Docker Compose
```bash
docker-compose up --build
```
- Frontend runs on `http://localhost:8081`
- Backend runs on `http://localhost:8080`

### 3. Manual Startup
**Backend**:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```

## Cloud Run Deployment

Both the Frontend and Backend are optimized for **Google Cloud Run** using `PORT` bindings and non-root users.

### Backend Deployment
```bash
cd backend
gcloud run deploy arenamind-backend \
  --source . \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_key_here,ENVIRONMENT=production
```

### Frontend Deployment
After deploying the backend, get the API URL and inject it into the frontend build.
```bash
cd frontend
gcloud run deploy arenamind-frontend \
  --source . \
  --allow-unauthenticated \
  --set-env-vars VITE_API_URL=https://your-backend-url.run.app/api
```

## API Health Check
The backend includes a health endpoint for Cloud Run monitoring:
- `GET /api/health` returns status, uptime, environment, and Gemini integration status.

## License
MIT License. See `LICENSE` for more information.
