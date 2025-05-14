# D:\socialadify\backend\app\api\insights\schemas.py

from pydantic import BaseModel
from typing import List

class AdInsight(BaseModel):
    id: str
    platform: str
    campaign_name: str
    impressions: int
    clicks: int
    conversions: int
    roi: float
    ctr: float
    engagement_rate: float
    cpc: float
    spend: float
    revenue: float