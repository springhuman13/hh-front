// === CONSTANTS ===
const token = localStorage.getItem("token");

// === UTILS ===
const getElement = id => document.getElementById(id);
const showElement = el => el.style.display = 'flex';
const hideElement = el => el.style.display = 'none';
const toggleFormDisplay = (id, show = true) => show ? showElement(getElement(id)) : hideElement(getElement(id));

async function fetchWithAuth(url, options = {}) {
    const headers = {
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, {
        ...options,
        headers
    });

    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.json();
}

// === INIT ===
document.addEventListener("DOMContentLoaded", async () => {
    await loadProfile();
    fetchRoles();
    initSaveProfileHandler();
});

// === PROFILE ===
async function loadProfile() {
    try {
        if (!token) throw new Error('Token not found');

        const user = await fetchWithAuth(`${API_URL}/profile/me`);
        const profile = user.profile;

        getElement("profile-about-you").value = profile.bio;
        document.querySelector('.profile-name').textContent = `${profile.first_name} ${profile.last_name || ''}`.trim();
        document.querySelector('.profile-img').src = profile.photo_url || 'img/profile_photo.jpeg';

        try {
            const git = await fetchWithAuth(`${API_URL}/profile/get_git`);
            renderGit(git);
        } catch (error) {
            console.warn("GitHub профиль не найден:", error.message);
            renderGit(null);
        }

        const allInterests = await fetch(`${API_URL}/hackathons/tech_focuses/`).then(res => res.json());
        const userInterests = await fetchWithAuth(`${API_URL}/profile/get_interests`);
        renderIntersting(allInterests, userInterests);

        const certificates = await fetchWithAuth(`${API_URL}/profile/get_certificates`);
        renderCertificate(certificates);

        const userSkills = await fetchWithAuth(`${API_URL}/profile/get_skills`);
        renderUserSkills(userSkills);

        await loadMyTeams()

    } catch (err) {
        console.error('Ошибка при получении профиля', err);
        window.location.href = '/auth.html';
    }
}

function initSaveProfileHandler() {
    const roleSelect = getElement("roles-select");
    const aboutTextarea = getElement("profile-about-you");
    const saveBtn = getElement("profile-save-btn");

    const showSaveBtn = () => showElement(saveBtn);

    roleSelect.addEventListener("change", showSaveBtn);
    aboutTextarea.addEventListener("input", showSaveBtn);

    saveBtn.addEventListener("click", async () => {
        const role_id = roleSelect.value;
        const bio = aboutTextarea.value;

        try {
            await fetchWithAuth(`${API_URL}/profile/update_profile`, {
                method: "POST",
                body: JSON.stringify({ role_id, bio })
            });
            alert("Профиль обновлен!");
            hideElement(saveBtn);
        } catch (err) {
            console.error(err);
            alert("Ошибка при обновлении профиля.");
        }
    });
}

// === ROLES ===
async function fetchRoles() {
    try {
        const response = await fetch(`${API_URL}/roles/get_all/`);
        const roles = await response.json();
        renderRoles(roles);

        if (!token) throw new Error('Token not found');

        const user = await fetchWithAuth(`${API_URL}/profile/me`);
        getElement("roles-select").value = user.profile.role_id;
    } catch (err) {
        console.error('Ошибка при загрузке ролей', err);
    }
}

function renderRoles(roles) {
    const container = getElement("roles-select");
    container.innerHTML = "";
    roles.forEach(({ id = 0, name = "Без названия" }) => {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = name;
        container.appendChild(option);
    });
}

// === GIT ===
function renderGit(git) {
    const container = getElement('git-content');
    container.innerHTML = "";

    if (!git || !git.username) {
        container.innerHTML = `<p>GitHub профиль не привязан</p>`;
        return;
    }

    container.innerHTML = `
        <p><strong>Username:</strong> <a href="https://github.com/${git.username}" target="_blank">${git.username}</a></p>
        <p><strong>Repositories:</strong> ${git.public_repos}</p>
        <p><strong>Followers:</strong> ${git.followers}</p>
        <p><strong>Following:</strong> ${git.following}</p>
    `;
}

function ChangeGit() {
    toggleFormDisplay('git-form', true);
}

function CloseGit() {
    toggleFormDisplay('git-form', false);
}

async function SaveGit() {
    const git_link = getElement('git_link').value;
    try {
        await fetchWithAuth(`${API_URL}/profile/update_git`, {
            method: "POST",
            body: JSON.stringify({ git_link })
        });
        alert("Git обновлен!");
        toggleFormDisplay('git-form', false);
    } catch (err) {
        console.error(err);
        alert("Ошибка при обновлении Git.");
    }
}

// === INTERESTS ===
function renderIntersting(intersting, userInterests) {
    const selected = userInterests.map(i => i.id);
    const container = getElement("intersting");
    container.innerHTML = "";

    intersting.forEach(({ id = 0, name = "Без названия" }) => {
        const checked = selected.includes(id) ? 'checked' : '';
        const label = document.createElement("label");
        label.innerHTML = `
            <input type="checkbox" name="intersting" value="${id}" ${checked}>
            <abbr title="${name}">${name}</abbr>
        `;
        container.appendChild(label);
    });

    const chipContainer = document.querySelector('.profile-intersting-container');
    chipContainer.innerHTML = '';
    userInterests.forEach(userInterest => {
        const div = document.createElement("div");
        div.className = "profile-intersting-item";
        div.textContent = userInterest.name;
        chipContainer.appendChild(div);
    });
}

