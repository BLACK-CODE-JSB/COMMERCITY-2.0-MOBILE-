
# Read original UTF-16 file from git
with open(r'www\index_original.html', 'r', encoding='utf-16') as f:
    content = f.read()

print('Original length:', len(content))

# Check what the emoji looks like in the original
idx = content.find('Carrito de Compras')
print('Cart section:', repr(content[idx-200:idx+50]))

idx2 = content.find('bnav-home')
print('bnav-home:', repr(content[idx2:idx2+100]))

idx3 = content.find('nav-home')
print('nav-home:', repr(content[idx3:idx3+100]))
