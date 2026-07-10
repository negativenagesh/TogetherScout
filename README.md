# TogetherScout

[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://togetherscout.vercel.app)
[![GitHub stars](https://img.shields.io/github/stars/negativenagesh/TogetherScout.svg?style=for-the-badge)](https://github.com/negativenagesh/TogetherScout/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/negativenagesh/TogetherScout.svg?style=for-the-badge)](https://github.com/negativenagesh/TogetherScout/network/members)

TogetherScout is an AI-powered startup scouting tool designed to help VCs and angel investors discover hidden gems.

Check live: https://togetherscout.vercel.app

Demo gif is loading!!!
![TogetherScout Demo](togetherscout.gif)

## Key Enhancements & Features

- **TogetherRadar:** A multi-agent discovery engine! Uncover hidden gems by asking complex queries like:
  - _"Find me 3 stealth startups where the founders recently left OpenAI within the last 12 months."_
  - _"Find me stealth biotech startups that recently raised over $2,000,000 according to SEC Form D filings."_
- **BYOK (Bring Your Own Key):** You can easily configure your preferred LLMs by adding your API keys directly in the **Settings** section of the UI! Supports:
  - **DeepSeek API** (Fast and highly effective)
  - **Google Gemini API** (Free tier works great!)
  - NVIDIA NIM / OpenAI API
- **Real-time Streaming UI:** A seamless experience with streaming responses so you can see the agents working in real time.

## Setup Instructions

### Forking and Cloning

1. Go to the GitHub repository page and Star It & then click the "Fork" button.
2. Clone your forked repository:
   ```bash
   git clone https://github.com/negativenagesh/TogetherScout.git
   ```
3. Enter the directory:
   ```bash
   cd TogetherScout
   ```

### Running with Docker Compose (Recommended)

The easiest way to run the application is using Docker Compose.

1. Build and start the containers:
   ```bash
   docker-compose up --build
   ```
2. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
3. **Configure API Keys:** Open the frontend, click on **Settings**, and paste your DeepSeek or Gemini API keys to start using TogetherRadar!

To stop the application, run:

```bash
docker-compose down
```

### Manual Setup (Without Docker)

If you prefer to run the components manually:

#### Backend

```bash
cd backend
uv sync
uv run uvicorn main:app --reload --port 8000
```

_(Make sure to set your API keys via the UI Settings once the frontend is running)_

#### Frontend

```bash
cd frontend
npm install
npm run dev
```
