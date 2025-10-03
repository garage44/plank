FROM python:3.11-slim

WORKDIR /app

# Install UV
RUN pip install uv

# Copy dependency files
COPY pyproject.toml ./

# Install dependencies
RUN uv sync --no-dev

# Copy application
COPY plank/ ./plank/

# Expose port
EXPOSE 8000

# Run the application
CMD ["uv", "run", "uvicorn", "plank.main:app", "--host", "0.0.0.0", "--port", "8000"]

