/* ==========================================================
   AGENDA VIRTUAL · PEDRO LEÓN
   Agenda + LocalStorage + Notificaciones
========================================================== */


/* ==========================================================
   CONFIGURACIÓN
========================================================== */

const STORAGE_KEY = "agendaEvents";
const NOTIFIED_KEY = "agendaNotified";

const REMINDER_MINUTES = 30;


/* ==========================================================
   VARIABLES
========================================================== */

let events = JSON.parse(
    localStorage.getItem(STORAGE_KEY)
) || [];

let notifiedEvents = JSON.parse(
    localStorage.getItem(NOTIFIED_KEY)
) || {};

let currentDate = new Date();

let selectedDate =
    formatDate(new Date());


/* ==========================================================
   ELEMENTOS
========================================================== */

const calendar =
    document.getElementById("calendar");

const monthTitle =
    document.getElementById("monthTitle");

const prevMonth =
    document.getElementById("prevMonth");

const nextMonth =
    document.getElementById("nextMonth");

const eventList =
    document.getElementById("eventList");

const selectedDateTitle =
    document.getElementById(
        "selectedDateTitle"
    );

const modal =
    document.getElementById("modal");

const addBtn =
    document.getElementById("addBtn");

const closeModal =
    document.getElementById("closeModal");

const cancelBtn =
    document.getElementById("cancelBtn");

const eventForm =
    document.getElementById("eventForm");

const deleteBtn =
    document.getElementById("deleteBtn");

const todayBtn =
    document.getElementById("todayBtn");

const notificationBtn =
    document.getElementById(
        "notificationBtn"
    );


/* ==========================================================
   INICIO
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateHeroDate();

        renderCalendar();

        renderEvents();

        updateCounters();

        requestNotificationPermission();

        checkReminders();

        /*
         * Revisar recordatorios cada minuto.
         */

        setInterval(
            checkReminders,
            60 * 1000
        );

    }
);


/* ==========================================================
   FECHAS
========================================================== */

function formatDate(date) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function todayString() {

    return formatDate(
        new Date()
    );

}


/* ==========================================================
   FECHA DEL ENCABEZADO
========================================================== */

function updateHeroDate() {

    const heroDate =
        document.getElementById(
            "heroDate"
        );

    if (!heroDate) return;

    heroDate.textContent =
        new Intl.DateTimeFormat(
            "es-CO",
            {
                weekday: "long",
                day: "numeric",
                month: "long"
            }
        ).format(
            new Date()
        );

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
        new Date(
            year,
            month,
            1
        );

    const lastDay =
        new Date(
            year,
            month + 1,
            0
        );

    /*
     * Convertimos domingo=0
     * a lunes=0
     */

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
        ).format(
            currentDate
        );


    /*
     * Espacios antes del día 1
     */

    for (
        let i = 0;
        i < startDay;
        i++
    ) {

        const empty =
            document.createElement("div");

        calendar.appendChild(
            empty
        );

    }


    /*
     * Días
     */

    for (
        let day = 1;
        day <= totalDays;
        day++
    ) {

        const date =
            new Date(
                year,
                month,
                day
            );

        const dateStr =
            formatDate(date);

        const cell =
            document.createElement(
                "div"
            );

        cell.className = "day";

        cell.textContent = day;


        /*
         * Hoy
         */

        if (
            dateStr ===
            todayString()
        ) {

            cell.classList.add(
                "today"
            );

        }


        /*
         * Día seleccionado
         */

        if (
            dateStr ===
            selectedDate
        ) {

            cell.classList.add(
                "selected"
            );

        }


        /*
         * Hay eventos
         */

        if (
            events.some(
                event =>
                    event.date ===
                    dateStr
            )
        ) {

            cell.classList.add(
                "has-events"
            );

        }


        cell.addEventListener(
            "click",
            () => {

                selectedDate =
                    dateStr;

                renderCalendar();

                renderEvents();

            }
        );


        calendar.appendChild(
            cell
        );

    }

}


