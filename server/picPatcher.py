from PIL import Image
import io

async def process_images(imageFiles, padding=20):
    images = []

    for imgFile in imageFiles:
        if imgFile and imgFile.filename:
            imgBytes = await imgFile.read()  # Read image blob
            try:
                img = Image.open(io.BytesIO(imgBytes))
                images.append(img)
            except Exception as e:
                print(f"Error loading image: {imgFile.filename}, {e}")

    if not images:
        return None

    maxWidth = max(img.width for img in images)
    alignedImages = []

    for img in images:
        # Convert to RGB if needed
        if img.mode == 'RGBA':
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3])
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')

        # Center align horizontally
        newImg = Image.new('RGB', (maxWidth, img.height), (255, 255, 255))
        offsetX = (maxWidth - img.width) // 2
        newImg.paste(img, (offsetX, 0))
        alignedImages.append(newImg)

    totalHeight = sum(img.height for img in alignedImages) + padding * (len(alignedImages) - 1)
    finalImage = Image.new('RGB', (maxWidth, totalHeight), (255, 255, 255))

    yOffset = 0
    for img in alignedImages:
        finalImage.paste(img, (0, yOffset))
        yOffset += img.height + padding

    outputBuffer = io.BytesIO()
    finalImage.save(outputBuffer, format='WEBP', quality=40, method=6)

    return outputBuffer.getvalue()
