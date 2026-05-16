<script setup>

</script>

<template>
    <footer class="footer">
        <div class="footer__content">
            <div class="footer__logo">
                <img src="/img/Logo.png" class="logo-img" alt="Logo Sass">
            </div>
            <div class="footer__info">
                <p>&copy; 2026 Headbuke. Todos los derechos reservados.</p>
                <p>Diseño y desarrollo con Sass</p>
            </div>
            <div class="footer__links">
                <a href="#" class="footer__link">Política de privacidad</a>
                <RouterLink to="/sobre-nosotros" class="footer__link">Sobre Nosotros</RouterLink>
                <RouterLink to="/contacto" class="footer__link">Contacto</RouterLink>

            </div>
        </div>
    </footer>
</template>