import pdfplumber
import glob
import os
import json
import math

def analyze_pdf(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        page = pdf.pages[0]
        lines = page.lines
        rects = page.rects
        
        # Merge all lines and rect edges into a set of segments
        segments = []
        for l in lines:
            segments.append((l['x0'], l['y0'], l['x1'], l['y1']))
        
        # Rectangles are essentially 4 lines
        for r in rects:
            x0, y0, x1, y1 = r['x0'], r['top'], r['x1'], r['bottom']
            segments.append((x0, y0, x1, y0))
            segments.append((x1, y0, x1, y1))
            segments.append((x0, y1, x1, y1))
            segments.append((x0, y0, x0, y1))
            
        # Identify horizontal, vertical, and diagonal lines
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
                
        # To find cells, we can look at the X and Y coordinates of vertical and horizontal lines
        x_coords = [l[0] for l in v_lines]
        y_coords = [l[0] for l in h_lines]
        
        def cluster_coords(coords, threshold=3):
            coords.sort()
            clusters = []
            for c in coords:
                if not clusters or c - clusters[-1] > threshold:
                    clusters.append(c)
            return clusters
            
        x_clusters = cluster_coords(x_coords)
        y_clusters = cluster_coords(y_coords)
        
        cols = max(0, len(x_clusters) - 1)
        rows = max(0, len(y_clusters) - 1)
        
        # Refine row/col count based on actual cell width/height
        # Cell width is usually the difference between major grid lines
        # But Tian/Mi grids have mid lines. So X clusters might be double the number of cells.
        
        # Try to find the bounding box of the whole grid area
        if not x_clusters or not y_clusters:
            return {"type": "Unknown", "rows": 0, "cols": 0, "desc": "No grid found"}
            
        width = x_clusters[-1] - x_clusters[0]
        height = y_clusters[-1] - y_clusters[0]
        
        # Count diagonals to distinguish Mi vs others
        # Diagonals usually mean Mi grid.
        # If no diagonals, but there are crosses, it's Tian.
        # If no internal crosses, it's Square.
        
        # A true cell will have an outline. 
        # Let's count how many distinct horizontal/vertical line spacing we have.
        x_diffs = [round(x_clusters[i+1] - x_clusters[i]) for i in range(len(x_clusters)-1)]
        y_diffs = [round(y_clusters[i+1] - y_clusters[i]) for i in range(len(y_clusters)-1)]
        
        # Filter small diffs
        x_diffs = [d for d in x_diffs if d > 5]
        y_diffs = [d for d in y_diffs if d > 5]
        
        # Determine actual number of cells by dividing total width by typical cell width
        # Typical cell width in a grid is the max common difference, or sum of two adjacent if it's Tian/Mi
        if len(d_lines) > 20:
            grid_type = "Mi"
            # In Mi grid, a cell has a mid-line, so the actual cell width is composed of 2 smaller diffs
            cols = len(x_diffs) // 2
            rows = len(y_diffs) // 2
        elif len(h_lines) > len(y_clusters) and len(v_lines) > len(x_clusters) and len(rects) > 10:
            # Lots of rects and lines but no diagonals -> Tian
            # Wait, let's just check if there are 2x sub-cells.
            # If the number of x_diffs is even and alternating, or if many cells have crosses.
            grid_type = "Tian"
            cols = len(x_diffs) // 2
            rows = len(y_diffs) // 2
        else:
            # If neither, maybe Square grid (no inner crosses)
            if len(v_lines) < 5:
                grid_type = "Horizontal"
                rows = len(y_diffs)
                cols = 1
            else:
                grid_type = "Square"
                cols = len(x_diffs)
                rows = len(y_diffs)
                
        # If cols/rows seem ridiculously high due to borders, adjust
        
        return {
            "type": grid_type,
            "rows": rows,
            "cols": cols,
            "x_diffs": len(x_diffs),
            "y_diffs": len(y_diffs),
            "d_lines": len(d_lines),
            "rects": len(rects),
            "text": page.extract_text().split('\n')[0] if page.extract_text() else ""
        }

if __name__ == "__main__":
    files = glob.glob("Giấy viết tiếng trung-pages/*.pdf")
    files.sort(key=lambda x: int(os.path.basename(x).split('-')[-1].split('.')[0]))
    results = {}
    for f in files:
        try:
            res = analyze_pdf(f)
            results[os.path.basename(f)] = res
        except Exception as e:
            results[os.path.basename(f)] = {"error": str(e)}
    print(json.dumps(results, indent=2, ensure_ascii=False))
