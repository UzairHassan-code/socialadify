# D:\socialadify\backend\app\api\insights\mock_data.py
from datetime import datetime, timedelta
import random

# Define sample target audiences
target_audiences = [
    "Men 18-24", "Men 25-34", "Men 35-44",
    "Women 18-24", "Women 25-34", "Women 35-44",
    "All Ages"
]

def generate_daily_stats(start_date: datetime, days: int, base_ctr: float, base_roi: float, base_cpc: float):
    daily_stats = []
    for i in range(days):
        date = start_date - timedelta(days=i)
        impressions = random.randint(1000, 3000)
        ctr = random.uniform(base_ctr - 1, base_ctr + 1)
        clicks = int(impressions * (ctr / 100))
        cpc = round(random.uniform(base_cpc - 0.1, base_cpc + 0.1), 2)
        spend = round(clicks * cpc, 2)
        roi = random.uniform(base_roi - 0.5, base_roi + 0.5)
        revenue = round(spend * roi, 2)
        conversions = random.randint(3, 15)

        daily_stats.append({
            "date": date.strftime("%Y-%m-%d"),
            "impressions": impressions,
            "clicks": clicks,
            "conversions": conversions,
            "spend": spend,
            "revenue": revenue
        })

    return daily_stats

today = datetime.today()

# Generate mock ad campaign data
mock_ads_data = [
    {
        "id": "meta_ad_001",
        "platform": "Meta",
        "campaign_name": "Winter Sale Campaign",
        "ad_type": "video",
        "region": "North America",
        "target_audience": random.choice(target_audiences),
        "impressions": 15000,
        "clicks": 1200,
        "conversions": 90,
        "roi": 2.5,
        "ctr": 8.0,
        "engagement_rate": 6.5,
        "cpc": 0.75,
        "spend": 900,
        "revenue": 2250,
        "daily_stats": generate_daily_stats(today, 7, base_ctr=8.0, base_roi=2.5, base_cpc=0.75)
    },
    {
        "id": "google_ad_002",
        "platform": "Google",
        "campaign_name": "Summer Launch",
        "ad_type": "image",
        "region": "Europe",
        "target_audience": random.choice(target_audiences),
        "impressions": 20000,
        "clicks": 1600,
        "conversions": 110,
        "roi": 3.0,
        "ctr": 8.0,
        "engagement_rate": 7.0,
        "cpc": 0.80,
        "spend": 1280,
        "revenue": 3840,
        "daily_stats": generate_daily_stats(today, 7, base_ctr=8.0, base_roi=3.0, base_cpc=0.80)
    },
    {
        "id": "meta_ad_003",
        "platform": "Meta",
        "campaign_name": "Flash Deals",
        "ad_type": "carousel",
        "region": "Asia",
        "target_audience": random.choice(target_audiences),
        "impressions": 18000,
        "clicks": 1500,
        "conversions": 105,
        "roi": 2.8,
        "ctr": 8.33,
        "engagement_rate": 6.9,
        "cpc": 0.78,
        "spend": 1170,
        "revenue": 3276,
        "daily_stats": generate_daily_stats(today, 7, base_ctr=8.3, base_roi=2.8, base_cpc=0.78)
    }
]

# Optional: preview the output
from pprint import pprint
pprint(mock_ads_data)
