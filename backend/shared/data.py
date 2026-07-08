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

    c3 = Company(
        id="c3",
        name="NeuroHealth",
        one_liner="AI diagnostics for brain scans",
        description="Using advanced deep learning models to detect early signs of Alzheimer's from MRI scans.",
        source="Y Combinator",
        batch="W23",
        batch_year="2023",
        status="Active",
        stage="Early",
        region="US",
        country="USA",
        city="Boston",
        team_size=25,
        is_hiring=True,
        website="https://neurohealth.ai",
        thesis_category=["healthcare"],
    )
    save_company(c3)

    c4 = Company(
        id="c4",
        name="GreenGrid",
        one_liner="Decentralized energy trading platform",
        description="Peer-to-peer marketplace for residential solar energy trading.",
        source="Techstars",
        batch="S23",
        batch_year="2023",
        status="Active",
        stage="Seed",
        region="Europe",
        country="Germany",
        city="Berlin",
        team_size=8,
        is_hiring=False,
        website="https://greengrid.energy",
        thesis_category=["climate"],
    )
    save_company(c4)

    c5 = Company(
        id="c5",
        name="VantageData",
        one_liner="Automated data lineage for enterprise",
        description="End-to-end data observability and lineage tracking for complex data pipelines.",
        source="Sequoia Surge",
        batch="09",
        batch_year="2024",
        status="Active",
        stage="Seed",
        region="India",
        country="India",
        city="Bangalore",
        team_size=12,
        is_hiring=True,
        website="https://vantagedata.io",
        thesis_category=["data-infrastructure"],
    )
    save_company(c5)

    c6 = Company(
        id="c6",
        name="DefiLend",
        one_liner="Institutional DeFi lending protocol",
        description="Providing uncollateralized crypto loans to verified institutions with compliance first approach.",
        source="a16z Crypto Startup School",
        batch="24",
        batch_year="2024",
        status="Active",
        stage="Seed",
        region="US",
        country="USA",
        city="SF",
        team_size=6,
        is_hiring=True,
        website="https://defilend.xyz",
        thesis_category=["web3"],
    )
    save_company(c6)

    pass
