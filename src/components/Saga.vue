<script setup>
//Imports
import { getFirestore, addDoc, collection, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { useCollection } from "vuefire";
import { supabase } from '../supabase.js';
import { ref } from "vue";

//Variables
const db = getFirestore();
var nombre = ref("");
var descripcion = ref("");
var ano = ref("");
var archivo = null;
var errorSup = false;
var editNombre = ref("");
var editDescripcion = ref("");
var editAno = ref("");
var editUrlImagen = ref("");
var editArchivo = null;
var datosArchivo = null;
var datosArchivoE = null;
const arraySagas = useCollection(collection(db, 'sagas'));

function adjuntarArchivo(e) {
    archivo = e.target.files[0];
    console.log("Archivo adjuntado:", archivo);
}

function adjuntarArchivoEdicion(e) {
    editArchivo = e.target.files[0];
}

async function agregarSaga() {
    console.log("Iniciando agregarSaga");
    
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
    await addDoc(collection(db, "sagas"), {
        nombre: nombre.value,
        descripcion: descripcion.value,
        ano: ano.value,
        urlImagen: datosArchivo || "",
        editando: false,
    });
    }

    nombre.value = "";
    descripcion.value = "";
    ano.value = "";
    archivo = null;
}

async function borrarSaga(id) {
    await deleteDoc(doc(db, "sagas", id));
}

async function guardarEdit(id) {
    console.log("Iniciando guardarEdit para saga:", id);

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

    await updateDoc(doc(db, 'sagas', id), {
        nombre: editNombre.value,
        descripcion: editDescripcion.value,
        ano: editAno.value,
        urlImagen: uploadedUrl,
        editando: false
    });

    console.log("Saga actualizada");
    editArchivo = null;
}
</script>

<template>
    <h1>Sagas</h1>
    <div class="crud-layout">
        <section class="crud-form">
            <h2>Crear / editar saga</h2>
            <div class="formulario-saga">
                <input v-model="nombre" type="text" placeholder="Nombre">
                <input v-model="descripcion" type="text" placeholder="Descripción">
                <input v-model="ano" type="text" placeholder="Año">
                <input type="file" @change="adjuntarArchivo">
                <button @click="agregarSaga">Añadir Saga</button>
            </div>
        </section>
        <section class="crud-list">
            <h2>Sagas existentes</h2>
            <ul class="list-scroll">
        <li v-for="saga in arraySagas" :key="saga.id" class="saga-item">
            <div v-if="!saga.editando">
                <p><strong>Nombre:</strong> {{ saga.nombre }}</p>
                <p><strong>Descripción:</strong> {{ saga.descripcion }}</p>
                <p><strong>Año:</strong> {{ saga.ano }}</p>
                <p v-if="saga.urlImagen"><strong>Imagen:</strong> <a :href="saga.urlImagen" target="_blank" rel="noreferrer">Ver imagen</a></p>
            </div>
            <div v-else class="formulario-edicion">
                <input v-model="editNombre" type="text" placeholder="Nombre">
                <input v-model="editDescripcion" type="text" placeholder="Descripción">
                <input v-model="editAno" type="text" placeholder="Año">
                <input type="file" @change="adjuntarArchivoEdicion" placeholder="Cambiar imagen">
            </div>

            <button v-if="!saga.editando" @click="saga.editando = true; editNombre = saga.nombre; editDescripcion = saga.descripcion; editAno = saga.ano; editUrlImagen = saga.urlImagen">Editar</button>
            <button v-if="!saga.editando" @click="borrarSaga(saga.id)">Eliminar</button>
            <button v-if="saga.editando" @click="guardarEdit(saga.id)">Guardar</button>
            <button v-if="saga.editando" @click="saga.editando = false">Cancelar</button>
        </li>
            </ul>
        </section>
    </div>
</template>

<style scoped>
.crud-layout {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  align-items: flex-start;
}

.crud-form,
.crud-list {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
}

.crud-form {
  flex: 1 1 360px;
  min-width: 320px;
}

.crud-list {
  flex: 1 1 520px;
  min-width: 420px;
  max-height: calc(100vh - 210px);
  overflow-y: auto;
}

.crud-list h2,
.crud-form h2 {
  margin-top: 0;
  margin-bottom: 18px;
  color: #163d6b;
}

.formulario-saga,
.formulario-edicion {
  display: grid;
  gap: 12px;
}

.list-scroll {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 16px;
}

.saga-item {
  border: 1px solid #e1e5ea;
  padding: 16px;
  border-radius: 12px;
  background: #fbfcfe;
}

.saga-item p {
  margin: 8px 0;
}

button {
  padding: 10px 14px;
  cursor: pointer;
  border-radius: 8px;
  border: none;
  background: #163d6b;
  color: white;
  transition: background 0.2s ease;
}

button:hover {
  background: #0e2d57;
}

@media (max-width: 900px) {
  .crud-layout {
    flex-direction: column;
  }

  .crud-list {
    max-height: none;
  }
}
</style>
