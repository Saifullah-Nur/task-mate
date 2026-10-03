// ========================================
// TASKMATE
// ========================================

const STORAGE_KEY = "taskmate_v6";

let tasks =
    JSON.parse(
        localStorage.getItem(STORAGE_KEY)
    ) || [];

let editingId = null;

let calendarDate = new Date();


// ========================================
// ELEMENT
// ========================================

const taskForm =
    document.getElementById("taskForm");

const formSection =
    document.getElementById("taskFormSection");

const taskList =
    document.getElementById("taskList");

const completedList =
    document.getElementById("completedList");

const emptyState =
    document.getElementById("emptyState");

const completedEmpty =
    document.getElementById("completedEmpty");

const searchInput =
    document.getElementById("searchInput");

const courseFilter =
    document.getElementById("courseFilter");

const taskDeadline =
    document.getElementById("taskDeadline");


// ========================================
// STORAGE
// ========================================

function saveTasks() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(tasks)
    );
}


// ========================================
// DATE
// ========================================

function getToday() {

    const date = new Date();

    return (
        date.getFullYear() +
        "-" +
        String(
            date.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            date.getDate()
        ).padStart(2, "0")
    );
}


function getDaysUntil(dateString) {

    const today =
        new Date(
            getToday() +
            "T00:00:00"
        );

    const target =
        new Date(
            dateString +
            "T00:00:00"
        );

    return Math.round(
        (target - today) /
        86400000
    );
}


function formatDate(dateString) {

    const date =
        new Date(
            dateString +
            "T00:00:00"
        );

    return date.toLocaleDateString(
        "id-ID",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


// ========================================
// FORM
// ========================================

function openTaskForm() {

    editingId = null;

    taskForm.reset();

    document.getElementById(
        "formTitle"
    ).innerText =
        "Tambah Tugas";

    taskDeadline.min =
        getToday();

    formSection.classList.remove(
        "hidden"
    );

    formSection.scrollIntoView({
        behavior: "smooth"
    });
}


function closeTaskForm() {

    editingId = null;

    taskForm.reset();

    formSection.classList.add(
        "hidden"
    );

    document.getElementById(
        "formTitle"
    ).innerText =
        "Tambah Tugas";
}


// ========================================
// SUBMIT
// ========================================

taskForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const name =
            document.getElementById(
                "taskName"
            ).value.trim();


        const course =
            document.getElementById(
                "taskCourse"
            ).value.trim();


        const deadline =
            document.getElementById(
                "taskDeadline"
            ).value;


        const priority =
            document.getElementById(
                "taskPriority"
            ).value;


        const notes =
            document.getElementById(
                "taskNotes"
            ).value.trim();


        if (
            name === "" ||
            course === "" ||
            deadline === ""
        ) {

            alert(
                "Nama tugas, mata kuliah, dan deadline wajib diisi."
            );

            return;
        }


        // EDIT
        if (
            editingId !== null
        ) {

            const task =
                tasks.find(
                    function(item) {

                        return (
                            item.id ===
                            editingId
                        );
                    }
                );


            if (task) {

                task.name =
                    name;

                task.course =
                    course;

                task.deadline =
                    deadline;

                task.priority =
                    priority;

                task.notes =
                    notes;
            }

        }


        // TAMBAH
        else {

            tasks.push({

                id:
                    Date.now(),

                name:
                    name,

                course:
                    course,

                deadline:
                    deadline,

                priority:
                    priority,

                notes:
                    notes,

                completed:
                    false
            });
        }


        saveTasks();

        closeTaskForm();

        refreshAll();
    }
);


// ========================================
// ACTIVE TASKS
// ========================================

