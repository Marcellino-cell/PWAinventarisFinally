/* =========================================================
   ROOM INVENTORY
   STABLE JAVASCRIPT
========================================================= */


/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY =
    "roomInventoryData_v4";

const THEME_KEY =
    "roomInventoryTheme_v4";

const ACTIVITY_KEY =
    "roomInventoryActivity_v4";


/* =========================================================
   STATE
========================================================= */

let inventories = [];

let deleteTargetId = null;

let deferredInstallPrompt = null;

let toastTimer = null;

let pendingAction = null;


/* =========================================================
   DOM
========================================================= */

const $ = id =>
    document.getElementById(id);


/* =========================================================
   INIT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    init
);


function init() {

    loadData();

    loadTheme();

    bindEvents();

    renderAll();

    setTimeout(
        hideSplash,
        1200
    );

    registerServiceWorker();

}


/* =========================================================
   SPLASH
========================================================= */

function hideSplash() {

    const splash =
        $("splashScreen");


    if (!splash) return;


    splash.classList.add(
        "hide"
    );


    setTimeout(
        () => {
            splash.remove();
        },
        550
    );

}


/* =========================================================
   EVENTS
========================================================= */

function bindEvents() {

    /* FORM */

    $("inventoryForm").addEventListener(
        "submit",
        saveInventory
    );


    $("cancelEditBtn").addEventListener(
        "click",
        cancelEdit
    );


    /* SEARCH */

    $("searchInput").addEventListener(
        "input",
        renderInventory
    );


    $("filterRuangan").addEventListener(
        "change",
        renderInventory
    );


    $("filterKondisi").addEventListener(
        "change",
        renderInventory
    );


    $("sortInventory").addEventListener(
        "change",
        renderInventory
    );


    $("resetFilterBtn").addEventListener(
        "click",
        resetFilters
    );


    /* THEME */

    $("themeBtn").addEventListener(
        "click",
        toggleTheme
    );


    /* DATA TOOLS */

    $("exportBtn").addEventListener(
        "click",
        exportData
    );


    $("importBtn").addEventListener(
        "click",
        () => $("importFile").click()
    );


    $("backupBtn").addEventListener(
        "click",
        backupData
    );


    $("restoreBtn").addEventListener(
        "click",
        () => $("restoreFile").click()
    );


    $("printBtn").addEventListener(
        "click",
        () =>
            window.print()
    );


    $("clearBtn").addEventListener(
        "click",
        askClearAll
    );


    $("clearActivityBtn").addEventListener(
        "click",
        clearActivity
    );


    /* FILE INPUT */

    $("importFile").addEventListener(
        "change",
        handleImport
    );


    $("restoreFile").addEventListener(
        "change",
        handleRestore
    );


    /* DELETE MODAL */

    $("cancelDeleteBtn").addEventListener(
        "click",
        closeDeleteModal
    );


    $("confirmDeleteBtn").addEventListener(
        "click",
        executeDelete
    );


    /* GENERAL MODAL */

    $("dataModalCancel").addEventListener(
        "click",
        closeDataModal
    );


    $("dataModalConfirm").addEventListener(
        "click",
        executePendingAction
    );


    /* NAVIGATION */

    document
        .querySelectorAll(".nav-item")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset.target;


                        const target =
                            $(id);


                        if (!target) return;


                        document
                            .querySelectorAll(
                                ".nav-item"
                            )
                            .forEach(
                                item =>
                                    item.classList.remove(
                                        "active"
                                    )
                            );


                        button.classList.add(
                            "active"
                        );


                        target.scrollIntoView({
                            behavior:
                                "smooth",
                            block:
                                "start"
                        });

                    }
                );

            }
        );


    /* KEYBOARD */

    document.addEventListener(
        "keydown",
        handleKeyboard
    );


    /* MODAL BACKDROP */

    document
        .querySelectorAll(
            ".modal-backdrop"
        )
        .forEach(
            backdrop => {

                backdrop.addEventListener(
                    "click",
                    () => {

                        closeDeleteModal();

                        closeDataModal();

                    }
                );

            }
        );

}


