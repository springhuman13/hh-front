let currentNotifications = [];

function extractTelegramUsername(url) {
    if (!url) return '';
    url = url.trim();
    if (url.startsWith('https://t.me/')) {
        return url.replace('https://t.me/', '');
    }
    if (url.startsWith('t.me/')) {
        return url.replace('t.me/', '');
    }
    return url;
}

// === Загрузка профиля ===
document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        const response = await fetch(`${API_URL}/profile/me`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Не удалось получить профиль");

        const user = await response.json();

        const avatar = document.getElementById("profile-avatar");
        if (user.profile.photo_url) {
            avatar.src = user.profile.photo_url;
        } else {
            avatar.src = "img/profile_photo.png";
        }

        document.getElementById("profile-link").href = "profile.html";

    } catch (error) {
        console.error("Ошибка при загрузке профиля:", error);
        if (error.message.includes("401")) {
            localStorage.removeItem("token");
        }
    }

    await fetchNotifications();
});

// === Загрузка уведомлений ===
async function fetchNotifications() {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${API_URL}/notification/get_all`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (response.ok) {
            currentNotifications = await response.json();
            renderNotifications(currentNotifications);
        }
    } catch (error) {
        console.error("Ошибка получения уведомлений:", error);
    }
}

function renderNotifications(notifications) {
    const container = document.getElementById("notifications-container");
    container.innerHTML = "";

    if (notifications.length === 0) {
        container.innerHTML = `<div class="no-notifications">Нет уведомлений</div>`;
        updateNotificationCount(0);
        return;
    }

    notifications.forEach(notif => {
        const div = document.createElement("div");
        div.className = "notification-item";
        div.innerHTML = `
            <img src="img/notif.svg">
            <p>${notif.message}</p>
        `;
        div.addEventListener("click", () => openNotificationModal(notif));
        container.appendChild(div);
    });

    updateNotificationCount(notifications.filter(n => !n.is_read).length);
}

function updateNotificationCount(count) {
    const countElement = document.getElementById("notification-count");
    countElement.textContent = count > 0 ? count : "";
}

// === Открытие/закрытие popup уведомлений ===
document.querySelector(".notification").addEventListener("click", () => {
    document.getElementById("notifications-popup").classList.toggle("show");
    fetchNotifications();
});

window.addEventListener("click", (event) => {
    const popup = document.getElementById("notifications-popup");
    const notificationButton = document.querySelector(".notification");

    if (popup.classList.contains("show") && !popup.contains(event.target) && !notificationButton.contains(event.target)) {
        popup.classList.remove("show");
    }
});

// === Работа с модальным окном ===
function openNotificationModal(notification) {
    const modal = document.getElementById("notification-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalText = document.getElementById("modal-text");

    modalTitle.textContent = "";
    modalText.innerHTML = "";

    if (notification.type === "application") {
        modalTitle.textContent = "Заявка на вступление";
        modalText.innerHTML = `
            <p>${notification.message}</p>
            <p><a href="${notification.link}">Профиль пользователя</a></p>
            <div class="notif-actions">
                <button class="accept-btn-modal" data-id="${notification.application_id}">Принять</button>
                <button class="decline-btn-modal" data-id="${notification.application_id}">Отклонить</button>
            </div>
        `;
    } else if (notification.type === "decline") {
        modalTitle.textContent = "Уведомление";
        modalText.innerHTML = `
            <p>${notification.message}</p>
        `;
    } else {
        const name = extractTelegramUsername(notification.link);
        modalTitle.textContent = "Уведомление";
        modalText.innerHTML = `
            <p>${notification.message}</p>
            ${notification.link ? `<p>Контакты: <a href="${notification.link}" target="_blank">@${name}</a></p>` : ""}
        `;
    }


    modal.style.display = "block";

    setTimeout(() => {
        document.querySelectorAll(".accept-btn-modal").forEach(btn => {
            btn.addEventListener("click", () => handleAccept(btn.dataset.id));
        });

        document.querySelectorAll(".decline-btn-modal").forEach(btn => {
            btn.addEventListener("click", () => handleDecline(btn.dataset.id));
        });
    }, 0);
}

// Закрытие модалки
document.querySelector(".close-modal").addEventListener("click", () => {
    document.getElementById("notification-modal").style.display = "none";
});

window.addEventListener("click", (event) => {
    const modal = document.getElementById("notification-modal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

// === Принятие / Отклонение заявок ===
async function handleAccept(notificationId) {
    const token = localStorage.getItem("token");
    if (!confirm("Вы уверены, что хотите принять заявку?")) return;

    try {
        const response = await fetch(`${API_URL}/application/accept`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ application_id: notificationId })
        });

        if (response.ok) {
            alert("Участник принят!");
            currentNotifications = currentNotifications.filter(n => n.id !== Number(notificationId));
            renderNotifications(currentNotifications);
            document.getElementById("notification-modal").style.display = "none";
        } else {
            const error = await response.json();
            alert("Ошибка: " + error.detail);
        }
    } catch (error) {
        console.error(error);
        alert("Ошибка сети");
    }
}

async function handleDecline(notificationId) {
    const token = localStorage.getItem("token");
    if (!confirm("Вы уверены, что хотите отклонить заявку?")) return;

    try {
        const response = await fetch(`${API_URL}/application/decline`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ application_id: notificationId })
        });

        if (response.ok) {
            alert("Заявка отклонена!");
            currentNotifications = currentNotifications.filter(n => n.id !== Number(notificationId));
            renderNotifications(currentNotifications);
            document.getElementById("notification-modal").style.display = "none";
        } else {
            const error = await response.json();
            alert("Ошибка: " + error.detail);
        }
    } catch (error) {
        console.error(error);
        alert("Ошибка сети");
    }
}
