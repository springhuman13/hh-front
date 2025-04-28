// === CONSTANTS ===
const token = localStorage.getItem("token");

// === UTILS ===
const getElement = id => document.getElementById(id);

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// === BUTTONS ===
function openTeamForm() {
    if (!token) {
        window.location.href = "auth.html";
        return;
    }

    var form = document.getElementById('form-create-team');
    form.style.display = 'flex';

    setTimeout(() => {
        form.classList.add('show');
    }, 10);
}
function closeTeamForm() {
    var form = document.getElementById('form-create-team');
    form.classList.remove('show');
    setTimeout(() => {
        form.style.display = 'none';
    }, 300);
}
document.getElementById("create-team-btn").addEventListener("click", createTeam);

// === FORM CHECKLIST ===
const checklistDataByRole = {};
function openCLForm(id) {
    var form = document.getElementById('form-checklist');
    form.style.display = 'flex';
    role = getElement(id).value

    setTimeout(() => fetchCL(), 0);

    async function fetchCL() {
        const response = await fetch(`${API_URL}/roles/get_checklist_for_role/${role}`);
        const cls = await response.json();
        renderCL(cls);
    }
    
    function renderCL(cls) {
        const container = getElement("form-checklist-details");
        container.innerHTML = "";
        checklistDataByRole[id] = [];
    
        cls.forEach((cl) => {
            const { checklist_id = 0, name = "", points = [] } = cl;
            const details = document.createElement("details");
            container.appendChild(details);

            const summary = document.createElement("summary");
            summary.textContent = name;
            details.appendChild(summary);
            
            points.forEach((point) => {
                const { id: pointId = 0, description = "Без названия" } = point;
                const p = document.createElement("p");
                p.innerHTML = `
                    <input type="number" min="1" max="5" step="1" value="1" data-weight-checklist-id="${pointId}">
                    <label><input type="checkbox" data-checklist-id="${pointId}">${description}</label>
                `;
                details.appendChild(p);

                const weightInput = p.querySelector(`[data-weight-checklist-id="${pointId}"]`);
                const checkbox = p.querySelector(`[data-checklist-id="${pointId}"]`);

                const updateData = () => {
                    const existing = checklistDataByRole[id].find(item => item.checklist_point_id === pointId);
                    if (checkbox.checked) {
                        if (!existing) {
                            checklistDataByRole[id].push({
                                checklist_point_id: pointId,
                                weight: parseInt(weightInput.value),
                            });
                        } else {
                            existing.weight = parseInt(weightInput.value);
                        }
                    } else if (existing) {
                        checklistDataByRole[id] = checklistDataByRole[id].filter(item => item.checklist_point_id !== pointId);
                    }
                };

                checkbox.addEventListener('change', updateData);
                weightInput.addEventListener('change', updateData);
            });
        });
    }
}
function closeCLForm() {
    document.getElementById('form-checklist').style.display = 'none';
}
function createCLForm() {
    document.getElementById('form-checklist').style.display = 'none';
}

// === ROLES ===
async function fetchRoles() {
    const response = await fetch(`${API_URL}/roles/get_all/`);
    const roles = await response.json();
    renderRolesSelect(roles);
    renderRolesCheckbox(roles);
}
function renderRolesSelect(roles) {
    const containers = document.getElementsByClassName("form-roles-select");
    Array.from(containers).forEach((container) => {
        container.innerHTML = "";
        const free = document.createElement("option");
        free.value = 0;
        free.textContent = "Не добавлять";
        container.appendChild(free);
        roles.forEach(({ id = 0, name = "Без названия" }) => {
            const option = document.createElement("option");
            option.value = id;
            option.textContent = name;
            container.appendChild(option);
        });
    });
}
function renderRolesCheckbox(roles) {
    const container = getElement("roles-checkbox");
    container.innerHTML = "";
    roles.forEach(({ id = 0, name = "Без названия" }) => {
        const label = document.createElement("label");
        label.innerHTML = `
            <input type="checkbox" name="roles" value="${id}"><abbr title="${name}">${name}</abbr>
        `;
        container.appendChild(label);
    });
}

// === CITIES ===
async function fetchCities() {
    const response = await fetch(`${API_URL}/cities/get_all/`);
    const cities = await response.json();
    renderCitiesSelect(cities);
    renderCitiesCheckbox(cities);
}
function renderCitiesSelect(cities) {
    const container = getElement("form-city-select");
    container.innerHTML = "";
    cities.forEach(({ id = 0, name = "Без названия" }) => {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = name;
        container.appendChild(option);
    });
}
function renderCitiesCheckbox(cities) {
    const container = getElement("cities-checkbox");
    container.innerHTML = "";
    cities.forEach(({ id = 0, name = "Без названия" }) => {
        const label = document.createElement("label");
        label.innerHTML = `
            <input type="checkbox" name="cities" value="${id}"><abbr title="${name}">${name}</abbr>
        `;
        container.appendChild(label);
    });
}


// === HACKATHONS ===
async function fetchHackathons() {
    const response = await fetch(`${API_URL}/hackathons/hackathons/`);
    const hackathons = await response.json();
    renderHackathonsSelect(hackathons);
    renderHackathonsCheckbox(hackathons);
    const hackathonFromUrl = getQueryParam('hackathon');
    if (hackathonFromUrl) {
        const checkbox = document.querySelector(`#hackathons-checkbox input[value="${hackathonFromUrl}"]`);
        if (checkbox) {
            checkbox.checked = true;
        }
    }
}
function renderHackathonsSelect(hackathons) {
    const container = getElement("form-hackathon-select");
    container.innerHTML = "";
    hackathons.forEach(({ id = 0, name = "Без названия" }) => {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = name;
        container.appendChild(option);
    });
}
function renderHackathonsCheckbox(hackathons) {
    const container = getElement("hackathons-checkbox");
    container.innerHTML = "";
    hackathons.forEach(({ id = 0, name = "Без названия" }) => {
        const label = document.createElement("label");
        label.innerHTML = `
            <input type="checkbox" name="hackathons" value="${id}"><abbr title="${name}">${name}</abbr>
        `;
        container.appendChild(label);
    });
}

