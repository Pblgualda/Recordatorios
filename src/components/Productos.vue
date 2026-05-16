<script setup>
//Imports
import { getFirestore, addDoc, collection, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { useCollection } from "vuefire";
import { supabase } from '../supabase.js';
import { ref } from "vue";

//Variables
const db = getFirestore();
var categoria = ref("");
var descripcion = ref("");
var dimensiones = ref("");
var nombre = ref("");
var precio = ref("");
var archivo = null;
var errorSup = false;
var editCategoria = ref("");
var editDescripcion = ref("");
var editDimensiones = ref("");
var editNombre = ref("");
var editPrecio = ref("");
var editArchivo = null;
var datosArchivo = null;
var datosArchivoE = null;
const arrayProductos = useCollection(collection(db, 'productos'));

function adjuntarArchivo(e) {
    archivo = e.target.files[0];
    console.log("Archivo adjuntado:", archivo);
}

function adjuntarArchivoEdicion(b) {
    editArchivo = b.target.files[0];
}

async function agregarProducto() {
    console.log("Iniciando agregarProducto");
    
    if (archivo) {
        const {data, error} = await supabase.storage.from('HeadbukeStorage').upload(archivo.name, archivo)
        const nombre = archivo.name;
        if(error){
          errorSup = true;
        }  
        else{      
        const { data } = supabase.storage.from('HeadbukeStorage').getPublicUrl(nombre);
         datosArchivo = data.publicUrl;
        }
    }
    if (!archivo || !errorSup) {
    await addDoc(collection(db, "productos"), {
        categoria: categoria.value,
        descripcion: descripcion.value,
        dimensiones: dimensiones.value,
        nombre: nombre.value,
        precio: parseFloat(precio.value) || 0,
        urlImagen: datosArchivo || "",
        editando: false,
    });
    }


    categoria.value = "";
    descripcion.value = "";
    dimensiones.value = "";
    nombre.value = "";
    precio.value = "";
    archivo = null;
}

async function borrarProducto(id) {
    await deleteDoc(doc(db, "productos", id));
}

async function guardarEdit(id) {
    console.log("Iniciando guardarEdit para producto:", id);
    

      
    if (editArchivo) {
        const {data, error} = await supabase.storage.from('HeadbukeStorage').upload(editArchivo.name, editArchivo)
        const nombre = editArchivo.name;
        if(error){
          errorSup = true;
        }  
        else{      
        const { data } = supabase.storage.from('HeadbukeStorage').getPublicUrl(nombre);
         datosArchivoE = data.publicUrl;
        }
    }
    if (!editArchivo || !errorSup) {
        await updateDoc(doc(db, 'productos', id), {
            categoria: editCategoria.value,
            descripcion: editDescripcion.value,
            dimensiones: editDimensiones.value,
            nombre: editNombre.value,
            precio: parseFloat(editPrecio.value) || 0,
            urlImagen: datosArchivoE || "",
            editando: false
        });
    }
    
    console.log("Producto actualizado");
    editArchivo = null;
}
</script>

<template>
    <h1>Productos</h1>
    <div class="crud-layout">
        <section class="crud-form">
            <h2>Crear / editar producto</h2>
            <div class="formulario-producto">
                <select v-model="categoria">
                    <option value="" disabled>Selecciona una categoría</option>
                    <option value="Peluches">Peluches</option>
                    <option value="Figuras">Figuras</option>
                    <option value="Posters">Posters</option>
                    <option value="Comics">Comics</option>
                </select>
        <input v-model="descripcion" type="text" placeholder="Descripción">
        <input v-model="dimensiones" type="text" placeholder="Dimensiones">
        <input v-model="nombre" type="text" placeholder="Nombre">
        <input v-model="precio" type="number" step="0.01" placeholder="Precio">
        <input type="file" @change="adjuntarArchivo">
        <button @click="agregarProducto">Añadir Producto</button>
            </div>
        </section>
        <section class="crud-list">
            <h2>Productos existentes</h2>
            <ul class="list-scroll">
        <li v-for="producto in arrayProductos" :key="producto.id" class="producto-item">
            <div v-if="!producto.editando">
                <p><strong>Categoría:</strong> {{ producto.categoria }}</p>
                <p><strong>Nombre:</strong> {{ producto.nombre }}</p>
                <p><strong>Descripción:</strong> {{ producto.descripcion }}</p>
                <p><strong>Dimensiones:</strong> {{ producto.dimensiones }}</p>
                <p><strong>Precio:</strong> ${{ producto.precio }}</p>
                <p v-if="producto.urlImagen"><strong>Imagen:</strong> <a :href="producto.urlImagen" target="_blank" rel="noreferrer">Ver imagen</a></p>
            </div>
            <div v-else class="formulario-edicion">
                <select v-model="editCategoria">
                    <option value="" disabled>Selecciona una categoría</option>
                    <option value="Peluches">Peluches</option>
                    <option value="Figuras">Figuras</option>
                    <option value="Posters">Posters</option>
                    <option value="Comics">Comics</option>
                </select>
                <input v-model="editDescripcion" type="text" placeholder="Descripción">
                <input v-model="editDimensiones" type="text" placeholder="Dimensiones">
                <input v-model="editNombre" type="text" placeholder="Nombre">
                <input v-model="editPrecio" type="number" step="0.01" placeholder="Precio">
                <input type="file" @change="adjuntarArchivoEdicion" placeholder="Cambiar imagen">
            </div>

            <button v-if="!producto.editando" @click="producto.editando = true; editCategoria = producto.categoria; editDescripcion = producto.descripcion; editDimensiones = producto.dimensiones; editNombre = producto.nombre; editPrecio = producto.precio">Editar</button>
            <button v-if="!producto.editando" @click="borrarProducto(producto.id)">Eliminar</button>
            <button v-if="producto.editando" @click="guardarEdit(producto.id)">Guardar</button>
            <button v-if="producto.editando" @click="producto.editando = false">Cancelar</button>
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

.formulario-producto,
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

.producto-item {
  border: 1px solid #e1e5ea;
  padding: 16px;
  border-radius: 12px;
  background: #fbfcfe;
}

.producto-item p {
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
