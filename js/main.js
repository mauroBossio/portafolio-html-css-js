
// Skills a mostrar, proximamente desde backend (Con un usuario de admin)

const skills = ["HTML", "CSS", "JavaScript (básico)", "Python (básico)"];

function renderSkills() {
    const $skills = document.getElementById('skills');
    $skills.innerHTML = skills.map(s => `<span class="pill">${s}</span>`).join('');
}

// Detectar si estamos en entorno local
const isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1";

// URLs de API
const LOCAL_API = "http://localhost:4000/api";
const PROD_API = "https://portafolio-back-end-vf4z.onrender.com/api";

// Elegir base según el entorno
const API = isLocal ? LOCAL_API : PROD_API;


let projects = [];
let searchQuery = "";


// Carga los proyectos desde el JSON ubicado en el backend y luego los renderiza en el front
// También maneja errores de carga mostrando un mensaje al usuario en lugar de los proyectos
// Si la carga es exitosa, también llama a renderFilters() para inicializar los botones de filtro
// antes de renderizar los proyectos en pantalla usando renderProjects(). 
// Esta función es asíncrona y utiliza fetch para obtener los datos desde la API definida en la variable API
// y actualiza el contenido del elemento con id "projects" en el DOM.
// Maneja errores mostrando un mensaje adecuado al usuario en caso de fallo en la carga de datos.

async function loadProjects() {
    try {
        const res = await fetch(`${API}/projects`);
        if (!res.ok) throw new Error("Error al cargar proyectos");
        projects = await res.json();
        renderFilters();
        renderProjects();
    } catch (err) {
        console.error(err);
        document.getElementById("projects").innerHTML =
            `<div class="empty">Error cargando proyectos 😞</div>`;
    }
}


// === Filtros por tags ===
const ALL = "Todos";
let activeTag = ALL;


// Obtiene todos los tags únicos de los proyectos, incluyendo una opción "Todos" al inicio
// y los devuelve en un array. Utiliza flatMap para aplanar los arrays de tags de cada proyecto
// y Set para eliminar duplicados.
// Esta función es utilizada para renderizar los botones de filtro en la interfaz de usuario.
// Devuelve un array de strings que representan los tags únicos de los proyectos.

function getAllTags() {
    const tags = projects.flatMap(p => p.tags || []);
    return [ALL, ...Array.from(new Set(tags))];
}


// Renderiza los botones de filtro en el elemento con id "filters".
// Utiliza la función getAllTags() para obtener los tags únicos y crea un botón por cada tag.
// Añade la clase "active" al botón correspondiente al tag activo.
// También añade listeners a cada botón para actualizar el tag activo y volver a renderizar
// tanto los filtros como los proyectos cuando se hace clic en un botón.
// Esta función es llamada inicialmente después de cargar los proyectos para configurar
// los filtros en la interfaz de usuario.
// Utiliza innerHTML para actualizar el contenido del contenedor de filtros en el DOM.

function renderFilters() {
    const $filters = document.getElementById('filters');
    const tags = getAllTags();

    $filters.innerHTML = tags.map(tag => `
    <button class="filter-btn ${tag === activeTag ? 'active' : ''}" data-tag="${tag}">
      ${tag}
    </button>
  `).join('');

    $filters.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            activeTag = btn.dataset.tag;
            renderFilters();
            renderProjects();
        });
    });
}

// === Buscador por texto ===//
// Manejo del input y botón de limpiar normaliza el texto para comparaciones insensibles a mayúsculas y acentos
// Actualiza la variable searchQuery y vuelve a renderizar los proyectos al cambiar el input
// Limpia el input y el query al hacer clic en el botón de limpiar y vuelve a renderizar los proyectos
// Utiliza un pequeño debounce para evitar re-renderizados excesivos
// Escucha eventos 'input' en el campo de búsqueda y 'click' en el botón de limpiar
// Actualiza el contenido del elemento con id "search" y "clearSearch" en el DOM


const $search = document.getElementById('search');
const $clearSearch = document.getElementById('clearSearch');

function normalize(txt) {
    return (txt || "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

// (Opcional) pequeño debounce para no re-renderizar en cada tecla
// solo después de que el usuario deja de tipear por 120ms
// Utiliza setTimeout para implementar el debounce
// y clearTimeout para cancelar llamadas anteriores si el usuario sigue escribiendo
// antes de que pase el tiempo de espera.
// Esta funcionalidad mejora la experiencia del usuario al permitir búsquedas
// más eficientes y rápidas en la lista de proyectos.
// No utiliza librerías externas, solo JavaScript nativo.
// Maneja la normalización de texto para búsquedas más flexibles.

let t;
$search.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(() => {
        searchQuery = $search.value;
        renderProjects();
    }, 120);
});

$clearSearch.addEventListener('click', () => {
    $search.value = "";
    searchQuery = "";
    renderProjects();
    $search.focus();
});

// Renderiza los proyectos filtrados por el tag activo y la búsqueda por texto
// Actualiza el contenido del elemento con id "projects" en el DOM
// Filtra los proyectos primero por el tag activo y luego por el texto de búsqueda
// Si no hay proyectos que coincidan con los filtros, muestra un mensaje adecuado
// Utiliza innerHTML para actualizar el contenido del contenedor de proyectos en el DOM

