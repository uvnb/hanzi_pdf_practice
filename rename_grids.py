import pdfplumber
import glob
import os
import shutil

def analyze_and_rename():
    files = glob.glob("Giấy viết tiếng trung-pages/*.pdf")
    files.sort(key=lambda x: int(os.path.basename(x).split('-')[-1].split('.')[0]))
    
    for idx, f in enumerate(files):
        with pdfplumber.open(f) as pdf:
            page = pdf.pages[0]
            lines = page.lines
            rects = page.rects
            
            # Count exact geometry properties
            segments = []
            for l in lines:
                segments.append((l['x0'], l['y0'], l['x1'], l['y1']))
            for r in rects:
                x0, y0, x1, y1 = r['x0'], r['top'], r['x1'], r['bottom']
                segments.append((x0, y0, x1, y0))
                segments.append((x1, y0, x1, y1))
                segments.append((x0, y1, x1, y1))
                segments.append((x0, y0, x0, y1))
                
            v_lines = []
            h_lines = []
            d_lines = []
            for x0, y0, x1, y1 in segments:
                dx = abs(x1 - x0)
                dy = abs(y1 - y0)
                if dx < 1 and dy > 5:
                    v_lines.append((min(x0, x1), min(y0, y1), max(y0, y1)))
                elif dy < 1 and dx > 5:
                    h_lines.append((min(y0, y1), min(x0, x1), max(x0, x1)))
                elif dx > 5 and dy > 5:
                    d_lines.append((x0, y0, x1, y1))
                    
            # Determine Grid Type
            # Usually, a single grid page has hundreds of lines if it's Mi or Tian.
            grid_type = "Unknown"
            if len(d_lines) > 50:
                grid_type = "O_Me"
            elif len(v_lines) > 100 and len(h_lines) > 100:
                grid_type = "O_Dien"
            elif len(h_lines) > 50 and len(v_lines) < 20:
                grid_type = "Ke_Ngang"
            elif len(v_lines) > 50 and len(h_lines) < 20:
                grid_type = "Ke_Doc"
            else:
                grid_type = "O_Vuong"

            # Estimate Rows and Cols based on major divisions
            x_coords = sorted(list(set([round(l[0], 0) for l in v_lines])))
            y_coords = sorted(list(set([round(l[0], 0) for l in h_lines])))
            
            def cluster(coords, threshold=10):
                if not coords: return []
                clusters = [coords[0]]
                for c in coords[1:]:
                    if c - clusters[-1] > threshold:
                        clusters.append(c)
                return clusters
                
            x_c = cluster(x_coords)
            y_c = cluster(y_coords)
            
            # For O_Me and O_Dien, there is a mid-line in each cell.
            # So actual cols = (len(x_c) - 1) / 2
            cols = max(1, len(x_c) - 1)
            rows = max(1, len(y_c) - 1)
            
            if grid_type in ["O_Me", "O_Dien"]:
                cols = cols // 2
                rows = rows // 2
                
            if grid_type == "O_Vuong":
                # For square grids without inner lines, rows and cols = number of clusters - 1
                cols = max(1, len(x_c) - 1)
                rows = max(1, len(y_c) - 1)
                
            # If the calculation fails or returns 0
            if cols == 0: cols = 1
            if rows == 0: rows = 1

            new_name = f"{grid_type}_{rows}x{cols}_p{idx+1}.pdf"
            new_path = os.path.join(os.path.dirname(f), new_name)
            
            print(f"Renaming: {os.path.basename(f)} -> {new_name}")
            shutil.move(f, new_path)

if __name__ == "__main__":
    analyze_and_rename()
