import pdfplumber
import sys

def main():
    with pdfplumber.open("Giấy viết tiếng trung-pages/O_Dien_12x12_p1.pdf") as pdf:
        lines = pdf.pages[0].lines
        print("Lines count:", len(lines))
        for l in lines[:10]:
            print(f"Line: {l['x0']}, {l['y0']} to {l['x1']}, {l['y1']}")

if __name__ == "__main__":
    main()
