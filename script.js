    async function fetchHackathons() {
        const response = await fetch("http://127.0.0.1:8000/hackathons/hackathons/");
        const hackathons = await response.json();
        renderHackathons(hackathons);
    }

    function renderHackathons(hackathons) {
        const container = document.querySelector(".hackathons-container");
        container.innerHTML = "";
        hackathons.forEach((hackathon) => {
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
                <a href=${hackathon.link}><img src=${hackathon.img}></a>
                <div class=card-text>
                    <a href=${hackathon.link}><h2>${hackathon.title}</h2></a>
                    <p>${hackathon.place}</p>
                    <p><strong>Дата: </strong>${hackathon.dates}</p>
                    <p><strong>Организатор: </strong>${hackathon.organizers}</p>
                    <p><strong>Технологический фокус: </strong>${hackathon.tech_focus}</p>
                </div>
                <a href="#" class="btn-find-team">
                    <img src="img/find_team.svg" alt="Иконка команды">
                    Найти команду
                </a>
            `;
            container.appendChild(card);
        });
    }

    document.addEventListener("DOMContentLoaded", fetchHackathons);