function renderActiveTasks() {

    const keyword =
        searchInput.value
        .toLowerCase()
        .trim();


    const selectedCourse =
        courseFilter.value;


    const activeTasks =
        tasks
        .filter(
            function(task) {

                if (
                    task.completed
                ) {
                    return false;
                }


                const matchSearch =
                    task.name
                        .toLowerCase()
                        .includes(keyword) ||

                    task.course
                        .toLowerCase()
                        .includes(keyword) ||

                    (
                        task.notes || ""
                    )
                    .toLowerCase()
                    .includes(keyword);


                const matchCourse =
                    selectedCourse === "Semua" ||
                    task.course ===
                    selectedCourse;


                return (
                    matchSearch &&
                    matchCourse
                );
            }
        )
        .sort(
            function(a, b) {

                return (
                    new Date(a.deadline) -
                    new Date(b.deadline)
                );
            }
        );


    taskList.innerHTML = "";


    if (
        activeTasks.length === 0
    ) {

        emptyState.classList.remove(
            "hidden"
        );

        return;
    }


    emptyState.classList.add(
        "hidden"
    );


    activeTasks.forEach(
        function(task) {

            taskList.appendChild(
                createActiveTaskCard(
                    task
                )
            );
        }
    );
}


// ========================================
// ACTIVE CARD
// ========================================

function createActiveTaskCard(
    task
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "task-card";


    const deadline =
        getDeadlineInfo(task);


    const priority =
        getPriorityClass(
            task.priority
        );


    let notes =
        "";


    if (
        task.notes
    ) {

        notes =
            `
            <div class="task-notes">
                📝 ${escapeHTML(task.notes)}
            </div>
            `;
    }


    card.innerHTML = `

        <div class="task-info">

            <div class="task-title">
                ${escapeHTML(task.name)}
            </div>

            <div class="task-course">
                📚 ${escapeHTML(task.course)}
            </div>

            <div class="task-meta">

                <span
                    class="badge ${deadline.className}">
                    📅 ${deadline.text}
                </span>

                <span
                    class="badge ${priority}">
                    ${escapeHTML(task.priority)}
                </span>

                <span class="badge pending">
                    Belum Selesai
                </span>

            </div>

            ${notes}

        </div>


        <div class="task-actions">

            <button
                class="complete-btn"
                onclick="completeTask(${task.id})">

                ✓ Selesai

            </button>

            <button
                class="edit-btn"
                onclick="editTask(${task.id})">

                ✏ Edit

            </button>

            <button
                class="delete-btn"
                onclick="deleteTask(${task.id})">

                🗑 Hapus

            </button>

        </div>
    `;


    return card;
}


// ========================================
// COMPLETED
// ========================================

function renderCompletedTasks() {

    const completedTasks =
        tasks
        .filter(
            function(task) {

                return task.completed;
            }
        )
        .sort(
            function(a, b) {

                return b.id - a.id;
            }
        );


    completedList.innerHTML = "";


    if (
        completedTasks.length === 0
    ) {

        completedEmpty.classList.remove(
            "hidden"
        );

        return;
    }


    completedEmpty.classList.add(
        "hidden"
    );


    completedTasks.forEach(
        function(task) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "task-card completed-task";


            card.innerHTML = `

                <div class="task-info">

                    <div class="task-title">
                        ${escapeHTML(task.name)}
                    </div>

                    <div class="task-course">
                        📚 ${escapeHTML(task.course)}
                    </div>

                    <div class="task-meta">

                        <span class="badge done">
                            ✅ Sudah Dikerjakan
                        </span>

                        <span class="badge normal">
                            📅 ${formatDate(task.deadline)}
                        </span>

                    </div>

                    ${
                        task.notes
                        ? `
                            <div class="task-notes">
                                📝 ${escapeHTML(task.notes)}
                            </div>
                          `
                        : ""
                    }

                </div>


                <div class="task-actions">

                    <button
                        class="complete-btn"
                        onclick="restoreTask(${task.id})">

                        ↩ Kembalikan

                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteTask(${task.id})">

                        🗑 Hapus

                    </button>

                </div>
            `;


            completedList.appendChild(
                card
            );
        }
    );
}


// ========================================
// COMPLETE
// ========================================

function completeTask(id) {

    const task =
        tasks.find(
            function(item) {

                return item.id === id;
            }
        );


    if (!task) {
        return;
    }


    task.completed =
        true;


    saveTasks();

    refreshAll();


    document.getElementById(
        "completed"
    ).scrollIntoView({
        behavior: "smooth"
    });
}


// ========================================
// RESTORE
// ========================================

function restoreTask(id) {

    const task =
        tasks.find(
            function(item) {

                return item.id === id;
            }
        );


    if (!task) {
        return;
    }


    task.completed =
        false;


    saveTasks();

    refreshAll();


    document.getElementById(
        "tasks"
    ).scrollIntoView({
        behavior: "smooth"
    });
}


