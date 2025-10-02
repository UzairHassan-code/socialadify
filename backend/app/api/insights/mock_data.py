# D:\socialadify\backend\app\api\insights\mock_data.py

# --- Mock Campaign 1 (The original one) ---
MOCK_GOOGLE_CAMPAIGN_1 = {
    "id": "MOCK-GOOGLE-CAMPAIGN-123",
    "name": "🚀 SocialAdify Showcase Campaign (Mock)",
    "status": "ENABLED",
    "clicks": 0, "impressions": 0, "ctr": 0.0, "average_cpc": 0.0, "cost": 0.0,
}

MOCK_CAMPAIGN_PERFORMANCE_1 = {
    "campaign_id": "MOCK-GOOGLE-CAMPAIGN-123",
    "campaign_name": "🚀 SocialAdify Showcase Campaign (Mock)",
    "status": "ENABLED",
    "performance_data": [
        {"date": "2025-09-24", "impressions": 1550, "clicks": 75, "cost_micros": 1500000},
        {"date": "2025-09-25", "impressions": 1620, "clicks": 81, "cost_micros": 1650000},
        {"date": "2025-09-26", "impressions": 1480, "clicks": 68, "cost_micros": 1400000},
        {"date": "2025-09-27", "impressions": 1750, "clicks": 95, "cost_micros": 1900000},
        {"date": "2025-09-28", "impressions": 1800, "clicks": 105, "cost_micros": 2150000},
        {"date": "2025-09-29", "impressions": 1950, "clicks": 120, "cost_micros": 2400000},
        {"date": "2025-09-30", "impressions": 2100, "clicks": 135, "cost_micros": 2650000},
    ]
}

# --- NEW: Mock Campaign 2 ---
# We'll give it slightly different performance characteristics for a good comparison.
MOCK_GOOGLE_CAMPAIGN_2 = {
    "id": "MOCK-GOOGLE-CAMPAIGN-456",
    "name": "📈 Q4 Sales Push (Mock)",
    "status": "ENABLED",
    "clicks": 0, "impressions": 0, "ctr": 0.0, "average_cpc": 0.0, "cost": 0.0,
}

MOCK_CAMPAIGN_PERFORMANCE_2 = {
    "campaign_id": "MOCK-GOOGLE-CAMPAIGN-456",
    "campaign_name": "📈 Q4 Sales Push (Mock)",
    "status": "ENABLED",
    "performance_data": [
        # This campaign will have higher impressions and cost, but lower clicks (less efficient)
        {"date": "2025-09-24", "impressions": 2200, "clicks": 65, "cost_micros": 1800000},
        {"date": "2025-09-25", "impressions": 2350, "clicks": 72, "cost_micros": 1950000},
        {"date": "2025-09-26", "impressions": 2100, "clicks": 60, "cost_micros": 1700000},
        {"date": "2025-09-27", "impressions": 2500, "clicks": 85, "cost_micros": 2300000},
        {"date": "2025-09-28", "impressions": 2600, "clicks": 90, "cost_micros": 2550000},
        {"date": "2025-09-29", "impressions": 2850, "clicks": 100, "cost_micros": 2800000},
        {"date": "2025-09-30", "impressions": 3100, "clicks": 110, "cost_micros": 3050000},
    ]
}

