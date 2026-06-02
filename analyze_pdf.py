import pdfplumber

def analyze_pdf(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        print(f"Total pages: {len(pdf.pages)}")
        
        for i, page in enumerate(pdf.pages):
            lines = page.lines
            rects = page.rects
            text = page.extract_text()
            
            # Extract basic info about lines to determine grid type
            vertical_lines = [l for l in lines if abs(l["x0"] - l["x1"]) < 1]
            horizontal_lines = [l for l in lines if abs(l["y0"] - l["y1"]) < 1]
            diagonal_lines = [l for l in lines if abs(l["x0"] - l["x1"]) >= 1 and abs(l["y0"] - l["y1"]) >= 1]
            
            first_line = text.split('\n')[0] if text and text.strip() else "NO TEXT"
            
            print(f"Page {i+1}:")
            print(f"  - First line text: {first_line}")
            print(f"  - Rectangles: {len(rects)}")
            print(f"  - V-lines: {len(vertical_lines)}")
            print(f"  - H-lines: {len(horizontal_lines)}")
            print(f"  - D-lines: {len(diagonal_lines)}")
            print(f"  - Total drawing objects: {len(lines) + len(rects)}")

analyze_pdf("Giấy viết tiếng trung.pdf")
