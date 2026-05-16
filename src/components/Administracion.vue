<script setup>
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
var admin = ref(true);
var arrayRecordatorios = useCollection(collection(db,'listaRecordatorios'));
const recordatoriosAdmin = computed(() => {
  return [...arrayRecordatorios.value].sort((a, b) => {

    // Ordenar por usuario
    const usuario = a.usuario.localeCompare(b.usuario)

    if (usuario !== 0) {
      return usuario
    }

    // Si es el mismo usuario, ordenar por prioridad
    return a.prioridad - b.prioridad
  })
})
const todosRecordatorios = ref([]);
const provider = new GoogleAuthProvider();
var archivo;





function adjuntarArchivo(e)
{
    archivo = e.target.files[0];
    console.log(archivo);
}
async function altaRecordatorio()
{

    if (archivo)
    {
        //antes de escribir en la bd neccesito subir el arhcivo a supabase
        const { data, error } = await supabase.storage.from('Storage').upload(archivo.name,archivo.value)
        if(error)
        {
            console.log(error);
            errorEnSubida = true;
        }
        else
        {
            console.log("perfe");
            errorEnSubida = false;
        }
    }
    if (!archivo || !errorEnSubida)
    {

        const  {data} = supabase.storage.from('Storage').getPublicUrl(archivo.name)
        console.log(data.publicUrl);
        //escribir en la bd sin archivo

    }
}


//Metodos de sesion

onAuthStateChanged(auth, (user) => {
  if(user){
    if(user.email == "admin@gmail.com")
    {
      admin=true;
    }
    else
    {
      admin=false;
    }
      logueado.value = true;
      nombreUsuario.value = user.displayName || user.email || "Usuario";
      imgusuario.value = user.photoURL || "";
      idUsuario.value = user.uid;
      emailUsuario.value = user.email;
      const todosRecordatorios = collection(db, "listaRecordatorios");
      const q = query(todosRecordatorios);
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


//Funcion para cargar la base de datos en el array


//Funcion cuando pulsas agregar un elemento
async function agregarElemento()
{
    await addDoc(collection(db, "listaRecordatorios"),
      {
        nombre: text.value,
        editando: false,
        completado: false,
        prioridad: 1,
        usuario : idUsuario.value,
        emailUsuario : emailUsuario.value,
        enlace: "",
      }
    );
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
    <div v-if="admin">
      <h1>Administración</h1>
      <ul>
        <li v-for="(Elemento) in recordatoriosAdmin" :key="Elemento.id"> 
          <input v-if="!Elemento.editando" type="checkbox" v-model="Elemento.completado">

            <p v-if="!Elemento.editando">Recordatorio de {{ Elemento.emailUsuario }}</p>
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

            <button v-if="!Elemento.editando" @click="Elemento.editando = !Elemento.editando; editText = Elemento.nombre">Editar</button>
            <button v-if="!Elemento.editando" @click="borrarElemento(Elemento.id)">X</button>

            <button v-if="Elemento.editando" @click="guardarEdit(Elemento.id)">Guardar</button>
            <button v-if="Elemento.editando" @click="editText ='';Elemento.editando=false">Cancelar</button>
        </li>
      </ul>
      <button @click="borrarTodo">Borrar Todo</button>
      <button @click="cerrarSesion()">Cerrar Sesion</button>
    </div>
    <div v-else>
        <h1>No puedes estar aquí</h1>
        <h2>Si eres administrador comprueba tu contraseña o contacta con el servicio tencico</h2>
    </div>
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