// Mensajes motivacionales
const motivationalMessages = [
    "El viaje de mil millas comienza con un solo paso. - Lao Tsé",
    "No es la carga lo que te pesa, sino cómo la llevas. - Proverbio chino",
    "Cada gran obra comienza con un pequeño sueño. - Ancestral",
    "El éxito es la suma de pequeños esfuerzos repetidos día tras día. - Proverbio",
    "Siembra hoy, y cosecharás mañana. - Sabiduría antigua"
];

// Función para mostrar un mensaje aleatorio
function showWelcomeMessage() {
    const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
    const message = motivationalMessages[randomIndex];
    alert(message);
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Limpia localStorage si contiene Pruebas SQL (por compatibilidad con versiones antiguas)
    if (localStorage.getItem('projects') && JSON.parse(localStorage.getItem('projects')).some(p => p.name === "Pruebas SQL")) {
        localStorage.removeItem('projects');
    }

    let projects = JSON.parse(localStorage.getItem('projects')) || [];
    let editingIndex = null;

    const addBtn = document.getElementById('add-btn');
    const modal = document.getElementById('modal');
    const projectForm = document.getElementById('project-form');
    const projectsContainer = document.getElementById('projects-container');
    const themeToggle = document.getElementById('theme-toggle');
    const closeModal = document.getElementById('close-modal');
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');

    // Verifica que los elementos existan
    if (!addBtn || !modal || !projectForm || !projectsContainer || !themeToggle || !closeModal || !exportBtn || !importBtn) {
        console.error('Uno o más elementos del DOM no se encontraron');
        return;
    }

    addBtn.addEventListener('click', () => {
        modal.classList.toggle('hidden');
        if (editingIndex === null) {
            projectForm.reset();
            document.querySelector('#project-form button[type="submit"]').textContent = 'Guardar';
        }
    });

    closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
        projectForm.reset();
        editingIndex = null;
        document.querySelector('#project-form button[type="submit"]').textContent = 'Guardar';
    });

    projectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const projectData = {
            name: document.getElementById('name').value,
            description: document.getElementById('description').value,
            status: document.getElementById('status').value,
            progress: document.getElementById('progress').value,
            startDate: document.getElementById('start-date').value || '',
            endDate: document.getElementById('end-date').value || ''
        };

        if (editingIndex !== null) {
            projects[editingIndex] = projectData;
            editingIndex = null;
            document.querySelector('#project-form button[type="submit"]').textContent = 'Guardar';
        } else {
            projects.push(projectData);
            if (projectData.progress == 100) {
                showWelcomeMessage();
            }
        }

        localStorage.setItem('projects', JSON.stringify(projects));
        loadProjects();
        projectForm.reset();
        modal.classList.add('hidden');
    });

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        themeToggle.textContent = document.body.classList.contains('dark-theme') ? 'Cambiar Tono' : 'Cambiar Tono';
    });

    exportBtn.addEventListener('click', async () => {
        const projectsData = JSON.parse(localStorage.getItem('projects')) || [];
        if (projectsData.length === 0) {
            alert('No hay proyectos para exportar.');
            return;
        }
        const jsonString = JSON.stringify(projectsData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'projects-tracker.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('Proyectos exportados como projects-tracker.json');
    });

    importBtn.addEventListener('click', async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (!file) return;
            try {
                const text = await file.text();
                const importedProjects = JSON.parse(text);
                if (!Array.isArray(importedProjects)) {
                    throw new Error('El archivo no contiene una lista válida de proyectos.');
                }
                const validProjects = importedProjects.filter(project =>
                    project.name && project.description && project.status && project.progress !== undefined
                );
                projects = validProjects;
                localStorage.setItem('projects', JSON.stringify(projects));
                loadProjects();
                alert('Proyectos importados con éxito.');
            } catch (error) {
                alert('Error al importar: ' + error.message);
            }
        });
        input.click();
    });

    function loadProjects() {
        projects.sort((a, b) => b.progress - a.progress);
        projectsContainer.innerHTML = '';
        projects.forEach((project, index) => {
            const card = document.createElement('div');
            card.classList.add('project-card');
            const startDate = project.startDate ? new Date(project.startDate) : null;
            const endDate = project.endDate ? new Date(project.endDate) : null;
            let duration = '';
            if (startDate && endDate && !isNaN(startDate) && !isNaN(endDate)) {
                duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
                duration = `${duration} días`;
            } else {
                duration = 'No definida';
            }
            card.innerHTML = `
                <h3>${project.name}</h3>
                <p><strong>Descripción:</strong> ${project.description}</p>
                <p><strong>Estado:</strong> ${project.status}</p>
                <p><strong>Progreso:</strong> ${project.progress}%</p>
                <p><strong>Inicio:</strong> ${project.startDate || 'No definida'}</p>
                <p><strong>Fin:</strong> ${project.endDate || 'No definida'}</p>
                <p><strong>Duración:</strong> ${duration}</p>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${project.progress}%"></div>
                </div>
                <div class="actions">
                    <button class="edit-btn" onclick="editProject(${index})">Editar</button>
                    <button class="delete-btn" onclick="deleteProject(${index})">Eliminar</button>
                </div>
            `;
            projectsContainer.appendChild(card);
        });
    }

    function editProject(index) {
        editingIndex = index;
        const project = projects[index];
        document.getElementById('name').value = project.name;
        document.getElementById('description').value = project.description;
        document.getElementById('status').value = project.status;
        document.getElementById('progress').value = project.progress;
        document.getElementById('start-date').value = project.startDate || '';
        document.getElementById('end-date').value = project.endDate || '';
        modal.classList.remove('hidden');
        document.querySelector('#project-form button[type="submit"]').textContent = 'Actualizar';
    }

    function deleteProject(index) {
        projects.splice(index, 1);
        localStorage.setItem('projects', JSON.stringify(projects));
        loadProjects();
    }

    // Inicialización
    loadProjects();
    showWelcomeMessage();
});