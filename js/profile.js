// === CONSTANTS ===
const token = localStorage.getItem("token");

// === UTILS ===
function getElement(id) {
    return document.getElementById(id);
}

function showElement(el) {
    el.style.display = 'block';
}

function hideElement(el) {
    el.style.display = 'none';
}

function toggleFormDisplay(id, show = true) {
    const form = getElement(id);
    show ? showElement(form) : hideElement(form);
}

async function fetchWithAuth(url, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    };

    if (body) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
    }

    const res = await fetch(url, options);
    if (!res.ok) throw new Error('Request failed');
    return await res.json();
}

// === ROLES ===
async function fetchRoles() {
    const response = await fetch(`${API_URL}/roles/get_all/`);
    const roles = await response.json();
    renderRoles(roles);

    if (!token) throw new Error('Token not found');

    const user = await fetchWithAuth(`${API_URL}/profile/me`);
    getElement("roles-select").value = user.profile.role_id;
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

// === PROFILE ===
document.addEventListener("DOMContentLoaded", async () => {
    await loadProfile();
    fetchRoles();

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
            await fetchWithAuth(`${API_URL}/profile/update_profile`, "POST", { role_id, bio });
            alert("Профиль обновлен!");
            hideElement(saveBtn);
        } catch (err) {
            console.error(err);
            alert("Ошибка при обновлении профиля.");
        }
    });
});

//  === загрузка профиля ===
async function loadProfile() {
    try {
        if (!token) throw new Error('Token not found');

        const user = await fetchWithAuth(`${API_URL}/profile/me`);
        const profile = user.profile;

        getElement("profile-about-you").value = profile.bio;
        document.querySelector('.profile-name').textContent = `${profile.first_name} ${profile.last_name || ''}`.trim();
        document.querySelector('.profile-img').src = profile.photo_url || 'img/profile_photo.jpeg';

        const git = await fetchWithAuth(`${API_URL}/profile/get_git`);
        const git_container = getElement('git-content');

        console.log(git)

        git_container.innerHTML = `
            <p><strong>Username:</strong><a href="https://github.com/${git.username}">${git.username}</a></p>
            <p><strong>Repositories:</strong> ${git.public_repos}</p>
            <p><strong>Followers:</strong> ${git.followers}</p>
            <p><strong>Following:</strong> ${git.following}</p>
        `;

    } catch (err) {
        console.error('Ошибка при получении профиля', err);
        // window.location.href = '/index.html'; // можно временно закомментить
    }
}

// === INTERESTING ===
async function fetchIntersting() {
    const response = await fetch(`${API_URL}/hackathons/tech_focuses/`);
    const intersting = await response.json();
    renderIntersting(intersting);
}

function renderIntersting(intersting) {
    const container = getElement("intersting");
    container.innerHTML = "";
    intersting.forEach(({ id = 0, name = "Без названия" }) => {
        const label = document.createElement("label");
        label.innerHTML = `<input type="checkbox" name="intersting" value="${id}"><abbr title="${name}">${name}</abbr>`;
        container.appendChild(label);
    });
}

function ChangeIntersting() {
    toggleFormDisplay('profile-intersting-form', true);
    fetchIntersting();
}

function SaveIntersting() {
    toggleFormDisplay('profile-intersting-form', false);
}

function CloseIntersting() {
    toggleFormDisplay('profile-intersting-form', false);
}

// === GIT ===
function ChangeGit() {
    toggleFormDisplay('git-form', true);
}

async function SaveGit() {

    const git_link = getElement('git_link').value;
    try {
        await fetchWithAuth(`${API_URL}/profile/update_git`, "POST", { git_link });
        alert("Git обновлен!");
    } catch (err) {
        console.error(err);
        alert("Ошибка при обновлении Git.");
    }
    toggleFormDisplay('git-form', false);
}

function CloseGit() {
    toggleFormDisplay('git-form', false);
}

