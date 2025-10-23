
// 1) Datos simples: array de skills y de proyectos (JSON mínimo)
const skills = ["HTML", "CSS", "JavaScript (básico)", "Python (básico)"];
const API = "http://localhost:4000/api";



let projects = []; // ahora vacío
let searchQuery = "";

// Carga los proyectos desde el JSON


async function loadProjects() {
    try {
        const res = await fetch(`${API}/projects`);
        if (!res.ok) throw new Error("Error al cargar proyectos");
        projects = await res.json();
        renderFilters();   // reconstruye la barra de filtros
        renderProjects();  // muestra la grilla
    } catch (err) {
        console.error(err);
        document.getElementById("projects").innerHTML =
            `<div class="empty">Error cargando proyectos 😞</div>`;
    }
}

// === Filtros por tags ===
const ALL = "Todos";
let activeTag = ALL;

function getAllTags() {
    // Une todos los arrays de tags y quita repetidos
    const tags = projects.flatMap(p => p.tags || []);
    return [ALL, ...Array.from(new Set(tags))];
}

function renderFilters() {
    const $filters = document.getElementById('filters');
    const tags = getAllTags();

    $filters.innerHTML = tags.map(tag => `
    <button class="filter-btn ${tag === activeTag ? 'active' : ''}" data-tag="${tag}">
      ${tag}
    </button>
  `).join('');

    // Listeners por cada botón
    $filters.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            activeTag = btn.dataset.tag;
            renderFilters();   // vuelve a pintar para actualizar "active"
            renderProjects();  // muestra proyectos filtrados
        });
    });
}

// === Buscador por texto ===
const $search = document.getElementById('search');
const $clearSearch = document.getElementById('clearSearch');

function normalize(txt) {
    return (txt || "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

// (Opcional) pequeño debounce para no re-renderizar en cada tecla
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



// 2) Render simple de skills y proyectos
function renderSkills() {
    const $skills = document.getElementById('skills');
    $skills.innerHTML = skills.map(s => `<span class="pill">${s}</span>`).join('');
}

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


// 3) Modal de contacto (nativo con <dialog>)
const modal = document.getElementById('contactModal');
const openBtn = document.getElementById('openModal');
const closeBtn = document.getElementById('closeModal');
const contactLink = document.getElementById('contactLink');

openBtn.addEventListener('click', () => modal.showModal());
closeBtn.addEventListener('click', () => modal.close());
contactLink.addEventListener('click', (e) => { e.preventDefault(); modal.showModal(); });

// 4) Manejo del envío (solo consola por ahora)
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

        if (res.ok) {
            statusEl.textContent = "¡Gracias! Tu mensaje fue enviado ✅";
            form.reset();
            setTimeout(() => { statusEl.textContent = ""; modal?.close(); }, 900);
        } else {
            const info = await res.json().catch(() => null);
            statusEl.textContent = info?.error || "No se pudo enviar. Probá más tarde.";
        }
    } catch {
        statusEl.textContent = "Error de red. Verificá tu conexión.";
    }
});


// 5) Footer dinámico (año actual)
document.getElementById('year').textContent = new Date().getFullYear();

// ====== Header auto-ocultable ======
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



// Inicializamos todo
renderSkills();
loadProjects();