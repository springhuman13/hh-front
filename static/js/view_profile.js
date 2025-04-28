// === UTILS ===
const getElement = id => document.getElementById(id);

// === INIT ===
document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');

    if (!userId) {
        alert('Пользователь не найден');
        window.location.href = "index.html";
        return;
    }

    await loadUserProfile(userId);
});

// === LOAD USER PROFILE ===
async function loadUserProfile(userId) {
    try {
        const response = await fetch(`${API_URL}/profile/${userId}`);
        if (!response.ok) throw new Error("Не удалось получить профиль");

        const profile = await response.json();

        getElement("profile-about-you").textContent = profile.bio || "Нет описания";
        getElement("role").textContent = profile.role_name
        document.querySelector('.profile-name').textContent = `${profile.first_name} ${profile.last_name || ''}`.trim();
        document.querySelector('.profile-img').src = profile.photo_url || 'img/profile_photo.jpeg';


        if (profile.git) {
            getElement('git-content').innerHTML = `
                <p><strong>Username:</strong> <a href="https://github.com/${profile.git.username}">${profile.git.username}</a></p>
                <p><strong>Repositories:</strong> ${profile.git.public_repos}</p>
                <p><strong>Followers:</strong> ${profile.git.followers}</p>
                <p><strong>Following:</strong> ${profile.git.following}</p>
            `;
        } else {
            getElement('git-content').innerHTML = `<p>Git профиль отсутствует</p>`;
        }

        renderInterests(profile.interests);
        renderSkills(profile.skills);
        renderCertificates(profile.certificates);

    } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
        alert("Ошибка загрузки профиля");
    }
}

function renderInterests(interests) {
    const container = document.querySelector('.profile-intersting-container');
    container.innerHTML = "";

    if (interests.length === 0) {
        container.innerHTML = `<p>Интересы не указаны</p>`;
        return;
    }

    interests.forEach(interest => {
        const div = document.createElement("div");
        div.className = "profile-intersting-item";
        div.textContent = interest.name;
        container.appendChild(div);
    });
}

function renderSkills(skills) {
    const container = document.querySelector('.skills-container');
    container.innerHTML = "";

    if (skills.length === 0) {
        container.innerHTML = `<p>Навыки не указаны</p>`;
        return;
    }

    skills.forEach(skill => {
        const div = document.createElement('div');
        div.className = "skills-item";
        div.textContent = skill.description;
        container.appendChild(div);
    });
}

function renderCertificates(certificates) {
    const container = getElement("certificate-list");
    container.innerHTML = "";

    if (certificates.length === 0) {
        container.innerHTML = `<p>Нет сертификатов</p>`;
        return;
    }

    certificates.forEach(cert => {
        const li = document.createElement("li");
        li.innerHTML = `<a href="${cert.download_url}" target="_blank">${cert.original_filename}</a>`;
        container.appendChild(li);
    });
}
