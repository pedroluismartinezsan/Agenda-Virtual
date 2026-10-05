// ==========================================
// AGENDA DEL DIPUTADO DEL QUINDÍO
// ==========================================

const STORAGE_KEY = "agenda_diputado_quindio_v1";

let events = loadEvents();

let currentDate = new Date();

let selectedDate = new Date();

let editingId = null;


// ==========================================
// ELEMENTOS
// ==========================================

const calendar = document.getElementById("calendar");
const monthTitle = document.getElementById("monthTitle");
const eventList = document.getElementById("eventList");
const selectedDateTitle = document.getElementById("selectedDateTitle");

const modal = document.getElementById("modal");
const eventForm = document.getElementById("eventForm");

const eventId = document.getElementById("eventId");
const eventTitle = document.getElementById("eventTitle");
const eventDate = document.getElementById("eventDate");
const eventTime = document.getElementById("eventTime");
const eventLocation = document.getElementById("eventLocation");
const eventCategory = document.getElementById("eventCategory");
const eventPriority = document.getElementById("eventPriority");
const eventNotes = document.getElementById("eventNotes");

const deleteBtn = document.getElementById("deleteBtn");


// ==========================================
// INICIO
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

  selectedDate = new Date();

  renderCalendar();

  renderEvents();

  updateSummary();

  setupInstallPrompt();

});


// ==========================================
// ALMACENAMIENTO
// ==========================================

function loadEvents() {

  try {

    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) {
      return [];
    }

    return JSON.parse(data);

  } catch (error) {

    console.error("No se pudieron cargar los eventos:", error);

    return [];

  }

}


function saveEvents() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(events)
  );

}


// ==========================================
// FECHAS
// ==========================================

function dateToKey(date) {

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;

}


function keyToDate(key) {

  const [year, month, day] =
    key.split("-").map(Number);

  return new Date(
    year,
    month - 1,
    day
  );

}


function isToday(date) {

  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );

}


function formatLongDate(date) {

  return new Intl.DateTimeFormat(
    "es-CO",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }
  ).format(date);

}


function formatTime(time) {

  if (!time) return "";

  const [hours, minutes] =
    time.split(":").map(Number);

  const date = new Date();

  date.setHours(hours, minutes);

  return new Intl.DateTimeFormat(
    "es-CO",
    {
      hour: "numeric",
      minute: "2-digit"
    }
  ).format(date);

}


// ==========================================
// CALENDARIO
// ==========================================

function renderCalendar() {

  calendar.innerHTML = "";

  const year = currentDate.getFullYear();

  const month = currentDate.getMonth();

  const monthName = new Intl.DateTimeFormat(
    "es-CO",
    { month: "long" }
  ).format(currentDate);

  monthTitle.textContent =
    `${monthName} ${year}`;


  let firstDay = new Date(
    year,
    month,
    1
  ).getDay();

  // Convertimos domingo = 0
  // a lunes = 0
  firstDay = (firstDay + 6) % 7;


  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();


  const daysPreviousMonth =
    new Date(
      year,
      month,
      0
    ).getDate();


  // Días del mes anterior
  for (
    let i = firstDay - 1;
    i >= 0;
    i--
  ) {

    const dayNumber =
      daysPreviousMonth - i;

    const date = new Date(
      year,
      month - 1,
      dayNumber
    );

    createDay(date, true);

  }


  // Días del mes actual
  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {

    const date = new Date(
      year,
      month,
      day
    );

    createDay(date, false);

  }


  // Días siguientes
  const totalCells =
    firstDay + daysInMonth;

  const remaining =
    (7 - (totalCells % 7)) % 7;

  for (
    let day = 1;
    day <= remaining;
    day++
  ) {

    const date = new Date(
      year,
      month + 1,
      day
    );

    createDay(date, true);

  }

}


