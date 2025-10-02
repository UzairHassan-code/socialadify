# D:/socialadify/backend/app/services/scheduler_service.py

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime, timezone
import logging

from app.crud import scheduled_post as scheduler_crud
from app.crud import user as user_crud
from app.db.session import get_database_context
from app.services.meta_service import publish_photo_to_page

logger = logging.getLogger(__name__)

async def process_due_posts():
    """
    Fetches and processes due posts using the securely stored, 
    non-expiring Page Access Token for each user.
    """
    logger.info("Scheduler job started: Checking for due posts...")
    
    async with get_database_context() as db:
        if db is None:
            logger.error("Could not get database connection for scheduler job.")
            return
            
        due_posts = await scheduler_crud.get_due_posts(db)

        if not due_posts:
            logger.info("No due posts found.")
            return

        logger.info(f"Found {len(due_posts)} due posts to process.")

        for post in due_posts:
            post_id = post.id
            logger.info(f"Processing post ID: {post_id}")
            
            try:
                await scheduler_crud.update_post_status(db, post_id, "processing")

                post_user = await user_crud.get_user_by_id(db, user_id=str(post.user_id))
                if not post_user:
                    raise Exception(f"User {post.user_id} not found for post {post_id}.")

                if post.target_platform in ["Facebook", "Instagram"]:
                    # --- THE FIX: Use the new 'linked_' fields ---
                    # The scheduler now checks for and uses the specific Page Access Token
                    # that was saved when the user linked their account.
                    if not post_user.linked_page_id or not post_user.linked_page_access_token:
                        raise Exception("User has not linked a Meta Page with a valid Page Access Token.")
                    
                    published_post_id = await publish_photo_to_page(
                        db=db,
                        user_id=post_user.id,
                        page_id=post_user.linked_page_id, # <-- Use the linked page ID
                        page_access_token=post_user.linked_page_access_token, # <-- Use the correct Page Access Token
                        image_url_from_db=post.image_url,
                        caption=post.caption
                    )
                    
                await scheduler_crud.update_post_status(db, post_id, "completed")
                logger.info(f"Successfully processed post ID: {post_id}")

            except Exception as e:
                error_message = str(e)
                logger.error(f"Failed to process post {post_id}: {error_message}", exc_info=True)
                await scheduler_crud.update_post_status(db, post_id, "failed", error_message=error_message)

    logger.info("Scheduler job finished.")

# --- Scheduler Setup (Unchanged) ---
scheduler = AsyncIOScheduler(timezone="UTC")

def start_scheduler():
    logger.info("Starting background scheduler...")
    scheduler.add_job(process_due_posts, 'interval', minutes=1, next_run_time=datetime.now(timezone.utc))
    scheduler.start()
    logger.info("Background scheduler started, running every minute.")

