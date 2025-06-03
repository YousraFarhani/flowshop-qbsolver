FROM python:3.9-slim

WORKDIR /app

# Install system dependencies if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Set Python path to include the app directory
# Create __init__.py files to make directories proper Python packages
RUN touch /app/api/__init__.py /app/api/qubo_implementations/__init__.py


ENV PYTHONPATH="${PYTHONPATH}:/app"

# Create __init__.py files to make directories proper Python packages
# Command to run the application
# Command to run the application
CMD ["sh", "-c", "cd /app && uvicorn api.solve_qubo:app --host 0.0.0.0 --port ${PORT:-8000}"]