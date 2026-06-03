import pdfplumber
with pdfplumber.open("Giấy viết tiếng trung-pages/O_Dien_12x12_p1.pdf") as pdf:
    lines = pdf.pages[0].lines
    d_lines = [l for l in lines if abs(l['x1']-l['x0'])>5 and abs(l['y1']-l['y0'])>5]
    print(len(d_lines))
