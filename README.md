# ArenaMind AI - Volunteer Co-Pilot & Command Center

ArenaMind AI is a premium stadium operations platform designed for large-scale events like the FIFA World Cup 2026. It provides real-time heatmap diagnostics, dynamic crowd density tracking, AI-powered operational recommendations, and a centralized Field Operations command network.

## Key Features
- **Dynamic Heatmap & Diagnostics**: Interactive stadium visualization with live risk monitoring.
- **Premium AI Operations**: Context-aware recommendations for congestion, medical, and security incidents.
- **Field Operations Network**: Centralized command dispatch to connected devices (Volunteer, Medical, Security, Transport, Maintenance, Operations, Supervisor, Police, Fire & Emergency, Accessibility Team).
- **MatchDay Operations Ingestion**: Upload scheduling datasets (CSV, Excel, JSON) or manually enter incidents.
- **Executive Dashboard**: Real-time metrics, simulation controls (weather, crowd surges), and AI summaries.

## Screenshots

### 1. Executive Operations Dashboard
![Executive Operations Dashboard](ScreenShot%201%20arenamind%20AI.png)

### 2. MatchDay Operations Ingestion
![MatchDay Ingestion](ScreenShot%202%20arenamind%20AI.png)

### 3. Field Operations Network & Dispatch
![Field Operations](ScreenShot%203%20arenamind%20AI.png)

### 4. Co-Pilot AI Diagnostics & Recommendations
![Co-Pilot AI Diagnostics](ScreenShot%204%20arenamind%20AI.png)

### 5. Interactive MatchDay Companion
![MatchDay Companion](ScreenShot%205%20arenamind%20AI.png)

## Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Framer Motion, Zustand
- **Backend**: Python, FastAPI, Pandas, Pydantic
- **AI Integration**: Google Gemini API
- **Deployment**: Docker, Google Cloud Run

## Project Structure
- `frontend/`: Vite + React application
- `backend/`: FastAPI service and API routes
- `backend/app/api/`: Endpoint definitions
- `backend/app/services/`: Preprocessing and Gemini service logic
- `backend/test_files/`: Example datasets for upload testing

## Local Development Setup

### 1. Environment Variables
Copy the `.env.example` file and configure it:
```bash
cp .env.example .env
```
Make sure to add your `GEMINI_API_KEY`.

### 2. Run with Docker Compose
From the project root:
```bash
docker compose up --build
```
- Frontend runs on `http://localhost:8081`
- Backend runs on `http://localhost:8080`

### 3. Manual Local Run
**Backend**:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows use .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8080
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
MIT License. See `LICENSE` for details.