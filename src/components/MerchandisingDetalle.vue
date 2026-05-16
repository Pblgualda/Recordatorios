<script setup>
import { useRoute, useRouter } from 'vue-router';
import { getFirestore, doc, getDoc, collection, addDoc, deleteDoc } from "firebase/firestore";
import { useCollection } from "vuefire";
import { ref, onMounted, computed } from "vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { addToCart } from "../composables/useCart";

const route = useRoute();
const router = useRouter();
const db = getFirestore();
const auth = getAuth();
const producto = ref(null);
const cargando = ref(true);
const error = ref("");
const mensajeCarrito = ref("");
const logueado = ref(false);
const nombreUsuario = ref("");
const emailUsuario = ref("");
const comentario = ref("");
const arrayComentarios = useCollection(collection(db, 'comentarios'));

onAuthStateChanged(auth, (user) => {
    if (user) {
        logueado.value = true;
        nombreUsuario.value = user.displayName || user.email || "Usuario";
        emailUsuario.value = user.email || "";
    } else {
        logueado.value = false;
        nombreUsuario.value = "";
        emailUsuario.value = "";
    }
});

const comentariosFiltrados = computed(() => {
    return arrayComentarios.value.filter(c => c.elemento === producto.value?.nombre);
});

onMounted(async () => {
    try {
        const productoId = route.params.id;
        const docRef = doc(db, "productos", productoId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            producto.value = {
                id: docSnap.id,
                ...docSnap.data()
            };
        } else {
            error.value = "Producto no encontrado";
        }
    } catch (err) {
        error.value = "Error al cargar el producto";
        console.error(err);
    } finally {
        cargando.value = false;
    }
});

async function ponerComentario() {
    if (!comentario.value.trim() || !producto.value) return;
    try {
        await addDoc(collection(db, "comentarios"), {
            texto: comentario.value,
            fechaPublicacion: new Date(),
            autorCorreo: emailUsuario.value,
            autorNombre: nombreUsuario.value,
            elemento: producto.value.nombre,
            editando: false,
        });
        comentario.value = "";
    } catch (err) {
        console.error("Error al publicar comentario:", err);
    }
}

async function borrarComentario(id) {
    try {
        await deleteDoc(doc(db, "comentarios", id));
    } catch (err) {
        console.error("Error al borrar comentario:", err);
    }
}

function agregarAlCarrito() {
    addToCart({
        tipo: 'producto',
        id: producto.value.id,
        nombre: producto.value.nombre,
        precio: producto.value.precio || 0,
        urlImagen: producto.value.urlImagen || '',
        categoria: producto.value.categoria || '',
        descripcion: producto.value.descripcion || ''
    });
    mensajeCarrito.value = `${producto.value.nombre} añadido al carrito.`;
    setTimeout(() => mensajeCarrito.value = '', 3000);
}

function volver() {
    router.back();
}
</script>

<template>
    <div class="detalle-container">
        <button class="btn-volver" @click="volver">← Volver</button>
        
        <div v-if="cargando" class="cargando">
            <p>Cargando producto...</p>
        </div>
        
        <div v-else-if="error" class="error">
            <p>{{ error }}</p>
        </div>
        
        <div v-else-if="producto" class="producto-detalle">
            <div class="imagen-seccion">
                <img v-if="producto.urlImagen" :src="producto.urlImagen" :alt="producto.nombre" class="producto-imagen-grande">
                <div v-else class="sin-imagen">No hay imagen disponible</div>
            </div>
            
            <div class="info-seccion">
                <p class="categoria-badge">{{ producto.categoria }}</p>
                <h1>{{ producto.nombre }}</h1>
                
                <div class="precio-container">
                    <p class="precio">${{ producto.precio }}</p>
                </div>
                
                <div class="descripcion-completa">
                    <h2>Descripción</h2>
                    <p>{{ producto.descripcion }}</p>
                </div>
                
                <div v-if="producto.dimensiones" class="caracteristicas">
                    <h2>Características</h2>
                    <p><strong>Dimensiones:</strong> {{ producto.dimensiones }}</p>
                </div>
                
                <div v-if="producto.material" class="caracteristicas">
                    <p><strong>Material:</strong> {{ producto.material }}</p>
                </div>
                
                <div v-if="producto.stock" class="stock">
                    <p><strong>Stock disponible:</strong> {{ producto.stock }}</p>
                </div>
                
                <div v-if="mensajeCarrito" class="mensaje-carrito">
                    {{ mensajeCarrito }}
                </div>
                <div class="acciones">
                    <button class="btn-carrito" @click="agregarAlCarrito">
                        🛒 Agregar al carrito
                    </button>
                </div>
            </div>
        </div>

        <div v-if="producto" class="seccion-comentarios">
            <div v-if="logueado" class="formulario-comentario">
                <h3>Deja tu comentario</h3>
                <textarea
                    v-model="comentario"
                    placeholder="Escribe tu comentario aquí..."
                    class="textarea-comentario"
                    rows="4"></textarea>
                <button @click="ponerComentario" class="btn-comentar">Publicar Comentario</button>
            </div>
            <div v-else class="no-autenticado">
                <p>Inicia sesión para dejar comentarios</p>
            </div>

            <div class="comentarios-lista">
                <h3>Comentarios ({{ comentariosFiltrados.length }})</h3>
                <div v-if="comentariosFiltrados.length === 0" class="sin-comentarios">
                    <p>No hay comentarios aún. ¡Sé el primero!</p>
                </div>
                <div v-else>
                    <div v-for="c in comentariosFiltrados" :key="c.id" class="comentario-card">
                        <div class="comentario-header">
                            <strong class="autor">{{ c.autorNombre }}</strong>
                            <span class="fecha">{{ c.fechaPublicacion.toDate ? c.fechaPublicacion.toDate().toLocaleString() : c.fechaPublicacion }}</span>
                        </div>
                        <p class="comentario-texto">{{ c.texto }}</p>
                        <button
                            v-if="c.autorCorreo === emailUsuario"
                            @click="borrarComentario(c.id)"
                            class="btn-borrar-comentario">
                            🗑️ Borrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.detalle-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.btn-volver {
    background-color: #f0f0f0;
    border: 1px solid #ddd;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    margin-bottom: 20px;
    font-size: 16px;
    transition: background-color 0.3s;
}