/* =========================================================
   LOAD DATA
========================================================= */

function loadData() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!saved) {

            inventories = [];

            return;

        }


        const data =
            JSON.parse(saved);


        inventories =
            Array.isArray(data)
                ? data
                : [];


    } catch {

        inventories = [];

    }

}


/* =========================================================
   SAVE DATA
========================================================= */

function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
            inventories
        )
    );

}


/* =========================================================
   SAVE INVENTORY
========================================================= */

function saveInventory(
    event
) {

    event.preventDefault();


    const nama =
        $("namaBarang")
            .value
            .trim();


    const kode =
        $("kodeInventaris")
            .value
            .trim();


    const ruangan =
        $("namaRuangan")
            .value
            .trim();


    const jumlah =
        Number(
            $("jumlahBarang")
                .value
        );


    const kondisi =
        $("kondisiBarang")
            .value;


    const editId =
        $("editId")
            .value;


    if (
        !nama ||
        !kode ||
        !ruangan ||
        !jumlah ||
        !kondisi
    ) {

        showToast(
            "Data belum lengkap",
            "Semua kolom wajib diisi.",
            "error"
        );

        return;

    }


    if (
        jumlah <= 0 ||
        !Number.isInteger(jumlah)
    ) {

        showToast(
            "Jumlah tidak valid",
            "Masukkan jumlah barang yang benar.",
            "error"
        );

        return;

    }


    /* EDIT */

    if (editId) {

        const index =
            inventories.findIndex(
                item =>
                    item.id ===
                    editId
            );


        if (index !== -1) {

            inventories[index] = {

                ...inventories[index],

                namaBarang:
                    nama,

                kodeInventaris:
                    kode,

                namaRuangan:
                    ruangan,

                jumlahBarang:
                    jumlah,

                kondisiBarang:
                    kondisi,

                updatedAt:
                    new Date()
                        .toISOString()

            };


            addActivity(
                `Mengubah ${nama}`
            );


            showToast(
                "Data diperbarui",
                "Data inventaris berhasil diubah.",
                "success"
            );

        }

    }

    /* TAMBAH */

    else {

        inventories.unshift({

            id:
                createId(),

            namaBarang:
                nama,

            kodeInventaris:
                kode,

            namaRuangan:
                ruangan,

            jumlahBarang:
                jumlah,

            kondisiBarang:
                kondisi,

            createdAt:
                new Date()
                    .toISOString()

        });


        addActivity(
            `Menambahkan ${nama}`
        );


        showToast(
            "Data tersimpan",
            "Inventaris berhasil ditambahkan.",
            "success"
        );

    }


    saveData();

    resetForm();

    renderAll();

}


/* =========================================================
   RESET FORM
========================================================= */

function resetForm() {

    $("inventoryForm")
        .reset();


    $("editId")
        .value = "";


    $("cancelEditBtn")
        .classList.add(
            "hidden"
        );


    $("submitBtn")
        .innerHTML = `

        <svg viewBox="0 0 24 24">

            <path d="M12 5v14"></path>

            <path d="M5 12h14"></path>

        </svg>

        Simpan Inventaris

    `;


    document.querySelector(
        "#formPanel .panel-title span"
    ).textContent =
        "DATABASE ENTRY";


    document.querySelector(
        "#formPanel .panel-title h2"
    ).textContent =
        "Tambah Inventaris";

}


/* =========================================================
   EDIT
========================================================= */