async function SaveIntersting() {
    const checked = Array.from(document.querySelectorAll('input[name="intersting"]:checked'))
        .map(input => parseInt(input.value));

    try {
        await fetchWithAuth(`${API_URL}/profile/update_interests`, {
            method: "POST",
            body: JSON.stringify({ interests: checked })
        });
        toggleFormDisplay('profile-intersting-form', false);
        await loadProfile();
    } catch (err) {
        console.error('Ошибка при сохранении интересов', err);
    }
}

function ChangeIntersting() {
    toggleFormDisplay('profile-intersting-form', true);
    fetchIntersting();
}

function CloseIntersting() {
    toggleFormDisplay('profile-intersting-form', false);
}

// === SKILLS ===
async function ChangeSkills() {
    toggleFormDisplay('form-checklist', true);

    const roleId = 1; // фиксированный id роли
    const response = await fetch(`${API_URL}/roles/get_checklist_for_role/${roleId}`);
    const allChecklists = await response.json();

    const userSkills = await fetchWithAuth(`${API_URL}/profile/get_skills`);
    const selectedSkillIds = userSkills.map(skill => skill.id);

    renderSkillsChecklist(allChecklists, selectedSkillIds);
}

function renderSkillsChecklist(checklists, selectedIds) {
    const container = getElement('form-checklist-details');
    container.innerHTML = "";

    checklists.forEach(checklist => {
        const details = document.createElement('details');
        const summary = document.createElement('summary');
        summary.textContent = checklist.name;
        details.appendChild(summary);

        checklist.points.forEach(point => {
            const p = document.createElement('p');
            const checked = selectedIds.includes(point.id) ? 'checked' : '';
            p.innerHTML = `
                <label>
                    <input type="checkbox" value="${point.id}" ${checked}>
                    ${point.description}
                </label>
            `;
            details.appendChild(p);
        });

        container.appendChild(details);
    });
}

async function createCLForm() {
    const checkedSkillIds = Array.from(document.querySelectorAll('#form-checklist-details input[type="checkbox"]:checked'))
        .map(cb => parseInt(cb.value));

    try {
        await fetchWithAuth(`${API_URL}/profile/update_skills`, {
            method: "POST",
            body: JSON.stringify({ skills: checkedSkillIds })
        });

        alert("Навыки обновлены!");
        toggleFormDisplay('form-checklist', false);
        await loadProfile();
    } catch (error) {
        console.error('Ошибка при сохранении навыков:', error);
    }
}

function closeCLForm() {
    toggleFormDisplay('form-checklist', false);
}

function renderUserSkills(skills) {
    const container = document.querySelector('.skills-container');
    container.innerHTML = "";

    skills.forEach(skill => {
        const div = document.createElement('div');
        div.className = "skills-item";
        div.textContent = skill.name;
        container.appendChild(div);
    });
}

// === CERTIFICATE ===

document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("certificateFile");
    if (fileInput) {
        fileInput.addEventListener("change", async function () {
            const formData = new FormData();
            formData.append("file", this.files[0]);

            try {
                const res = await fetchWithAuth(`${API_URL}/profile/upload_certificate`, {
                    method: "POST",
                    body: formData
                });

                alert("Файл успешно загружен!");

                this.value = "";
            } catch (err) {
                console.error("Ошибка при загрузке файла:", err);
                alert("Ошибка при загрузке файла.");
            }
        });
    }
});

function renderCertificate(certificates) {
    const container = getElement("certificate-list");
    container.innerHTML = "";
    certificates.forEach(({ original_filename, download_url}) => {
        if (download_url.startsWith('http://')) {
            download_url = download_url.replace('http://', 'https://');
        }
        const ol = document.createElement("ol");
        ol.innerHTML = `
            <a href="${download_url}" target="_blank" download="${original_filename}">${original_filename}</a>
        `;
        container.appendChild(ol);
    });
}


//  === TEAMS ===
async function loadMyTeams() {
    try {
        const response = await fetch(`${API_URL}/team/get_my_teams`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error(`Ошибка: ${response.status}`);

        const teams = await response.json();
        renderTeams(teams);
    } catch (error) {
        console.error(error);
        alert("Ошибка при загрузке ваших команд.");
    }
}

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
                btn.onclick = () => {openTMModal(member)};
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

function openTMModal(member) {
    const modal = getElement("tm-modal");
    const modalTitle = getElement("tm-modal-title");
    const modalText = getElement("tm-modal-text");

    modalTitle.textContent = "";
    modalText.innerHTML = "";

    const name = extractTelegramUsername(member.user_tg);
    modalTitle.textContent = member.role_name;
    modalText.innerHTML = `
        <p><a href="https://hahackathon.ru.tuna.am/view_profile.html?id=${member.user_id}" target="_blank">Профиль</a></p>
        <p>Контакты: <a href="${member.user_tg}" target="_blank">@${name}</a></p>
    `;
    modal.style.display = "block";
}

document.querySelector(".close-modal").addEventListener("click", () => {
    getElement("tm-modal").style.display = "none";
});

window.addEventListener("click", (event) => {
    const modal = getElement("tm-modal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
});