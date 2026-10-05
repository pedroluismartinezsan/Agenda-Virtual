/* ==========================================================
   AGENDA VIRTUAL - PEDRO LEÓN
========================================================== */

let events = JSON.parse(
    localStorage.getItem("agendaEvents")
) || [];

let currentDate = new Date();
let selectedDate = formatDate(new Date());

/* ==========================================================
   ELEMENTOS
========================================================== */

const calendar = document.getElementById("calendar");
const monthTitle = document.getElementById("monthTitle");

const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");

const eventList = document.getElementById("eventList");
const selectedDateTitle =
    document.getElementById("selectedDateTitle");

const modal = document.getElementById("modal");
const addBtn = document.getElementById("addBtn");
const closeModal = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");

const eventForm =
    document.getElementById("eventForm");

const deleteBtn =
    document.getElementById("deleteBtn");

const todayBtn =
    document.getElementById("todayBtn");

/* ==========================================================
   INICIO
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderCalendar();
        renderEvents();
        updateCounters();

    }
);

/* ==========================================================
   FECHAS
========================================================== */

function formatDate(date) {

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function todayString() {
    return formatDate(new Date());
}

/* ==========================================================
   CALENDARIO
========================================================== */

function renderCalendar() {

    calendar.innerHTML = "";

    const year =
        currentDate.getFullYear();

    const month =
        currentDate.getMonth();

    const firstDay =
        new Date(year, month, 1);

    const lastDay =
        new Date(year, month + 1, 0);

    const startDay =
        (firstDay.getDay() + 6) % 7;

    const totalDays =
        lastDay.getDate();

    monthTitle.textContent =
        new Intl.DateTimeFormat(
            "es-CO",
            {
                month: "long",
                year: "numeric"
            }
        ).format(currentDate);

    // Vacíos

    for (let i = 0; i < startDay; i++) {

        const empty =
            document.createElement("div");

        calendar.appendChild(empty);
    }

    // Días

    for (let day = 1; day <= totalDays; day++) {

        const date =
            new Date(year, month, day);

        const dateStr =
            formatDate(date);

        const cell =
            document.createElement("div");

        cell.className = "day";

        cell.textContent = day;

        if (dateStr === todayString()) {
            cell.classList.add("today");
        }

        if (dateStr === selectedDate) {
            cell.classList.add("selected");
        }

        if (
            events.some(
                e => e.date === dateStr
            )
        ) {
            cell.classList.add(
                "has-events"
            );
        }

        cell.addEventListener(
            "click",
            () => {

                selectedDate = dateStr;

                renderCalendar();
                renderEvents();

            }
        );

        calendar.appendChild(cell);
    }

}

/* ==========================================================
   EVENTOS
========================================================== */

function renderEvents() {

    const dateFormatted =
        new Intl.DateTimeFormat(
            "es-CO",
            {
                weekday: "long",
                day: "numeric",
                month: "long"
            }
        ).format(
            new Date(selectedDate)
        );

    selectedDateTitle.textContent =
        dateFormatted;

    const dayEvents =
        events
            .filter(
                e => e.date === selectedDate
            )
            .sort((a, b) =>
                a.time.localeCompare(b.time)
            );

    eventList.innerHTML = "";

    if (dayEvents.length === 0) {

        eventList.innerHTML = `
            <div class="empty">
                No hay compromisos
            </div>
        `;

        return;
    }

    dayEvents.forEach(event => {

        const card =
            document.createElement("div");

        card.className =
            `event-card priority-${event.priority.toLowerCase()}`;

        card.innerHTML = `
            <div class="event-top">

                <div>

                    <h3 class="event-title">
                        ${event.title}
                    </h3>

                    <div class="event-meta">
                        🕒 ${event.time}
                        <br>
                        📍 ${event.location || "Sin lugar"}
                    </div>

                    <div class="event-category">
                        ${event.category}
                    </div>

                </div>

                <div class="event-time">
                    ${event.priority}
                </div>

            </div>
        `;

        card.addEventListener(
            "click",
            () => editEvent(event.id)
        );

        eventList.appendChild(card);

    });

}

/* ==========================================================
   CONTADORES
========================================================== */

function updateCounters() {

    const today = todayString();

    const todayEvents =
        events.filter(
            e => e.date === today
        );

    const high =
        events.filter(
            e => e.priority === "Alta"
        );

    document.getElementById(
        "todayCount"
    ).textContent =
        todayEvents.length;

    document.getElementById(
        "todayHeroCount"
    ).textContent =
        todayEvents.length;

    document.getElementById(
        "upcomingCount"
    ).textContent =
        events.length;

    document.getElementById(
        "highCount"
    ).textContent =
        high.length;
}

/* ==========================================================
   MODAL
========================================================== */

function openModal() {

    modal.classList.remove("hidden");
}

function closeModalFunc() {

    modal.classList.add("hidden");

    eventForm.reset();

    document.getElementById(
        "eventId"
    ).value = "";

    deleteBtn.classList.add(
        "hidden"
    );
}

/* ==========================================================
   BOTONES
========================================================== */

addBtn.addEventListener(
    "click",
    () => {

        eventForm.reset();

        document.getElementById(
            "eventDate"
        ).value = selectedDate;

        openModal();

    }
);

closeModal.addEventListener(
    "click",
    closeModalFunc
);

cancelBtn.addEventListener(
    "click",
    closeModalFunc
);

todayBtn.addEventListener(
    "click",
    () => {

        currentDate = new Date();

        selectedDate = todayString();

        renderCalendar();
        renderEvents();

    }
);

prevMonth.addEventListener(
    "click",
    () => {

        currentDate.setMonth(
            currentDate.getMonth() - 1
        );

        renderCalendar();
    }
);

nextMonth.addEventListener(
    "click",
    () => {

        currentDate.setMonth(
            currentDate.getMonth() + 1
        );

        renderCalendar();
    }
);

/* ==========================================================
   GUARDAR
========================================================== */

eventForm.addEventListener(
    "submit",
    e => {

        e.preventDefault();

        const id =
            document.getElementById(
                "eventId"
            ).value;

        const data = {

            id: id || Date.now(),

            title:
                document.getElementById(
                    "eventTitle"
                ).value,

            date:
                document.getElementById(
                    "eventDate"
                ).value,

            time:
                document.getElementById(
                    "eventTime"
                ).value,

            location:
                document.getElementById(
                    "eventLocation"
                ).value,

            category:
                document.getElementById(
                    "eventCategory"
                ).value,

            priority:
                document.getElementById(
                    "eventPriority"
                ).value,

            notes:
                document.getElementById(
                    "eventNotes"
                ).value

        };

        if (id) {

            const index =
                events.findIndex(
                    e => e.id == id
                );

            events[index] = data;

        } else {

            events.push(data);
        }

        saveEvents();

        closeModalFunc();

    }
);

/* ==========================================================
   EDITAR
========================================================== */

function editEvent(id) {

    const event =
        events.find(
            e => e.id == id
        );

    if (!event) return;

    document.getElementById(
        "eventId"
    ).value = event.id;

    document.getElementById(
        "eventTitle"
    ).value = event.title;

    document.getElementById(
        "eventDate"
    ).value = event.date;

    document.getElementById(
        "eventTime"
    ).value = event.time;

    document.getElementById(
        "eventLocation"
    ).value = event.location;

    document.getElementById(
        "eventCategory"
    ).value = event.category;

    document.getElementById(
        "eventPriority"
    ).value = event.priority;

    document.getElementById(
        "eventNotes"
    ).value = event.notes;

    deleteBtn.classList.remove(
        "hidden"
    );

    openModal();
}

/* ==========================================================
   ELIMINAR
========================================================== */

deleteBtn.addEventListener(
    "click",
    () => {

        const id =
            document.getElementById(
                "eventId"
            ).value;

        if (
            confirm(
                "¿Eliminar compromiso?"
            )
        ) {

            events =
                events.filter(
                    e => e.id != id
                );

            saveEvents();

            closeModalFunc();
        }

    }
);

/* ==========================================================
   GUARDAR LOCAL
========================================================== */

function saveEvents() {

    localStorage.setItem(
        "agendaEvents",
        JSON.stringify(events)
    );

    renderCalendar();
    renderEvents();
    updateCounters();
}