.btn-volver:hover {
    background-color: #e0e0e0;
}

.cargando, .error {
    text-align: center;
    padding: 40px;
    font-size: 18px;
}

.error {
    color: #dc3545;
}

.producto-detalle {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    margin-bottom: 40px;
}

.imagen-seccion {
    display: flex;
    align-items: center;
    justify-content: center;
}

.producto-imagen-grande {
    width: 100%;
    max-height: 600px;
    object-fit: contain;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    background-color: #f9f9f9;
}

.sin-imagen {
    width: 100%;
    height: 400px;
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    font-size: 18px;
}

.info-seccion {
    display: flex;
    flex-direction: column;
}

.categoria-badge {
    display: inline-block;
    background-color: #007bff;
    color: white;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    text-transform: uppercase;
    margin-bottom: 15px;
    width: fit-content;
}

.info-seccion h1 {
    font-size: 32px;
    margin-bottom: 20px;
    color: #333;
}

.precio-container {
    margin-bottom: 30px;
}

.precio {
    font-size: 36px;
    font-weight: bold;
    color: #007bff;
}

.descripcion-completa,
.caracteristicas {
    margin-bottom: 25px;
}

.descripcion-completa h2,
.caracteristicas h2 {
    font-size: 18px;
    margin-bottom: 10px;
    color: #333;
}

.descripcion-completa p,
.caracteristicas p {
    font-size: 16px;
    color: #666;
    line-height: 1.6;
}

.caracteristicas p {
    margin-bottom: 8px;
}

.stock {
    margin-bottom: 20px;
    padding: 15px;
    background-color: #f0f8ff;
    border-left: 4px solid #007bff;
    border-radius: 4px;
}

.stock p {
    font-size: 16px;
    color: #333;
}

.acciones {
    margin-top: 30px;
}

.mensaje-carrito {
    margin-bottom: 18px;
    padding: 14px 18px;
    border-radius: 8px;
    background-color: #e8f8ea;
    color: #1f7a33;
    border: 1px solid #c6ebce;
}

.btn-carrito {
    width: 100%;
    padding: 15px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s;
}

.btn-carrito:hover {
    background-color: #218838;
}

.seccion-comentarios {
    margin-top: 40px;
    background: #fff;
    padding: 24px;
    border-radius: 12px;
    border: 1px solid #e0e0e0;
}

.formulario-comentario {
    display: grid;
    gap: 12px;
    margin-bottom: 24px;
}

.textarea-comentario {
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 16px;
    font-size: 15px;
    resize: vertical;
}

.btn-comentar {
    width: fit-content;
    background: #163d6b;
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 12px 18px;
    cursor: pointer;
    transition: background 0.2s ease;
}

.btn-comentar:hover {
    background: #0e2d57;
}

.comentarios-lista h3 {
    margin-bottom: 18px;
    color: #163d6b;
}

.comentario-card {
    border: 1px solid #e1e5ea;
    border-radius: 12px;
    padding: 18px;
    margin-bottom: 16px;
    background: #fbfcfe;
}

.comentario-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-bottom: 12px;
    flex-wrap: wrap;
}

.autor {
    color: #163d6b;
}

.fecha {
    color: #666;
    font-size: 14px;
}

.comentario-texto {
    color: #333;
    line-height: 1.6;
    margin-bottom: 12px;
}

.btn-borrar-comentario {
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 10px;
    padding: 10px 14px;
    cursor: pointer;
}

.btn-borrar-comentario:hover {
    background: #b02a37;
}

/* Responsive */
@media (max-width: 768px) {
    .producto-detalle {
        grid-template-columns: 1fr;
        gap: 20px;
    }
    
    .info-seccion h1 {
        font-size: 24px;
    }
    
    .precio {
        font-size: 28px;
    }
}
</style>
