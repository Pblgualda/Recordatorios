<script  setup>

</script>

<template>
    <div class="sobre-nosotros">
        <h1>Sobre Nosotros</h1>
        <p></p>
    </div>
    <div class="miembros">
        <div class="miembro">
            <img src="/img/miembro1.png" alt="Miembro 1">
            <h3>Pablo Gualda Parra</h3>
            <p>Fundador de Headbuke</p>
            <p>Guionista de videojuegos</p>
            <p>Desarrollador de videojuegos</p>
        </div>
        <div class="miembro">
            <img src="/img/miembro2.png" alt="Miembro 2">
            <h3>Javier Morente Parra</h3>
            <p>Co-fundador de Headbuke</p>
            <p>Guionista de videojuegos</p>
            <p>Desarrollador de videojuegos</p>
        </div>
        <div class="miembro">
            <img src="/img/miembro3.png" alt="Miembro 3">
            <h3>Manuel Calixto Piñar</h3>
            <p>Actor de dolaje</p>
            <p>Desarrollador de videojuegos</p>
        </div>
    </div>
</template>
<style scoped>
.sobre-nosotros {
    text-align: center;
    margin: 40px 0;
}
.miembros {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
}
.miembro {
    text-align: center;
    margin: 20px;
}
</style>