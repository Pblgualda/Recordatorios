<script setup>
//Imports
import { getFirestore, addDoc, collection, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { useCollection } from "vuefire";
import { supabase } from '../supabase.js';
import { ref } from "vue";

//Variables
const db = getFirestore();
var nombre = ref("");
var fechaPublicacion = ref("");
var numeroJugadores = ref("");
var plataformas = ref("");
var sagaSeleccionada = ref("");
var generos = ref("");
var idiomas = ref("");
var archivo = null;
var errorSup = false;
var editNombre = ref("");
var editFechaPublicacion = ref("");
var editNumeroJugadores = ref("");
var editPlataformas = ref("");
var editSagaSeleccionada = ref("");
var editGeneros = ref("");
var editIdiomas = ref("");
var editArchivo = null;
var datosArchivo = null;
var editUrlImagen = ref("");
var urlJuego = ref("");
var editEnlaceJuego = ref("");
const arrayVideojuegos = useCollection(collection(db, 'videojuegos'));
const arraySagas = useCollection(collection(db, 'sagas'));

function adjuntarArchivo(e) {
    archivo = e.target.files[0];
    console.log("Archivo adjuntado:", archivo);
}

function adjuntarArchivoEdicion(e) {
    editArchivo = e.target.files[0];
}

async function agregarVideojuego() {
    console.log("Iniciando agregarVideojuego");
    
    if (archivo) {
        const {data, error} = await supabase.storage.from('HeadbukeStorage').upload(archivo.name, archivo)
        const nombreArchivo = archivo.name;
        if(error){
          errorSup = true;
        }  
        else{      
        const { data } = supabase.storage.from('HeadbukeStorage').getPublicUrl(nombreArchivo);
         datosArchivo = data.publicUrl;
        }
    }
    if (!archivo || !errorSup) {
    await addDoc(collection(db, "videojuegos"), {
        nombre: nombre.value,
        fechaPublicacion: fechaPublicacion.value,
        numeroJugadores: numeroJugadores.value,
        plataformas: plataformas.value,
        saga: sagaSeleccionada.value,
        generos: generos.value,
        idiomas: idiomas.value,
        urlImagen: datosArchivo || "",
        urlJuego: urlJuego.value || "",
        editando: false,
    });
    }

    nombre.value = "";
    fechaPublicacion.value = "";
    numeroJugadores.value = "";
    plataformas.value = "";
    sagaSeleccionada.value = "";
    generos.value = "";
    idiomas.value = "";
    archivo = null;
}

async function borrarVideojuego(id) {
    await deleteDoc(doc(db, "videojuegos", id));
}

async function guardarEdit(id) {
    console.log("Iniciando guardarEdit para videojuego:", id);
    
    let uploadedUrl = editUrlImagen;
    if (editArchivo) {
        console.log("Nuevo archivo para edición, subiendo...");
        const {data, error} = await supabase.storage.from('HeadbukeStorage').upload(editArchivo.name, editArchivo)
        const nombreArchivo = editArchivo.name;
        if(!error){
            const { data: publicData } = supabase.storage.from('HeadbukeStorage').getPublicUrl(nombreArchivo);
            uploadedUrl = publicData.publicUrl;
        }
        console.log("URL nueva del archivo:", uploadedUrl);
    }

    await updateDoc(doc(db, 'videojuegos', id), {
        nombre: editNombre.value,
        fechaPublicacion: editFechaPublicacion.value,
        numeroJugadores: editNumeroJugadores.value,
        plataformas: editPlataformas.value,
        saga: editSagaSeleccionada.value,
        generos: editGeneros.value,
        idiomas: editIdiomas.value,
        urlImagen: uploadedUrl,
        urlJuego: editEnlaceJuego.value || "",
        editando: false
    });
    
    console.log("Videojuego actualizado");
    editArchivo = null;
}
</script>

<template>
    <h1>Videojuegos</h1>
    <div class="crud-layout">
        <section class="crud-form">
            <h2>Crear / editar videojuego</h2>
            <div class="formulario-videojuego">
                <input v-model="nombre" type="text" placeholder="Nombre">
                <input v-model="fechaPublicacion" type="date">
                <input v-model="numeroJugadores" type="text" placeholder="Número de jugadores">
                <input v-model="plataformas" type="text" placeholder="Plataformas (ej: PS5, Xbox, PC)">
                <select v-model="sagaSeleccionada">
                    <option value="">Seleccionar Saga (Opcional)</option>
                    <option v-for="saga in arraySagas" :key="saga.id" :value="saga.nombre">
                        {{ saga.nombre }}
                    </option>
                </select>
                <input v-model="enlaceJuego" type="text" placeholder="Enlace del juego">
                <input v-model="generos" type="text" placeholder="Géneros">
                <input v-model="idiomas" type="text" placeholder="Idiomas">
                <input type="file" @change="adjuntarArchivo">
                <button @click="agregarVideojuego">Añadir Videojuego</button>
            </div>
        </section>
        <section class="crud-list">
            <h2>Videojuegos existentes</h2>
            <ul class="list-scroll">
        <li v-for="videojuego in arrayVideojuegos" :key="videojuego.id" class="videojuego-item">
            <div v-if="!videojuego.editando">
                <p><strong>Nombre:</strong> {{ videojuego.nombre }}</p>
                <p><strong>Fecha de Publicación:</strong> {{ videojuego.fechaPublicacion }}</p>
                <p><strong>Número de Jugadores:</strong> {{ videojuego.numeroJugadores }}</p>
                <p><strong>Plataformas:</strong> {{ videojuego.plataformas }}</p>
                <p v-if="videojuego.saga"><strong>Saga:</strong> {{ videojuego.saga }}</p>
                <p><strong>Géneros:</strong> {{ videojuego.generos }}</p>
                <p><strong>Idiomas:</strong> {{ videojuego.idiomas }}</p>
                <p v-if="videojuego.urlImagen"><strong>Imagen:</strong> <a :href="videojuego.urlImagen" target="_blank" rel="noreferrer">Ver imagen</a></p>
            </div>
            <div v-else class="formulario-edicion">
                <input v-model="editNombre" type="text" placeholder="Nombre">
                <input v-model="editFechaPublicacion" type="date">
                <input v-model="editNumeroJugadores" type="text" placeholder="Número de jugadores">
                <input v-model="editPlataformas" type="text" placeholder="Plataformas">
                <select v-model="editSagaSeleccionada">
                    <option value="">Seleccionar Saga (Opcional)</option>
                    <option v-for="saga in arraySagas" :key="saga.id" :value="saga.nombre">
                        {{ saga.nombre }}
                    </option>
                </select>
                <input v-model="editEnlaceJuego" type="text" placeholder="Enlace del juego">
                <input v-model="editGeneros" type="text" placeholder="Géneros">
                <input v-model="editIdiomas" type="text" placeholder="Idiomas">
                <input type="file" @change="adjuntarArchivoEdicion" placeholder="Cambiar imagen">
            </div>

            <button v-if="!videojuego.editando" @click="videojuego.editando = true; editNombre = videojuego.nombre; editFechaPublicacion = videojuego.fechaPublicacion; editNumeroJugadores = videojuego.numeroJugadores; editPlataformas = videojuego.plataformas; editSagaSeleccionada = videojuego.saga; editGeneros = videojuego.generos; editIdiomas = videojuego.idiomas; editUrlImagen = videojuego.urlImagen">Editar</button>
            <button v-if="!videojuego.editando" @click="borrarVideojuego(videojuego.id)">Eliminar</button>
            <button v-if="videojuego.editando" @click="guardarEdit(videojuego.id)">Guardar</button>
            <button v-if="videojuego.editando" @click="videojuego.editando = false">Cancelar</button>
        </li>
            </ul>
        </section>
    </div>
</template>

<style scoped>
/* Ensure text uses global font */
.crud-layout,
.crud-form,
.crud-list,
.videojuego-item,
.formulario-videojuego,
.formulario-edicion {
  font-family: inherit;
}

.crud-layout {
  display: flex;
  gap: 2.4rem;
  flex-wrap: wrap;
  align-items: flex-start;
}

.crud-form,
.crud-list {
  background: #fff;
  border: 1px solid #e6e9ee;
  border-radius: 1rem;
  padding: 1.6rem;
  box-shadow: 0 8px 26px rgba(11,31,58,0.04);
}

.crud-form { flex: 1 1 36rem; min-width: 32rem; }
.crud-list { flex: 1 1 52rem; min-width: 42rem; max-height: calc(100vh - 18rem); overflow-y: auto; }

.crud-list h2,
.crud-form h2 { margin-top: 0; margin-bottom: 1.2rem; color: #163d6b; }

.formulario-videojuego,
.formulario-edicion { display: grid; gap: 1.2rem; }

.list-scroll { list-style: none; padding: 0; margin: 0; display: grid; gap: 1.6rem; }

.videojuego-item { border: 1px solid #eef2f6; padding: 1.4rem; border-radius: 0.9rem; background: #ffffff; }
.videojuego-item p { margin: 0.6rem 0; color: #333; }

select, input, button { padding: 0.9rem 1.2rem; border-radius: 0.8rem; font-size: 1.4rem; }
select, input { border: 1px solid #e6e9ee; }

button { cursor: pointer; border: none; background: #163d6b; color: white; transition: background 0.18s ease; font-weight:700; }
button:hover { background: #0e2d57; }

/* Improve list item layout for readability */
.videojuego-item { display:flex; flex-direction:column; gap:0.6rem; }

@media (max-width: 900px) {
  .crud-layout { flex-direction: column; }
  .crud-list { max-height: none; }
}
</style>