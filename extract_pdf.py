import sys
try:
    import fitz  # PyMuPDF
except ImportError:
    print("Installing PyMuPDF...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "PyMuPDF"])
    import fitz

doc = fitz.open("template.pdf")
print(f"Total pages: {len(doc)}")

for i in range(min(3, len(doc))):
    page = doc[i]
    text = page.get_text()
    print(f"\n--- PAGE {i+1} ---")
    print(text[:500])
    
print("\nImage extraction test:")
for i in range(min(3, len(doc))):
    page = doc[i]
    image_list = page.get_images(full=True)
    print(f"Page {i+1} has {len(image_list)} images")
