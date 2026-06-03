import cv2
import numpy as np

img = cv2.imread('frontend/public/landing/new-hero-bg.png')

# Print the width and height
print(f"Image dimensions: {img.shape}")

# Look at the rightmost column (x = width - 1)
right_col = img[:, -1]
# Is it a solid color (parchment) or does it have variation (flower)?
std_dev = np.std(right_col, axis=0)
print(f"Standard deviation of rightmost column: {std_dev}")

# Look at x = width - 100
col_100 = img[:, -100]
print(f"Standard deviation at x = width - 100: {np.std(col_100, axis=0)}")

