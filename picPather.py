from PIL import Image
import io

def process_images(image_files, padding=20, quality=85):
    """
    Process an array of image file objects and concatenate them into one image.
    
    Args:
        image_files: List of file objects from request.files.getlist()
        padding: Padding between images in pixels
        quality: JPEG quality (0-100, higher is better quality but larger file size)
        
    Returns:
        bytes: The processed image as JPEG bytes
    """
    # Load images from file objects
    images = []
    for img_file in image_files:
        if img_file and img_file.filename:
            # Read image data and create PIL Image
            img_data = img_file.read()
            img = Image.open(io.BytesIO(img_data))
            images.append(img)
    
    if not images:
        return None
    
    # Center-align images
    max_width = max(img.width for img in images)
    aligned_images = []
    
    for img in images:
        # Convert to RGB if image has transparency (PNG) or non-RGB mode
        if img.mode == 'RGBA':
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3])  # Use alpha channel as mask
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
            
        # Create a new image with max width and center the original image
        new_img = Image.new('RGB', (max_width, img.height), (255, 255, 255))
        offset_x = (max_width - img.width) // 2
        new_img.paste(img, (offset_x, 0))
        aligned_images.append(new_img)
    
    # Concatenate images vertically with padding
    total_height = sum(img.height for img in aligned_images) + padding * (len(aligned_images) - 1)
    final_image = Image.new('RGB', (max_width, total_height), (255, 255, 255))
    
    y_offset = 0
    for img in aligned_images:
        final_image.paste(img, (0, y_offset))
        y_offset += img.height + padding
    
    # Convert final image to JPEG bytes
    output_buffer = io.BytesIO()
    final_image.save(output_buffer, format='JPEG', quality=quality, optimize=True)
    return output_buffer.getvalue()


def convert_single_image(file, quality=85):
    try:
        image = Image.open(file.stream).convert("RGB")
        buffer = io.BytesIO()
        image.save(buffer, format='JPEG', quality=quality)
        return buffer.getvalue()
    except Exception as e:
        logger.exception("Failed to convert single image")
        return None
