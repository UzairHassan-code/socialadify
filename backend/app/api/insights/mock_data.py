# --- Mock Campaign 1 (The original one - EFFICIENT) ---
MOCK_GOOGLE_CAMPAIGN_1 = {
    "id": "MOCK-GOOGLE-CAMPAIGN-123",
    "name": "SocialAdify Showcase Campaign",
    "status": "ENABLED",
    "clicks": 135, "impressions": 0, "ctr": 0.0, "average_cpc": 0.0, "cost": 0.0,
}

MOCK_CAMPAIGN_PERFORMANCE_1 = {
    "campaign_id": "MOCK-GOOGLE-CAMPAIGN-123",
    "campaign_name": "SocialAdify Showcase Campaign",
    "status": "ENABLED",
    "performance_data": [
        {"date": "2025-10-10", "impressions": 1550, "clicks": 75, "cost_micros": 1500000},
        {"date": "2025-10-11", "impressions": 1620, "clicks": 81, "cost_micros": 1650000},
        {"date": "2025-10-12", "impressions": 1480, "clicks": 68, "cost_micros": 1400000},
        {"date": "2025-10-13", "impressions": 1750, "clicks": 95, "cost_micros": 1900000},
        {"date": "2025-10-14", "impressions": 1800, "clicks": 105, "cost_micros": 2150000},
        {"date": "2025-10-15", "impressions": 1950, "clicks": 120, "cost_micros": 2400000},
        {"date": "2025-10-16", "impressions": 2100, "clicks": 135, "cost_micros": 2650000},
    ]
}

# --- EDITED: Mock Campaign 2 (Now represents an INEFFICIENT campaign) ---
MOCK_GOOGLE_CAMPAIGN_2 = {
    "id": "MOCK-GOOGLE-CAMPAIGN-456",
    "name": "Q4 Sales Push",
    "status": "ENABLED",
    "clicks": 62, "impressions": 0, "ctr": 0.0, "average_cpc": 0.0, "cost": 0.0,
}

MOCK_CAMPAIGN_PERFORMANCE_2 = {
    "campaign_id": "MOCK-GOOGLE-CAMPAIGN-456",
    "campaign_name": "Q4 Sales Push",
    "status": "ENABLED",
    "performance_data": [
        # This campaign now has high impressions and cost, but very low clicks.
        # This indicates the ad is being shown a lot but isn't compelling enough to click.
        {"date": "2025-10-10", "impressions": 2500, "clicks": 10, "cost_micros": 2500000},
        {"date": "2025-10-11", "impressions": 2600, "clicks": 8, "cost_micros": 2800000},
        {"date": "2025-10-12", "impressions": 2400, "clicks": 7, "cost_micros": 2600000},
        {"date": "2025-10-13", "impressions": 2800, "clicks": 12, "cost_micros": 3000000},
        {"date": "2025-10-14", "impressions": 2900, "clicks": 9, "cost_micros": 3200000},
        {"date": "2025-10-15", "impressions": 3000, "clicks": 11, "cost_micros": 3500000},
        {"date": "2025-10-16", "impressions": 3200, "clicks": 5, "cost_micros": 3800000},
    ]
}
