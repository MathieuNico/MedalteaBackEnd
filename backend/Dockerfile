FROM python:3.12-slim

# Prevent Python from writing pyc files and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /usr/src/app

# System deps
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev build-essential curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project into a 'backend' directory to support imports (since it has __init__.py)
COPY . ./backend

# Expose ports
EXPOSE 8000 8001

# Default command (can be overridden)
# Running from /usr/src/app, allowing 'backend' package imports
ENV PYTHONPATH=/usr/src/app
CMD ["uvicorn", "backend.rag_api:app", "--host", "0.0.0.0", "--port", "8000"]