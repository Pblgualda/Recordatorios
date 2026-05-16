import { createApp } from 'vue'
import {createRouter,createWebHistory} from 'vue-router';
import App from './App.vue'
import './assets/main.css'
import Inicio from './components/Inicio.vue';
import Administracion from './components/Administracion.vue';
import Merchandising from './components/Merchandising.vue';
import Sagas from './components/Sagas.vue';
import Login from './components/Login.vue';
import Perfil from './components/Perfil.vue';
import Contacto from './components/Contacto.vue';
import SobreNosotros from './components/SobreNosotros.vue';
import Carrito from './components/Carrito.vue'
import MerchandisingDetalle from './components/MerchandisingDetalle.vue'
import VideojuegoDetalle from './components/VideojuegoDetalle.vue'
import Pedidos from './components/Pedidos.vue'
import { initializeApp } from 'firebase/app';
import { VueFire } from 'vuefire';
import './assets/main.css'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCAeZjJUv8fttddhk4iRKYb0EIGA0-1Ofk",
  authDomain: "headbuke.firebaseapp.com",
  projectId: "headbuke",
  storageBucket: "headbuke.firebasestorage.app",
  messagingSenderId: "635234940050",
  appId: "1:635234940050:web:b45150fcfed88de5e1624b"
};

const routes = [
    { path: "/", component: Inicio},
    { path: '/merchandising', component: Merchandising},
    { path: '/merchandising/:id', component: MerchandisingDetalle},
    { path: '/sagas', component: Sagas},
    { path: '/sagas/:id', component: VideojuegoDetalle},
    { path: '/login', component: Login},
    { path: '/perfil', component: Perfil},
    { path: '/pedidos', component: Pedidos},
    { path: '/contacto', component: Contacto },
    { path: '/sobre-nosotros', component: SobreNosotros },
    { path: '/carrito', component: Carrito }
]

export const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, from) => {
    var estasAutenticado = true;

    console.log("Estas autenticado: "+to.fullPath+"que tiene"+to.meta.requiresAuth);
    if (to.meta.requiresAuth && !estasAutenticado)
        return false;
    else
     return true;
});



const firebaseApp = initializeApp(firebaseConfig);
const app = createApp(App);
//app.initializeApp(firebaseConfig);
app.use(router)
app.mount('#app')
app.use( VueFire, {
    firebaseApp,
    modules: [],
});
