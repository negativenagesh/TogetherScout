FROM python:3.13-slim

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Copy dependency files
COPY pyproject.toml uv.lock ./
COPY backend/pyproject.toml ./backend/

# Install dependencies using uv
RUN uv sync --frozen --package backend --no-install-project

# Copy the rest of the application
COPY . .

EXPOSE 8000

# Run the application using uv and respect the PORT environment variable (Render sets this)
CMD ["sh", "-c", "uv run uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
