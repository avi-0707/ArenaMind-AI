FROM python:3.11-slim

WORKDIR /app

# Non-root user setup
RUN groupadd -r appuser && useradd -r -g appuser appuser

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Set permissions for non-root user
RUN chown -R appuser:appuser /app
USER appuser

ENV PORT=8080
EXPOSE $PORT

CMD sh -c "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"