/* ==========================================================
   EVENTOS DEL DÍA
========================================================== */

function renderEvents() {

    const date =
        new Date(
            `${selectedDate}T12:00:00`
        );


    selectedDateTitle.textContent =
        new Intl.DateTimeFormat(
            "es-CO",
            {
                weekday: "long",
                day: "numeric",
                month: "long"
            }
        ).format(
            date
        );


    const dayEvents =
        events
            .filter(
                event =>
                    event.date ===
                    selectedDate
            )
            .sort(
                (a, b) =>
                    a.time.localeCompare(
                        b.time
                    )
            );


    eventList.innerHTML = "";


    if (
        dayEvents.length === 0
    ) {

        eventList.innerHTML = `
            <div class="empty">
                No hay compromisos
                programados para este día.
            </div>
        `;

        return;

    }


    dayEvents.forEach(
        event => {

            const card =
                document.createElement(
                    "div"
                );


            const priority =
                (
                    event.priority ||
                    "Media"
                ).toLowerCase();


            card.className =
                `event-card priority-${priority}`;


            const reminderHTML =
                event.reminder !== false
                    ? `
                        <span
                          class="event-reminder"
                          title="Recordatorio 30 minutos antes"
                        >
                          🔔 30 min
                        </span>
                      `
                    : "";


            card.innerHTML = `

                <div class="event-top">

                    <div>

                        <h3 class="event-title">
                            ${escapeHTML(
                                event.title
                            )}
                        </h3>

                        <div class="event-meta">

                            🕒
                            ${escapeHTML(
                                event.time
                            )}

                            <br>

                            📍
                            ${escapeHTML(
                                event.location ||
                                "Sin lugar"
                            )}

                        </div>

                        <div class="event-category">

                            ${escapeHTML(
                                event.category
                            )}

                        </div>

                        ${reminderHTML}

                    </div>

                    <div class="event-priority">

                        ${escapeHTML(
                            event.priority
                        )}

                    </div>

                </div>

            `;


            card.addEventListener(
                "click",
                () => {

                    editEvent(
                        event.id
                    );

                }
            );


            eventList.appendChild(
                card
            );

        }
    );

}


/* ==========================================================
   CONTADORES
========================================================== */

function updateCounters() {

    const today =
        todayString();


    const todayEvents =
        events.filter(
            event =>
                event.date ===
                today
        );


    const high =
        events.filter(
            event =>
                event.priority ===
                "Alta"
        );


    const upcoming =
        events.filter(
            event => {

                const date =
                    new Date(
                        `${event.date}T${event.time}`
                    );

                return date >=
                    new Date();

            }
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
        upcoming.length;


    document.getElementById(
        "highCount"
    ).textContent =
        high.length;

}


/* ==========================================================
   MODAL
========================================================== */

function openModal() {

    modal.classList.remove(
        "hidden"
    );

}


function closeModalFunc() {

    modal.classList.add(
        "hidden"
    );

    eventForm.reset();


    document.getElementById(
        "eventId"
    ).value = "";


    document.getElementById(
        "eventReminder"
    ).checked = true;


    deleteBtn.classList.add(
        "hidden"
    );


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Nuevo compromiso";

}


/* ==========================================================
   NUEVO EVENTO
========================================================== */

addBtn.addEventListener(
    "click",
    () => {

        eventForm.reset();


        document.getElementById(
            "eventId"
        ).value = "";


        document.getElementById(
            "eventDate"
        ).value =
            selectedDate;


        document.getElementById(
            "eventReminder"
        ).checked =
            true;


        document.getElementById(
            "modalTitle"
        ).textContent =
            "Nuevo compromiso";


        deleteBtn.classList.add(
            "hidden"
        );


        openModal();

    }
);


/* ==========================================================
   CERRAR MODAL
========================================================== */

closeModal.addEventListener(
    "click",
    closeModalFunc
);


cancelBtn.addEventListener(
    "click",
    closeModalFunc
);


/* ==========================================================
   CAMBIAR MES
========================================================== */

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
   BOTÓN HOY
========================================================== */

todayBtn.addEventListener(
    "click",
    () => {

        currentDate =
            new Date();

        selectedDate =
            todayString();

        renderCalendar();

        renderEvents();

    }
);


/* ==========================================================
   GUARDAR EVENTO
========================================================== */

eventForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const id =
            document.getElementById(
                "eventId"
            ).value;


        const reminder =
            document.getElementById(
                "eventReminder"
            ).checked;


        const data = {

            id:
                id ||
                String(
                    Date.now()
                ),

            title:
                document.getElementById(
                    "eventTitle"
                ).value.trim(),

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
                ).value.trim(),

            category:
                document.getElementById(
                    "eventCategory"
                ).value,

            priority:
                document.getElementById(
                    "eventPriority"
                ).value,

            reminder: reminder,

            reminderMinutes:
                REMINDER_MINUTES,

            notes:
                document.getElementById(
                    "eventNotes"
                ).value.trim()

        };


        if (id) {

            const index =
                events.findIndex(
                    item =>
                        String(item.id) ===
                        String(id)
                );


            if (index !== -1) {

                /*
                 * Si cambia la fecha/hora,
                 * permitimos un nuevo aviso.
                 */

                const oldEvent =
                    events[index];


                if (
                    oldEvent.date !==
                    data.date ||
                    oldEvent.time !==
                    data.time
                ) {

                    delete notifiedEvents[
                        notificationKey(data)
                    ];

                    saveNotificationState();

                }


                events[index] =
                    data;

            }

        } else {

            events.push(data);

        }


        saveEvents();

        closeModalFunc();

    }
);