function createDay(date, otherMonth) {

  const day = document.createElement("div");

  day.className = "day";

  if (otherMonth) {
    day.classList.add("other-month");
  }

  if (isToday(date)) {
    day.classList.add("today");
  }

  if (
    dateToKey(date) ===
    dateToKey(selectedDate)
  ) {

    day.classList.add("selected");

  }


  const dateKey = dateToKey(date);

  const hasEvents =
    events.some(
      event => event.date === dateKey
    );

  if (hasEvents) {
    day.classList.add("has-events");
  }


  day.textContent =
    date.getDate();


  day.addEventListener(
    "click",
    () => {

      selectedDate = new Date(date);

      renderCalendar();

      renderEvents();

    }
  );


  calendar.appendChild(day);

}


// ==========================================
// EVENTOS
// ==========================================

function renderEvents() {

  eventList.innerHTML = "";

  const dateKey =
    dateToKey(selectedDate);


  selectedDateTitle.textContent =
    formatLongDate(selectedDate);


  const dayEvents =
    events
      .filter(event =>
        event.date === dateKey
      )
      .sort((a, b) =>
        a.time.localeCompare(b.time)
      );


  if (dayEvents.length === 0) {

    const empty =
      document.createElement("div");

    empty.className = "empty";

    empty.textContent =
      "No hay compromisos registrados para este día.";

    eventList.appendChild(empty);

    return;

  }


  dayEvents.forEach(event => {

    const card =
      document.createElement("div");

    card.className =
      `event-card priority-${event.priority.toLowerCase()}`;


    const top =
      document.createElement("div");

    top.className = "event-top";


    const title =
      document.createElement("h3");

    title.className = "event-title";

    title.textContent =
      event.title;


    const time =
      document.createElement("div");

    time.className = "event-time";

    time.textContent =
      formatTime(event.time);


    top.appendChild(title);

    top.appendChild(time);


    const meta =
      document.createElement("div");

    meta.className = "event-meta";

    meta.textContent =
      event.location
        ? `📍 ${event.location}`
        : "Sin lugar definido";


    const category =
      document.createElement("span");

    category.className =
      "event-category";

    category.textContent =
      event.category;


    card.appendChild(top);

    card.appendChild(meta);

    card.appendChild(category);


    if (event.notes) {

      const notes =
        document.createElement("div");

      notes.className = "event-meta";

      notes.textContent =
        `📝 ${event.notes}`;

      card.appendChild(notes);

    }


    card.addEventListener(
      "click",
      () => openEditModal(event.id)
    );


    eventList.appendChild(card);

  });

}


// ==========================================
// MODAL
// ==========================================

function openNewModal() {

  editingId = null;

  document.getElementById(
    "modalTitle"
  ).textContent =
    "Agregar actividad";


  eventForm.reset();

  eventId.value = "";

  eventDate.value =
    dateToKey(selectedDate);

  eventPriority.value = "Media";

  deleteBtn.classList.add("hidden");

  modal.classList.remove("hidden");

  setTimeout(
    () => eventTitle.focus(),
    100
  );

}


function openEditModal(id) {

  const event =
    events.find(
      item => item.id === id
    );

  if (!event) return;

  editingId = id;

  document.getElementById(
    "modalTitle"
  ).textContent =
    "Editar actividad";


  eventId.value = event.id;

  eventTitle.value = event.title;

  eventDate.value = event.date;

  eventTime.value = event.time;

  eventLocation.value =
    event.location || "";

  eventCategory.value =
    event.category;

  eventPriority.value =
    event.priority;

  eventNotes.value =
    event.notes || "";


  deleteBtn.classList.remove(
    "hidden"
  );

  modal.classList.remove(
    "hidden"
  );

}


function closeModal() {

  modal.classList.add(
    "hidden"
  );

  editingId = null;

}


document.getElementById(
  "addBtn"
).addEventListener(
  "click",
  openNewModal
);


document.getElementById(
  "closeModal"
).addEventListener(
  "click",
  closeModal
);


document.getElementById(
  "cancelBtn"
).addEventListener(
  "click",
  closeModal
);


modal.addEventListener(
  "click",
  event => {

    if (
      event.target === modal
    ) {
      closeModal();
    }

  }
);


