async function fetchHackathons() {
    const response = await fetch("http://127.0.0.1:8000/hackathons/hackathons/");
    const hackathons = await response.json();
    renderHackathons(hackathons);
}

async function fetchOrganizers() {
    const response = await fetch("http://127.0.0.1:8000/hackathons/organizers/");
    const organizers = await response.json();
    renderOrganizers(organizers);
}

async function fetchTechFocuses() {
    const response = await fetch("http://127.0.0.1:8000/hackathons/tech_focuses/");
    const tech_focuses = await response.json();
    renderTechFocuses(tech_focuses);
}

function renderHackathons(hackathons) {
    const container = document.querySelector(".hackathons-container");
    container.innerHTML = "";
    hackathons.forEach((hackathon) => {
        
        const {
            name = "Без названия",
            online = false,
            website = "#",
            image = "img/placeholder.png",
            dates = "Дата не указана",
            place = "Место не указано",
            organizers = [],
            tech_focuses = []
        } = hackathon;

        const organizerNames = organizers.map(org => org.name).join(", ");
        const techFocusNames = tech_focuses.map(tf => tf.name).join(", ");

        const card = document.createElement("div");
        card.className = "card";
        
        card.innerHTML = `
                <a href=${website}><img src=${image}></a>
                <div class=card-text>
                    <a href=${website}><h2>${name}</h2></a>
                    <p>${place}</p>
                    <p><strong>Дата: </strong>${dates}</p>
                    <p><strong>Организатор: </strong>${organizerNames}</p>
                    <p><strong>Технологический фокус: </strong>${techFocusNames}</p>
                </div>
                <a href="teams.html" class="btn-find-team">
                    <img src="img/find_team.svg" alt="Иконка команды">
                    Найти команду
                </a>
            `;
        container.appendChild(card);
    });
}

function renderOrganizers(organizers){
    const container = document.getElementById("org");
    container.innerHTML = "";
    organizers.forEach((organizer) => {
        
        const {
            id = 0,
            name = "Без названия",
        } = organizer;

        const label = document.createElement("label");
        
        label.innerHTML = `
                <input type="checkbox" name="organizers" value="${id}"><abbr title="${name}">${name}</abbr>
            `;
        container.appendChild(label);
    });
}

function renderTechFocuses(tech_focuses){
    const container = document.getElementById("tf");
    container.innerHTML = "";
    tech_focuses.forEach((tech_focus) => {
        
        const {
            id = 0,
            name = "Без названия",
        } = tech_focus;

        const label = document.createElement("label");
        
        label.innerHTML = `
                <input type="checkbox" name="tech_focuses" value="${id}"><abbr title="${name}">${name}</abbr>
            `;
        container.appendChild(label);
    });
}

document.addEventListener("DOMContentLoaded", fetchHackathons);
document.addEventListener("DOMContentLoaded", fetchOrganizers);
document.addEventListener("DOMContentLoaded", fetchTechFocuses);

async function applyFilters() {
    const filters = {
        online: null,
        organizers: [],
        tech_focuses: []
    };

    const onlineCheckbox = document.querySelector('.online input');
    if (onlineCheckbox.checked) {
        filters.online = true;
    }

    document.querySelectorAll('#org input:checked').forEach(cb => {
        filters.organizers.push(cb.value);
    });

    document.querySelectorAll('#tf input:checked').forEach(cb => {
        filters.tech_focuses.push(cb.value);
    });

    if (filters.organizers.length === 0) delete filters.organizers;
    if (filters.tech_focuses.length === 0) delete filters.tech_focuses;
    if (filters.online === null) delete filters.online;

    const response = await fetch('http://127.0.0.1:8000/hackathons/get-filtered/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(filters)
    });

    if (response.ok) {
        const data = await response.json();
        renderHackathons(data); // функция, которая перерисовывает карточки
    } else {
        console.error('Ошибка при получении данных:', response.status);
    }
}

document.querySelector('.filter-section').addEventListener('change', (event) => {
    if (event.target.matches('.filter-content input, .online input')) {
        applyFilters();
    }
});

function resetFilters(event) {
    event.preventDefault();
    document.querySelectorAll('.filter-content input, .online input').forEach(cb => {
        cb.checked = false;
    });

    applyFilters();
}

async function handleSearch(event) {
    event.preventDefault();
    const searchQuery = document.getElementById('search-input').value.trim();

    if (searchQuery) {
        const response = await fetch('http://127.0.0.1:8000/hackathons/get-filtered/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: searchQuery })
        });

        const data = await response.json();
        renderHackathons(data); 
    } else {
        const response = await fetch('http://127.0.0.1:8000/hackathons/hackathons/', {
            method: 'GET',
        });

        const data = await response.json();
        renderHackathons(data);
    }
}