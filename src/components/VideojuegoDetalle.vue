<script setup>
import { useRoute, useRouter } from 'vue-router';
import { getFirestore, doc, getDoc, collection, addDoc, deleteDoc } from "firebase/firestore";
import { useCollection } from "vuefire";
import { ref, onMounted, computed } from "vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const route = useRoute();
const router = useRouter();
const db = getFirestore();
const auth = getAuth();

const videojuego = ref(null);
const cargando = ref(true);
const error = ref("");
const logueado = ref(false);
const nombreUsuario = ref("");
const emailUsuario = ref("");
const idUsuario = ref("");
const comentario = ref("");
const arrayComentarios = useCollection(collection(db, 'comentarios'));

// Detectar si el usuario está autenticado
onAuthStateChanged(auth, (user) => {
    if (user) {
        logueado.value = true;
        nombreUsuario.value = user.displayName || user.email || "Usuario";
        emailUsuario.value = user.email;
        idUsuario.value = user.uid;
    } else {
        logueado.value = false;
        nombreUsuario.value = "";
        emailUsuario.value = "";
    }
});

// Filtrar comentarios para este videojuego
const comentariosFiltrados = computed(() => {
    return arrayComentarios.value.filter(c => c.elemento === videojuego.value?.nombre);
});

onMounted(async () => {
    try {
        const videojuegoId = route.params.id;
        const docRef = doc(db, "videojuegos", videojuegoId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            videojuego.value = {
                id: docSnap.id,
                ...docSnap.data()
            };
        } else {
            error.value = "Videojuego no encontrado";
        }
    } catch (err) {
        error.value = "Error al cargar el videojuego";
        console.error(err);
    } finally {
        cargando.value = false;
    }
});