// ==========================================
// GUARDAR
// ==========================================

eventForm.addEventListener(
  "submit",
  event => {

    event.preventDefault();


    const data = {

      title:
        eventTitle.value.trim(),

      date:
        eventDate.value,

      time:
        eventTime.value,

      location:
        eventLocation.value.trim(),

      category:
        eventCategory.value,

      priority:
        eventPriority.value,

      notes:
        eventNotes.value.trim()

    };


    if (!data.title || !data.date) {

      alert(
        "Por favor completa los campos obligatorios."
      );

      return;

    }


    if (editingId) {

      const index =
        events.findIndex(
          item =>
            item.id === editingId
        );


      if (index !== -1) {

        events[index] = {
          ...events[index],
          ...data
        };

      }

    } else {

      const newEvent = {

        id:
          generateId(),

        ...data,

        createdAt:
          new Date().toISOString()

      };


      events.push(newEvent);

    }


    saveEvents();

    selectedDate =
      keyToDate(data.date);

    currentDate =
      new Date(selectedDate);


    closeModal();

    renderCalendar();

    renderEvents();

    updateSummary();

  }
);


// ==========================================
// ELIMINAR
// ==========================================

deleteBtn.addEventListener(
  "click",
  () => {

    if (!editingId) return;


    const event =
      events.find(
        item =>
          item.id === editingId
      );


    if (!event) return;


    const confirmed =
      confirm(
        `¿Eliminar "${event.title}"?`
      );


    if (!confirmed) return;


    events =
      events.filter(
        item =>
          item.id !== editingId
      );


    saveEvents();

    closeModal();

    renderCalendar();

    renderEvents();

    updateSummary();

  }
);


// ==========================================
// ID
// ==========================================

function generateId() {

  if (
    window.crypto &&
    crypto.randomUUID
  ) {

    return crypto.randomUUID();

  }

  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .substring(2)
  );

}


// ==========================================
// NAVEGACIÓN
// ==========================================

document.getElementById(
  "prevMonth"
).addEventListener(
  "click",
  () => {

    currentDate.setMonth(
      currentDate.getMonth() - 1
    );

    renderCalendar();

  }
);


document.getElementById(
  "nextMonth"
).addEventListener(
  "click",
  () => {

    currentDate.setMonth(
      currentDate.getMonth() + 1
    );

    renderCalendar();

  }
);


document.getElementById(
  "todayBtn"
).addEventListener(
  "click",
  () => {

    const today =
      new Date();

    currentDate =
      new Date(today);

    selectedDate =
      new Date(today);

    renderCalendar();

    renderEvents();

  }
);


// ==========================================
// RESUMEN
// ==========================================

function updateSummary() {

  const todayKey =
    dateToKey(new Date());


  const todayEvents =
    events.filter(
      event =>
        event.date === todayKey
    );


  const today =
    new Date();

  today.setHours(0,0,0,0);


  const upcoming =
    events.filter(event => {

      const date =
        keyToDate(event.date);

      date.setHours(0,0,0,0);

      return date >= today;

    });


  const high =
    events.filter(
      event =>
        event.priority === "Alta"
    );


  document.getElementById(
    "todayCount"
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


// ==========================================
// INSTALACIÓN PWA
// ==========================================

let deferredPrompt = null;

function setupInstallPrompt() {

  const installBtn =
    document.getElementById(
      "installBtn"
    );


  window.addEventListener(
    "beforeinstallprompt",
    event => {

      event.preventDefault();

      deferredPrompt = event;

      installBtn.classList.remove(
        "hidden"
      );

    }
  );


  installBtn.addEventListener(
    "click",
    async () => {

      if (!deferredPrompt) return;

      deferredPrompt.prompt();

      await deferredPrompt.userChoice;

      deferredPrompt = null;

      installBtn.classList.add(
        "hidden"
      );

    }
  );


  window.addEventListener(
    "appinstalled",
    () => {

      deferredPrompt = null;

      installBtn.classList.add(
        "hidden"
      );

    }
  );

}
