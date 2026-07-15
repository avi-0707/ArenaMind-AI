FROM python:3.10-slim

WORKDIR /app

# Copy requirements and install
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code
COPY backend /app/backend

# Set PYTHONPATH so the app module can be found
ENV PYTHONPATH=/app

# Expose port (Koyeb uses 8000 by default or reads the PORT env var)
ENV PORT=8000
EXPOSE 8000

# Start the application
CMD uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
