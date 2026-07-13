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

STATE_IDS = {
    "Andaman and Nicobar Islands": "5f48ce592a9bb065cdf9fb1f", "Andhra Pradesh": "5f48ce592a9bb065cdf9fb20",
    "Arunachal Pradesh": "5f48ce592a9bb065cdf9fb21", "Assam": "5f48ce592a9bb065cdf9fb22",
    "Bihar": "5f48ce592a9bb065cdf9fb23", "Chandigarh": "5f48ce592a9bb065cdf9fb24",
    "Chhattisgarh": "5f48ce592a9bb065cdf9fb25", "Dadra and Nagar Haveli and Daman and Diu": "5f48ce592a9bb065cdf9fb42",
    "Delhi": "5f48ce592a9bb065cdf9fb26", "Goa": "5f48ce592a9bb065cdf9fb27",
    "Gujarat": "5f48ce592a9bb065cdf9fb28", "Haryana": "5f48ce592a9bb065cdf9fb29",
    "Himachal Pradesh": "5f48ce592a9bb065cdf9fb2a", "Jammu and Kashmir": "5f48ce592a9bb065cdf9fb2b",
    "Jharkhand": "5f48ce592a9bb065cdf9fb2c", "Karnataka": "5f48ce592a9bb065cdf9fb2d",
    "Kerala": "5f48ce592a9bb065cdf9fb2e", "Ladakh": "5f48ce592a9bb065cdf9fb41",
    "Lakshadweep": "5f48ce592a9bb065cdf9fb2f", "Madhya Pradesh": "5f48ce592a9bb065cdf9fb30",
    "Maharashtra": "5f48ce592a9bb065cdf9fb31", "Manipur": "5f48ce592a9bb065cdf9fb32",
    "Meghalaya": "5f48ce592a9bb065cdf9fb33", "Mizoram": "5f48ce592a9bb065cdf9fb34",
    "Nagaland": "5f48ce592a9bb065cdf9fb35", "Odisha": "5f48ce592a9bb065cdf9fb36",
    "Puducherry": "5f48ce592a9bb065cdf9fb37", "Punjab": "5f48ce592a9bb065cdf9fb38",
    "Rajasthan": "5f48ce592a9bb065cdf9fb39", "Sikkim": "5f48ce592a9bb065cdf9fb3a",
    "Tamil Nadu": "5f48ce592a9bb065cdf9fb3b", "Telangana": "5f48ce592a9bb065cdf9fb3c",
    "Tripura": "5f48ce592a9bb065cdf9fb3d", "Uttar Pradesh": "5f48ce592a9bb065cdf9fb3f",
    "Uttarakhand": "5f48ce592a9bb065cdf9fb3e", "West Bengal": "5f48ce592a9bb065cdf9fb40"
}

STAGE_IDS = {
    "Ideation": "prototype",
    "Validation": "validation",
    "Early Traction": "earlytraction",
    "Scaling": "scaling"
}

async def search_startup_india(filters: Dict[str, Any], page: int = 0) -> Dict[str, Any]:
    url = "https://api.startupindia.gov.in/sih/api/noauth/search/profiles"
    
    payload = {
        "query": filters.get("query", ""),
        "focusSector": False,
        "industries": filters.get("industries", []),
        "sectors": filters.get("sectors", []),
        "states": [STATE_IDS[s] for s in filters.get("states", []) if s in STATE_IDS] if filters.get("states") else [],
        "cities": filters.get("cities", []),
        "stages": [STAGE_IDS[s] for s in filters.get("stages", []) if s in STAGE_IDS] if filters.get("stages") else [],
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
                        "small_logo_thumb_url": f"https://api.startupindia.gov.in/sih/api/file/user/image/Startup?fileName={item.get('pic')}" if item.get("pic") else "",
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