/* ==========================================================
   EDITAR EVENTO
========================================================== */

function editEvent(id) {

    const event =
        events.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!event) return;


    document.getElementById(
        "eventId"
    ).value =
        event.id;


    document.getElementById(
        "eventTitle"
    ).value =
        event.title;


    document.getElementById(
        "eventDate"
    ).value =
        event.date;


    document.getElementById(
        "eventTime"
    ).value =
        event.time;


    document.getElementById(
        "eventLocation"
    ).value =
        event.location || "";


    document.getElementById(
        "eventCategory"
    ).value =
        event.category;


    document.getElementById(
        "eventPriority"
    ).value =
        event.priority;


    document.getElementById(
        "eventReminder"
    ).checked =
        event.reminder !== false;


    document.getElementById(
        "eventNotes"
    ).value =
        event.notes || "";


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Editar compromiso";


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
            !confirm(
                "¿Deseas eliminar este compromiso?"
            )
        ) {

            return;

        }


        events =
            events.filter(
                event =>
                    String(event.id) !==
                    String(id)
            );


        /*
         * Eliminar también el
         * registro del recordatorio.
         */

        Object.keys(
            notifiedEvents
        ).forEach(
            key => {

                if (
                    key.includes(
                        String(id)
                    )
                ) {

                    delete notifiedEvents[
                        key
                    ];

                }

            }
        );


        saveNotificationState();

        saveEvents();

        closeModalFunc();

    }
);


/* ==========================================================
   LOCAL STORAGE
========================================================== */

function saveEvents() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(events)
    );


    renderCalendar();

    renderEvents();

    updateCounters();

}


function saveNotificationState() {

    localStorage.setItem(
        NOTIFIED_KEY,
        JSON.stringify(
            notifiedEvents
        )
    );

}


/* ==========================================================
   NOTIFICACIONES
========================================================== */

async function requestNotificationPermission() {

    if (
        !("Notification" in window)
    ) {

        console.log(
            "Este navegador no soporta notificaciones."
        );

        return;

    }


    /*
     * No molestamos automáticamente
     * si ya existe una decisión.
     */

    if (
        Notification.permission ===
        "granted"
    ) {

        return;

    }


    if (
        Notification.permission ===
        "denied"
    ) {

        return;

    }

}