function renderProjects() {
    const $grid = document.getElementById('projects');

    // 1) Filtrar por tag
    let filtered = (activeTag === ALL)
        ? projects
        : projects.filter(p => (p.tags || []).includes(activeTag));

    // 2) Filtrar por texto (título o descripción)
    const q = normalize(searchQuery);
    if (q) {
        filtered = filtered.filter(p => {
            const title = normalize(p.title);
            const desc = normalize(p.description);
            return title.includes(q) || desc.includes(q);
        });
    }

    if (filtered.length === 0) {
        $grid.innerHTML = `<div class="empty">
      No hay proyectos ${q ? `para “<strong>${searchQuery}</strong>”` : ""} con el filtro: <strong>${activeTag}</strong>.
    </div>`;
        return;
    }

    $grid.innerHTML = filtered.map(p => `
    <article class="card">
      <h3>${p.title}</h3>
      <p class="muted">${p.description}</p>
      <div class="tags">${(p.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}</div>
      <div class="actions">
        <a class="btn" href="${p.link}">Ver</a>
        <a class="btn" href="${p.repo}">Repo</a>
        <span class="muted" style="margin-left:auto;">${p.year}</span>
      </div>
    </article>
  `).join('');
}


// Modal de contacto (nativo con <dialog>)
// Manejo de apertura y cierre del modal de contacto
// Añade listeners a los botones y enlaces correspondientes
// para abrir y cerrar el modal utilizando el elemento <dialog>.
// Previene el comportamiento por defecto del enlace de contacto
// para abrir el modal en su lugar.
// Utiliza showModal() y close() del elemento <dialog> para manejar la visibilidad del modal.
// Añade listeners a los elementos con id "openModal", "closeModal" y "contactLink" en el DOM.
// También añade listeners a los botones de cierre dentro del modal para cerrarlo.


const modal = document.getElementById('contactModal');
const openBtn = document.getElementById('openModal');
const closeBtn = document.getElementById('closeModal');
const contactLink = document.getElementById('contactLink');

openBtn.addEventListener('click', () => modal.showModal());
closeBtn.addEventListener('click', () => modal.close());
contactLink.addEventListener('click', (e) => { e.preventDefault(); modal.showModal(); });
document.getElementById('closeModal')?.addEventListener('click', () => modal.close());
document.getElementById('closeModal2')?.addEventListener('click', () => modal.close());

// 4) Manejo del envío (solo consola por ahora)
// Maneja el envío del formulario de contacto
// Previene el comportamiento por defecto del formulario
// Envía los datos del formulario a la API utilizando fetch
// Muestra mensajes de estado al usuario durante el proceso de envío
// Resetea el formulario y cierra el modal si el envío es exitoso
// Muestra un mensaje de error si el envío falla
// Utiliza el elemento con id "contactForm" para obtener los datos del formulario
// y el elemento con id "formStatus" para mostrar mensajes de estado al usuario.
// Utiliza JSON para enviar los datos al endpoint /contact de la API definida en la variable API.
// Añade un listener al evento 'submit' del formulario.
// Actualiza el contenido del DOM según el estado del envío.
// Utiliza async/await para manejar la operación asíncrona de envío de datos.

const form = document.getElementById('contactForm');
const statusEl = document.getElementById('formStatus');


form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = "Enviando…";
    try {
        const fd = new FormData(form);
        const payload = Object.fromEntries(fd);

        const res = await fetch(`${API}/contact`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: payload.name,
                email: payload.email,
                message: payload.message || payload.body
            }),
        });

        if (!res.ok) throw new Error("Error en envío");
        statusEl.textContent = "¡Gracias! Tu mensaje fue enviado ✅";
        form.reset();
        setTimeout(() => { statusEl.textContent = ""; modal?.close(); }, 900);
    } catch (e) {
        statusEl.textContent = "No se pudo enviar. Intentá más tarde.";
    }
});



// 5) Footer dinámico (año actual)
document.getElementById('year').textContent = new Date().getFullYear();

// ====== Header auto-ocultable ======
// Muestra u oculta el header según la dirección del scroll
// Añade una sombra al header cuando hay scroll para mejorar la visibilidad
// Utiliza la propiedad window.scrollY para detectar la posición del scroll
// y compara la posición actual con la última posición conocida para determinar
// si el usuario está scrolleando hacia arriba o hacia abajo.
// Añade o quita las clases "hide" y "scrolled" al elemento <header> según corresponda.
// Utiliza un listener en el evento 'scroll' de la ventana para manejar los cambios de scroll.
// Actualiza las variables lastScrollY y header para mantener el estado del scroll y el elemento del DOM.

const header = document.querySelector("header");
let lastScrollY = window.scrollY;

// ====== Botón "ir arriba" ======
const backToTop = document.getElementById('backToTop');

function toggleBackToTop() {
    if (window.scrollY > 300) { // aparece al bajar un poco
        backToTop?.classList.add('show');
    } else {
        backToTop?.classList.remove('show');
    }
}

function setStatus(msg) {
    const el = document.getElementById('formStatus');
    if (el) el.textContent = msg;
    else console.log(msg);
}

backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener('scroll', toggleBackToTop);
toggleBackToTop(); // estado inicial


window.addEventListener("scroll", () => {
    const currentY = window.scrollY;

    // Mostrar siempre si estamos arriba
    if (currentY < 50) {
        header.classList.remove("hide", "scrolled");
        return;
    }

    // Aplicar una leve sombra cuando hay scroll
    header.classList.add("scrolled");

    if (currentY > lastScrollY) {
        // Scrolleando hacia abajo -> ocultar
        header.classList.add("hide");
    } else {
        // Scrolleando hacia arriba -> mostrar
        header.classList.remove("hide");
    }

    lastScrollY = currentY;
});

setStatus("Enviando…");

// Inicializamos todo
renderSkills();
loadProjects();