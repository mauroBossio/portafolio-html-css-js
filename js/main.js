
// 1) Datos simples: array de skills y de proyectos (JSON mínimo)
const skills = ["HTML", "CSS", "JavaScript (básico)", "Python (básico)"];

const projects = [
    {
        title: "Landing simple",
        description: "Página estática con HTML y CSS responsivo.",
        tags: ["HTML", "CSS"],
        year: "2025",
        link: "#",
        repo: "#"
    },
    {
        title: "Mini calculadora",
        description: "Pequeña app JS con eventos y DOM.",
        tags: ["JavaScript"],
        year: "2025",
        link: "#",
        repo: "#"
    },
    {
        title: "Dashboard básico",
        description: "Maquetado de tarjetas + tipografías.",
        tags: ["HTML", "CSS"],
        year: "2024",
        link: "#",
        repo: "#"
    }
];

// 2) Render simple de skills y proyectos
function renderSkills() {
    const $skills = document.getElementById('skills');
    $skills.innerHTML = skills.map(s => `<span class="pill">${s}</span>`).join('');
}

function renderProjects() {
    const $grid = document.getElementById('projects');
    $grid.innerHTML = projects.map(p => `
        <article class="card">
          <h3>${p.title}</h3>
          <p class="muted">${p.description}</p>
          <div class="tags">${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
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
form.addEventListener('submit', (e) => {
    e.preventDefault(); // prevenimos cierre automático del dialog
    const data = Object.fromEntries(new FormData(form));
    console.log("[Simulación de envío] Datos del formulario:", data);
    alert("¡Gracias! (Por ahora solo simulamos el envío y registramos en consola)");
    form.reset();
    modal.close();
});

// 5) Footer dinámico (año actual)
document.getElementById('year').textContent = new Date().getFullYear();

// Inicializamos todo
renderSkills();
renderProjects();