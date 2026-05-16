<script setup>
import { ref, computed, onMounted } from 'vue';
import { getFirestore, collection } from 'firebase/firestore';
import { useCollection } from 'vuefire';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const db = getFirestore();
const auth = getAuth();
// useCollection wrapper: provide a getter for the collection
const pedidosCollection = useCollection(() => collection(db, 'pedidos'));

const pedidos = pedidosCollection;
const usuarioEmail = ref('');
const logueado = ref(false);
const esAdmin = ref(false);

onAuthStateChanged(auth, (user) => {
  if (user) {
    logueado.value = true;
    usuarioEmail.value = user.email || '';
    // emails de administradores conocidos
    esAdmin.value = ['setalegorar@gmail.com', 'paguparra@gmail.com'].includes(usuarioEmail.value);
  } else {
    logueado.value = false;
    usuarioEmail.value = '';
    esAdmin.value = false;
  }
});

const pedidosFiltrados = computed(() => {
  if (!pedidos.value) return [];
  if (esAdmin.value) return pedidos.value.slice().sort((a,b)=> new Date(b.fecha) - new Date(a.fecha));
  return pedidos.value.filter(p => (p.email || '').toLowerCase() === usuarioEmail.value.toLowerCase()).slice().sort((a,b)=> new Date(b.fecha) - new Date(a.fecha));
});
</script>

<template>
  <div class="pedidos-page">
    <h1>Mis pedidos</h1>

    <div v-if="!logueado" class="no-login">
      <p>Inicia sesión para ver tus pedidos.</p>
    </div>

    <div v-else>
      <div v-if="pedidosFiltrados.length === 0">
        <p>No hay pedidos registrados.</p>
      </div>

      <div v-else class="lista-pedidos">
        <div v-for="p in pedidosFiltrados" :key="p.id" class="pedido-card">
          <div class="pedido-header">
            <div><strong>ID:</strong> <span>{{ p.id }}</span></div>
            <div class="estatus">{{ p.estatus || 'Pendiente' }}</div>
          </div>
          <div class="pedido-meta">
            <div><strong>Cliente:</strong> {{ p.cliente }}</div>
            <div><strong>Email:</strong> {{ p.email }}</div>
            <div><strong>Total:</strong> ${{ p.total ? (p.total.toFixed ? p.total.toFixed(2) : p.total) : '0.00' }}</div>
            <div><strong>Fecha:</strong> {{ p.fecha && p.fecha.toDate ? p.fecha.toDate().toLocaleString() : p.fecha }}</div>
            <div v-if="p.direccion"><strong>Dirección:</strong> {{ p.direccion }}</div>
            <div v-if="p.telefono"><strong>Teléfono:</strong> {{ p.telefono }}</div>
          </div>
          <div class="pedido-items">
            <h4>Items</h4>
            <ul>
              <li v-for="(it, idx) in p.items" :key="idx">
                {{ it.nombre }} x{{ it.cantidad || 1 }} — ${{ it.precio ? ((it.precio * (it.cantidad || 1)).toFixed ? (it.precio * (it.cantidad || 1)).toFixed(2) : it.precio) : '0.00' }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pedidos-page { max-width: 1000px; margin: 24px auto; padding: 20px; }
.pedido-card { border: 1px solid #e1e5ea; background: #fff; padding: 16px; border-radius: 12px; margin-bottom: 16px; }
.pedido-header { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:12px; }
.estatus { background:#f0f4ff; color:#163d6b; padding:6px 10px; border-radius:8px; font-weight:600; }
.pedido-meta { display:grid; grid-template-columns:repeat(2,1fr); gap:8px 16px; margin-bottom:12px; color:#333; }
.pedido-items ul { margin:0; padding-left:18px; }

@media (max-width:700px) {
  .pedido-meta { grid-template-columns:1fr; }
}
</style>