function editItem(id) {

    const item =
        inventories.find(
            inventory =>
                inventory.id === id
        );


    if (!item) return;


    $("editId")
        .value =
        item.id;


    $("namaBarang")
        .value =
        item.namaBarang;


    $("kodeInventaris")
        .value =
        item.kodeInventaris;


    $("namaRuangan")
        .value =
        item.namaRuangan;


    $("jumlahBarang")
        .value =
        item.jumlahBarang;


    $("kondisiBarang")
        .value =
        item.kondisiBarang;


    $("cancelEditBtn")
        .classList.remove(
            "hidden"
        );


    $("submitBtn")
        .innerHTML = `

        <svg viewBox="0 0 24 24">

            <path
                d="M20 6 9 17l-5-5"
            ></path>

        </svg>

        Update Inventaris

    `;


    document.querySelector(
        "#formPanel .panel-title span"
    ).textContent =
        "DATABASE EDIT";


    document.querySelector(
        "#formPanel .panel-title h2"
    ).textContent =
        "Edit Inventaris";


    $("formPanel")
        .scrollIntoView({
            behavior:
                "smooth",
            block:
                "center"
        });


    $("namaBarang")
        .focus();

}


function cancelEdit() {

    resetForm();

    showToast(
        "Edit dibatalkan",
        "Form dikembalikan.",
        "info"
    );

}


/* =========================================================
   DELETE
========================================================= */

function askDelete(id) {

    deleteTargetId =
        id;


    openDeleteModal();

}


function openDeleteModal() {

    const modal =
        $("confirmModal");


    modal.classList.add(
        "show"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );

}


function closeDeleteModal() {

    const modal =
        $("confirmModal");


    modal.classList.remove(
        "show"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    deleteTargetId =
        null;

}


function executeDelete() {

    if (!deleteTargetId) {

        closeDeleteModal();

        return;

    }


    const item =
        inventories.find(
            data =>
                data.id ===
                deleteTargetId
        );


    inventories =
        inventories.filter(
            data =>
                data.id !==
                deleteTargetId
        );


    saveData();


    if (item) {

        addActivity(
            `Menghapus ${item.namaBarang}`
        );

    }


    closeDeleteModal();


    renderAll();


    showToast(
        "Data dihapus",
        "Inventaris berhasil dihapus.",
        "success"
    );

}


/* =========================================================
   RENDER INVENTORY
========================================================= */

function renderInventory() {

    const list =
        $("inventoryList");


    const empty =
        $("emptyState");


    const search =
        $("searchInput")
            .value
            .trim()
            .toLowerCase();


    const room =
        $("filterRuangan")
            .value;


    const condition =
        $("filterKondisi")
            .value;


    const sort =
        $("sortInventory")
            .value;


    let filtered =
        inventories.filter(
            item => {

                const text = `

                    ${item.namaBarang}

                    ${item.kodeInventaris}

                    ${item.namaRuangan}

                `
                    .toLowerCase();


                return (

                    (
                        !search ||
                        text.includes(search)
                    )

                    &&

                    (
                        !room ||
                        item.namaRuangan === room
                    )

                    &&

                    (
                        !condition ||
                        item.kondisiBarang === condition
                    )

                );

            }
        );


    filtered.sort(
        (a,b) => {

            if (
                sort ===
                "nameAsc"
            ) {

                return a.namaBarang.localeCompare(
                    b.namaBarang
                );

            }


            if (
                sort ===
                "nameDesc"
            ) {

                return b.namaBarang.localeCompare(
                    a.namaBarang
                );

            }


            if (
                sort ===
                "qtyAsc"
            ) {

                return (
                    a.jumlahBarang -
                    b.jumlahBarang
                );

            }


            if (
                sort ===
                "qtyDesc"
            ) {

                return (
                    b.jumlahBarang -
                    a.jumlahBarang
                );

            }


            if (
                sort ===
                "oldest"
            ) {

                return (
                    new Date(
                        a.createdAt || 0
                    ) -
                    new Date(
                        b.createdAt || 0
                    )
                );

            }


            return (
                new Date(
                    b.createdAt || 0
                ) -
                new Date(
                    a.createdAt || 0
                )
            );

        }
    );


    list.innerHTML =
        "";


    $("resultCounter")
        .textContent =
        `${filtered.length} data`;


    if (!filtered.length) {

        empty.classList.remove(
            "hidden"
        );

        return;

    }


    empty.classList.add(
        "hidden"
    );


    filtered.forEach(
        item => {

            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "inventory-item";


            element.innerHTML = `

                <div class="item-title">

                    <strong>
                        ${escapeHtml(
                            item.namaBarang
                        )}
                    </strong>

                    <code>
                        ${escapeHtml(
                            item.kodeInventaris
                        )}
                    </code>

                </div>


                <div class="item-info">

                    <span>
                        RUANGAN
                    </span>

                    <strong>
                        ${escapeHtml(
                            item.namaRuangan
                        )}
                    </strong>

                </div>


                <div class="item-info quantity-column">

                    <span>
                        JUMLAH
                    </span>

                    <strong>
                        ${item.jumlahBarang}
                        unit
                    </strong>

                </div>


                <div class="item-info">

                    <span>
                        KONDISI
                    </span>

                    <div style="margin-top:4px">

                        <span
                            class="condition ${item.kondisiBarang.toLowerCase()}"
                        >
                            ${escapeHtml(
                                item.kondisiBarang
                            )}
                        </span>

                    </div>

                </div>


                <div class="item-actions">

                    <button
                        class="item-action"
                        type="button"
                        data-action="edit"
                        data-id="${item.id}"
                        title="Edit"
                    >

                        <svg viewBox="0 0 24 24">

                            <path
                                d="M12 20h9"
                            ></path>

                            <path
                                d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"
                            ></path>

                        </svg>

                    </button>


                    <button
                        class="item-action delete"
                        type="button"
                        data-action="delete"
                        data-id="${item.id}"
                        title="Hapus"
                    >

                        <svg viewBox="0 0 24 24">

                            <polyline
                                points="3 6 5 6 21 6"
                            ></polyline>

                            <path
                                d="M19 6l-1 14H6L5 6"
                            ></path>

                            <path
                                d="M10 11v5"
                            ></path>

                            <path
                                d="M14 11v5"
                            ></path>

                            <path
                                d="M9 6V3h6v3"
                            ></path>

                        </svg>

                    </button>

                </div>

            `;


            list.appendChild(
                element
            );

        }
    );


    /* BUTTON EVENTS */

    list.querySelectorAll(
        ".item-action"
    )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset.id;


                        const action =
                            button.dataset.action;


                        if (
                            action ===
                            "edit"
                        ) {

                            editItem(id);

                        }


                        if (
                            action ===
                            "delete"
                        ) {

                            askDelete(id);

                        }

                    }
                );

            }
        );

}


