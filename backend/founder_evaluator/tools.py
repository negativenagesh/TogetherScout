import httpx
import os

async def fetch_github_stats(github_url: str) -> dict:
    if not github_url:
        return {"error": "No github URL provided."}
    
    # Extract username
    username = github_url.rstrip('/').split('/')[-1]
    
    # In a real app we'd call the GH API with a token:
    # headers = {"Authorization": f"Bearer {os.getenv('GITHUB_TOKEN')}"}
    # async with httpx.AsyncClient() as client:
    #     res = await client.get(f"https://api.github.com/users/{username}", headers=headers)
    #     if res.status_code == 200: return res.json()
    
    # Mocking for MVP
    return {
        "username": username,
        "public_repos": 15,
        "followers": 120,
        "recent_activity_level": "High (commits daily)",
        "languages": ["Python", "TypeScript", "Rust"]
    }
