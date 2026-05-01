<script setup>


//Storage de imagenes

//Imports
import { getFirestore, addDoc, collection,  getDocs, setDoc, updateDoc, deleteDoc, doc, query, where, orderBy } from "firebase/firestore";
import { useCollection } from "vuefire";
import { signOut, getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword ,signInWithEmailAndPassword,
onAuthStateChanged,browserSessionPersistence, setPersistence} from "firebase/auth";
import { supabase } from '../supabase.js'
import { ref,computed } from "vue";

//Variables
const auth = getAuth();
var logueado = ref(false);
var nombreUsuario = ref("");
var imgusuario = ref("");
var idUsuario = ref("");
var emailUsuario = ref("");
const db = getFirestore();
var text=ref("");
var editText=ref("");
var arrayRecordatorios = useCollection(collection(db,'listaRecordatorios'));
const recordatoriosOrdenados = computed(() => {
  return [...arrayRecordatorios.value].sort(
    (a, b) => a.prioridad - b.prioridad
  )
})
const todosRecordatorios = ref([]);
const provider = new GoogleAuthProvider();
var archivo;
var errorSup = false;
var datosArchivo;



//Metodos de sesion

onAuthStateChanged(auth, (user) => {
  if(user){
      logueado.value = true;
      nombreUsuario.value = user.displayName || user.email || "Usuario";
      imgusuario.value = user.photoURL || "";
      idUsuario.value = user.uid;
      emailUsuario.value = user.email;
      const todosRecordatorios = collection(db, "listaRecordatorios");
      const q = query(todosRecordatorios, where('usuario', "==", idUsuario.value));
      arrayRecordatorios = useCollection(q);     
  }else{
      logueado.value = false;
      nombreUsuario.value = "";
      imgusuario.value = "";
  }
  console.log(logueado.value);
});

function cerrarSesion()
    {
        logueado.value = false;
        const auth = getAuth();
        signOut(auth).then(() => {
            // Sign-out successful.
        }).catch((error) => {
            // An error happened.
        });
    }


function adjuntarArchivo(e)
{
    archivo = e.target.files[0];
    console.log(archivo);
}


//Funcion cuando pulsas agregar un elemento
async function agregarElemento()
{
   if (archivo){

        const {data, error} = await supabase.storage.from('Storage').upload(archivo.name, archivo)
        const nombre = archivo.name;
        if(error){
          errorSup = true;
        }  
        else{      
        const { data } = supabase.storage.from('Storage').getPublicUrl(nombre);
         datosArchivo = data.publicUrl;
        }
    }
    if(!archivo || !errorSup){
    
         await addDoc(collection(db, "listaRecordatorios"),
      {
        nombre: text.value,
        editando: false,
        completado: false,
        prioridad: 1,
        usuario : idUsuario.value,
        emailUsuario : emailUsuario.value,
        enlace: datosArchivo || "",
      }
    );
    }
    //Limpiar el input
    text.value="";
}

//Funcion cuando pulsas eliminar un elemento

async function borrarElemento(Indice)
{
  await deleteDoc(doc(db, "listaRecordatorios", Indice));
}

//Funcion para borrar todos los recordatorios

function borrarCompletados()
{
 //  
}

//Funcion para guardar recordatorio tras ser editados
async function guardarEdit(Indice)
{
      await updateDoc(doc(db, 'listaRecordatorios', Indice), { nombre: editText.value , editando: false})
}



async function cambiarPrioridad(Indice,Prioridad)
{
  await updateDoc(doc(db, 'listaRecordatorios', Indice), { prioridad: Prioridad})
}

</script>

<template>
      <h1>Recordatorios</h1>
      <div >
        <input v-model="text" type="text" @keyup.enter="agregarElemento"></input>
        <button @click="agregarElemento">Añadir</button>
        <input type="file" @change="adjuntarArchivo">
      </div>  
      <ul>
        <li v-for="(Elemento) in recordatoriosOrdenados" :key="Elemento.id"> 
          <input v-if="!Elemento.editando" type="checkbox" v-model="Elemento.completado">

            <p v-if="!Elemento.editando" :class="{claseTachado: Elemento.completado}">{{Elemento.nombre}}</p>
            <input v-else v-model="editText" type="text" editText={{Elemento.nombre}}></input> 

            <div v-if="!Elemento.editando">
              <button 
                :class="['btn', Elemento.prioridad === 1 ? 'alta' : '']"
                @click="cambiarPrioridad(Elemento.id,1)">
                Alta
              </button>

              <button 
                :class="['btn', Elemento.prioridad === 2 ? 'media' : '']"
                @click="cambiarPrioridad(Elemento.id,2)">
                Media
              </button>

              <button 
                :class="['btn', Elemento.prioridad === 3 ? 'baja' : '']"
                @click="cambiarPrioridad(Elemento.id,3)">
                Baja
              </button>
            </div>
            <!--Boton de descarga-->
            <div v-if="Elemento.enlace">
              <a 
                :href="Elemento.enlace"
                target="_blank"
                download
              >
                <button>Descargar archivo</button>
              </a>
            </div>

            <button v-if="!Elemento.editando" @click="Elemento.editando = !Elemento.editando; editText = Elemento.nombre">Editar</button>
            <button v-if="!Elemento.editando" @click="borrarElemento(Elemento.id)">X</button>

            <button v-if="Elemento.editando" @click="guardarEdit(Elemento.id)">Guardar</button>
            <button v-if="Elemento.editando" @click="editText ='';Elemento.editando=false">Cancelar</button>
        </li>
      </ul>
      <button @click="borrarTodo">Borrar Todo</button>
      <button @click="cerrarSesion()">Cerrar Sesion</button>
</template>
<style scoped>



.btn {
  padding: 6px 10px;
  border: none;
  margin: 2px;
  cursor: pointer;
  background-color: #ddd;
  color: #333;
  border-radius: 5px;
  transition: 0.2s;
}

/* PRIORIDAD ALTA */
.alta {
  background-color: #ff4d4d;
  color: white;
}

/* PRIORIDAD MEDIA */
.media {
  background-color: #ffa500;
  color: white;
}

/* PRIORIDAD BAJA */
.baja {
  background-color: #4caf50;
  color: white;
}

/* Hover opcional */
.btn:hover {
  opacity: 0.8;
}
</style>