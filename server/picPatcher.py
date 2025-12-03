from PIL import Image, ExifTags
import io
import datetime


def extract_timestamp(img):
    try:
        exif = img.getexif()
        if not exif:
            return None

        for tag, val in ExifTags.TAGS.items():
            if val == "DateTimeOriginal":
                dateStr = exif.get(tag)
                if dateStr:
                    return datetime.datetime.strptime(dateStr, "%Y:%m:%d %H:%M:%S")
    except:
        pass
    return None


async def process_images(imageFiles, padding=20):
    loaded = []

    # Load images + timestamps
    for imgFile in imageFiles:
        if imgFile and imgFile.filename:
            imgBytes = await imgFile.read()
            try:
                img = Image.open(io.BytesIO(imgBytes))
                ts = extract_timestamp(img)
                loaded.append((img, ts, imgFile.filename))
            except Exception:
                pass

    if not loaded:
        return None

    # Sort by timestamp earliest on top
    loaded.sort(key=lambda x: (x[1] or datetime.datetime.min, x[2]))

    processed = []

    # Normalize channels
    maxWidth = max(img.width for img, _, _ in loaded)

    for img, _, _ in loaded:
        if img.mode == "RGBA":
            bg = Image.new("RGB", img.size, (255, 255, 255))
            bg.paste(img, mask=img.split()[3])
            img = bg
        elif img.mode != "RGB":
            img = img.convert("RGB")

        # center horizontally
        aligned = Image.new("RGB", (maxWidth, img.height), (255, 255, 255))
        offset = (maxWidth - img.width) // 2
        aligned.paste(img, (offset, 0))

        processed.append(aligned)

    totalHeight = sum(i.height for i in processed) + padding * (len(processed) - 1)

    finalImage = Image.new("RGB", (maxWidth, totalHeight), (255, 255, 255))

    y = 0
    for img in processed:
        finalImage.paste(img, (0, y))
        y += img.height + padding

    outputBuffer = io.BytesIO()
    finalImage.save(
        outputBuffer,
        format="WEBP",
        lossless=True,
        method=6,
    )

    return outputBuffer.getvalue()
