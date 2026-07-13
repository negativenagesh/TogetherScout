import httpx
import json
from typing import Dict, Any

async def fetch_startupindia_filters() -> Dict[str, Any]:
    """Fetch or provide filters for Startup India."""
    return {
        "industries": [
            "Agriculture", "AI", "Analytics", "AR VR (Augmented + Virtual Reality)",
            "Automotive", "Aeronautics Aerospace & Defence", "Architecture Interior Design",
            "Art & Photography", "Animation", "Chemicals", "Computer Vision",
            "Construction", "Dating Matrimonial", "Design", "Education", "Events",
            "Fashion", "Finance Technology", "Food & Beverages", "Green Technology",
            "Healthcare & Lifesciences", "Human Resources", "Marketing", "Media & Entertainment",
            "Nanotechnology", "Non- Renewable Energy", "Pets & Animals", "Renewable Energy",
            "Retail", "Robotics", "Safety", "Security Solutions", "Social Impact",
            "Sports", "Technology Hardware", "Telecommunication & Networking",
            "Textiles & Apparel", "Transportation & Storage", "Travel & Tourism"
        ],
        "sectors": [
            "AdTech", "Agritech", "BioTech", "Cleantech", "Consumer Internet",
            "Deep Tech", "EdTech", "FinTech", "HealthTech", "Logistics",
            "SaaS", "SpaceTech"
        ],
        "stages": [
            "Ideation", "Validation", "Early Traction", "Scaling"
        ],
        "states": [
            "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh",
            "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu",
            "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
            "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh",
            "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
            "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
            "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
        ]
    }

async def search_startup_india(filters: Dict[str, Any], page: int = 0) -> Dict[str, Any]:
    url = "https://api.startupindia.gov.in/sih/api/noauth/search/profiles"
    
    payload = {
        "query": filters.get("query", ""),
        "focusSector": False,
        "industries": filters.get("industries", []),
        "sectors": filters.get("sectors", []),
        "states": filters.get("states", []),
        "cities": filters.get("cities", []),
        "stages": filters.get("stages", []),
        "badges": [],
        "roles": ["Startup"],
        "page": page,
        "sort": {"orders": [{"field": "registeredOn", "direction": "DESC"}]},
        "dpiitRecogniseUser": filters.get("dpiitRecognised", False),
        "internationalUser": False
    }
    
    if filters.get("exempted80IAC"):
        pass

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Origin": "https://www.startupindia.gov.in",
        "Referer": "https://www.startupindia.gov.in/content/sih/en/search.html?roles=Startup&page=0"
    }

    companies = []
    has_more = False
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, headers=headers, timeout=15.0)
            if response.status_code == 200:
                data = response.json()
                content = data.get("content", [])
                
                has_more = not data.get("last", True)
                
                for item in content:
                    companies.append({
                        "id": str(item.get("id", "")),
                        "name": item.get("name", "Unknown Startup"),
                        "slug": item.get("id", ""),
                        "website": "",
                        "small_logo_thumb_url": f"https://www.startupindia.gov.in/network/public/profile/image/show/{item.get('pic')}" if item.get("pic") else "",
                        "one_liner": ", ".join(item.get("industries", [])),
                        "long_description": f"DPIIT Recognised: {item.get('dippRecognitionStatus') == 'RECOGNISED'}",
                        "industry": item.get("industries", [""])[0] if item.get("industries") else "",
                        "all_industries": item.get("industries", []),
                        "all_locations": f"{item.get('city', '')}, {item.get('state', '')}".strip(", "),
                        "batch": item.get("stages", [""])[0] if item.get("stages") else "",
                        "team_size": "",
                        "founded_year": "",
                        "investors": [],
                        "founders_text": "",
                        "linkedin_url": "",
                        "jobs_url": "",
                        "dpiit_recognized": item.get("dippRecognitionStatus") == "RECOGNISED",
                        "80iac_applied": item.get("form80IacApplied", False)
                    })
        except Exception as e:
            print(f"Error fetching Startup India: {e}")
            
    return {
        "companies": companies,
        "page": page,
        "has_more": has_more
    }