// === FORM CREATION HANDLER ===
async function createTeam() {
    const name = getElement("name").value;
    const hackathonId = getElement("form-hackathon-select").value;
    const cityId = getElement("form-city-select").value;
    const description = getElement("form-description").value;

    const roles = [];
    const roleElements = document.querySelectorAll(".form-roles-select");

    roleElements.forEach((selectEl) => {
        const selectId = selectEl.id;
        const roleId = parseInt(selectEl.value);
        if (!roleId) return;

        const checklist = checklistDataByRole[selectId] || [];
        roles.push({
            role_id: roleId,
            checklist: checklist
        });
    });

    const payload = { name, hackathon_id: hackathonId, city_id: cityId, description, roles };

    try {
        const response = await fetch(`${API_URL}/team/create_team`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.json();
            alert("Ошибка при создании команды: " + error.detail);
            return;
        }

        const result = await response.json();
        alert("Команда успешно создана!");
        document.getElementById('form-create-team').style.display = 'none';
    } catch (error) {
        console.error("Ошибка:", error);
        alert("Произошла ошибка при создании команды.");
    }
}

// === RENDERING TEAMS ===
function renderTeams(teams) {
    const container = getElement("teams-container");
    container.innerHTML = "";

    if (!teams.length) {
        container.innerHTML = `<div class="empty-message">Команды не найдены :(</div>`;
        return;
    }

    teams.forEach(team => {
        const teamCard = document.createElement("div");
        teamCard.className = "teams-card";

        const memberButtons = team.members.map(member => {
            const btn = document.createElement("button");
            const img = document.createElement("img");
            img.title = member.role_name;
        
            if (member.user_id) {
                img.src = `img/role_taken/${member.role_id}.svg`;
            } else {
                img.src = `img/role_free/${member.role_id}.svg`;
                btn.onclick = () => {
                    if (confirm("Подать заявку на вступление в команду?")) {
                        sendApplication(member.id);
                    }
                };
            }
        
            btn.appendChild(img);
            return btn;
        });        

        teamCard.innerHTML = `
            <div class="team-name">
                <p>${team.name}</p>
            </div>
            <div class="team-info">
                <p><strong>Хакатон: </strong><a href="${team.hackathon_website}" target="_blank">${team.hackathon_name}</a></p>
                <p><strong>Город: </strong>${team.city_name}</p>
                <p>${team.description}</p>
            </div>
        `;

        const membersDiv = document.createElement("div");
        membersDiv.className = "team-members";
        memberButtons.forEach(btn => membersDiv.appendChild(btn));

        teamCard.appendChild(membersDiv);
        container.appendChild(teamCard);
    });
}

// === LOAD TEAMS INITIALLY ===
async function loadTeams() {
    try {
        const response = await fetch(`${API_URL}/team/get_filtered`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
                sort: 1,
                name: null,
                city: [],
                hackathon: [],
                role: []
            })
        });
        if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
        const teams = await response.json();
        renderTeams(teams);
    } catch (error) {
        console.error(error);
    }
}

// === FILTER TEAMS ===
async function applyTeamFilters() {
    const filters = {
        sort: parseInt(getElement('sort-select').value),
        name: null,
        city: [],
        hackathon: [],
        role: []
    };

    const searchInput = document.querySelector('.search-hackathon input[name="search"]');
    if (searchInput.value.trim()) {
        filters.name = searchInput.value.trim();
    }

    document.querySelectorAll('#cities-checkbox input:checked').forEach(cb => filters.city.push(Number(cb.value)));
    document.querySelectorAll('#hackathons-checkbox input:checked').forEach(cb => filters.hackathon.push(Number(cb.value)));
    document.querySelectorAll('#roles-checkbox input:checked').forEach(cb => filters.role.push(Number(cb.value)));

    if (!filters.name) delete filters.name;

    try {
        const response = await fetch(`${API_URL}/team/get_filtered`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            },
            body: JSON.stringify(filters)
        });

        if (!response.ok) throw new Error(`Ошибка: ${response.status}`);

        const data = await response.json();
        renderTeams(data);
    } catch (error) {
        console.error(error);
    }
}

// === SEND APPLICATION ===
async function sendApplication(teamMemberId) {
    try {
        const response = await fetch(`${API_URL}/application/submit`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ team_member_id: teamMemberId })
        });

        if (response.ok) {
            alert("Заявка отправлена!");
        } else {
            const error = await response.json();
            alert("Ошибка при отправке заявки: " + error.error);
        }
    } catch (error) {
        console.error(error);
        alert("Ошибка сети.");
    }
}


// === EVENT LISTENERS ===
document.addEventListener("DOMContentLoaded", async () => {
    await fetchCities();
    await fetchRoles();
    await fetchHackathons();
    applyTeamFilters();
});

document.querySelector('.filter-section').addEventListener('change', event => {
    if (event.target.matches('.filter-content input, #sort-select')) {
        applyTeamFilters();
    }
});
document.querySelector('.search-hackathon form').addEventListener('submit', event => {
    event.preventDefault();
    applyTeamFilters();
});

function resetFilters(event) {
    event.preventDefault();
    document.querySelectorAll('.filter-content input').forEach(cb => cb.checked = false);
    document.querySelector('#sort-select').value = '0';
    document.querySelector('.search-hackathon input[name="search"]').value = '';
    applyTeamFilters();
}