/* =========================================================
   ROOMS
========================================================= */

function updateRooms() {

    const select =
        $("filterRuangan");


    const old =
        select.value;


    const rooms =
        [
            ...new Set(
                inventories.map(
                    item =>
                        item.namaRuangan
                )
            )
        ]
        .filter(Boolean)
        .sort();


    select.innerHTML = `

        <option value="">
            Semua Ruangan
        </option>

    `;


    rooms.forEach(
        room => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                room;


            option.textContent =
                room;


            select.appendChild(
                option
            );

        }
    );


    if (
        rooms.includes(old)
    ) {

        select.value =
            old;

    }


    const roomMap = {};


    inventories.forEach(
        item => {

            const room =
                item.namaRuangan;


            if (!roomMap[room]) {

                roomMap[room] = {

                    records: 0,

                    units: 0

                };

            }


            roomMap[room].records++;

            roomMap[room].units +=
                Number(
                    item.jumlahBarang
                ) || 0;

        }
    );


    const names =
        Object.keys(
            roomMap
        );


    $("roomCount")
        .textContent =
        names.length;


    const container =
        $("roomSummary");


    container.innerHTML =
        "";


    names.sort();


    names.forEach(
        (name,index) => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "room-card";


            card.innerHTML = `

                <h3>
                    ${escapeHtml(
                        name
                    )}
                </h3>

                <div class="room-card-data">

                    <div>

                        <strong>
                            ${roomMap[name].records}
                        </strong>

                        <span>
                            Record
                        </span>

                    </div>


                    <div>

                        <strong>
                            ${formatNumber(
                                roomMap[name].units
                            )}
                        </strong>

                        <span>
                            Unit
                        </span>

                    </div>

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   DASHBOARD + CHART
========================================================= */

function updateDashboard() {

    let total = 0;

    let baik = 0;

    let ringan = 0;

    let berat = 0;


    inventories.forEach(
        item => {

            const qty =
                Number(
                    item.jumlahBarang
                ) || 0;


            total += qty;


            if (
                item.kondisiBarang ===
                "Baik"
            ) {

                baik += qty;

            }


            if (
                item.kondisiBarang ===
                "Ringan"
            ) {

                ringan += qty;

            }


            if (
                item.kondisiBarang ===
                "Berat"
            ) {

                berat += qty;

            }

        }
    );


    $("totalBarang")
        .textContent =
        formatNumber(total);


    $("barangBaik")
        .textContent =
        formatNumber(baik);


    $("barangRingan")
        .textContent =
        formatNumber(ringan);


    $("barangBerat")
        .textContent =
        formatNumber(berat);


    $("chartTotal")
        .textContent =
        formatNumber(total);


    updateChart(
        total,
        baik,
        ringan,
        berat
    );

}


function updateChart(
    total,
    baik,
    ringan,
    berat
) {

    if (!total) {

        $("donutChart")
            .style.background =
            "#273044";


        $("legendBaikPercent")
            .textContent =
            "0%";


        $("legendRinganPercent")
            .textContent =
            "0%";


        $("legendBeratPercent")
            .textContent =
            "0%";


        return;

    }


    const pBaik =
        baik /
        total *
        100;


    const pRingan =
        ringan /
        total *
        100;


    const first =
        pBaik * 3.6;


    const second =
        (
            pBaik +
            pRingan
        ) * 3.6;


    $("donutChart")
        .style.background = `

            conic-gradient(

                #22c55e
                0deg
                ${first}deg,

                #eab308
                ${first}deg
                ${second}deg,

                #ef4444
                ${second}deg
                360deg

            )

        `;


    $("legendBaikPercent")
        .textContent =
        `${Math.round(
            pBaik
        )}%`;


    $("legendRinganPercent")
        .textContent =
        `${Math.round(
            pRingan
        )}%`;


    $("legendBeratPercent")
        .textContent =
        `${Math.round(
            berat /
            total *
            100
        )}%`;

}


/* =========================================================
   HEALTH
========================================================= */

function updateHealth() {

    const complete =
        inventories.filter(
            item =>
                item.namaBarang &&
                item.kodeInventaris &&
                item.namaRuangan &&
                item.jumlahBarang &&
                item.kondisiBarang
        ).length;


    $("completeDataCount")
        .textContent =
        complete;


    $("recordCount")
        .textContent =
        inventories.length;


    $("databaseStatus")
        .textContent =
        "READY";

}


/* =========================================================
   RESET FILTER
========================================================= */

function resetFilters() {

    $("searchInput")
        .value =
        "";


    $("filterRuangan")
        .value =
        "";


    $("filterKondisi")
        .value =
        "";


    $("sortInventory")
        .value =
        "newest";


    renderInventory();


    showToast(
        "Filter direset",
        "Semua filter kembali ke awal.",
        "info"
    );

}


/* =========================================================
   ACTIVITY
========================================================= */

function getActivities() {

    try {

        return (
            JSON.parse(
                localStorage.getItem(
                    ACTIVITY_KEY
                )
            ) || []
        );

    } catch {

        return [];

    }

}


function addActivity(
    text
) {

    const activities =
        getActivities();


    activities.unshift({

        text:
            text,

        time:
            new Date()
                .toISOString()

    });


    localStorage.setItem(
        ACTIVITY_KEY,
        JSON.stringify(
            activities.slice(
                0,
                30
            )
        )
    );


    renderActivity();

}


function renderActivity() {

    const container =
        $("activityLog");


    const activities =
        getActivities()
            .slice(
                0,
                8
            );


    container.innerHTML =
        "";


    if (!activities.length) {

        container.innerHTML = `

            <div class="activity-row">

                <div>

                    <span
                        class="activity-dot"
                    ></span>

                    <span>
                        Belum ada aktivitas.
                    </span>

                </div>

                <span class="activity-time">
                    --
                </span>

            </div>

        `;


        return;

    }


    activities.forEach(
        activity => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "activity-row";


            row.innerHTML = `

                <div>

                    <span
                        class="activity-dot"
                    ></span>

                    <span>
                        ${escapeHtml(
                            activity.text
                        )}
                    </span>

                </div>

                <span
                    class="activity-time"
                >
                    ${formatDate(
                        activity.time
                    )}
                </span>

            `;


            container.appendChild(
                row
            );

        }
    );

}


function clearActivity() {

    localStorage.removeItem(
        ACTIVITY_KEY
    );


    renderActivity();


    showToast(
        "Log dibersihkan",
        "Riwayat aktivitas telah dihapus.",
        "success"
    );

}


/* =========================================================
   EXPORT
========================================================= */

function exportData() {

    const data = {

        app:
            "RoomInventory",

        version:
            "4.0",

        exportedAt:
            new Date()
                .toISOString(),

        inventoryData:
            inventories

    };


    downloadJSON(
        data,
        "roominventory-export.json"
    );


    addActivity(
        "Export data inventaris"
    );


    showToast(
        "Export berhasil",
        "File JSON berhasil dibuat.",
        "success"
    );

}


/* =========================================================
   BACKUP
========================================================= */

function backupData() {

    const data = {

        app:
            "RoomInventory",

        type:
            "backup",

        version:
            "4.0",

        createdAt:
            new Date()
                .toISOString(),

        theme:
            localStorage.getItem(
                THEME_KEY
            ) ||
            "dark",

        inventoryData:
            inventories

    };


    downloadJSON(
        data,
        "roominventory-backup.json"
    );


    addActivity(
        "Membuat backup data"
    );


    showToast(
        "Backup berhasil",
        "Backup JSON berhasil dibuat.",
        "success"
    );

}


/* =========================================================
   IMPORT
========================================================= */

function handleImport(
    event
) {

    const file =
        event.target.files[0];


    if (!file) return;


    readJSON(
        file,
        data => {

            const result =
                Array.isArray(data)
                    ? data
                    : data.inventoryData;


            if (
                !Array.isArray(result)
            ) {

                showToast(
                    "Import gagal",
                    "Format JSON tidak valid.",
                    "error"
                );

                return;

            }


            openDataModal(
                "Import Data",
                "Data sekarang akan diganti dengan data dari file.",
                () => {

                    inventories =
                        result;


                    saveData();

                    renderAll();


                    addActivity(
                        "Import data inventaris"
                    );


                    showToast(
                        "Import berhasil",
                        "Data berhasil dimasukkan.",
                        "success"
                    );

                }
            );

        }
    );


    event.target.value =
        "";

}


/* =========================================================
   RESTORE
========================================================= */

function handleRestore(
    event
) {

    const file =
        event.target.files[0];


    if (!file) return;


    readJSON(
        file,
        data => {

            const result =
                Array.isArray(data)
                    ? data
                    : data.inventoryData;


            if (
                !Array.isArray(result)
            ) {

                showToast(
                    "Restore gagal",
                    "File backup tidak valid.",
                    "error"
                );

                return;

            }


            openDataModal(
                "Restore Backup",
                "Data saat ini akan diganti dengan backup.",
                () => {

                    inventories =
                        result;


                    saveData();


                    if (
                        data.theme ===
                        "light" ||

                        data.theme ===
                        "dark"
                    ) {

                        localStorage.setItem(
                            THEME_KEY,
                            data.theme
                        );


                        loadTheme();

                    }


                    renderAll();


                    addActivity(
                        "Restore backup"
                    );


                    showToast(
                        "Restore berhasil",
                        "Backup berhasil dipulihkan.",
                        "success"
                    );

                }
            );

        }
    );


    event.target.value =
        "";

}


/* =========================================================
   CLEAR ALL
========================================================= */

function askClearAll() {

    if (!inventories.length) {

        showToast(
            "Database kosong",
            "Tidak ada data untuk dihapus.",
            "info"
        );

        return;

    }


    openDataModal(
        "Hapus Semua Data",
        "Semua data inventaris akan dihapus. Lanjutkan?",
        () => {

            inventories =
                [];


            saveData();

            renderAll();


            addActivity(
                "Menghapus semua data"
            );


            showToast(
                "Database dibersihkan",
                "Semua data inventaris telah dihapus.",
                "success"
            );

        }
    );

}


/* =========================================================
   MODAL
========================================================= */

function openDataModal(
    title,
    text,
    action
) {

    $("dataModalTitle")
        .textContent =
        title;


    $("dataModalText")
        .textContent =
        text;


    pendingAction =
        action;


    $("dataModal")
        .classList.add(
            "show"
        );

}


function closeDataModal() {

    $("dataModal")
        .classList.remove(
            "show"
        );


    pendingAction =
        null;

}


function executePendingAction() {

    if (
        typeof pendingAction !==
        "function"
    ) {

        closeDataModal();

        return;

    }


    const action =
        pendingAction;


    pendingAction =
        null;


    closeDataModal();


    action();

}


/* =========================================================
   THEME
========================================================= */

function loadTheme() {

    const theme =
        localStorage.getItem(
            THEME_KEY
        );


    const light =
        theme ===
        "light";


    document.body.classList.toggle(
        "light",
        light
    );


    document.body.classList.toggle(
        "dark",
        !light
    );


    updateThemeIcon(
        light
    );


    fixSidebarColor(
        light
    );

}


function toggleTheme() {

    const light =
        !document.body.classList.contains(
            "light"
        );


    localStorage.setItem(
        THEME_KEY,
        light
            ? "light"
            : "dark"
    );


    loadTheme();


    showToast(
        light
            ? "Light mode aktif"
            : "Dark mode aktif",
        "Tema berhasil diubah.",
        "info"
    );

}


function updateThemeIcon(
    light
) {

    if (light) {

        $("themeIcon")
            .innerHTML = `

                <circle
                    cx="12"
                    cy="12"
                    r="4"
                ></circle>

                <path d="M12 2v2"></path>
                <path d="M12 20v2"></path>
                <path d="M2 12h2"></path>
                <path d="M20 12h2"></path>

                <path
                    d="m4.93 4.93 1.42 1.42"
                ></path>

                <path
                    d="m17.65 17.65 1.42 1.42"
                ></path>

            `;

    } else {

        $("themeIcon")
            .innerHTML = `

                <path
                    d="M21 12.8A8.5 8.5 0 1 1 11.2 3
                    6.5 6.5 0 0 0 21 12.8Z"
                ></path>

            `;

    }

}


function fixSidebarColor(
    light
) {

    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            item => {

                const active =
                    item.classList.contains(
                        "active"
                    );


                item.style.setProperty(
                    "color",
                    active
                        ? (
                            light
                                ? "#4c1d95"
                                : "#ffffff"
                        )
                        : (
                            light
                                ? "#64748b"
                                : "#78839a"
                        ),
                    "important"
                );

            }
        );

}


/* =========================================================
   INSTALL PWA
========================================================= */

window.addEventListener(
    "beforeinstallprompt",
    event => {

        event.preventDefault();


        deferredInstallPrompt =
            event;


        $("installBtn")
            .hidden =
            false;

    }
);


$("installBtn")
    .addEventListener(
        "click",
        async () => {

            if (
                !deferredInstallPrompt
            ) {

                showToast(
                    "Install tidak tersedia",
                    "Gunakan Live Server / HTTPS.",
                    "info"
                );

                return;

            }


            deferredInstallPrompt
                .prompt();


            await deferredInstallPrompt
                .userChoice;


            deferredInstallPrompt =
                null;


            $("installBtn")
                .hidden =
                true;

        }
    );


/* =========================================================
   SERVICE WORKER
========================================================= */

function registerServiceWorker() {

    if (
        !("serviceWorker" in navigator)
    ) {

        return;

    }


    navigator.serviceWorker
        .register(
            "service-worker.js"
        )
        .then(
            registration => {

                console.log(
                    "Service Worker aktif:",
                    registration.scope
                );

            }
        )
        .catch(
            error => {

                console.error(
                    "Service Worker error:",
                    error
                );

            }
        );

}


/* =========================================================
   KEYBOARD
========================================================= */

function handleKeyboard(
    event
) {

    if (
        (
            event.ctrlKey ||
            event.metaKey
        ) &&
        event.key.toLowerCase() ===
            "k"
    ) {

        event.preventDefault();


        $("searchInput")
            .focus();

    }


    if (
        event.key ===
        "Escape"
    ) {

        closeDeleteModal();

        closeDataModal();

    }

}


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {

    updateDashboard();

    updateRooms();

    renderInventory();

    updateHealth();

    renderActivity();

}


/* =========================================================
   HELPERS
========================================================= */

function createId() {

    return (
        Date.now()
            .toString(36)
        +
        Math.random()
            .toString(36)
            .substring(2)
    );

}


function formatNumber(
    value
) {

    return Number(
        value || 0
    )
        .toLocaleString(
            "id-ID"
        );

}


function formatDate(
    value
) {

    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "--";

    }


    return date.toLocaleString(
        "id-ID",
        {
            day:
                "2-digit",

            month:
                "2-digit",

            hour:
                "2-digit",

            minute:
                "2-digit"
        }
    );

}


function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   JSON
========================================================= */

function downloadJSON(
    data,
    filename
) {

    const blob =
        new Blob(
            [
                JSON.stringify(
                    data,
                    null,
                    2
                )
            ],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        filename;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    setTimeout(
        () => {

            URL.revokeObjectURL(
                url
            );

        },
        500
    );

}


function readJSON(
    file,
    callback
) {

    const reader =
        new FileReader();


    reader.onload =
        event => {

            try {

                const data =
                    JSON.parse(
                        event.target.result
                    );


                callback(
                    data
                );

            } catch {

                showToast(
                    "File tidak valid",
                    "JSON tidak dapat dibaca.",
                    "error"
                );

            }

        };


    reader.onerror =
        () => {

            showToast(
                "Gagal membaca",
                "File tidak dapat diproses.",
                "error"
            );

        };


    reader.readAsText(
        file
    );

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    title,
    message,
    type = "success"
) {

    clearTimeout(
        toastTimer
    );


    $("toastTitle")
        .textContent =
        title;


    $("toastMessage")
        .textContent =
        message;


    if (
        type ===
        "error"
    ) {

        $("toastIcon")
            .textContent =
            "!";

        $("toastIcon")
            .style.color =
            "#f87171";

    }

    else if (
        type ===
        "info"
    ) {

        $("toastIcon")
            .textContent =
            "i";

        $("toastIcon")
            .style.color =
            "#a78bfa";

    }

    else {

        $("toastIcon")
            .textContent =
            "✓";

        $("toastIcon")
            .style.color =
            "#4ade80";

    }


    $("toast")
        .classList.add(
            "show"
        );


    toastTimer =
        setTimeout(
            () => {

                $("toast")
                    .classList.remove(
                        "show"
                    );

            },
            3000
        );

}