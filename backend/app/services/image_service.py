from PIL import Image, ImageDraw, ImageFont
import uuid
import time
from pathlib import Path

# Define root paths based on this file's location
_SERVICE_ROOT = Path(__file__).resolve().parent
_BACKEND_ROOT = _SERVICE_ROOT.parent.parent

# Define directories for assets and output
ASSETS_DIR = _BACKEND_ROOT / "assets"
GENERATED_POSTS_DIR = _BACKEND_ROOT / "static" / "generated_posts"
TEMPLATES_DIR = _BACKEND_ROOT / "static" / "templates" # Assuming templates are stored here

# Ensure directories exist
GENERATED_POSTS_DIR.mkdir(parents=True, exist_ok=True)


def generate_image_from_template(template_doc: dict, field_values: dict, user_id: str) -> str:
    """
    Generates an image by overlaying text onto a base template image.

    Args:
        template_doc: The template document from MongoDB.
        field_values: A dictionary of user-provided text for the editable fields.
        user_id: The ID of the current user to create a unique filename.

    Returns:
        The URL-friendly path to the newly generated image.
    """
    try:
        # 1. Load the base template image
        base_image_path = _BACKEND_ROOT / template_doc["base_image_path"]
        base_image = Image.open(base_image_path).convert("RGBA")
        draw = ImageDraw.Draw(base_image)

        # 2. Iterate through the editable fields defined in the template
        for field in template_doc["editable_fields"]:
            key = field["key"]
            
            # Check if the user provided input for this field
            if key in field_values:
                text_to_draw = field_values[key]
                
                # Load the specified font
                font_path = ASSETS_DIR / field["font"]
                font = ImageFont.truetype(str(font_path), field["font_size"])
                
                # Get position and color
                position = (field["position"]["x"], field["position"]["y"])
                color = field["color"]
                
                # 3. Draw the text onto the image
                draw.text(position, text_to_draw, fill=color, font=font, anchor="lt") # 'lt' anchor is top-left

        # 4. Save the new image with a unique name
        timestamp = int(time.time())
        unique_filename = f"user_{user_id}_template_{timestamp}_{uuid.uuid4().hex[:6]}.png"
        output_path = GENERATED_POSTS_DIR / unique_filename
        
        base_image.save(output_path, "PNG")
        
        # 5. Return the path to the new image for API response
        return f"/static/generated_posts/{unique_filename}"

    except FileNotFoundError as e:
        print(f"Error: A required file was not found. {e}")
        raise ValueError(f"Missing asset file: {e.filename}")
    except Exception as e:
        print(f"An unexpected error occurred during image generation: {e}")
        raise