async function ponerComentario() {
    if (!comentario.value.trim()) return;
    try {
        await addDoc(collection(db, "comentarios"), {
            texto: comentario.value,
            fechaPublicacion: new Date(),
            autorCorreo: emailUsuario.value,
            autorNombre: nombreUsuario.value,
            elemento: videojuego.value.nombre,
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

function volver() {
    router.back();
}
</script>

<template>
    <div class="detalle-container">
        <button class="btn-volver" @click="volver">← Volver</button>
        
        <div v-if="cargando" class="cargando">
            <p>Cargando videojuego...</p>
        </div>
        
        <div v-else-if="error" class="error">
            <p>{{ error }}</p>
        </div>
        
        <div v-else-if="videojuego" class="videojuego-detalle">
            <div class="imagen-seccion">
                <img v-if="videojuego.urlImagen" :src="videojuego.urlImagen" :alt="videojuego.nombre" class="videojuego-imagen-grande">
                <div v-else class="sin-imagen">No hay imagen disponible</div>
            </div>
            
            <div class="info-seccion">
                <p v-if="videojuego.saga" class="saga-badge">{{ videojuego.saga }}</p>
                <div class="titulo-fecha">
                    <h1>{{ videojuego.nombre }}</h1>
                    <span class="fecha-publicacion">{{ videojuego.fechaPublicacion }}</span>
                </div>
                
                <div class="acciones">
                    <a v-if="videojuego.urlJuego" :href="videojuego.urlJuego" target="_blank" rel="noreferrer" class="btn-descargar">
                        📥 Descargar Juego
                    </a>
                </div>

                <div class="especificaciones">
                    <h2>Especificaciones</h2>
                    <div class="specs-grid">
                        <div class="spec-item">
                            <strong>Fecha de Publicación:</strong>
                            <span>{{ videojuego.fechaPublicacion }}</span>
                        </div>
                        <div class="spec-item">
                            <strong>Número de Jugadores:</strong>
                            <span>{{ videojuego.numeroJugadores }}</span>
                        </div>
                        <div class="spec-item">
                            <strong>Plataformas:</strong>
                            <span>{{ videojuego.plataformas }}</span>
                        </div>
                        <div class="spec-item">
                            <strong>Géneros:</strong>
                            <span>{{ videojuego.generos }}</span>
                        </div>
                        <div class="spec-item">
                            <strong>Idiomas:</strong>
                            <span>{{ videojuego.idiomas }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Sección de comentarios -->
        <div v-if="videojuego" class="seccion-comentarios">
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

.videojuego-detalle {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    margin-bottom: 40px;
    background: white;
    padding: 30px;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
}

.imagen-seccion {
    display: flex;
    align-items: center;
    justify-content: center;
}

.videojuego-imagen-grande {
    width: 100%;
    max-height: 600px;
    object-fit: contain;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
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

.saga-badge {
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

.titulo-fecha {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
}

.titulo-fecha h1 {
    margin: 0;
    flex: 1;
}

.fecha-publicacion {
    font-size: 16px;
    color: #666;
    background-color: #f0f0f0;
    padding: 8px 16px;
    border-radius: 4px;
    white-space: nowrap;
}

.acciones {
    margin-bottom: 30px;
}

.btn-descargar {
    display: inline-block;
    padding: 12px 24px;
    background-color: #28a745;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    font-weight: bold;
    transition: background-color 0.3s;
}

.btn-descargar:hover {
    background-color: #218838;
}

.especificaciones {
    margin-top: 30px;
}

.especificaciones h2 {
    font-size: 18px;
    margin-bottom: 15px;
    color: #333;
    border-bottom: 2px solid #007bff;
    padding-bottom: 10px;
}

.specs-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
}

.spec-item {
    padding: 12px;
    background-color: #f8f9fa;
    border-left: 4px solid #007bff;
    border-radius: 4px;
}

.spec-item strong {
    display: block;
    color: #555;
    margin-bottom: 5px;
    font-size: 14px;
}

.spec-item span {
    display: block;
    color: #333;
    font-size: 16px;
}

/* Sección de Comentarios */
.seccion-comentarios {
    background: white;
    padding: 30px;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    margin-bottom: 40px;
}

.formulario-comentario {
    margin-bottom: 30px;
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 8px;
}

.formulario-comentario h3 {
    margin-bottom: 15px;
    color: #333;
}

.textarea-comentario {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: inherit;
    font-size: 14px;
    resize: vertical;
    margin-bottom: 10px;
}

.textarea-comentario:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.btn-comentar {
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: background-color 0.3s;
}

.btn-comentar:hover {
    background-color: #0056b3;
}

.no-autenticado {
    padding: 20px;
    background-color: #fff3cd;
    border: 1px solid #ffc107;
    border-radius: 4px;
    margin-bottom: 20px;
}

.no-autenticado p {
    color: #856404;
    margin: 0;
}

.comentarios-lista h3 {
    margin-bottom: 20px;
    color: #333;
    border-bottom: 2px solid #007bff;
    padding-bottom: 10px;
}

.sin-comentarios {
    text-align: center;
    padding: 40px;
    color: #999;
}

.comentario-card {
    padding: 15px;
    margin-bottom: 15px;
    background-color: #f8f9fa;
    border-left: 4px solid #007bff;
    border-radius: 4px;
}

.comentario-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.autor {
    color: #333;
    font-size: 16px;
}

.fecha {
    color: #999;
    font-size: 12px;
}

.comentario-texto {
    color: #555;
    line-height: 1.6;
    margin-bottom: 10px;
}

.btn-borrar-comentario {
    padding: 6px 12px;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: background-color 0.3s;
}

.btn-borrar-comentario:hover {
    background-color: #c82333;
}

/* Responsive */
@media (max-width: 768px) {
    .videojuego-detalle {
        grid-template-columns: 1fr;
        gap: 20px;
    }
    
    .titulo-fecha {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .info-seccion h1 {
        font-size: 24px;
    }

    .specs-grid {
        grid-template-columns: 1fr;
    }
    
    .comentario-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;
    }
}
</style>
