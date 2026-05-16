<script setup>
import { getFirestore, collection } from "firebase/firestore";
import { useCollection } from "vuefire";
import { ref, computed } from "vue";
import { query, orderBy, limit, getDocs } from "firebase/firestore";

//Variables
const db = getFirestore();
const arraySagas = useCollection(collection(db, 'sagas'));

const productosRecientes = useCollection(query(collection(db, 'productos'), limit(3)));

</script>

<template>
        <div class="hero-image">
            <div class="hero-text">
                <h1>Headbuke</h1>
                <p>De todo para todos</p>
            </div>
        </div>
    <section class="novedades">
        <h2>Novedades</h2>
        <div class="news-card">
            <div class="news-image">
                <img src="/img/GalloWars.png" alt="Novedad">
            </div> 
            <div class="news-info">
                <h3>Nuevo juego: "Gallo Wars: Definitive"</h3>
                <ul>
                    <li><p>Fecha de lanzamiento: 20 de Junio de 2026</p></li>
                    <li><p>Numero de jugadores: 1-4</p></li>
                    <li><p>Idiomas: Español, Inglés, Francés, Portugues</p></li>
                    <li><p>Plataformas: PC</p></li>
                    <li><p>Generos: Arcade, Acción,Terror psicologico</p></li>
                </ul>  
            </div>
        </div> 
    </section>
    <section class="sagas">
        <h2>Sagas</h2>
        <div class="products-list">     
            <article class="product-card" v-for="saga in arraySagas" :key="saga.id">
                <div class="product-card__media">
                    <img :src="saga.urlImagen" :alt="saga.nombre">
                </div>
                <div class="product-card__content">
                    <h3 class="product-card__title">{{saga.nombre}}</h3>
                    <p class="product-card__text">
                        {{saga.descripcion}}
                    </p>
                </div>
            </article>
        </div>
    </section>
    <section class="merchList">
        <h2>Merchandising</h2>
        <div class="merch-list">     
            <article class="merch-card" v-for="producto in productosRecientes" :key="producto.id">
                <div class="merch-card__media">
                    <img :src="producto.urlImagen" :alt="producto.nombre">
                </div>
                <div class="merch-card__content">
                    <h3 class="merch-card__title">{{producto.nombre}}</h3>
                    <ul class="merch-card__text">
                        <li>Precio: {{producto.precio}}$</li>
                    </ul>  
                </div>
            </article>   
        </div>
    </section>
</template>

<style scoped>

</style>