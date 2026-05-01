<script setup>
    var email = ref("");
    var password = ref("");
    var logueado = ref(false);
    var nombreUsuario = ref("");
    var imgusuario = ref("");
    var email = ref("");
    var password = ref("");
    var idUsuario = ref("");
    const auth = getAuth();
    var admin = ref(false);
    const provider = new GoogleAuthProvider();



    import { ref,computed } from "vue";
    import { useCollection } from "vuefire"
    import { addDoc, collection, getFirestore, doc, deleteDoc, setDoc, query, where} from 'firebase/firestore'
    import { signOut, getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword ,signInWithEmailAndPassword,
    onAuthStateChanged,browserSessionPersistence, setPersistence} from "firebase/auth";
    import { useRouter } from "vue-router";

    defineEmits(['idUsuario']);


    const router = useRouter();

    function iniciarSesion()
    {
        signInWithPopup(auth, provider)
        .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        console.log(user);
        router.push({ name: 'Recordatorio' });
        // IdP data available using getAdditionalUserInfo(result)
        // ...
        }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
        });

        }

        setPersistence(auth, browserSessionPersistence)
        .then(() => {
            return signInWithEmailAndPassword(auth, email, password);
        })
        .catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
        });

        function registro(){
        const auth = getAuth();
        createUserWithEmailAndPassword(auth, email.value, password.value)
        .then((userCredential) => {
            // Signed up 
            const user = userCredential.user;
            console.log("Usuario registrado");
            // ...
            router.push({ name: 'Recordatorio' });
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            // ..
        });
    }

    function iniciaSesionEmailPassword()
    {
        const auth = getAuth();
        signInWithEmailAndPassword(auth, email.value, password.value)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            console.log("Sesión iniciada");
            router.push({ name: 'Recordatorio' });
            // ...
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
        });
    }

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
    <form @submit.prevent="registro" class="formulario_registro">
      <label for="email">Email:</label>
      <input class="input-texto" type="email" v-model="email" placeholder="Email">
      <label for="password">Contraseña: </label>
      <input class="input-texto" type="password" v-model="password" placeholder="Password">

      <button type="submit" class="btn">Crear cuenta</button>
      <p>Si ya tienes cuenta inicia sesión directamente: </p>
      <button type="button" @click="iniciaSesionEmailPassword" class="btn">
        Iniciar sesión
      </button>
    </form>
    <p>Usa tu cuenta de Google para registrarte: </p>
    <button @click="iniciarSesion">Registro con google</button>
</template>