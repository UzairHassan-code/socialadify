# D:/socialadify/backend/app/services/scheduler_service.py

import logging
from app.crud import scheduled_post as scheduler_crud
from app.crud import user as user_crud
from app.db.session import get_database_context
from app.services.meta_service import publish_photo_to_page, boost_published_post

logger = logging.getLogger(__name__)

async def process_due_posts():
    """
    The main function for the background job. It finds due posts and processes them.
    """
    logger.info("Scheduler job started: Checking for due posts...")
    
    async with get_database_context() as db:
        try:
            due_posts = await scheduler_crud.get_due_posts(db)
            
            if not due_posts:
                logger.info("No due posts found.")
                return

            for post in due_posts:
                post_id = post.id
                logger.info(f"Processing post ID: {post_id}")

                await scheduler_crud.update_post_status(db, post_id, "processing")

                try:
                    post_user = await user_crud.get_user_by_id(db, user_id=str(post.user_id))
                    if not post_user:
                        raise Exception(f"User {post.user_id} not found for scheduled post.")

                    # --- Meta Workflow ---
                    if post.target_platform in ["Facebook", "Instagram"]:
                        if not post_user.meta_page_id or not post_user.meta_page_access_token:
                            raise Exception("User has not connected a Meta Page.")
                        
                        # 1. Publish the post to the user's page
                        published_post_id = await publish_photo_to_page(
                            page_id=post_user.meta_page_id,
                            page_access_token=post_user.meta_page_access_token,
                            caption=post.caption,
                            image_url=post.image_url
                        )

                        # 2. If auto-boost is enabled, run the boost simulation
                        if post.auto_boost:
                            if not post.boost_budget or not post.boost_duration_days:
                                raise Exception("Boost is enabled but budget or duration is missing.")
                            
                            await boost_published_post(
                                page_post_id=published_post_id,
                                ad_account_id=post_user.meta_page_id, # Using Page ID as a placeholder
                                page_access_token=post_user.meta_page_access_token,
                                budget=post.boost_budget,
                                duration_days=post.boost_duration_days
                            )
                    
                    # --- Google Ads Workflow ---
                    elif post.target_platform == "Google":
                        # For Google, we just log a notification as planned.
                        logger.info(f"--- [NOTIFICATION] ---")
                        logger.info(f"Post {post_id} for Google Ads is due.")
                        logger.info(f"Notify user {post_user.email} to create their campaign.")
                        logger.info(f"--- [NOTIFICATION] ---")

                    await scheduler_crud.update_post_status(db, post_id, "completed")
                    logger.info(f"Successfully processed post ID: {post_id}")

                except Exception as e:
                    error_msg = f"Failed to process post {post_id}: {e}"
                    logger.error(error_msg, exc_info=True)
                    await scheduler_crud.update_post_status(db, post_id, "failed", error_message=str(e))

        except Exception as e:
            logger.error(f"An error occurred during the scheduler job: {e}", exc_info=True)

    logger.info("Scheduler job finished.")
