from PIL import Image
import os

source = r'c:\Users\ADMIN\Remonode\NextJS\remopay-web\public\icon.png'
dest = r'c:\Users\ADMIN\Remonode\NextJS\remopay-web\app\favicon.ico'

try:
    img = Image.open(source)
    print(f'Image opened: {img.size}, mode: {img.mode}')
    
    if img.mode == 'RGBA':
        background = Image.new('RGB', img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[3])
        img = background
    
    img.save(dest, format='ICO')
    print(f'? Conversion successful!')
    print(f'Saved to: {dest}')
except Exception as e:
    print(f'? Error: {e}')