// ========================================
// EDIT
// ========================================

function editTask(id) {

    const task =
        tasks.find(
            function(item) {

                return item.id === id;
            }
        );


    if (!task) {
        return;
    }


    editingId =
        id;


    document.getElementById(
        "formTitle"
    ).innerText =
        "Edit Tugas";


    document.getElementById(
        "taskName"
    ).value =
        task.name;


    document.getElementById(
        "taskCourse"
    ).value =
        task.course;


    document.getElementById(
        "taskDeadline"
    ).value =
        task.deadline;


    document.getElementById(
        "taskPriority"
    ).value =
        task.priority;


    document.getElementById(
        "taskNotes"
    ).value =
        task.notes || "";


    formSection.classList.remove(
        "hidden"
    );


    formSection.scrollIntoView({
        behavior: "smooth"
    });
}


// ========================================
// DELETE
// ========================================

function deleteTask(id) {

    const task =
        tasks.find(
            function(item) {

                return item.id === id;
            }
        );


    if (!task) {
        return;
    }


    const confirmed =
        confirm(
            "Yakin ingin menghapus tugas ini?"
        );


    if (!confirmed) {
        return;
    }


    tasks =
        tasks.filter(
            function(item) {

                return item.id !== id;
            }
        );


    saveTasks();

    refreshAll();
}


// ========================================
// DEADLINE
// ========================================

function getDeadlineInfo(task) {

    const days =
        getDaysUntil(
            task.deadline
        );


    if (
        days < 0
    ) {

        return {
            text:
                "Deadline Lewat",

            className:
                "late"
        };
    }


    if (
        days === 0
    ) {

        return {
            text:
                "Deadline Hari Ini",

            className:
                "today"
        };
    }


    if (
        days === 1
    ) {

        return {
            text:
                "Deadline Besok",

            className:
                "tomorrow"
        };
    }


    return {
        text:
            formatDate(
                task.deadline
            ),

        className:
            "upcoming"
    };
}


// ========================================
// PRIORITY
// ========================================

function getPriorityClass(
    priority
) {

    if (
        priority === "Tinggi"
    ) {

        return "high";
    }


    if (
        priority === "Rendah"
    ) {

        return "low";
    }


    return "medium";
}


// ========================================
// COURSE FILTER
// ========================================

function updateCourseFilter() {

    const current =
        courseFilter.value;


    const courses = [];


    tasks.forEach(
        function(task) {

            if (
                !courses.includes(
                    task.course
                )
            ) {

                courses.push(
                    task.course
                );
            }
        }
    );


    courses.sort();


    courseFilter.innerHTML =
        "";


    const allOption =
        document.createElement(
            "option"
        );


    allOption.value =
        "Semua";

    allOption.textContent =
        "Semua Mata Kuliah";


    courseFilter.appendChild(
        allOption
    );


    courses.forEach(
        function(course) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                course;

            option.textContent =
                course;


            courseFilter.appendChild(
                option
            );
        }
    );


    if (
        courses.includes(current)
    ) {

        courseFilter.value =
            current;

    } else {

        courseFilter.value =
            "Semua";
    }
}


// ========================================
// STATISTICS
// ========================================

function updateStatistics() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            function(task) {

                return task.completed;
            }
        ).length;


    const pending =
        total - completed;


    document.getElementById(
        "totalTasks"
    ).innerText =
        total;


    document.getElementById(
        "completedTasks"
    ).innerText =
        completed;


    document.getElementById(
        "pendingTasks"
    ).innerText =
        pending;


    updateNearestDeadline();
}


// ========================================
// NEAREST DEADLINE
// ========================================

function updateNearestDeadline() {

    const active =
        tasks.filter(
            function(task) {

                return !task.completed;
            }
        );


    const element =
        document.getElementById(
            "nearestDeadline"
        );


    if (
        active.length === 0
    ) {

        element.innerText =
            "-";

        return;
    }


    active.sort(
        function(a, b) {

            return (
                new Date(a.deadline) -
                new Date(b.deadline)
            );
        }
    );


    const days =
        getDaysUntil(
            active[0].deadline
        );


    if (
        days < 0
    ) {

        element.innerText =
            "Lewat";

    } else if (
        days === 0
    ) {

        element.innerText =
            "Hari Ini";

    } else if (
        days === 1
    ) {

        element.innerText =
            "Besok";

    } else {

        element.innerText =
            days + " hari";
    }
}


