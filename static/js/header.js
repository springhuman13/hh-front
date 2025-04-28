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

        if (user.profile.photo_url) {
            document.getElementById("profile-avatar").src = user.profile.photo_url;
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

});

