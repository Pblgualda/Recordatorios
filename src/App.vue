<script setup>
  import InicioSesion from './components/InicioSesion.vue';
  import { getFirestore, addDoc, collection,  getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
  import { useCollection } from "vuefire";
  import { signOut, getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword ,signInWithEmailAndPassword,
  onAuthStateChanged,browserSessionPersistence, setPersistence} from "firebase/auth";
  import { ref,computed } from "vue";

  const auth = getAuth();
  var logueado = ref();
  var nombreUsuario = ref("");
  var imgusuario = ref("");
  var idUsuario = ref("");
  var emailUsuario = ref("");
  const db = getFirestore();
  var text=ref("");
  var editText=ref("");
  var arrayRecordatorios = useCollection(collection(db,'listaRecordatorios'));
  const todosRecordatorios = ref([]);
  const provider = new GoogleAuthProvider();
  var archivo;
  var admin = ref(false);

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


</script>

<template>
  <nav>
    <RouterLink to="/">Inicio</RouterLink>
    <RouterLink to="/recordatorios">Recordatorios</RouterLink>
    <RouterLink v-if="admin==true" to="/administracion">Administracion</RouterLink>
  </nav>
  <main>
    <!--Parte de Login-->
      <div v-if="logueado==false">
         <InicioSesion/>
      </div>
      <div v-else>
        <div class="divIMG">
          <img :src="imgusuario" alt="logoUsuarios">
        </div>      
      </div>
    <!--Parte de vista-->
      <div v-if="logueado==true">
        <RouterView />
      </div>
      <div v-else>
        <h1>Inicia Sesion para acceder a todas las funcionalidades</h1>
      </div>   
  </main>
</template>

<style scoped>
</style>
