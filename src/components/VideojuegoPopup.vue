<script setup>
const emit = defineEmits(['cerrar']);
    var email = ref("");
    var password = ref("");
    var logueado = ref(false);
    var nombreUsuario = ref("");
    var imgusuario = ref("");
    var emailUsuario = ref("");
    var password = ref("");
    var idUsuario = ref("");
    const auth = getAuth();
    var admin = ref(false);
    var comentario = ref("");
    const provider = new GoogleAuthProvider();
import { useCollection } from "vuefire";
import { supabase } from '../supabase.js'
import { ref,computed } from "vue";
import { addDoc, collection, getFirestore, doc, deleteDoc, setDoc, query, where} from 'firebase/firestore'
import { signOut, getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword ,signInWithEmailAndPassword,
onAuthStateChanged,browserSessionPersistence, setPersistence} from "firebase/auth";

const db = getFirestore();


    onAuthStateChanged(auth, (user) => {
    if(user){
        logueado.value = true;
        nombreUsuario.value = user.displayName || user.email || "Usuario";
        imgusuario.value = user.photoURL || "";
        idUsuario.value = user.uid;
        emailUsuario.value = user.email;
        //arrayRecordatorios = useCollection(q);     
    }else{
        logueado.value = false;
        nombreUsuario.value = "";
        imgusuario.value = "";
    }
    console.log(logueado.value);
    });

async function ponerComentario() {
    console.log("Iniciando ponerComentario");
    await addDoc(collection(db, "comentarios"), {
        texto: comentario.value,
        fechaPublicacion: new Date(),
        autorCorreo: emailUsuario.value,
        autorNombre: nombreUsuario.value,
        elemento: props.videojuego.nombre,
        editando: false,
    });


    comentario.value = "";
}
async function borrarComentario(id) {
    await deleteDoc(doc(db, "comentarios", id));
}

const props = defineProps({
  videojuego: {
    type: Object,
    default: null
  },
  mostrar: {
    type: Boolean,
    default: false
  }
});

function cerrarPopup() {
  emit('cerrar');
}

function cerrarAlClickarFuera(event) {
  if (event.target === event.currentTarget) {
    cerrarPopup();
  }
}

const arrayComentarios = useCollection(collection(db, 'comentarios'));

//Computed properties para filtrado
const comentariosFiltrados = computed(() => {
    return arrayComentarios.value.filter(comentario => comentario.elemento === props.videojuego.nombre);
});
</script>

<template>
  <div v-if="mostrar && videojuego" class="popup-overlay" @click="cerrarAlClickarFuera">
    <div class="popup-content">
      <button class="cerrar-btn" @click="cerrarPopup">&times;</button>
      
      <div class="popup-header">
        <h2>{{ videojuego.nombre }}</h2>
        <p v-if="videojuego.saga" class="saga-badge">{{ videojuego.saga }}</p>
      </div>

      <div class="popup-body">
        <div v-if="videojuego.urlImagen" class="imagen-principal">
          <img :src="videojuego.urlImagen" :alt="videojuego.nombre">
        </div>

        <div class="boton-descarga">
          <a :href="videojuego.urlJuego" target="_blank" rel="noreferrer" class="btn btn-primary">Descargar Juego</a>
        </div>

        <div class="info-detallada">
          <div class="info-row">
            <strong>Fecha de Publicación:</strong>
            <span>{{ videojuego.fechaPublicacion }}</span>
          </div>
          
          <div class="info-row">
            <strong>Número de Jugadores:</strong>
            <span>{{ videojuego.numeroJugadores }}</span>
          </div>
          
          <div class="info-row">
            <strong>Plataformas:</strong>
            <span>{{ videojuego.plataformas }}</span>
          </div>
          
          <div class="info-row">
            <strong>Géneros:</strong>
            <span>{{ videojuego.generos }}</span>
          </div>
          
          <div class="info-row">
            <strong>Idiomas:</strong>
            <span>{{ videojuego.idiomas }}</span>
          </div>
        </div>
        <div v-if="logueado==true">
            <h3>Deja tu comentario:</h3>
            <textarea v-model="comentario" placeholder="Escribe tu comentario aquí..."></textarea>
            <button @click="ponerComentario">Publicar Comentario</button>
        </div>
        <div v-for="comentario in comentariosFiltrados" :key="comentario.id" class="comentario">
            <div>
                <h3><strong>{{ comentario.autorNombre }}</strong></h3>
                <h4>{{ comentario.texto }}</h4>
                <p>{{ comentario.fechaPublicacion.toDate().toLocaleString() }}</p>
                <button @click="borrarComentario(comentario.id)" v-if="comentario.autorCorreo === emailUsuario">Borrar</button>
            </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup-content {
  background-color: white;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.cerrar-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  z-index: 1001;
}

.cerrar-btn:hover {
  color: #333;
}

.popup-header {
  padding: 20px 20px 0 20px;
  text-align: center;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.popup-header h2 {
  margin: 0 0 10px 0;
  font-size: 28px;
  color: #333;
}

.saga-badge {
  display: inline-block;
  background-color: #007bff;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.popup-body {
  padding: 0 20px 20px 20px;
}

.imagen-principal {
  text-align: center;
  margin-bottom: 20px;
}

.imagen-principal img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.info-detallada {
  display: grid;
  gap: 15px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 16px;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row strong {
  color: #555;
  font-weight: 600;
  min-width: 150px;
}

.info-row span {
  color: #333;
  text-align: right;
  flex: 1;
}

@media (max-width: 600px) {
  .popup-content {
    width: 95%;
    margin: 20px;
  }
  
  .popup-header h2 {
    font-size: 24px;
  }
  
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .info-row span {
    text-align: left;
  }
}
</style>