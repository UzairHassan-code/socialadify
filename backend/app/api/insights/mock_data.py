from datetime import datetime, timedelta
import random

# Define sample target audiences
target_audiences = [
    "Men 18-24", "Men 25-34", "Men 35-44",
    "Women 18-24", "Women 25-34", "Women 35-44",
    "Women 34-44", # Added new target audience
    "All Ages"
]

def generate_daily_stats(start_date: datetime, days: int, base_ctr: float, base_roi: float, base_cpc: float):
    daily_stats = []
    for i in range(days):
        date = start_date - timedelta(days=i)
        # Ensure impressions are at least enough to generate some clicks based on CTR
        # And clicks are enough for some conversions if conversion rate is > 0
        impressions = random.randint(1000, 5000) # Increased upper range for more variability
        
        # Fluctuate CTR around the base
        ctr_fluctuation = random.uniform(-0.5, 0.5) # Smaller fluctuation for daily stats
        ctr = max(0.1, base_ctr + ctr_fluctuation) # Ensure CTR is not too low or negative
        
        clicks = int(impressions * (ctr / 100))
        
        # Fluctuate CPC around the base
        cpc_fluctuation = random.uniform(-0.05, 0.05) # Smaller fluctuation
        cpc = max(0.01, round(base_cpc + cpc_fluctuation, 2))
        
        spend = round(clicks * cpc, 2)
        
        # Fluctuate ROI around the base
        roi_fluctuation = random.uniform(-0.2, 0.2) # Smaller fluctuation
        roi = max(0.1, base_roi + roi_fluctuation) 
        
        revenue = round(spend * roi, 2)
        
        # Base conversions on clicks and a fluctuating daily conversion rate
        # This makes daily conversions more directly tied to daily clicks and overall campaign conversion rate
        # Assume base_conversion_rate is (base_conversions_overall / base_clicks_overall)
        # For simplicity, let's make daily conversions a fraction of daily clicks, with some randomness
        daily_conversion_rate_factor = random.uniform(0.03, 0.15) # e.g. 3% to 15% of clicks convert daily
        conversions = max(0, int(clicks * daily_conversion_rate_factor))

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

# Calculate metrics for the new campaign
new_campaign_clicks = 861
new_campaign_impressions = 1754
new_campaign_spend = 18066.00 # Make it float for consistency
new_campaign_roi = 6.73
new_campaign_conversion_rate_decimal = 0.09 # User provided 0.09

new_campaign_conversions = round(new_campaign_clicks * new_campaign_conversion_rate_decimal)
new_campaign_ctr = round((new_campaign_clicks / new_campaign_impressions) * 100, 2) if new_campaign_impressions > 0 else 0
new_campaign_cpc = round(new_campaign_spend / new_campaign_clicks, 2) if new_campaign_clicks > 0 else 0
new_campaign_revenue = round(new_campaign_spend * new_campaign_roi, 2)

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
        "spend": 900.00,
        "revenue": 2250.00,
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
        "ctr": 8.0, # (1600/20000)*100
        "engagement_rate": 7.0,
        "cpc": 0.80, # 1280/1600
        "spend": 1280.00,
        "revenue": 3840.00,
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
        "conversions": 105, # (1500 * (X/100)) -> X = 7% conversion rate
        "roi": 2.8,
        "ctr": 8.33, # (1500/18000)*100
        "engagement_rate": 6.9,
        "cpc": 0.78, # 1170/1500
        "spend": 1170.00,
        "revenue": 3276.00,
        "daily_stats": generate_daily_stats(today, 7, base_ctr=8.33, base_roi=2.8, base_cpc=0.78)
    },
    # New campaign based on your input
    {
        "id": "tiktok_ad_004", # New unique ID
        "platform": "TikTok",   # New platform example
        "campaign_name": "Influencer Bloom", # Example name
        "ad_type": "video",     # As specified
        "region": "Global",     # Example region
        "target_audience": "Women 34-44", # As specified
        "impressions": new_campaign_impressions, # 1754
        "clicks": new_campaign_clicks,           # 861
        "conversions": new_campaign_conversions, # Calculated: 77
        "roi": new_campaign_roi,                 # 6.73
        "ctr": new_campaign_ctr,                 # Calculated: 49.09
        "engagement_rate": 6.0,                  # As specified (Engagement score)
        "cpc": new_campaign_cpc,                 # Calculated: 20.98
        "spend": new_campaign_spend,             # 18066.00
        "revenue": new_campaign_revenue,         # Calculated: 121587.18
        "daily_stats": generate_daily_stats(
            today, 
            days=7, 
            base_ctr=new_campaign_ctr, 
            base_roi=new_campaign_roi, 
            base_cpc=new_campaign_cpc
        )
    }
]

# Optional: preview the output
if __name__ == "__main__": # To prevent running when imported
    from pprint import pprint
    pprint(mock_ads_data)
