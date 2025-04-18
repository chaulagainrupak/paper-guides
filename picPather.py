from PIL import Image
import io

def process_images(image_files, padding=20):
    images = []
    for img_file in image_files:
        if img_file and img_file.filename:
            img_file.stream.seek(0)
            img = Image.open(img_file.stream)
            images.append(img)

    if not images:
        return None

    max_width = max(img.width for img in images)
    aligned_images = []

    for img in images:
        if img.mode == 'RGBA':
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3])
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')

        # Center align
        new_img = Image.new('RGB', (max_width, img.height), (255, 255, 255))
        offset_x = (max_width - img.width) // 2
        new_img.paste(img, (offset_x, 0))
        aligned_images.append(new_img)

    # Combine vertically with padding
    total_height = sum(img.height for img in aligned_images) + padding * (len(aligned_images) - 1)
    final_image = Image.new('RGB', (max_width, total_height), (255, 255, 255))

    y_offset = 0
    for img in aligned_images:
        final_image.paste(img, (0, y_offset))
        y_offset += img.height + padding

    # Save to PNG
    output_buffer = io.BytesIO()
    final_image.save(output_buffer, format='PNG', optimize=True, compress_level=9)
    return output_buffer.getvalue()


def convert_single_image(file):
    try:
        image = Image.open(file.stream).convert("RGB")
        buffer = io.BytesIO()
        image.save(buffer, format='PNG', optimize=True, compress_level=9)
        return buffer.getvalue()
    except Exception as e:
        return None
