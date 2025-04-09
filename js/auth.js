async function onTelegramAuth(user) {
    const params = new URLSearchParams(user).toString();

    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/auth/login-telegram?${params}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        const data = await response.json();

        if (response.ok && data.access_token) {
            localStorage.setItem("token", data.access_token);
            window.location.href = "profile.html"; // редирект в профиль
        } else {
            alert("Ошибка авторизации");
            console.error(data);
        }
    } catch (error) {
        alert("Ошибка сети");
        console.error(error);
    }
}