// ========================================
// CALENDAR
// ========================================

function changeMonth(
    amount
) {

    calendarDate.setMonth(
        calendarDate.getMonth() +
        amount
    );

    renderCalendar();
}


function renderCalendar() {

    const grid =
        document.getElementById(
            "calendarGrid"
        );


    const title =
        document.getElementById(
            "calendarTitle"
        );


    const year =
        calendarDate.getFullYear();


    const month =
        calendarDate.getMonth();


    title.innerText =
        new Date(
            year,
            month,
            1
        ).toLocaleDateString(
            "id-ID",
            {
                month: "long",
                year: "numeric"
            }
        );


    grid.innerHTML =
        "";


    const firstDay =
        new Date(
            year,
            month,
            1
        );


    const startDay =
        (
            firstDay.getDay() +
            6
        ) % 7;


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    for (
        let i = 0;
        i < startDay;
        i++
    ) {

        const blank =
            document.createElement(
                "div"
            );


        blank.className =
            "calendar-day";


        grid.appendChild(
            blank
        );
    }


    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const cell =
            document.createElement(
                "div"
            );


        cell.className =
            "calendar-day";


        const dateString =
            year +
            "-" +
            String(
                month + 1
            ).padStart(2, "0") +
            "-" +
            String(day)
                .padStart(2, "0");


        if (
            dateString ===
            getToday()
        ) {

            cell.classList.add(
                "today"
            );
        }


        cell.innerHTML =
            `
            <div class="calendar-number">
                ${day}
            </div>
            `;


        const dayTasks =
            tasks.filter(
                function(task) {

                    return (
                        task.deadline ===
                        dateString
                    );
                }
            );


        if (
            dayTasks.length > 0
        ) {

            cell.innerHTML +=
                `
                <div class="calendar-count">
                    ${dayTasks.length} tugas
                </div>
                `;
        }


        cell.addEventListener(
            "click",
            function() {

                showSelectedDate(
                    dateString
                );
            }
        );


        grid.appendChild(
            cell
        );
    }
}


// ========================================
// CALENDAR DETAILS
// ========================================

function showSelectedDate(
    dateString
) {

    const selectedDate =
        document.getElementById(
            "selectedDate"
        );


    const selectedTasks =
        document.getElementById(
            "selectedTasks"
        );


    selectedDate.innerText =
        formatDate(
            dateString
        );


    const dateTasks =
        tasks.filter(
            function(task) {

                return (
                    task.deadline ===
                    dateString
                );
            }
        );


    if (
        dateTasks.length === 0
    ) {

        selectedTasks.innerHTML =
            `
            <p class="muted">
                Tidak ada tugas pada tanggal ini.
            </p>
            `;

        return;
    }


    selectedTasks.innerHTML =
        "";


    dateTasks.forEach(
        function(task) {

            selectedTasks.innerHTML +=
                `
                <div class="calendar-task">

                    <strong>
                        ${escapeHTML(task.name)}
                    </strong>

                    <p>
                        📚 ${escapeHTML(task.course)}
                    </p>

                    <p>
                        ${
                            task.completed
                            ? "✅ Sudah dikerjakan"
                            : "⏳ Belum selesai"
                        }
                    </p>

                </div>
                `;
        }
    );
}


// ========================================
// SEARCH
// ========================================

searchInput.addEventListener(
    "input",
    function() {

        renderActiveTasks();
    }
);


// ========================================
// FILTER
// ========================================

courseFilter.addEventListener(
    "change",
    function() {

        renderActiveTasks();
    }
);


// ========================================
// ESCAPE
// ========================================

function escapeHTML(text) {

    return String(text)
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


// ========================================
// REFRESH
// ========================================

function refreshAll() {

    updateCourseFilter();

    renderActiveTasks();

    renderCompletedTasks();

    updateStatistics();

    renderCalendar();
}


// ========================================
// START
// ========================================

taskDeadline.min =
    getToday();


refreshAll();