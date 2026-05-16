const CART_KEY = 'headbuke_cart';

function parseCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch (e) {
    console.error('Error parsing cart from localStorage', e);
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function itemKey(item) {
  return `${item.tipo || 'producto'}-${item.id}`;
}

export function getCart() {
  return parseCart();
}

export function getCartCount() {
  return parseCart().reduce((sum, item) => sum + (item.cantidad || 0), 0);
}

export function addToCart(nuevoItem) {
  const cart = parseCart();
  const key = itemKey(nuevoItem);
  const existing = cart.find(item => item.key === key);

  if (existing) {
    existing.cantidad = (existing.cantidad || 0) + (nuevoItem.cantidad || 1);
  } else {
    cart.push({
      key,
      tipo: nuevoItem.tipo || 'producto',
      id: nuevoItem.id,
      nombre: nuevoItem.nombre,
      precio: Number(nuevoItem.precio || 0),
      urlImagen: nuevoItem.urlImagen || '',
      cantidad: nuevoItem.cantidad || 1,
      categoria: nuevoItem.categoria || '',
      descripcion: nuevoItem.descripcion || ''
    });
  }

  saveCart(cart);
  return cart;
}

export function updateCartItem(id, tipo, cantidad) {
  const cart = parseCart();
  const key = `${tipo}-${id}`;
  const updated = cart.filter(item => item.key !== key);

  if (cantidad > 0) {
    const existing = cart.find(item => item.key === key);
    if (existing) {
      existing.cantidad = cantidad;
      updated.push(existing);
    }
  }

  saveCart(updated);
  return updated;
}

export function removeFromCart(id, tipo) {
  const cart = parseCart();
  const filtered = cart.filter(item => item.key !== `${tipo}-${id}`);
  saveCart(filtered);
  return filtered;
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
}

export function getCartTotal() {
  return parseCart().reduce((sum, item) => sum + (item.precio || 0) * (item.cantidad || 1), 0);
}
