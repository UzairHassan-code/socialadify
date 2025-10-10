# D:/socialadify/backend/app/api/templates/router.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.core.security import get_current_active_user
from app.schemas.user import UserInDB, PyObjectId
from app.db.session import get_database
from app.crud import template as template_crud
# --- NEW: Import the CRUD function for saving posts ---
from app.crud import generated_post as post_crud
from app.services.image_service import generate_image_from_template
# --- NEW: Import the schema needed for creating a post record ---
from app.api.post_generator.schemas import GeneratedPostCreate
from .schemas import TemplatePublic, TemplateGenerationRequest, TemplateGenerationResponse
import logging

router = APIRouter()
CurrentUserDependency = Depends(get_current_active_user)
DbDependency = Depends(get_database)
logger = logging.getLogger(__name__)


@router.get("", response_model=List[TemplatePublic])
async def list_available_templates(
    db = DbDependency,
    current_user: UserInDB = CurrentUserDependency
):
    """
    Get a list of all available templates for the user to choose from.
    """
    templates_from_db = await template_crud.get_all_templates(db)
    # Removing the debug print statement from the previous step
    return templates_from_db

@router.post("/{template_id}/generate", response_model=TemplateGenerationResponse)
async def generate_post_from_template(
    template_id: str,
    request: TemplateGenerationRequest,
    db = DbDependency,
    current_user: UserInDB = CurrentUserDependency
):
    """
    Generate a new image post by filling in a template with user-provided data
    AND save it to the user's history.
    """
    try:
        template_obj_id = PyObjectId(template_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid template ID format.")

    template_doc = await template_crud.get_template_by_id(db, template_id=template_obj_id)
    if not template_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found.")
    
    try:
        # 1. Generate the image and get its URL (no changes here)
        generated_url = generate_image_from_template(
            template_doc=template_doc,
            field_values=request.field_values,
            user_id=str(current_user.id)
        )
        
        # --- 2. THE FIX: Save the generated post to the database ---
        # Create a placeholder for the 'original_request' since templates don't have one
        # This matches the structure your history page expects
        placeholder_request = {
            "product_name": template_doc.get("name", "Template Post"),
            "target_audience": "", "key_features": [], "tone": "",
            "platform": "", "call_to_action": "", "aspect_ratio": ""
        }

        # Create the database record object
        post_to_save = GeneratedPostCreate(
            user_id=current_user.id,
            image_url=generated_url,
            # Use the template name as the prompt for history display
            prompt_used=f"Generated from template: {template_doc.get('name', 'Unknown Template')}",
            original_request=placeholder_request
        )
        
        # Call the existing CRUD function to save the post
        await post_crud.create_generated_post(db, post_in=post_to_save)
        logger.info(f"Successfully saved template-generated post for user {current_user.id}")

        # 3. Return the response to the frontend (no changes here)
        return TemplateGenerationResponse(generated_image_url=generated_url)

    except ValueError as e:
        logger.error(f"Image generation failed for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail=f"Image generation failed: {e}")
    except Exception as e:
        logger.error(f"An unexpected error occurred for user {current_user.id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred.")

