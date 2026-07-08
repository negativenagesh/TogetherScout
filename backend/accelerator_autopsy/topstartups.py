import httpx
from bs4 import BeautifulSoup
import urllib.parse
from typing import Dict, Any

async def scrape_topstartups(filters: Dict[str, Any], page: int = 1) -> Dict[str, Any]:
    base_url = "https://topstartups.io/"
    params = {}
    
    if filters.get("hq"):
        params["hq_location"] = filters["hq"]
        
    for k in ["industries", "company_size", "founded_year", "funding_round"]:
        if filters.get(k):
            params[k] = filters[k]
            
    if page > 1:
        params["page"] = page
        
    url = f"{base_url}?{urllib.parse.urlencode(params, doseq=True)}"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers={"User-Agent": "Mozilla/5.0"})
        
    soup = BeautifulSoup(response.text, "html.parser")
    cards = soup.find_all("div", id="item-card-filter")
    
    companies = []
    # Skip the first card as it's the filter form
    for card in cards[1:]:
        try:
            name_el = card.find("h3")
            if not name_el:
                continue
                
            name = name_el.text.strip()
            
            website = ""
            a_tag = card.find("a", id="startup-website-link")
            if a_tag and a_tag.get("href"):
                website = a_tag["href"]
                if "?utm_source" in website:
                    website = website.split("?utm_source")[0]
                    
            logo_url = ""
            img_tag = card.find("img")
            if img_tag and img_tag.get("src"):
                logo_url = img_tag["src"]
                
            desc = ""
            p_tags = card.find_all("p")
            for p in p_tags:
                b_tag = p.find("b")
                if b_tag and "What they do" in b_tag.text:
                    desc_text = p.get_text(separator="\n").split("What they do:")[1]
                    desc = desc_text.split("\n")[1].strip()
                    break
                    
            industries = []
            industry_tags = card.find_all("span", id="industry-tags")
            for tag in industry_tags:
                industries.append(tag.text.strip())
                
            hq = ""
            founded = ""
            size = ""
            for p in p_tags:
                b_tag = p.find("b")
                if b_tag and "Quick facts:" in b_tag.text:
                    text_content = p.get_text(separator="\n")
                    if "📍HQ:" in text_content:
                        hq_line = [line for line in text_content.split("\n") if "📍HQ:" in line]
                        if hq_line:
                            hq = hq_line[0].replace("📍HQ:", "").strip()
                            
            size_tags = card.find_all("span", id="company-size-tags")
            for tag in size_tags:
                tag_text = tag.text.strip()
                if tag_text.startswith("Founded:"):
                    founded = tag_text.replace("Founded:", "").strip()
                else:
                    size = tag_text
                    
            stage = ""
            investors = []
            for p in p_tags:
                b_tag = p.find("b")
                if b_tag and "Funding:" in b_tag.text:
                    stage_tags = p.find_all("span", id="funding-tags")
                    if stage_tags:
                        for tag in stage_tags:
                            if "Series" in tag.text or "Seed" in tag.text or "IPO" in tag.text:
                                stage = tag.text.strip()
                            else:
                                investors.append(tag.text.strip())

            founders_text = ""
            for p in p_tags:
                b_tag = p.find("b")
                if b_tag and "Founders:" in b_tag.text:
                    founders_text_split = p.get_text(separator="\n").split("Founders:")
                    if len(founders_text_split) > 1:
                        founders_text = founders_text_split[1].strip()

            linkedin_url = ""
            social_links = card.find_all("a", id="social_media_link")
            for s_link in social_links:
                if "linkedin.com" in s_link.get("href", ""):
                    linkedin_url = s_link.get("href")

            jobs_url = ""
            jobs_link = card.find("a", id="view-jobs")
            if jobs_link and jobs_link.get("href"):
                jobs_url = jobs_link["href"]
                        
            companies.append({
                "id": website or name, # fallback
                "name": name,
                "slug": "",
                "website": website,
                "small_logo_thumb_url": logo_url,
                "one_liner": desc,
                "long_description": desc,
                "industry": industries[0] if industries else "",
                "all_industries": industries,
                "all_locations": hq,
                "batch": stage or founded,
                "team_size": size,
                "founded_year": founded,
                "investors": investors,
                "founders_text": founders_text,
                "linkedin_url": linkedin_url,
                "jobs_url": jobs_url,
            })
        except Exception as e:
            print(f"Error parsing card: {e}")
            continue
            
    has_more = False
    pagination = soup.find("ul", class_="pagination")
    if pagination:
        next_btn = pagination.find("a", string=lambda s: s and "Next" in s)
        if next_btn:
            has_more = True
            
    return {
        "companies": companies,
        "page": page,
        "has_more": has_more
    }
