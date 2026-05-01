import { createApp } from 'vue'
import {createRouter,createWebHistory} from 'vue-router';
import App from './App.vue'
import './assets/main.css'
import LandingPage from './components/LandingPage.vue';
import Administracion from './components/Administracion.vue';
import Recordatorio from './components/Recordatorio.vue';
import { initializeApp } from 'firebase/app';
import { VueFire } from 'vuefire';
import  supabaseStorage  from './components/supabaseStorage.vue';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBHuddPEWC7vS3i__m1LeaQ5eRDJfBac3w",
  authDomain: "to-do-list-e5f92.firebaseapp.com",
  projectId: "to-do-list-e5f92",
  storageBucket: "to-do-list-e5f92.firebasestorage.app",
  messagingSenderId: "206880014500",
  appId: "1:206880014500:web:e5c4423f4c9e51d5c1e631"
};

const routes = [
    { path: "/", component: LandingPage},
    { path: '/recordatorios', component: Recordatorio},
    { path: '/administracion', component: Administracion},
    { path: '/recordatorio',name:'Recordatorio', component: Recordatorio}
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
