<script setup>
//Imports
import { getFirestore, collection } from "firebase/firestore";
import { useCollection } from "vuefire";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { addToCart } from "../composables/useCart";

//Variables
const db = getFirestore();
const router = useRouter();
var busqueda = ref("");
var categoriaSeleccionada = ref("");
var mensajeCarrito = ref("");
const arrayProductos = useCollection(collection(db, 'productos'));

//Computed properties para filtrado
const categorias = computed(() => {
    const cats = new Set();
    arrayProductos.value.forEach(producto => {
        if (producto.categoria) {
            cats.add(producto.categoria);
        }
    });
    return Array.from(cats).sort();
});

const productosFiltrados = computed(() => {
    return arrayProductos.value.filter(producto => {
        const coincideBusqueda = busqueda.value === "" || 
            producto.nombre.toLowerCase().includes(busqueda.value.toLowerCase()) ||
            producto.descripcion.toLowerCase().includes(busqueda.value.toLowerCase());
        
        const coincideCategoria = categoriaSeleccionada.value === "" || 
            producto.categoria === categoriaSeleccionada.value;
        
        return coincideBusqueda && coincideCategoria;
    });
});

function limpiarFiltros() {
    busqueda.value = "";
    categoriaSeleccionada.value = "";
}

function filtrarPorCategoria(categoria) {
    categoriaSeleccionada.value = categoriaSeleccionada.value === categoria ? "" : categoria;
}

function verDetalle(productoId) {
    router.push(`/merchandising/${productoId}`);
}

function agregarAlCarrito(producto) {
    addToCart({
        tipo: 'producto',
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio || 0,
        urlImagen: producto.urlImagen || '',
        categoria: producto.categoria || '',
        descripcion: producto.descripcion || ''
    });
    mensajeCarrito.value = `${producto.nombre} añadido al carrito.`;
    setTimeout(() => mensajeCarrito.value = '', 3000);
}
</script>

<template>
    <h1>Merchandising</h1>
    <h2>Proximamente online...</h2>
    
    <div class="filtros">
        <div class="busqueda">
            <input v-model="busqueda" type="text" placeholder="Buscar producto...">
            <button @click="busqueda = ''" v-if="busqueda">Limpiar búsqueda</button>
        </div>

        <div class="categorias">
            <h3>Filtrar por categoría:</h3>
            <button 
                @click="categoriaSeleccionada = ''"
                :class="{ activo: categoriaSeleccionada === '' }"
                class="btn-categoria">
                Todas las categorías
            </button>
            <button 
                v-for="categoria in categorias" 
                :key="categoria"
                @click="filtrarPorCategoria(categoria)"
                :class="{ activo: categoriaSeleccionada === categoria }"
                class="btn-categoria">
                {{ categoria }}
            </button>
        </div>

        <button @click="limpiarFiltros" class="btn-limpiar">Limpiar todos los filtros</button>
    </div>

    <div v-if="mensajeCarrito" class="mensaje-carrito">
        {{ mensajeCarrito }}
    </div>

    <div v-if="productosFiltrados.length === 0" class="sin-resultados">
        <p>No se encontraron productos que coincidan con los filtros.</p>
    </div>

    <div v-else class="productos-grid">
        <div v-for="producto in productosFiltrados" :key="producto.id" class="producto-card" @click="verDetalle(producto.id)">
            <div v-if="producto.urlImagen" class="producto-imagen">
                <img :src="producto.urlImagen" :alt="producto.nombre">
            </div>
            <div class="producto-info">
                <p class="categoria-badge">{{ producto.categoria }}</p>
                <h3>{{ producto.nombre }}</h3>
                <p class="descripcion">{{ producto.descripcion }}</p>
                <p v-if="producto.dimensiones" class="dimensiones"><strong>Dimensiones:</strong> {{ producto.dimensiones }}</p>
                <p class="precio">${{ producto.precio }}</p>
                <button class="btn-agregar-carrito" @click.stop="agregarAlCarrito(producto)">Añadir al carrito</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Use the project's global font and ensure inheritance */
.filtros,
.productos-grid,
.producto-card,
.producto-info {
  font-family: inherit;
}

.filtros {
  background: rgba(255,255,255,0.85);
  padding: 2.4rem;
  border-radius: 1rem;
  margin-bottom: 3.2rem;
  box-shadow: 0 6px 18px rgba(11,31,58,0.06);
}

.busqueda {
  margin-bottom: 1.6rem;
  display: flex;
  gap: 1rem;
}

.busqueda input {
  flex: 1;
  padding: 1.4rem;
  border: 1px solid #e6e9ee;
  border-radius: 0.8rem;
  font-size: 1.6rem;
}

.busqueda button {
  padding: 1.2rem 1.6rem;
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 0.8rem;
  cursor: pointer;
  font-weight: 600;
}

.categorias h3 {
  margin-bottom: 0.8rem;
  font-size: 1.4rem;
  text-transform: uppercase;
  color: #163d6b;
}

.btn-categoria {
  padding: 0.9rem 1.4rem;
  margin-right: 0.8rem;
  margin-bottom: 0.8rem;
  background-color: white;
  border: 1px solid #e6e9ee;
  border-radius: 0.8rem;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.btn-categoria:hover { transform: translateY(-2px); box-shadow: 0 6px 14px rgba(11,31,58,0.06); }

.btn-categoria.activo {
  background-color: #163d6b;
  color: white;
  border-color: #163d6b;
}

.btn-limpiar {
  padding: 1rem 1.6rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 0.8rem;
  cursor: pointer;
}

.sin-resultados { text-align: center; padding: 4rem; color: #666; }

.productos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(24rem, 1fr));
  gap: 2.4rem;
}

.producto-card {
  background: #ffffff;
  border-radius: 1rem;
  overflow: hidden;
  transition: transform 0.28s ease, box-shadow 0.28s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  min-height: 36rem;
}

.producto-card:hover { transform: translateY(-6px); box-shadow: 0 12px 30px rgba(11,31,58,0.12); }

.producto-imagen {
  width: 100%;
  background-color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}
.producto-imagen img {
  width: 100%;
  height: auto;
  object-fit: contain;
  display: block;
}
.producto-info {
  padding: 1.6rem;
  display:flex;
  flex-direction:column;
  gap:0.8rem;
  flex:1;
}

.mensaje-carrito { margin: 1.6rem 0; padding: 1.4rem 1.8rem; border-radius: 0.8rem; background-color: #e8f8ea; color: #1f7a33; border: 1px solid #c6ebce; }

.btn-agregar-carrito { margin-top: auto; padding: 1.1rem 1.6rem; background-color: #28a745; color:white; border:none; border-radius:0.8rem; font-size:1.5rem; font-weight:700; cursor:pointer; }
.btn-agregar-carrito:hover { background-color:#218838; }

.categoria-badge { display:inline-block; background-color:#f1f5f9; color:#163d6b; padding:0.4rem 0.8rem; border-radius:0.6rem; font-size:1.2rem; }

.producto-info h3 { margin:0; font-size:1.8rem; color:#0b1f3a; }
.descripcion { font-size:1.4rem; color:#556; line-height:1.5; margin-bottom:0.6rem; }
.dimensiones { font-size:1.2rem; color:#888; }
.precio { font-size:1.8rem; font-weight:800; color:#007bff; margin-top:0.8rem; }

@media (max-width: 900px) {
  .productos-grid { grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr)); }
  .producto-imagen { height: 18rem; }
}

</style>