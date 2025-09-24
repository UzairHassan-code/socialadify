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
    The core function for the background job. Fetches and processes due posts.
    """
    logger.info("Scheduler job started: Checking for due posts...")
    
    # Use a context manager to ensure the DB connection is handled correctly
    async with get_database_context() as db:
        # --- THIS IS THE FIX ---
        # Changed 'if not db:' to the more explicit 'if db is None:'
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
                # Mark as processing
                await scheduler_crud.update_post_status(db, post_id, "processing")

                post_user = await user_crud.get_user_by_id(db, user_id=str(post.user_id))
                if not post_user:
                    raise Exception(f"User {post.user_id} not found for post {post_id}.")

                # --- Platform-specific Logic ---
                if post.target_platform in ["Facebook", "Instagram"]:
                    if not post_user.meta_page_id or not post_user.meta_page_access_token:
                        raise Exception("User has not connected a Meta Page.")
                    
                    published_post_id = await publish_photo_to_page(
                        db=db,
                        user_id=post_user.id,
                        page_id=post_user.meta_page_id,
                        page_access_token=post_user.meta_page_access_token,
                        image_url_from_db=post.image_url,
                        caption=post.caption
                    )
                    
                    if post.auto_boost:
                        # For now, this is a simulation. We'll implement the real boost later.
                        logger.info("Post is marked for auto-boosting (simulation).")

                elif post.target_platform == "Google Ads":
                    logger.info(f"[NOTIFICATION] Post {post_id} for Google Ads is due. User should be notified.")
                
                # Mark as completed
                await scheduler_crud.update_post_status(db, post_id, "completed")
                logger.info(f"Successfully processed post ID: {post_id}")

            except Exception as e:
                error_message = str(e)
                logger.error(f"Failed to process post {post_id}: {error_message}", exc_info=True)
                await scheduler_crud.update_post_status(db, post_id, "failed", error_message=error_message)

    logger.info("Scheduler job finished.")

# --- Scheduler Setup ---
scheduler = AsyncIOScheduler(timezone="UTC")

def start_scheduler():
    logger.info("Starting background scheduler...")
    # Run the job every minute
    scheduler.add_job(process_due_posts, 'interval', minutes=1, next_run_time=datetime.now(timezone.utc))
    scheduler.start()
    logger.info("Background scheduler started, running every minute.")

