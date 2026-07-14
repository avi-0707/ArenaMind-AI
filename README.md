# ArenaMind AI 🏟️ 

**The Autonomous Decision Intelligence Platform for FIFA World Cup 2026 Operations.**

![ArenaMind AI Banner](https://img.shields.io/badge/Status-Release_Candidate-success) ![React](https://img.shields.io/badge/React-18-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.104-teal) ![Gemini](https://img.shields.io/badge/AI-Gemini_2.5_Flash-orange)

ArenaMind AI transforms complex stadium telemetry into actionable, executive-level decision intelligence. It is a premium digital twin platform designed specifically to optimize crowd dynamics, volunteer deployment, security, and accessibility for large-scale mega-events like the FIFA World Cup.

---

## 🌟 Key Features

- **Operational Digital Twin**: Real-time modeling of crowd flow, volunteer allocation, and network health.
- **Tournament Intelligence Engine**: An autonomous ledger that archives matches and incrementally learns from operational successes and failures to improve future recommendations.
- **AI Strategy Lab**: Generates multi-variant tactical plans (Aggressive, Balanced, Conservative) with complete explainability, expected recovery times, and historical precedent.
- **Executive Mission Control**: A unified dashboard tracking the global Readiness Score, active incidents, and predictive bottlenecks.
- **MatchDay Companion & Ops Copilot**: Context-aware AI assistants for both fans and field staff.
- **Dynamic Notification Center**: A global event stream capturing critical alerts and AI-generated intelligence in real-time.

---

## 🏗 Architecture

ArenaMind AI utilizes a decoupled modern architecture:

1. **Frontend (React + Vite + Zustand)**: High-performance, 60fps rendering with Framer Motion for premium micro-interactions. TailwindCSS drives a dark/light mode enterprise aesthetic.
2. **Backend (Python + FastAPI)**: A high-concurrency API layer validating telemetry via Pydantic and interacting with Google's Gemini models.
3. **AI Layer (Google Gemini 2.5 Flash)**: Powers the Strategy Lab, Ops Copilot, and MatchDay Companion with near-instant reasoning capabilities.

---

## 💻 Tech Stack

- **Frontend**: React 18, Vite, TypeScript, TailwindCSS, Zustand, Framer Motion, Chart.js, Lucide React.
- **Backend**: Python 3.10+, FastAPI, Pandas, Pydantic, Uvicorn.
- **AI**: Google GenAI SDK (`gemini-2.5-flash`).

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/arenamind-ai.git
   cd arenamind-ai
   ```

2. **Setup Backend**
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   
   # Create a .env file and add your Gemini API Key
   echo "GEMINI_API_KEY=your_api_key_here" > .env
   
   # Run the server
   uvicorn app.main:app --reload --host 0.0.0.1 --port 9999
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   
   # Run the development server
   npm run dev
   ```

---

## 🐳 Docker Deployment

To run the entire stack using Docker Compose:

```bash
docker-compose up --build
```
*The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:9999`.*

---

## 🔮 Future Roadmap

- **Multi-Stadium Orchestration**: Connect multiple digital twins to a central FIFA command.
- **Live Drone Feed Analysis**: Integrate computer vision for real-time crowd density validation.
- **Automated Volunteer Dispatch**: Direct integration with wearable devices to dispatch field teams autonomously.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.