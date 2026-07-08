# TogetherScout

TogetherScout is an AI-powered startup scouting tool for VCs.

![TogetherScout Demo](togetherscout.gif)

## Setup Instructions

### Forking and Cloning

1. Go to the GitHub repository page and click the "Fork" button.
2. Clone your forked repository:
   git clone https://github.com/negativenagesh/TogetherScout.git
3. Enter the directory:
   cd TogetherScout

### Running with Docker Compose

The easiest way to run the application is using Docker Compose.

1. Ensure your NVIDIA_NIM_API_KEY is exported in your environment:
   export NVIDIA_NIM_API_KEY=your_api_key_here

2. Build and start the containers:
   docker-compose up --build

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

To stop the application, run:
docker-compose down

### Manual Setup (Without Docker)

If you prefer to run the components manually without Docker:

#### Backend

1. cd backend
2. uv sync
3. export NVIDIA_NIM_API_KEY=your_api_key_here
4. uv run uvicorn main:app --reload --port 8000

#### Frontend

1. cd frontend
2. npm install
3. npm run dev
