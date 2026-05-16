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
    import { useCollection } from "vuefire"
    import { addDoc, collection, getFirestore, doc, deleteDoc, setDoc, query, where} from 'firebase/firestore'
    import { signOut, getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword ,signInWithEmailAndPassword,
    onAuthStateChanged,browserSessionPersistence, setPersistence} from "firebase/auth";
    import { useRouter } from "vue-router";

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

</script>

<template>
    <div class="logo">
        <img src="/img/Logo.png" class="logo-img" alt="LogoHeadbuke">
    </div>
    <div class="heading">
        <h1 class="heading-text">Headbuke</h1>
    </div> 
    <nav class="first-nav">
        <ul class="first-nav-list">
            <li class="first-nav-item">
                <RouterLink to="/" href="#" class="first-nav-link">Inicio</RouterLink>
            </li>
            <li class="first-nav-item">
                <RouterLink to="/sagas" href="#" class="first-nav-link">Sagas</RouterLink>
            </li>
            <li class="first-nav-item">
                <RouterLink to="/merchandising" href="#" class="first-nav-link">Merchandising</RouterLink>
            </li>
            <li class="first-nav-item">
                <RouterLink to="/carrito" href="#" class="first-nav-link">
                    <img class="classCarrito" src="/img/carrito.png" alt="Carrito">
                </RouterLink>
            </li>
            <li class="first-nav-item">
                <RouterLink v-if="!logueado" to="/login" href="#" class="first-nav-link">Iniciar Sesión</RouterLink>
                <RouterLink v-else to="/perfil" href="#" class="perfil-foto"><img src="/img/usuario.png" alt="logoUsuarios"></RouterLink>
            </li>
        </ul>
    </nav>
</template>
<style scoped>
    .perfil-foto img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
    }
    .classCarrito 
    {
        width: 40px;
        height: 40px;
    }

    
</style>