/* ==========================================================
   BOTÓN DE NOTIFICACIONES
========================================================== */

notificationBtn.addEventListener(
    "click",
    async () => {

        if (
            !("Notification" in window)
        ) {

            alert(
                "Este navegador no permite notificaciones."
            );

            return;

        }


        if (
            Notification.permission ===
            "granted"
        ) {

            alert(
                "Las notificaciones ya están activadas."
            );

            return;

        }


        const permission =
            await Notification.requestPermission();


        if (
            permission ===
            "granted"
        ) {

            notificationBtn.textContent =
                "🔔";

            alert(
                "Notificaciones activadas correctamente."
            );


            /*
             * Revisamos inmediatamente.
             */

            checkReminders();

        } else {

            alert(
                "Las notificaciones no fueron activadas."
            );

        }

    }
);


/* ==========================================================
   COMPROBAR RECORDATORIOS
========================================================== */

function checkReminders() {

    if (
        !("Notification" in window)
    ) {

        return;

    }


    if (
        Notification.permission !==
        "granted"
    ) {

        return;

    }


    const now =
        new Date();


    events.forEach(
        event => {

            if (
                event.reminder === false
            ) {

                return;

            }


            if (
                !event.date ||
                !event.time
            ) {

                return;

            }


            const eventDate =
                new Date(
                    `${event.date}T${event.time}:00`
                );


            const reminderDate =
                new Date(
                    eventDate.getTime() -
                    (
                        REMINDER_MINUTES *
                        60 *
                        1000
                    )
                );


            /*
             * Ventana de comprobación:
             *
             * desde el momento del recordatorio
             * hasta 1 minuto después.
             */

            const difference =
                now.getTime() -
                reminderDate.getTime();


            const oneMinute =
                60 * 1000;


            if (
                difference >= 0 &&
                difference <= oneMinute
            ) {

                sendReminder(
                    event
                );

            }

        }
    );

}


/* ==========================================================
   ENVIAR RECORDATORIO
========================================================== */

async function sendReminder(event) {

    const key =
        notificationKey(event);


    /*
     * Evitar duplicados.
     */

    if (
        notifiedEvents[key]
    ) {

        return;

    }


    notifiedEvents[key] =
        true;


    saveNotificationState();


    const title =
        "🔔 Compromiso en 30 minutos";


    const body =
        `${event.title}` +
        ` · ${event.time}` +
        (
            event.location
                ? ` · ${event.location}`
                : ""
        );


    /*
     * Si tenemos Service Worker,
     * intentamos mostrar la notificación
     * mediante él.
     */

    if (
        "serviceWorker" in navigator
    ) {

        try {

            const registration =
                await navigator
                    .serviceWorker
                    .ready;


            await registration.showNotification(
                title,
                {
                    body: body,

                    icon:
                        "icons/icon-192.png",

                    badge:
                        "icons/icon-192.png",

                    tag:
                        `agenda-${event.id}`,

                    renotify: true,

                    data: {
                        eventId:
                            event.id
                    }

                }
            );


            return;

        } catch (error) {

            console.error(
                "Error en notificación:",
                error
            );

        }

    }


    /*
     * Alternativa.
     */

    try {

        new Notification(
            title,
            {
                body: body
            }
        );

    } catch (error) {

        console.error(
            error
        );

    }

}


/* ==========================================================
   CLAVE ÚNICA DE NOTIFICACIÓN
========================================================== */

function notificationKey(event) {

    return `${event.id}-${event.date}-${event.time}`;

}


/* ==========================================================
   SEGURIDAD
========================================================== */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


/* ==========================================================
   SERVICE WORKER
========================================================== */

if (
    "serviceWorker" in navigator
) {

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
                .register(
                    "sw.js"
                )
                .then(
                    registration => {

                        console.log(
                            "Service Worker registrado:",
                            registration.scope
                        );

                    }
                )
                .catch(
                    error => {

                        console.error(
                            "Error Service Worker:",
                            error
                        );

                    }
                );

        }
    );

}
