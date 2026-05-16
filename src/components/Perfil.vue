<script setup>
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
    const provider = new GoogleAuthProvider();



    import { ref,computed } from "vue";
    import { useCollection } from "vuefire";
    import { addDoc, collection, getFirestore, doc, deleteDoc, setDoc, query, where} from 'firebase/firestore';
    import { signOut, getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword ,signInWithEmailAndPassword,
    onAuthStateChanged,browserSessionPersistence, setPersistence} from "firebase/auth";
    import { useRouter } from "vue-router";
    import Productos from './Productos.vue';
    import Saga from './Saga.vue';
    import Videojuegos from './Videojuegos.vue';

    defineEmits(['idUsuario']);


    const router = useRouter();
    const currentView = ref('');

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
            if(user.email == "setalegorar@gmail.com" || user.email == "paguparra@gmail.com")
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
        }else{
            logueado.value = false;
            nombreUsuario.value = "";
            imgusuario.value = "";
        }
        console.log(logueado.value);
    });

</script>

<template>
    <div>
        <h1>Perfil de Usuario</h1>
    <h2>Nombre:</h2>
    <p>{{ nombreUsuario }}</p>
    <h2>Email:</h2>
    <p>{{ emailUsuario }}</p>

    <button @click="router.push('/pedidos')">Mis pedidos</button>


    <div v-if="admin == true" class="admin-panel">
        <h2>Panel de administrador</h2>
        <div v-if="!currentView">
            <button @click="currentView = 'productos'">Gestionar Productos</button>
            <button @click="currentView = 'saga'">Gestionar Sagas</button>
            <button @click="currentView = 'videojuegos'">Gestionar Videojuegos</button>
        </div>
        <div v-else>
            <button @click="currentView = ''">Volver al Panel</button>
            <Productos v-if="currentView === 'productos'" />
            <Saga v-if="currentView === 'saga'" />
            <Videojuegos v-if="currentView === 'videojuegos'" />
        </div>
    </div>
    <button @click="cerrarSesion">Cerrar sesión</button>
    </div>
</template>
<style scoped>

div {
    background-color: #ffffff;
    color: #2f2fff;
    padding: 20px;
    border-radius: 12px;
    max-width: 700px;
    margin: auto;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    font-family: Arial, sans-serif;
    margin-bottom: 30px;
    margin-top: 30px;
}

h1 {
    color: #2f2fff;
    text-align: center;
    margin-bottom: 20px;
}

h2 {
    color: #2f2fff;
    margin-top: 15px;
    margin-bottom: 5px;
}

p {
    background-color: #f4f7fb;
    padding: 10px;
    border-radius: 6px;
    border-left: 4px solid #2f2fff;
}

img {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    border: 3px solid #2f2fff;
    object-fit: cover;
    margin-top: 10px;
}

button {
    background-color: #2f2fff;
    color: white;
    border: none;
    padding: 10px 16px;
    margin: 10px 5px 0 0;
    border-radius: 8px;
    cursor: pointer;
    transition: 0.3s ease;
    font-weight: bold;
}

button:hover {
    background-color: #2f2fff;
    transform: scale(1.03);
}

.admin-panel {
    margin-top: 25px;
    padding: 20px;
    background-color: #eef3fa;
    border: 2px solid #2f2fff;
    border-radius: 10px;
}


</style>