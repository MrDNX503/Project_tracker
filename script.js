let projects = JSON.parse(localStorage.getItem('projects')) || [];
let editingIndex = null;

const addBtn = document.getElementById('add-btn');
const modal = document.getElementById('modal');
const projectForm = document.getElementById('project-form');
const projectsContainer = document.getElementById('projects-container');
const themeToggle = document.getElementById('theme-toggle');
const closeModal = document.getElementById('close-modal');

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

function loadProjects() {
    projects.sort((a, b) => b.progress - a.progress);
    
    projectsContainer.innerHTML = '';
    projects.forEach((project, index) => {
        const card = document.createElement('div');
        card.classList.add('project-card');
        // Manejar fechas vacías o inválidas
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

projectForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const projectData = {
        name: document.getElementById('name').value,
        description: document.getElementById('description').value,
        status: document.getElementById('status').value,
        progress: document.getElementById('progress').value,
        startDate: document.getElementById('start-date').value || '', // Vacío si no se define
        endDate: document.getElementById('end-date').value || ''      // Vacío si no se define
    };

    if (editingIndex !== null) {
        projects[editingIndex] = projectData;
        editingIndex = null;
        document.querySelector('#project-form button[type="submit"]').textContent = 'Guardar';
    } else {
        projects.push(projectData);
    }

    localStorage.setItem('projects', JSON.stringify(projects));
    loadProjects();
    projectForm.reset();
    modal.classList.add('hidden');
});

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

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    themeToggle.textContent = document.body.classList.contains('dark-theme') ? 'Cambiar Tono' : 'Cambiar Tono';
});


loadProjects();