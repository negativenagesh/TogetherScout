from typing import Dict, List
from .models import Company, Founder, Evaluation

# In-memory storage
companies_db: Dict[str, Company] = {}
founders_db: Dict[str, Founder] = {}
evaluations_db: Dict[str, Evaluation] = {}

def get_all_companies() -> List[Company]:
    return list(companies_db.values())

def get_company(company_id: str) -> Company | None:
    return companies_db.get(company_id)

def save_company(company: Company):
    companies_db[company.id] = company

def get_all_founders() -> List[Founder]:
    return list(founders_db.values())

def get_founder(founder_id: str) -> Founder | None:
    return founders_db.get(founder_id)

def save_founder(founder: Founder):
    founders_db[founder.id] = founder

def get_evaluation_for_founder(founder_id: str) -> Evaluation | None:
    # Get latest evaluation for a founder
    evals = [e for e in evaluations_db.values() if e.founder_id == founder_id]
    if evals:
        return sorted(evals, key=lambda x: x.created_at, reverse=True)[0]
    return None

def save_evaluation(evaluation: Evaluation):
    evaluations_db[evaluation.id] = evaluation

def seed_data():
    if companies_db:
        return # Already seeded
    
    # Synthetic Techstars Company
    c1 = Company(
        id="c1",
        name="AutoParse AI",
        one_liner="AI powered data extraction for legacy systems",
        description="We turn PDF and unstructured text into clean SQL schemas.",
        source="Techstars",
        batch="W24",
        batch_year="2024",
        status="Active",
        stage="Seed",
        region="US",
        country="USA",
        city="SF",
        team_size=4,
        is_hiring=True,
        website="https://autoparse.ai",
        thesis_category=[],
    )
    save_company(c1)

    # Synthetic Antler India Company
    c2 = Company(
        id="c2",
        name="FinSync",
        one_liner="Cross-border B2B payments infrastructure",
        description="API first cross border payments for the US-India corridor.",
        source="Antler India",
        batch="S24",
        batch_year="2024",
        status="Active",
        stage="Seed",
        region="India",
        country="India",
        city="Bangalore",
        team_size=10,
        is_hiring=True,
        website="https://finsync.io",
        thesis_category=[],
    )
    save_company(c2)

    # Founders
    f1 = Founder(
        id="f1",
        name="Alice Hacker",
        company_ids=["c1"],
        role="technical",
        bio="10x developer, formerly at Stripe and Google. Built large scale distributed systems.",
        github_url="https://github.com/alice",
        batch="W24",
        diaspora_flag=True
    )
    save_founder(f1)

    f2 = Founder(
        id="f2",
        name="Bob Builder",
        company_ids=["c1"],
        role="business",
        bio="GTM operator, 2x founder, previously scaled revenue to $10M at SaaS co.",
        batch="W24",
        diaspora_flag=False
    )
    save_founder(f2)

    f3 = Founder(
        id="f3",
        name="Charlie Researcher",
        company_ids=["c2"],
        role="research",
        bio="PhD in ML from Stanford. 15 papers in NLP.",
        batch="S24",
        diaspora_flag=True
    )
    save_founder(f3)
