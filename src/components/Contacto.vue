<template>
    <section class="contacto">
        <h2>Contacto</h2>

        <ul class="contact-grid">
            <li class="contact-card">
                <img src="/img/usuario.png" alt="Correo" />
                <div>
                    <p class="contact-label">Correo</p>
                    <a href="mailto:setalegorar@gmail.com">setalegorar@gmail.com</a>
                </div>
            </li>

            <li class="contact-card">
                <img src="/img/instagram.png" alt="Instagram" />
                <div>
                    <p class="contact-label">Instagram</p>
                    <a href="https://instagram.com/headbukeig" target="_blank" rel="noreferrer">@headkukeig</a>
                </div>
            </li>

            <li class="contact-card">
                <img src="/img/youtube.png" alt="YouTube" />
                <div>
                    <p class="contact-label">YouTube</p>
                    <a href="https://www.youtube.com/@Headbuke" target="_blank" rel="noreferrer">Headbuke</a>
                </div>
            </li>

            <li class="contact-card">
                <img src="/img/Logo.png" alt="GitHub" />
                <div>
                    <p class="contact-label">GitHub</p>
                    <a href="https://github.com/headbuke" target="_blank" rel="noreferrer">github.com/headbuke</a>
                </div>
            </li>

            <li class="contact-card">
                <img src="/img/twitter.png" alt="X" />
                <div>
                    <p class="contact-label">X</p>
                    <a href="https://x.com/HeadBuke" target="_blank" rel="noreferrer">@HeadBuke</a>
                </div>
            </li>
        </ul>
    </section>
</template>
<style scoped>
    .contacto {
        padding: 28px 16px;
        max-width: 1000px;
        margin: 0 auto;
    }

    .contacto h2 {
        margin-bottom: 24px;
        text-align: center;
        font-size: 5rem;
        color: black;
    }

    .contact-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 18px;
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .contact-card {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 18px;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.95);
        box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
        color: #111;
        min-height: 96px;
    }

    .contact-card img {
        width: 46px;
        height: 46px;
        object-fit: contain;
        border-radius: 12px;
        background: #f6f6f6;
        padding: 6px;
    }

    .contact-label {
        margin: 0 0 6px;
        font-weight: 700;
        font-size: 2.95rem;
        color: #333;
    }

    .contact-card a {
        color: #0b6cff;
        text-decoration: none;
        font-size: 2.05rem;
        word-break: break-word;
    }

    .contact-card a:hover {
        text-decoration: underline;
    }

    @media (max-width: 520px) {
        .contact-card {
            flex-direction: column;
            align-items: flex-start;
        }
    }
</style>