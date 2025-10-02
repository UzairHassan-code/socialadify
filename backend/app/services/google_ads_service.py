# D:\socialadify\backend\app\services\google_ads_service.py
from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException
import logging
from pathlib import Path
import yaml
# --- FIXED: Import the correct, renamed mock campaign objects ---
from app.api.insights.mock_data import MOCK_GOOGLE_CAMPAIGN_1, MOCK_GOOGLE_CAMPAIGN_2

# --- Configuration ---
CONFIG_FILE = Path(__file__).resolve().parent.parent.parent / "google-ads.yaml"
logger = logging.getLogger(__name__)


def get_google_ads_client(refresh_token: str) -> GoogleAdsClient:
    """Initializes and returns a GoogleAdsClient instance."""
    try:
        with open(CONFIG_FILE, "r") as f:
            config_dict = yaml.safe_load(f)
        config_dict["refresh_token"] = refresh_token
        config_dict["use_proto_plus"] = True
        return GoogleAdsClient.load_from_dict(config_dict)
    except Exception as e:
        logger.error(f"Failed to initialize Google Ads client: {e}")
        raise


def list_accessible_customers(client: GoogleAdsClient) -> list[dict]:
    """
    Fetches a list of all Google Ads accounts accessible by the user,
    including accounts under any manager accounts.
    """
    customer_list = []
    try:
        query = """
            SELECT
                customer_client.id,
                customer_client.descriptive_name,
                customer_client.manager,
                customer_client.test_account,
                customer_client.status
            FROM customer_client
            WHERE customer_client.status = 'CLOSED'
        """
        ga_service = client.get_service("GoogleAdsService")
        login_customer_id = client.login_customer_id
        response_stream = ga_service.search_stream(customer_id=login_customer_id, query=query)
        for batch in response_stream:
            for row in batch.results:
                customer = row.customer_client
                customer_list.append({
                    "id": str(customer.id),
                    "name": customer.descriptive_name,
                    "is_manager": customer.manager,
                    "is_test_account": customer.test_account,
                })
        manager_query = f"""
            SELECT customer.id, customer.descriptive_name, customer.manager, customer.test_account
            FROM customer WHERE customer.id = {login_customer_id}
        """
        manager_response = ga_service.search(customer_id=login_customer_id, query=manager_query)
        for row in manager_response:
            customer = row.customer
            if not any(c["id"] == str(customer.id) for c in customer_list):
                   customer_list.append({
                       "id": str(customer.id),
                       "name": customer.descriptive_name,
                       "is_manager": customer.manager,
                       "is_test_account": customer.test_account,
                   })
        logger.info(f"Found {len(customer_list)} total accessible Google Ads accounts.")
        return customer_list
    except GoogleAdsException as ex:
        logger.error(f"Google Ads API request failed: {ex}")
        raise


def get_campaigns(client: GoogleAdsClient, customer_id: str) -> list[dict]:
    ga_service = client.get_service("GoogleAdsService")
    query = """
        SELECT
            campaign.id, campaign.name, campaign.status,
            metrics.clicks, metrics.impressions, metrics.ctr,
            metrics.average_cpc, metrics.cost_micros
        FROM campaign ORDER BY campaign.name
    """
    stream = ga_service.search_stream(customer_id=customer_id, query=query)
    campaign_list = []
    for batch in stream:
        for row in batch.results:
            campaign = row.campaign
            metrics = row.metrics
            campaign_list.append({
                "id": str(campaign.id),
                "name": campaign.name,
                "status": campaign.status.name,
                "clicks": metrics.clicks,
                "impressions": metrics.impressions,
                "ctr": metrics.ctr,
                "average_cpc": metrics.average_cpc / 1_000_000,
                "cost": metrics.cost_micros / 1_000_000,
            })
    
    # --- Inject BOTH mock campaigns into the list ---
    campaign_list.append(MOCK_GOOGLE_CAMPAIGN_1)
    campaign_list.append(MOCK_GOOGLE_CAMPAIGN_2)

    logger.info(f"Found {len(campaign_list) - 2} real campaigns, added 2 mock campaigns.")
    return campaign_list

