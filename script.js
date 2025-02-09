    async function fetchHackathons() {
        const response = await fetch("http://127.0.0.1:8000/hackathons/hackathons/");
        const hackathons = await response.json();
        renderHackathons(hackathons);
    }

    function renderHackathons(hackathons) {
        const container = document.querySelector(".hackathons-container");
        container.innerHTML = ""; // Очистить контейнер
        hackathons.forEach((hackathon) => {
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
                <h2>${hackathon.title}</h2>
                <p>${hackathon.description}</p>
                <p>${hackathon.link}</p>
            `;
            container.appendChild(card);
        });
    }

    document.addEventListener("DOMContentLoaded", fetchHackathons);
