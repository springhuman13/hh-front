//  ##ROLES##




//  ##INTERSTING##


async function fetchIntersting() {
    const response = await fetch(`${API_URL}/hackathons/tech_focuses/`);
    const intersting = await response.json();
    renderIntersting(intersting);
}

function renderIntersting(intersting){
    const container = document.getElementById("intersting");
    container.innerHTML = "";
    intersting.forEach((tech_focus) => {
        
        const {
            id = 0,
            name = "Без названия",
        } = tech_focus;

        const label = document.createElement("label");
        
        label.innerHTML = `
                <input type="checkbox" name="intersting" value="${id}"><abbr title="${name}">${name}</abbr>
            `;
        container.appendChild(label);
    });
}

function ChangeIntersting(){
    var form = document.getElementById('profile-intersting-form');
    form.style.display = 'flex';
    fetchIntersting();
}

function SaveIntersting(){
    var form = document.getElementById('profile-intersting-form');
    form.style.display = 'none';
}

function CloseIntersting(){
    var form = document.getElementById('profile-intersting-form');
    form.style.display = 'none';
}

//  ##GIT##

function ChangeGit(){
    var form = document.getElementById('git-form');
    form.style.display = 'flex';
}

function SaveGit(){
    var form = document.getElementById('git-form');
    form.style.display = 'none';
}

function CloseGit(){
    var form = document.getElementById('git-form');
    form.style.display = 'none';
}


// ##PROFILE##

window.addEventListener('DOMContentLoaded', async () => {
    await loadProfile();  // Загружаем данные пользователя
});

// Получение профиля пользователя
async function loadProfile() {
    try {
        const token = localStorage.getItem("token");  // Получаем JWT из localStorage

        if (!token) {
            throw new Error('Token not found');
        }

        const res = await fetch(`${API_URL}/profile/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`  // Добавляем токен в заголовок
            }
        });

        if (!res.ok) throw new Error('Unauthorized');
        const user = await res.json();

        console.log(user)

        // Вставляем имя
        document.querySelector('.profile-name').textContent = `${user.profile.first_name} ${user.profile.last_name || ''}`.trim();

        // Аватарка
        const avatarUrl = user.profile.photo_url || 'img/profile_photo.jpeg';
        document.querySelector('.profile-img').src = avatarUrl;

        // TODO: Добавить вставку интересов, роли, GIT и т.д.
        // Например:
        // populateGit(user.github);
        // populateInterests(user.interests);
        // document.querySelector('#role').value = user.role;

    } catch (err) {
        console.error('Ошибка при получении профиля', err);
        //window.location.href = '/index.html'; // редирект, если не авторизован
    }
}