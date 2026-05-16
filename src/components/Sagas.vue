<script setup>
//Imports
import { getFirestore, collection } from "firebase/firestore";
import { useCollection } from "vuefire";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

//Variables
const db = getFirestore();
const router = useRouter();
var sagaSeleccionada = ref("");
const arrayVideojuegos = useCollection(collection(db, 'videojuegos'));
const arraySagas = useCollection(collection(db, 'sagas'));

//Computed properties para filtrado
const videojuegosFiltrados = computed(() => {
    if (!sagaSeleccionada.value) return [];
    return arrayVideojuegos.value.filter(videojuego => videojuego.saga === sagaSeleccionada.value);
});

function seleccionarSaga(saga) {
    sagaSeleccionada.value = sagaSeleccionada.value === saga.nombre ? "" : saga.nombre;
}

function verDetalle(videojuegoId) {
    router.push(`/sagas/${videojuegoId}`);
}
</script>

<template>
    <h1>Sagas</h1>
    
    <div class="sagas-filtros">
        <div class="sagas-grid">
            <div 
                v-for="saga in arraySagas" 
                :key="saga.id"
                @click="seleccionarSaga(saga)"
                :class="{ activo: sagaSeleccionada === saga.nombre }"
                class="saga-card"
                :aria-label="saga.nombre">
                <div v-if="saga.urlImagen" class="saga-logo">
                    <img :src="saga.urlImagen" :alt="saga.nombre">
                </div>
                <div v-else class="saga-logo-placeholder">
                    <span>{{ saga.nombre.charAt(0) }}</span>
                </div>
                <span class="sr-only">{{ saga.nombre }}</span>
            </div>
        </div>
    </div>

    <div v-if="!sagaSeleccionada" class="seleccionar-saga">
        <p>Selecciona una saga para ver sus videojuegos</p>
    </div>

    <div v-else-if="videojuegosFiltrados.length === 0" class="sin-resultados">
        <p>No se encontraron videojuegos para esta saga.</p>
    </div>

    <div v-else class="videojuegos-grid">
        <div v-for="videojuego in videojuegosFiltrados" :key="videojuego.id" class="videojuego-card" @click="verDetalle(videojuego.id)">
            <div v-if="videojuego.urlImagen" class="videojuego-imagen">
                <img :src="videojuego.urlImagen" :alt="videojuego.nombre">
            </div>
            <div class="videojuego-info">
                <h3 class="videojuego-nombre">{{ videojuego.nombre }}</h3>
                <p><strong>Fecha de Publicación:</strong> {{ videojuego.fechaPublicacion }}</p>
                <p><strong>Número de Jugadores:</strong> {{ videojuego.numeroJugadores }}</p>
                <p><strong>Plataformas:</strong> {{ videojuego.plataformas }}</p>
                <p><strong>Géneros:</strong> {{ videojuego.generos }}</p>
                <p><strong>Idiomas:</strong> {{ videojuego.idiomas }}</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Inherit project font */
.sagas-filtros,
.sagas-grid,
.saga-card,
.videojuegos-grid,
.videojuego-card,
.videojuego-info {
  font-family: inherit;
}

.sagas-filtros { margin-bottom: 2.4rem; }
.sagas-filtros h3 { margin-bottom: 1.2rem; font-size: 1.6rem; }

.sagas-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(14rem, 1fr));
  gap: 2.4rem;
  align-items: start;
  grid-auto-rows: 1fr;
}

.saga-card { border-radius: 1rem; overflow: hidden; cursor: pointer; transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease; background: #2f2fff; display:flex; align-items:center; justify-content:center; min-height: 14rem; aspect-ratio: 2.4 / 1; color: #ffffff; position: relative; padding: 1rem; }
.saga-card:hover { transform: translateY(-4px); box-shadow: 0 10px 26px rgba(11,31,58,0.18); }
.saga-card.activo { background: #163d6b; box-shadow: 0 12px 30px rgba(22,61,107,0.2); }

.saga-logo {
  width: 100%;
  height: 100%;
  border-radius: 0.8rem;
  overflow: hidden;
  background: #2f2fff;
  display:flex;
  align-items:center;
  justify-content:center;
  padding: 1rem;
  box-sizing: border-box;
}
.saga-logo img {
  width: 100%;
  height: auto;
  max-height: 15rem;
  object-fit: contain;
  display: block;
}
.saga-logo-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 0;
  background:#092048;
  display:flex;
  align-items:center;
  justify-content:center;
  color:#fff;
  font-size:3.2rem;
  font-weight:700;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}

.seleccionar-saga, .sin-resultados { text-align:center; padding:3.2rem; color:#666; font-size:1.6rem; }

.videojuegos-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(28rem, 1fr)); gap:1.6rem; }

.videojuego-card { border:1px solid #eef2f6; border-radius:1rem; overflow:hidden; transition: transform 0.18s ease, box-shadow 0.18s ease; cursor:pointer; background:#fff; }
.videojuego-card:hover { transform: translateY(-6px); box-shadow: 0 12px 30px rgba(11,31,58,0.08); }

.videojuego-imagen {
  width: 100%;
  max-height: 24rem;
  overflow: hidden;
  background: #f8fafc;
  display:flex;
  align-items:center;
  justify-content:center;
}
.videojuego-imagen img {
  width: 100%;
  height: auto;
  object-fit: contain;
  display: block;
}

.videojuego-info { padding:1.4rem; }
.videojuego-nombre { margin:0 0 0.8rem 0; font-size:1.6rem; color:#163d6b; }
.videojuego-info p { margin:0.4rem 0; font-size:1.4rem; color:#444; }

@media (max-width:1200px) {
  .sagas-grid { grid-template-columns: repeat(3, minmax(12rem, 1fr)); }
}
@media (max-width:900px) {
  .videojuego-imagen { height:16rem; }
  .sagas-grid { grid-template-columns: repeat(2, minmax(12rem, 1fr)); }
}
@media (max-width:600px) {
  .sagas-grid { grid-template-columns: repeat(1, 1fr); }
}
</style>
