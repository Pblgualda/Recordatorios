<script setup>
import { ref, computed, onMounted } from 'vue';
import { getFirestore, addDoc, collection } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getCart, removeFromCart, updateCartItem, clearCart, getCartTotal } from '../composables/useCart';

const db = getFirestore();
const auth = getAuth();
const carrito = ref([]);
const pedidoExitoso = ref(false);
const pedidoId = ref('');
const ordenError = ref('');
const nombreCliente = ref('');
const direccion = ref('');
const telefono = ref('');
const notas = ref('');
const emailUsuario = ref('');
const logueado = ref(false);

const total = computed(() => getCartTotal());

function cargarCarrito() {
  carrito.value = getCart();
}

function cambiarCantidad(item, delta) {
  const nuevaCantidad = Math.max(1, (item.cantidad || 1) + delta);
  carrito.value = updateCartItem(item.id, item.tipo, nuevaCantidad);
}

function borrarItem(item) {
  carrito.value = removeFromCart(item.id, item.tipo);
}

async function realizarPedido() {
  ordenError.value = '';

  if (carrito.value.length === 0) {
    ordenError.value = 'El carrito está vacío.';
    return;
  }
  if (!nombreCliente.value.trim() || !direccion.value.trim() || !telefono.value.trim()) {
    ordenError.value = 'Rellena nombre, dirección y teléfono para realizar el pedido.';
    return;
  }

  try {
    const pedido = {
      cliente: nombreCliente.value,
      email: emailUsuario.value || 'invitado',
      direccion: direccion.value,
      telefono: telefono.value,
      notas: notas.value,
      items: carrito.value,
      total: total.value,
      fecha: new Date(),
      estatus: 'Pendiente'
    };

    const docRef = await addDoc(collection(db, 'pedidos'), pedido);
    pedidoId.value = docRef.id;
    pedidoExitoso.value = true;
    clearCart();
    cargarCarrito();
  } catch (error) {
    console.error('Error al crear pedido:', error);
    ordenError.value = 'No pudimos procesar tu pedido. Intenta de nuevo.';
  }
}

onMounted(() => {
  cargarCarrito();
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    logueado.value = true;
    emailUsuario.value = user.email || '';
    nombreCliente.value = user.displayName || user.email || '';
  } else {
    logueado.value = false;
    emailUsuario.value = '';
  }
});
</script>

<template>
  <div class="carrito-page">
    <h1>Carrito de la compra</h1>

    <div v-if="pedidoExitoso" class="pedido-exitoso">
      <h2>Pedido realizado con éxito</h2>
      <p>Tu pedido se ha enviado correctamente.</p>
      <p><strong>ID de pedido:</strong> {{ pedidoId }}</p>
      <p>Revisa tu correo o tu perfil para el seguimiento.</p>
    </div>

    <div v-else>
      <div v-if="carrito.length === 0" class="carrito-vacio">
        <p>Tu carrito está vacío.</p>
        <p>Ve a <RouterLink class="router-link" to="/merchandising">Merchandising</RouterLink> para añadir productos.</p>
      </div>

      <div v-else class="carrito-grid">
        <div class="carrito-items">
          <div v-for="item in carrito" :key="item.key" class="carrito-item">
            <div class="item-imagen">
              <img v-if="item.urlImagen" :src="item.urlImagen" :alt="item.nombre" />
              <div v-else class="imagen-placeholder">No hay imagen</div>
            </div>
            <div class="item-detalle">
              <h3>{{ item.nombre }}</h3>
              <p class="item-categoria" v-if="item.categoria">{{ item.categoria }}</p>
              <p class="item-descripcion" v-if="item.descripcion">{{ item.descripcion }}</p>
              <div class="item-controls">
                <button @click="cambiarCantidad(item, -1)">-</button>
                <span>{{ item.cantidad }}</span>
                <button @click="cambiarCantidad(item, 1)">+</button>
              </div>
            </div>
            <div class="item-precio">
              <p>{{ item.precio ? `$${(item.precio * item.cantidad).toFixed(2)}` : 'Sin precio' }}</p>
              <button class="btn-eliminar" @click="borrarItem(item)">Eliminar</button>
            </div>
          </div>
        </div>

        <div class="checkout-card">
          <h2>Resumen del pedido</h2>
          <div class="resumen-linea">
            <span>Productos:</span>
            <span>{{ carrito.length }}</span>
          </div>
          <div class="resumen-linea">
            <span>Total:</span>
            <span>${{ total.toFixed(2) }}</span>
          </div>

          <div class="checkout-form">
            <h3>Datos de envío</h3>
            <label>
              Nombre completo
              <input v-model="nombreCliente" type="text" placeholder="Tu nombre" />
            </label>
            <label>
              Dirección
              <input v-model="direccion" type="text" placeholder="Calle, número, ciudad" />
            </label>
            <label>
              Teléfono
              <input v-model="telefono" type="text" placeholder="Teléfono de contacto" />
            </label>
            <label>
              Comentarios
              <textarea v-model="notas" placeholder="Información adicional" rows="3"></textarea>
            </label>
            <div class="orden-error" v-if="ordenError">{{ ordenError }}</div>
            <button v-if="logueado" class="btn-pedido" @click="realizarPedido">Realizar pedido</button>
            <p v-else>Inicia sesión para poder realizar tu pedido.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.carrito-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px;
  margin-bottom: 110px;
}

.router-link {
  color: #007bff;
  text-decoration: none;
}

h1 {
  margin-bottom: 20px;
  color: #222;
}



.carrito-vacio,
.pedido-exitoso {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 12px;
  background: #fff;
}

.carrito-vacio p,
.pedido-exitoso p {
  margin: 10px 0;
  color: #444;
}

.carrito-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.carrito-items {
  display: grid;
  gap: 16px;
  margin-top:1px
}

.carrito-item {
  display: grid;
  grid-template-columns: 120px 1fr auto;
  gap: 16px;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 12px;
  background: #fff;
  align-items: center;
}

.item-imagen {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-imagen img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.imagen-placeholder {
  color: #999;
  text-align: center;
  padding: 8px;
}

.item-detalle h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
}

.item-categoria,
.item-descripcion {
  margin: 4px 0;
  color: #666;
  font-size: 14px;
}

.item-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

.item-controls button {
  width: 32px;
  height: 32px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: white;
  cursor: pointer;
}

.item-precio {
  text-align: right;
}

.item-precio p {
  font-weight: 700;
  margin-bottom: 12px;
}

.btn-eliminar {
  background: #dc3545;
  color: white;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
}

.checkout-card {
  padding: 24px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid #ddd;
}

.checkout-card h2,
.checkout-card h3 {
  margin-top: 0;
}

.resumen-linea {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-weight: 600;
  font-size: 25px;
}

.checkout-form {
  margin-top: 24px;
}

.checkout-form label {
  display: block;
  margin-bottom: 16px;
  font-size: 14px;
  color: #333;
}

.checkout-form input,
.checkout-form textarea {
  width: 100%;
  padding: 12px;
  margin-top: 8px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 14px;
}

.orden-error {
  color: #b02a37;
  margin-bottom: 16px;
}

.btn-pedido {
  width: 100%;
  padding: 14px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  cursor: pointer;
}

.btn-pedido:hover {
  background: #0062cc;
}

@media (max-width: 900px) {
  .carrito-grid {
    grid-template-columns: 1fr;
  }
}
</style>