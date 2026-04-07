import fitz
import os

pdf_path = "template.pdf"
output_dir = "backend/src/templates/assets"
os.makedirs(output_dir, exist_ok=True)

try:
    doc = fitz.open(pdf_path)
    count = 0
    for i in range(len(doc)):
        for img in doc[i].get_images(full=True):
            xref = img[0]
            pix = fitz.Pixmap(doc, xref)
            
            # Save format depends on colorspace
            filename = os.path.join(output_dir, f"page{i+1}_img{count}.png")
            if pix.n - pix.alpha < 4:
                pix.save(filename)
            else:
                # CMYK needs conversion to RGB
                pix1 = fitz.Pixmap(fitz.csRGB, pix)
                pix1.save(filename)
                pix1 = None
                
            pix = None
            count += 1
            print(f"Saved {filename}")

    print(f"Extracted {count} images to {output_dir}")
except Exception as e:
    print(f"Failed to extract images: {e}")
