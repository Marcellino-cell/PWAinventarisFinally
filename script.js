/* =========================================================
   SISTEM INVENTARIS RUANGAN V6.0
   FIREBASE GOOGLE LOGIN + LOCAL ADMIN
   PWA + LOCAL STORAGE
========================================================= */


/* =========================================================
   FIREBASE IMPORT
========================================================= */

/* =========================================================
   FIREBASE CONFIG BARU
========================================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    browserLocalPersistence,
    setPersistence,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


const firebaseConfig = {
    apiKey: "AIzaSyCGYXZYJroOjIsBw0PD2h6KqoEyZKb-Gxw",
    authDomain: "sistem-inventaris-ruangan-2026.firebaseapp.com",
    projectId: "sistem-inventaris-ruangan-2026",
    storageBucket: "sistem-inventaris-ruangan-2026.firebasestorage.app",
    messagingSenderId: "760181965978",
    appId: "1:760181965978:web:a444ceb2d29676b9e30b23",
    measurementId: "G-W1Z7CFXX0M"
};


/* =========================================================
   INITIALIZE FIREBASE
========================================================= */

const firebaseApp =
    initializeApp(firebaseConfig);

const auth =
    getAuth(firebaseApp);

const googleProvider =
    new GoogleAuthProvider();

googleProvider.setCustomParameters({
    prompt: "select_account"
});


/* =========================================================
   FIREBASE APP
========================================================= */

const firebaseApp =
    initializeApp(
        firebaseConfig
    );


/*
   Auth dibuat saat dibutuhkan.
   Dengan cara ini halaman tidak terus-menerus
   memanggil Firebase Authentication ketika
   user hanya memakai mode lokal.
*/

let auth = null;

let googleProvider = null;


/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY =
    "roomInventoryData_v60";

const ACTIVITY_KEY =
    "roomInventoryActivity_v60";

const THEME_KEY =
    "roomInventoryTheme_v60";

const AUTH_KEY =
    "roomInventoryAdminAuth_v60";

const GOOGLE_USER_KEY =
    "roomInventoryGoogleUser_v60";

const AUTO_BACKUP_KEY =
    "roomInventoryAutoBackup_v60";


/* =========================================================
   LOCAL ADMIN
========================================================= */

const ADMIN_USERNAME =
    "admin";

const ADMIN_PASSWORD =
    "admin123";


/* =========================================================
   STATE
========================================================= */

let inventoryData = [];

let activityData = [];

let editingId = null;

let confirmCallback = null;

let deferredInstallPrompt = null;

let isAdminLoggedIn = false;

let currentGoogleUser = null;

let googleLoginBusy = false;


/* =========================================================
   HELPER
========================================================= */

function $(id) {
    return document.getElementById(id);
}


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    init
);


/* =========================================================
   INIT
========================================================= */

function init() {

    try {

        loadTheme();

        loadData();

        loadActivity();

        loadLocalAuth();

        bindEvents();

        renderAll();

        updateClock();

        setInterval(
            updateClock,
            1000
        );

        registerServiceWorker();

        setTimeout(
            hideSplash,
            500
        );

    }
    catch (error) {

        /*
           Jangan spam console dengan Firebase error.
           Error internal aplikasi tetap ditangani.
        */

        hideSplash();

    }

}


/* =========================================================
   FIREBASE AUTH INIT
========================================================= */

async function getFirebaseAuth() {

    if (auth) {
        return auth;
    }


    try {

        auth =
            getAuth(
                firebaseApp
            );


        await setPersistence(
            auth,
            browserLocalPersistence
        );


        googleProvider =
            new GoogleAuthProvider();


        googleProvider.setCustomParameters({

            prompt:
                "select_account"

        });


        return auth;

    }
    catch (error) {

        /*
           Sengaja tidak console.error.
           Error ditampilkan sebagai pesan UI.
        */

        throw error;

    }

}


/* =========================================================
   LOCAL AUTH
========================================================= */

function loadLocalAuth() {

    const saved =
        localStorage.getItem(
            AUTH_KEY
        );


    if (
        saved ===
        "local-admin"
    ) {

        isAdminLoggedIn =
            true;

    }
    else if (
        saved ===
        "google-admin"
    ) {

        const user =
            getSavedGoogleUser();


        if (user) {

            currentGoogleUser =
                user;

            isAdminLoggedIn =
                true;

        }
        else {

            localStorage.removeItem(
                AUTH_KEY
            );

            isAdminLoggedIn =
                false;

        }

    }
    else {

        isAdminLoggedIn =
            false;

    }


    updateAuthUI();

}


function getSavedGoogleUser() {

    try {

        const saved =
            localStorage.getItem(
                GOOGLE_USER_KEY
            );


        return saved
            ? JSON.parse(saved)
            : null;

    }
    catch {

        return null;

    }

}


/* =========================================================
   AUTH UI
========================================================= */

function updateAuthUI() {

    const button =
        $("loginButton");

    const text =
        $("loginButtonText");


    if (!button) {
        return;
    }


    if (isAdminLoggedIn) {

        if (currentGoogleUser) {

            if (text) {

                text.textContent =
                    "Google Admin";

            }

        }
        else {

            if (text) {

                text.textContent =
                    "Logout Admin";

            }

        }

    }
    else {

        if (text) {

            text.textContent =
                "Login Admin";

        }

    }

}


/* =========================================================
   LOGIN MODAL
========================================================= */

function openLoginModal() {

    if (isAdminLoggedIn) {

        logoutAdmin();

        return;

    }


    $("loginModal")
        ?.classList.add(
            "show"
        );


    clearLoginMessages();

}


function closeLoginModal() {

    $("loginModal")
        ?.classList.remove(
            "show"
        );

}


function clearLoginMessages() {

    if ($("loginError")) {

        $("loginError")
            .textContent =
            "";

    }


    if ($("googleLoginStatus")) {

        $("googleLoginStatus")
            .innerHTML =
            "";

    }

}


/* =========================================================
   LOCAL LOGIN
========================================================= */

function handleLocalLogin(
    event
) {

    event.preventDefault();


    const username =
        $("loginUsername")
            ?.value
            .trim() ||
        "";

    const password =
        $("loginPassword")
            ?.value ||
        "";


    if (
        username ===
        ADMIN_USERNAME
        &&
        password ===
        ADMIN_PASSWORD
    ) {

        isAdminLoggedIn =
            true;

        currentGoogleUser =
            null;


        localStorage.setItem(
            AUTH_KEY,
            "local-admin"
        );


        localStorage.removeItem(
            GOOGLE_USER_KEY
        );


        updateAuthUI();

        closeLoginModal();


        addActivity(
            "Login Admin lokal",
            "fa-circle-check"
        );


        showToast(
            "Login Admin berhasil.",
            "success"
        );


        return;

    }


    if ($("loginError")) {

        $("loginError")
            .textContent =
            "Username atau password salah.";

    }


    if ($("loginPassword")) {

        $("loginPassword")
            .value =
            "";

        $("loginPassword")
            .focus();

    }

}


/* =========================================================
   GOOGLE LOGIN
========================================================= */

async function loginWithGoogle() {

    if (googleLoginBusy) {
        return;
    }


    googleLoginBusy =
        true;


    const button =
        $("googleLoginButton");


    if (button) {

        button.disabled =
            true;

        button.textContent =
            "Menghubungkan ke Google...";

    }


    setGoogleStatus(
        "Membuka Login Google...",
        "info"
    );


    try {

        const firebaseAuth =
            await getFirebaseAuth();


        const result =
            await signInWithPopup(
                firebaseAuth,
                googleProvider
            );


        if (
            !result ||
            !result.user
        ) {

            throw new Error(
                "Akun Google tidak ditemukan."
            );

        }


        const user =
            result.user;


        currentGoogleUser = {

            uid:
                user.uid,

            email:
                user.email ||
                "",

            displayName:
                user.displayName ||
                "Google Admin",

            photoURL:
                user.photoURL ||
                ""

        };


        isAdminLoggedIn =
            true;


        localStorage.setItem(
            AUTH_KEY,
            "google-admin"
        );


        localStorage.setItem(
            GOOGLE_USER_KEY,
            JSON.stringify(
                currentGoogleUser
            )
        );


        updateAuthUI();


        closeLoginModal();


        addActivity(
            `Login Google: ${
                currentGoogleUser.email
            }`,
            "fa-circle-check"
        );


        showToast(
            `Login Google berhasil. Selamat datang, ${
                currentGoogleUser.displayName
            }.`,
            "success"
        );

    }
    catch (error) {

        /*
           Tidak console.error(error)
           supaya console tidak dipenuhi
           auth/api-key-not-valid.
        */

        handleGoogleError(
            error
        );

    }
    finally {

        googleLoginBusy =
            false;


        if (button) {

            button.disabled =
                false;

            button.innerHTML = `
                <span class="google-icon">
                    G
                </span>
                Login dengan Google
            `;

        }

    }

}


/* =========================================================
   GOOGLE ERROR
========================================================= */

function handleGoogleError(
    error
) {

    const code =
        error?.code ||
        "";


    let message =
        "Login Google tidak dapat dilakukan.";


    if (
        code.includes(
            "api-key-not-valid"
        )
        ||
        code.includes(
            "invalid-api-key"
        )
    ) {

        message =
            "Firebase Authentication belum siap. Periksa Web App Firebase dan API key project baru.";

    }

    else if (
        code ===
        "auth/unauthorized-domain"
    ) {

        message =
            "Domain ini belum ditambahkan ke Authorized domains Firebase.";

    }

    else if (
        code ===
        "auth/operation-not-allowed"
    ) {

        message =
            "Google Login belum diaktifkan di Firebase.";

    }

    else if (
        code ===
        "auth/popup-blocked"
    ) {

        message =
            "Popup Google diblokir browser.";

    }

    else if (
        code ===
        "auth/popup-closed-by-user"
    ) {

        message =
            "Login Google dibatalkan.";

    }

    else if (
        code ===
        "auth/network-request-failed"
    ) {

        message =
            "Koneksi internet bermasalah.";

    }


    setGoogleStatus(
        message,
        "error"
    );


    showToast(
        message,
        "error"
    );

}


/* =========================================================
   GOOGLE STATUS
========================================================= */

function setGoogleStatus(
    message,
    type = "info"
) {

    const element =
        $("googleLoginStatus");


    if (!element) {
        return;
    }


    element.innerHTML = `

        <div class="google-status-message ${type}">

            ${escapeHtml(
                message
            )}

        </div>

    `;

}


/* =========================================================
   LOGOUT
========================================================= */

async function logoutAdmin() {

    try {

        if (
            auth &&
            currentGoogleUser
        ) {

            /*
               Tidak perlu memaksa refresh auth.
            */

        }

    }
    catch {
        /* intentionally ignored */
    }


    isAdminLoggedIn =
        false;

    currentGoogleUser =
        null;


    localStorage.removeItem(
        AUTH_KEY
    );


    localStorage.removeItem(
        GOOGLE_USER_KEY
    );


    updateAuthUI();


    addActivity(
        "Logout Admin",
        "fa-right-from-bracket"
    );


    showToast(
        "Logout berhasil.",
        "info"
    );

}


/* =========================================================
   REQUIRE ADMIN
========================================================= */

function requireAdmin(
    action
) {

    if (isAdminLoggedIn) {
        return true;
    }


    showToast(
        `Silakan login Admin untuk ${action}.`,
        "warning"
    );


    openLoginModal();


    return false;

}


/* =========================================================
   EVENT BINDING
========================================================= */

function bindEvents() {

    $("loginButton")
        ?.addEventListener(
            "click",
            openLoginModal
        );


    $("closeLoginButton")
        ?.addEventListener(
            "click",
            closeLoginModal
        );


    $("loginForm")
        ?.addEventListener(
            "submit",
            handleLocalLogin
        );


    $("googleLoginButton")
        ?.addEventListener(
            "click",
            loginWithGoogle
        );


    $("togglePasswordButton")
        ?.addEventListener(
            "click",
            togglePassword
        );


    $("mobileMenuButton")
        ?.addEventListener(
            "click",
            function () {

                $("sidebar")
                    ?.classList.toggle(
                        "open"
                    );

            }
        );


    document
        .querySelectorAll(
            ".menu-item"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        switchSection(
                            button.dataset.section
                        );

                    }
                );

            }
        );


    $("themeButton")
        ?.addEventListener(
            "click",
            toggleTheme
        );


    $("quickAddButton")
        ?.addEventListener(
            "click",
            openAddModal
        );


    $("inventoryAddButton")
        ?.addEventListener(
            "click",
            openAddModal
        );


    $("emptyAddButton")
        ?.addEventListener(
            "click",
            openAddModal
        );


    $("heroMonitorButton")
        ?.addEventListener(
            "click",
            () =>
                switchSection(
                    "monitoring"
                )
        );


    $("closeModalButton")
        ?.addEventListener(
            "click",
            closeInventoryModal
        );


    $("cancelModalButton")
        ?.addEventListener(
            "click",
            closeInventoryModal
        );


    $("inventoryForm")
        ?.addEventListener(
            "submit",
            handleFormSubmit
        );


    $("searchInput")
        ?.addEventListener(
            "input",
            renderInventory
        );


    $("roomFilter")
        ?.addEventListener(
            "change",
            renderInventory
        );


    $("conditionFilter")
        ?.addEventListener(
            "change",
            renderInventory
        );


    $("sortFilter")
        ?.addEventListener(
            "change",
            renderInventory
        );


    $("resetFilterButton")
        ?.addEventListener(
            "click",
            resetFilters
        );


    $("confirmCancel")
        ?.addEventListener(
            "click",
            closeConfirmModal
        );


    $("confirmYes")
        ?.addEventListener(
            "click",
            executeConfirm
        );


    $("clearActivityButton")
        ?.addEventListener(
            "click",
            clearActivities
        );


    $("backupButton")
        ?.addEventListener(
            "click",
            createBackup
        );


    $("restoreButton")
        ?.addEventListener(
            "click",
            () =>
                $("restoreFileInput")
                    ?.click()
        );


    $("restoreFileInput")
        ?.addEventListener(
            "change",
            handleRestore
        );


    $("exportButton")
        ?.addEventListener(
            "click",
            exportCSV
        );


    $("installButton")
        ?.addEventListener(
            "click",
            installPWA
        );


    $("inventoryModal")
        ?.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    $("inventoryModal")
                ) {

                    closeInventoryModal();

                }

            }
        );


    $("loginModal")
        ?.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    $("loginModal")
                ) {

                    closeLoginModal();

                }

            }
        );


    $("confirmModal")
        ?.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    $("confirmModal")
                ) {

                    closeConfirmModal();

                }

            }
        );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                closeLoginModal();

                closeInventoryModal();

                closeConfirmModal();

            }

        }
    );


    window.addEventListener(
        "beforeinstallprompt",
        event => {

            event.preventDefault();

            deferredInstallPrompt =
                event;


            $("installButton")
                ?.classList.remove(
                    "hidden"
                );

        }
    );

}


/* =========================================================
   NAVIGATION
========================================================= */

function switchSection(
    target
) {

    document
        .querySelectorAll(
            ".page-section"
        )
        .forEach(
            section => {

                section.classList.remove(
                    "active-section"
                );

            }
        );


    document
        .querySelectorAll(
            ".menu-item"
        )
        .forEach(
            item => {

                item.classList.toggle(
                    "active",
                    item.dataset.section ===
                    target
                );

            }
        );


    $(target)
        ?.classList.add(
            "active-section"
        );


    $("sidebar")
        ?.classList.remove(
            "open"
        );


    if (
        target ===
        "inventory"
    ) {

        renderInventory();

    }


    if (
        target ===
        "monitoring"
    ) {

        updateMonitoring();

    }


    if (
        target ===
        "statistics"
    ) {

        renderStatistics();

    }


    if (
        target ===
        "activity"
    ) {

        renderActivity();

    }

}


/* =========================================================
   PASSWORD
========================================================= */

function togglePassword() {

    const input =
        $("loginPassword");


    const button =
        $("togglePasswordButton");


    if (!input) {
        return;
    }


    if (
        input.type ===
        "password"
    ) {

        input.type =
            "text";


        if (button) {

            button.textContent =
                "Hide";

        }

    }
    else {

        input.type =
            "password";


        if (button) {

            button.textContent =
                "Show";

        }

    }

}


/* =========================================================
   INVENTORY MODAL
========================================================= */

function openAddModal() {

    if (
        !requireAdmin(
            "menambah inventaris"
        )
    ) {

        return;

    }


    editingId =
        null;


    $("modalTitle")
        .textContent =
        "Tambah Inventaris";


    $("inventoryForm")
        ?.reset();


    $("inventoryId")
        .value =
        "";


    $("inventoryQuantity")
        .value =
        "1";


    $("inventoryCondition")
        .value =
        "Baik";


    $("inventoryModal")
        ?.classList.add(
            "show"
        );


    setTimeout(
        () => {

            $("inventoryCode")
                ?.focus();

        },
        100
    );

}


function openEditModal(
    id
) {

    if (
        !requireAdmin(
            "mengedit inventaris"
        )
    ) {

        return;

    }


    const item =
        inventoryData.find(
            entry =>
                String(
                    entry.id
                ) ===
                String(
                    id
                )
        );


    if (!item) {

        showToast(
            "Data tidak ditemukan.",
            "error"
        );

        return;

    }


    editingId =
        String(
            id
        );


    $("modalTitle")
        .textContent =
        "Edit Inventaris";


    $("inventoryId")
        .value =
        item.id;


    $("inventoryCode")
        .value =
        item.kodeInventaris;


    $("inventoryName")
        .value =
        item.nama;


    $("inventoryCategory")
        .value =
        item.kategori;


    $("inventoryRoom")
        .value =
        item.ruangan;


    $("inventoryQuantity")
        .value =
        item.jumlah;


    $("inventoryCondition")
        .value =
        item.kondisi;


    $("inventoryNotes")
        .value =
        item.keterangan ||
        "";


    $("inventoryModal")
        ?.classList.add(
            "show"
        );

}


function closeInventoryModal() {

    $("inventoryModal")
        ?.classList.remove(
            "show"
        );


    editingId =
        null;

}


/* =========================================================
   FORM SUBMIT
========================================================= */

function handleFormSubmit(
    event
) {

    event.preventDefault();


    if (
        !requireAdmin(
            "menyimpan inventaris"
        )
    ) {

        return;

    }


    const code =
        $("inventoryCode")
            .value
            .trim();


    const name =
        $("inventoryName")
            .value
            .trim();


    const category =
        $("inventoryCategory")
            .value
            .trim();


    const room =
        $("inventoryRoom")
            .value
            .trim();


    const quantity =
        Number(
            $("inventoryQuantity")
                .value
        );


    const condition =
        $("inventoryCondition")
            .value;


    const notes =
        $("inventoryNotes")
            .value
            .trim();


    if (
        !code ||
        !name ||
        !category ||
        !room
    ) {

        showToast(
            "Semua field wajib diisi.",
            "warning"
        );

        return;

    }


    if (
        !Number.isFinite(
            quantity
        ) ||
        quantity < 0
    ) {

        showToast(
            "Jumlah tidak valid.",
            "warning"
        );

        return;

    }


    const duplicate =
        inventoryData.find(
            item =>

                String(
                    item.kodeInventaris
                ).toLowerCase() ===
                code.toLowerCase()

                &&

                String(
                    item.id
                ) !==
                String(
                    editingId
                )
        );


    if (duplicate) {

        showToast(
            "Kode inventaris sudah digunakan.",
            "warning"
        );

        return;

    }


    if (editingId) {

        const index =
            inventoryData.findIndex(
                item =>
                    String(
                        item.id
                    ) ===
                    String(
                        editingId
                    )
            );


        if (
            index ===
            -1
        ) {

            return;

        }


        inventoryData[index] = {

            ...inventoryData[index],

            kodeInventaris:
                code,

            nama:
                name,

            kategori:
                category,

            ruangan:
                room,

            jumlah:
                quantity,

            kondisi:
                condition,

            keterangan:
                notes,

            updatedAt:
                new Date()
                    .toISOString()

        };


        addActivity(
            `Mengubah "${name}"`,
            "fa-pen"
        );


        showToast(
            "Data berhasil diperbarui.",
            "success"
        );

    }
    else {

        inventoryData.unshift({

            id:
                createId(),

            kodeInventaris:
                code,

            nama:
                name,

            kategori:
                category,

            ruangan:
                room,

            jumlah:
                quantity,

            kondisi:
                condition,

            keterangan:
                notes,

            tanggal:
                new Date()
                    .toISOString(),

            updatedAt:
                new Date()
                    .toISOString()

        });


        addActivity(
            `Menambahkan "${name}"`,
            "fa-plus"
        );


        showToast(
            "Inventaris berhasil ditambahkan.",
            "success"
        );

    }


    saveData();

    closeInventoryModal();

    renderAll();

}


/* =========================================================
   DELETE
========================================================= */

function deleteInventory(
    id
) {

    if (
        !requireAdmin(
            "menghapus inventaris"
        )
    ) {

        return;

    }


    const item =
        inventoryData.find(
            entry =>
                String(
                    entry.id
                ) ===
                String(
                    id
                )
        );


    if (!item) {
        return;
    }


    openConfirmModal(
        "Hapus Inventaris",
        `Yakin ingin menghapus "${item.nama}"?`,
        () => {

            inventoryData =
                inventoryData.filter(
                    entry =>
                        String(
                            entry.id
                        ) !==
                        String(
                            id
                        )
                );


            saveData();


            addActivity(
                `Menghapus "${item.nama}"`,
                "fa-trash"
            );


            renderAll();


            showToast(
                "Data berhasil dihapus.",
                "success"
            );

        }
    );

}


/* =========================================================
   INVENTORY RENDER
========================================================= */

function renderInventory() {

    const tbody =
        $("inventoryTableBody");


    if (!tbody) {
        return;
    }


    const search =
        $("searchInput")
            ?.value
            .trim()
            .toLowerCase() ||
        "";


    const room =
        $("roomFilter")
            ?.value ||
        "all";


    const condition =
        $("conditionFilter")
            ?.value ||
        "all";


    const sort =
        $("sortFilter")
            ?.value ||
        "newest";


    let result =
        inventoryData.filter(
            item => {

                const searchable =
                    [
                        item.kodeInventaris,
                        item.nama,
                        item.kategori,
                        item.ruangan
                    ]
                    .join(" ")
                    .toLowerCase();


                const searchMatch =
                    !search ||
                    searchable.includes(
                        search
                    );


                const roomMatch =
                    room === "all" ||
                    item.ruangan ===
                    room;


                const conditionMatch =
                    condition === "all" ||
                    item.kondisi ===
                    condition;


                return (
                    searchMatch &&
                    roomMatch &&
                    conditionMatch
                );

            }
        );


    result.sort(
        (a, b) => {

            if (
                sort ===
                "oldest"
            ) {

                return (
                    new Date(
                        a.tanggal
                    ) -
                    new Date(
                        b.tanggal
                    )
                );

            }


            if (
                sort ===
                "nameAsc"
            ) {

                return a.nama.localeCompare(
                    b.nama,
                    "id"
                );

            }


            if (
                sort ===
                "nameDesc"
            ) {

                return b.nama.localeCompare(
                    a.nama,
                    "id"
                );

            }


            if (
                sort ===
                "stockHigh"
            ) {

                return (
                    Number(
                        b.jumlah
                    ) -
                    Number(
                        a.jumlah
                    )
                );

            }


            if (
                sort ===
                "stockLow"
            ) {

                return (
                    Number(
                        a.jumlah
                    ) -
                    Number(
                        b.jumlah
                    )
                );

            }


            return (
                new Date(
                    b.tanggal
                ) -
                new Date(
                    a.tanggal
                )
            );

        }
    );


    tbody.innerHTML =
        "";


    result.forEach(
        item => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>

                    <span class="code-badge">

                        ${escapeHtml(
                            item.kodeInventaris
                        )}

                    </span>

                </td>


                <td>

                    <strong>

                        ${escapeHtml(
                            item.nama
                        )}

                    </strong>

                </td>


                <td>

                    ${escapeHtml(
                        item.kategori
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        item.ruangan
                    )}

                </td>


                <td>

                    ${Number(
                        item.jumlah
                    )}

                </td>


                <td>

                    <span
                        class="condition-badge ${String(
                            item.kondisi
                        ).toLowerCase()}"
                    >

                        ${conditionLabel(
                            item.kondisi
                        )}

                    </span>

                </td>


                <td>

                    ${formatDate(
                        item.tanggal
                    )}

                </td>


                <td>

                    <div class="action-buttons">

                        <button
                            class="icon-button edit-button"
                            type="button"
                            title="Edit"
                        >
                            Edit
                        </button>


                        <button
                            class="icon-button delete delete-button"
                            type="button"
                            title="Hapus"
                        >
                            ×
                        </button>

                    </div>

                </td>

            `;


            row.querySelector(
                ".edit-button"
            )
            ?.addEventListener(
                "click",
                () =>
                    openEditModal(
                        item.id
                    )
            );


            row.querySelector(
                ".delete-button"
            )
            ?.addEventListener(
                "click",
                () =>
                    deleteInventory(
                        item.id
                    )
            );


            tbody.appendChild(
                row
            );

        }
    );


    setText(
        "resultCount",
        result.length
    );


    $("emptyState")
        ?.classList.toggle(
            "hidden",
            result.length > 0
        );

}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    const total =
        inventoryData.length;


    const good =
        inventoryData.filter(
            item =>
                item.kondisi ===
                "Baik"
        ).length;


    const attention =
        inventoryData.filter(
            item =>
                item.kondisi !==
                "Baik"
        ).length;


    const totalStock =
        inventoryData.reduce(
            (
                sum,
                item
            ) =>
                sum +
                Number(
                    item.jumlah ||
                    0
                ),
            0
        );


    setText(
        "totalItems",
        total
    );


    setText(
        "goodItems",
        good
    );


    setText(
        "attentionItems",
        attention
    );


    setText(
        "totalStock",
        totalStock
    );


    renderRecent();

    renderLowStock();

    renderRooms();

}


/* =========================================================
   RECENT
========================================================= */

function renderRecent() {

    const container =
        $("recentItems");


    if (!container) {
        return;
    }


    const items =
        [...inventoryData]
            .sort(
                (a, b) =>
                    new Date(
                        b.tanggal
                    ) -
                    new Date(
                        a.tanggal
                    )
            )
            .slice(
                0,
                5
            );


    if (!items.length) {

        container.innerHTML = `
            <div class="empty-mini">
                Belum ada inventaris.
            </div>
        `;

        return;

    }


    container.innerHTML =
        items
            .map(
                item => `

                    <div class="recent-item">

                        <div class="recent-item-main">

                            <strong>
                                ${escapeHtml(
                                    item.nama
                                )}
                            </strong>

                            <span>
                                ${escapeHtml(
                                    item.ruangan
                                )}
                                ·
                                ${item.jumlah}
                                unit
                            </span>

                        </div>

                        <span class="recent-date">
                            ${formatDate(
                                item.tanggal
                            )}
                        </span>

                    </div>

                `
            )
            .join("");

}


/* =========================================================
   LOW STOCK
========================================================= */

function renderLowStock() {

    const container =
        $("lowStockPreview");


    if (!container) {
        return;
    }


    const items =
        inventoryData
            .filter(
                item =>
                    Number(
                        item.jumlah
                    ) <= 2
            )
            .slice(
                0,
                5
            );


    if (!items.length) {

        container.innerHTML = `
            <div class="empty-mini">
                Tidak ada stok rendah.
            </div>
        `;

        return;

    }


    container.innerHTML =
        items
            .map(
                item => `

                    <div class="mini-item">

                        <div class="mini-item-main">

                            <strong>
                                ${escapeHtml(
                                    item.nama
                                )}
                            </strong>

                            <span>
                                ${escapeHtml(
                                    item.ruangan
                                )}
                            </span>

                        </div>

                        <span class="mini-stock">
                            ${item.jumlah}
                        </span>

                    </div>

                `
            )
            .join("");

}


/* =========================================================
   ROOM
========================================================= */

function renderRooms() {

    const container =
        $("roomOverview");


    if (!container) {
        return;
    }


    const rooms = {};


    inventoryData.forEach(
        item => {

            rooms[
                item.ruangan
            ] = (
                rooms[
                    item.ruangan
                ] ||
                0
            ) +
            Number(
                item.jumlah ||
                0
            );

        }
    );


    const entries =
        Object.entries(
            rooms
        )
        .sort(
            (a, b) =>
                b[1] -
                a[1]
        );


    if (!entries.length) {

        container.innerHTML = `
            <div class="empty-mini">
                Belum ada data ruangan.
            </div>
        `;

        return;

    }


    const max =
        Math.max(
            ...entries.map(
                item =>
                    item[1]
            ),
            1
        );


    container.innerHTML =
        entries
            .slice(
                0,
                8
            )
            .map(
                ([room, count]) => {

                    const width =
                        Math.round(
                            count /
                            max *
                            100
                        );


                    return `

                        <div class="room-row">

                            <div class="room-name">
                                ${escapeHtml(
                                    room
                                )}
                            </div>

                            <div class="room-bar">

                                <div
                                    style="width:${width}%"
                                ></div>

                            </div>

                            <strong>
                                ${count}
                            </strong>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   MONITORING
========================================================= */

function updateMonitoring() {

    const total =
        inventoryData.length;


    const good =
        inventoryData.filter(
            item =>
                item.kondisi ===
                "Baik"
        ).length;


    const light =
        inventoryData.filter(
            item =>
                item.kondisi ===
                "Ringan"
        ).length;


    const heavy =
        inventoryData.filter(
            item =>
                item.kondisi ===
                "Berat"
        ).length;


    const lowStock =
        inventoryData.filter(
            item =>
                Number(
                    item.jumlah
                ) <= 2
        ).length;


    setText(
        "monitorTotal",
        total
    );


    setText(
        "monitorGood",
        good
    );


    setText(
        "monitorLowStock",
        lowStock
    );


    setText(
        "monitorHealthGood",
        good
    );


    setText(
        "monitorHealthLight",
        light
    );


    setText(
        "monitorHealthHeavy",
        heavy
    );


    updateHealth();

    updateStorage();

}


/* =========================================================
   HEALTH
========================================================= */

function updateHealth() {

    const total =
        inventoryData.length;


    if (!total) {

        setText(
            "dataHealth",
            "0%"
        );


        setText(
            "healthGoodCount",
            "0"
        );


        setText(
            "healthLightCount",
            "0"
        );


        setText(
            "healthHeavyCount",
            "0"
        );


        setWidth(
            "healthProgress",
            "0%"
        );


        return;

    }


    const good =
        inventoryData.filter(
            item =>
                item.kondisi ===
                "Baik"
        ).length;


    const light =
        inventoryData.filter(
            item =>
                item.kondisi ===
                "Ringan"
        ).length;


    const heavy =
        inventoryData.filter(
            item =>
                item.kondisi ===
                "Berat"
        ).length;


    const percentage =
        Math.round(
            good /
            total *
            100
        );


    setText(
        "dataHealth",
        `${percentage}%`
    );


    setWidth(
        "healthProgress",
        `${percentage}%`
    );


    setText(
        "healthGoodCount",
        good
    );


    setText(
        "healthLightCount",
        light
    );


    setText(
        "healthHeavyCount",
        heavy
    );

}


/* =========================================================
   STORAGE
========================================================= */

function updateStorage() {

    try {

        const data =
            localStorage.getItem(
                STORAGE_KEY
            ) ||
            "";


        const bytes =
            new Blob(
                [data]
            ).size;


        const percentage =
            Math.min(
                100,
                Math.round(
                    bytes /
                    (
                        5 *
                        1024 *
                        1024
                    ) *
                    100
                )
            );


        setText(
            "monitorStorage",
            `${percentage}%`
        );


        setText(
            "terminalStorage",
            `${percentage}%`
        );

    }
    catch {

        setText(
            "monitorStorage",
            "0%"
        );


        setText(
            "terminalStorage",
            "0%"
        );

    }

}


/* =========================================================
   STATISTICS
========================================================= */

function renderStatistics() {

    const total =
        inventoryData.length;


    const totalStock =
        inventoryData.reduce(
            (
                sum,
                item
            ) =>
                sum +
                Number(
                    item.jumlah ||
                    0
                ),
            0
        );


    const rooms =
        new Set(
            inventoryData.map(
                item =>
                    item.ruangan
            )
        );


    const categories =
        new Set(
            inventoryData.map(
                item =>
                    item.kategori
            )
        );


    setText(
        "statTotalItems",
        total
    );


    setText(
        "statTotalStock",
        totalStock
    );


    setText(
        "statTotalRooms",
        rooms.size
    );


    setText(
        "statTotalCategories",
        categories.size
    );


    const good =
        inventoryData.filter(
            item =>
                item.kondisi ===
                "Baik"
        ).length;


    const light =
        inventoryData.filter(
            item =>
                item.kondisi ===
                "Ringan"
        ).length;


    const heavy =
        inventoryData.filter(
            item =>
                item.kondisi ===
                "Berat"
        ).length;


    const goodPercent =
        total
            ? Math.round(
                good /
                total *
                100
            )
            : 0;


    const lightPercent =
        total
            ? Math.round(
                light /
                total *
                100
            )
            : 0;


    const heavyPercent =
        total
            ? Math.round(
                heavy /
                total *
                100
            )
            : 0;


    setText(
        "donutTotal",
        total
    );


    setText(
        "legendGood",
        `${goodPercent}%`
    );


    setText(
        "legendLight",
        `${lightPercent}%`
    );


    setText(
        "legendHeavy",
        `${heavyPercent}%`
    );


    const goodEnd =
        goodPercent;


    const lightEnd =
        goodPercent +
        lightPercent;


    const donut =
        $("conditionDonut");


    if (donut) {

        donut.style.background =

            `conic-gradient(
                var(--green) 0% ${goodEnd}%,
                var(--orange) ${goodEnd}% ${lightEnd}%,
                var(--red) ${lightEnd}% 100%
            )`;

    }


    renderCategories();

}


/* =========================================================
   CATEGORIES
========================================================= */

function renderCategories() {

    const container =
        $("categoryStats");


    if (!container) {
        return;
    }


    const categories = {};


    inventoryData.forEach(
        item => {

            categories[
                item.kategori
            ] = (
                categories[
                    item.kategori
                ] ||
                0
            ) +
            Number(
                item.jumlah ||
                0
            );

        }
    );


    const list =
        Object.entries(
            categories
        )
        .sort(
            (a, b) =>
                b[1] -
                a[1]
        )
        .slice(
            0,
            8
        );


    if (!list.length) {

        container.innerHTML = `
            <div class="empty-mini">
                Belum ada kategori.
            </div>
        `;

        return;

    }


    const max =
        Math.max(
            ...list.map(
                item =>
                    item[1]
            ),
            1
        );


    container.innerHTML =
        list
            .map(
                ([name, count]) => {

                    const width =
                        Math.round(
                            count /
                            max *
                            100
                        );


                    return `

                        <div class="category-item">

                            <div class="category-name">
                                ${escapeHtml(
                                    name
                                )}
                            </div>

                            <div class="category-bar">

                                <div
                                    style="width:${width}%"
                                ></div>

                            </div>

                            <strong>
                                ${count}
                            </strong>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   ACTIVITY
========================================================= */

function loadActivity() {

    try {

        const saved =
            localStorage.getItem(
                ACTIVITY_KEY
            );


        const parsed =
            saved
                ? JSON.parse(
                    saved
                )
                : [];


        activityData =
            Array.isArray(
                parsed
            )
                ? parsed
                : [];

    }
    catch {

        activityData =
            [];

    }

}


function saveActivity() {

    localStorage.setItem(
        ACTIVITY_KEY,
        JSON.stringify(
            activityData.slice(
                0,
                50
            )
        )
    );

}


function addActivity(
    text,
    icon = "fa-circle-info"
) {

    activityData.unshift({

        id:
            createId(),

        text:
            text,

        icon:
            icon,

        time:
            new Date()
                .toISOString()

    });


    activityData =
        activityData.slice(
            0,
            50
        );


    saveActivity();

    renderActivity();

}


function renderActivity() {

    const container =
        $("activityLog");


    if (!container) {
        return;
    }


    if (!activityData.length) {

        container.innerHTML = `
            <div class="empty-mini">
                Belum ada aktivitas.
            </div>
        `;

        return;

    }


    container.innerHTML =
        activityData
            .slice(
                0,
                30
            )
            .map(
                item => `

                    <div class="activity-item">

                        <div class="activity-icon">
                            •
                        </div>

                        <div class="activity-text">

                            <strong>
                                ${escapeHtml(
                                    item.text
                                )}
                            </strong>

                            <span>
                                Sistem Inventaris
                            </span>

                        </div>

                        <div class="activity-time">
                            ${formatTime(
                                item.time
                            )}
                        </div>

                    </div>

                `
            )
            .join("");

}


/* =========================================================
   CLEAR ACTIVITY
========================================================= */

function clearActivities() {

    if (
        !requireAdmin(
            "menghapus aktivitas"
        )
    ) {

        return;

    }


    if (!activityData.length) {

        showToast(
            "Aktivitas sudah kosong.",
            "info"
        );

        return;

    }


    openConfirmModal(
        "Hapus Aktivitas",
        "Semua aktivitas akan dihapus.",
        () => {

            activityData =
                [];


            saveActivity();

            renderActivity();


            showToast(
                "Aktivitas berhasil dihapus.",
                "success"
            );

        }
    );

}


/* =========================================================
   BACKUP
========================================================= */

function createBackup() {

    if (
        !requireAdmin(
            "membuat backup"
        )
    ) {

        return;

    }


    const backup = {

        version:
            "6.0",

        createdAt:
            new Date()
                .toISOString(),

        inventory:
            inventoryData,

        activities:
            activityData

    };


    localStorage.setItem(
        AUTO_BACKUP_KEY,
        JSON.stringify(
            backup
        )
    );


    downloadFile(
        JSON.stringify(
            backup,
            null,
            2
        ),
        `inventory-backup-${fileDate()}.json`,
        "application/json"
    );


    addActivity(
        "Membuat backup data",
        "fa-database"
    );


    showToast(
        "Backup berhasil dibuat.",
        "success"
    );

}


/* =========================================================
   RESTORE
========================================================= */

function handleRestore(
    event
) {

    if (
        !requireAdmin(
            "melakukan restore"
        )
    ) {

        event.target.value =
            "";

        return;

    }


    const file =
        event.target.files?.[0];


    if (!file) {
        return;
    }


    readJSON(file)
        .then(
            data => {

                if (
                    !data ||
                    !Array.isArray(
                        data.inventory
                    )
                ) {

                    throw new Error(
                        "Backup tidak valid."
                    );

                }


                openConfirmModal(
                    "Restore Backup",
                    "Data saat ini akan diganti.",
                    () => {

                        inventoryData =
                            normalizeData(
                                data.inventory
                            );


                        if (
                            Array.isArray(
                                data.activities
                            )
                        ) {

                            activityData =
                                data.activities;

                        }


                        saveData();

                        saveActivity();

                        renderAll();


                        addActivity(
                            "Memulihkan backup",
                            "fa-clock"
                        );


                        showToast(
                            "Backup berhasil dipulihkan.",
                            "success"
                        );

                    }
                );

            }
        )
        .catch(
            () => {

                showToast(
                    "File backup tidak valid.",
                    "error"
                );

            }
        )
        .finally(
            () => {

                event.target.value =
                    "";

            }
        );

}


/* =========================================================
   EXPORT CSV
========================================================= */

function exportCSV() {

    if (
        !inventoryData.length
    ) {

        showToast(
            "Belum ada data.",
            "info"
        );

        return;

    }


    const headers = [

        "Kode Inventaris",
        "Nama Barang",
        "Kategori",
        "Ruangan",
        "Jumlah",
        "Kondisi",
        "Keterangan",
        "Tanggal"

    ];


    const rows =
        inventoryData.map(
            item => [

                item.kodeInventaris,

                item.nama,

                item.kategori,

                item.ruangan,

                item.jumlah,

                conditionLabel(
                    item.kondisi
                ),

                item.keterangan,

                formatDate(
                    item.tanggal
                )

            ]
        );


    const csv =
        [
            headers,
            ...rows
        ]
        .map(
            row =>
                row
                    .map(
                        csvEscape
                    )
                    .join(",")
        )
        .join("\n");


    downloadFile(
        "\uFEFF" +
        csv,
        `inventaris-${fileDate()}.csv`,
        "text/csv;charset=utf-8;"
    );


    addActivity(
        "Export CSV",
        "fa-file-export"
    );


    showToast(
        "Data berhasil diexport.",
        "success"
    );

}


/* =========================================================
   RESET FILTER
========================================================= */

function resetFilters() {

    $("searchInput")
        .value =
        "";

    $("roomFilter")
        .value =
        "all";

    $("conditionFilter")
        .value =
        "all";

    $("sortFilter")
        .value =
        "newest";


    renderInventory();

}


/* =========================================================
   CONFIRM
========================================================= */

function openConfirmModal(
    title,
    message,
    callback
) {

    setText(
        "confirmTitle",
        title
    );


    setText(
        "confirmMessage",
        message
    );


    confirmCallback =
        callback;


    $("confirmModal")
        ?.classList.add(
            "show"
        );

}


function closeConfirmModal() {

    $("confirmModal")
        ?.classList.remove(
            "show"
        );


    confirmCallback =
        null;

}


function executeConfirm() {

    const callback =
        confirmCallback;


    closeConfirmModal();


    if (
        typeof callback ===
        "function"
    ) {

        callback();

    }

}


/* =========================================================
   THEME
========================================================= */

function loadTheme() {

    const theme =
        localStorage.getItem(
            THEME_KEY
        );


    const dark =
        theme ===
        "dark";


    document.body.classList.toggle(
        "dark",
        dark
    );


    updateThemeButton(
        dark
    );

}


function toggleTheme() {

    const dark =
        document.body.classList.toggle(
            "dark"
        );


    localStorage.setItem(
        THEME_KEY,
        dark
            ? "dark"
            : "light"
    );


    updateThemeButton(
        dark
    );

}


function updateThemeButton(
    dark
) {

    const button =
        $("themeButton");


    if (!button) {
        return;
    }


    button.innerHTML =
        dark
            ? "☀ Mode Terang"
            : "☾ Mode Gelap";

}


/* =========================================================
   DATA
========================================================= */

function loadData() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );


        inventoryData =
            saved
                ? normalizeData(
                    JSON.parse(
                        saved
                    )
                )
                : [];

    }
    catch {

        inventoryData =
            [];

    }

}


function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
            inventoryData
        )
    );

}


function normalizeData(
    data
) {

    if (
        !Array.isArray(
            data
        )
    ) {

        return [];

    }


    return data.map(
        item => ({

            id:
                item.id ||
                createId(),

            kodeInventaris:
                item.kodeInventaris ||
                item.kode ||
                "",

            nama:
                item.nama ||
                item.name ||
                "",

            kategori:
                item.kategori ||
                item.category ||
                "",

            ruangan:
                item.ruangan ||
                item.room ||
                "",

            jumlah:
                Number(
                    item.jumlah ??
                    item.quantity ??
                    0
                ),

            kondisi:
                item.kondisi ||
                item.condition ||
                "Baik",

            keterangan:
                item.keterangan ||
                item.notes ||
                "",

            tanggal:
                item.tanggal ||
                item.createdAt ||
                new Date()
                    .toISOString(),

            updatedAt:
                item.updatedAt ||
                new Date()
                    .toISOString()

        })
    );

}


/* =========================================================
   FILTER ROOM
========================================================= */

function updateRoomFilter() {

    const select =
        $("roomFilter");


    if (!select) {
        return;
    }


    const current =
        select.value;


    const rooms =
        [
            ...new Set(
                inventoryData
                    .map(
                        item =>
                            item.ruangan
                    )
                    .filter(Boolean)
            )
        ]
        .sort(
            (a, b) =>
                a.localeCompare(
                    b,
                    "id"
                )
        );


    select.innerHTML = `
        <option value="all">
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
        rooms.includes(
            current
        )
    ) {

        select.value =
            current;

    }

}


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {

    renderInventory();

    updateDashboard();

    updateMonitoring();

    renderStatistics();

    renderActivity();

    updateRoomFilter();

    updateStorage();

    updateFooterYear();

    updateAuthUI();

}


/* =========================================================
   SPLASH
========================================================= */

function hideSplash() {

    const splash =
        $("splashScreen");


    if (!splash) {
        return;
    }


    setText(
        "loadingText",
        "Sistem siap!"
    );


    setTimeout(
        () => {

            splash.classList.add(
                "hide"
            );

        },
        350
    );

}


/* =========================================================
   CLOCK
========================================================= */

function updateClock() {

    const now =
        new Date();


    if ($("liveClock")) {

        $("liveClock")
            .textContent =
            now.toLocaleTimeString(
                "id-ID",
                {

                    hour:
                        "2-digit",

                    minute:
                        "2-digit",

                    second:
                        "2-digit"

                }
            );

    }


    if ($("liveDate")) {

        $("liveDate")
            .textContent =
            now.toLocaleDateString(
                "id-ID",
                {

                    weekday:
                        "long",

                    day:
                        "numeric",

                    month:
                        "long",

                    year:
                        "numeric"

                }
            );

    }

}


/* =========================================================
   FOOTER
========================================================= */

function updateFooterYear() {

    setText(
        "footerYear",
        new Date()
            .getFullYear()
    );

}


/* =========================================================
   PWA
========================================================= */

function registerServiceWorker() {

    if (
        !("serviceWorker" in navigator)
    ) {
        return;
    }


    if (
        location.protocol ===
        "file:"
    ) {
        return;
    }


    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
                .register(
                    "service-worker.js",
                    {
                        updateViaCache:
                            "none"
                    }
                )
                .catch(
                    () => {
                        /*
                           SW error tidak dibiarkan
                           memenuhi console.
                        */
                    }
                );

        }
    );

}


async function installPWA() {

    if (
        !deferredInstallPrompt
    ) {

        showToast(
            "Installasi belum tersedia di browser ini.",
            "info"
        );

        return;

    }


    try {

        await deferredInstallPrompt.prompt();

        await deferredInstallPrompt.userChoice;

    }
    catch {
        /* ignore */
    }


    deferredInstallPrompt =
        null;


    $("installButton")
        ?.classList.add(
            "hidden"
        );

}


/* =========================================================
   UTILITIES
========================================================= */

function createId() {

    if (
        window.crypto?.randomUUID
    ) {

        return crypto.randomUUID();

    }


    return (
        Date.now()
            .toString(36) +
        Math.random()
            .toString(36)
            .slice(2)
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

        return "-";

    }


    return date.toLocaleDateString(
        "id-ID",
        {

            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric"

        }
    );

}


function formatTime(
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

        return "-";

    }


    return date.toLocaleTimeString(
        "id-ID",
        {

            hour:
                "2-digit",

            minute:
                "2-digit"

        }
    );

}


function fileDate() {

    const date =
        new Date();


    return [

        date.getFullYear(),

        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        ),

        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        )

    ].join("-");

}


function conditionLabel(
    value
) {

    if (
        value ===
        "Ringan"
    ) {

        return "Rusak Ringan";

    }


    if (
        value ===
        "Berat"
    ) {

        return "Rusak Berat";

    }


    return "Baik";

}


function csvEscape(
    value
) {

    const text =
        String(
            value ??
            ""
        );


    if (
        text.includes(",") ||
        text.includes('"') ||
        text.includes("\n")
    ) {

        return (
            '"' +
            text.replace(
                /"/g,
                '""'
            ) +
            '"'
        );

    }


    return text;

}


function downloadFile(
    content,
    filename,
    type
) {

    const blob =
        new Blob(
            [content],
            {
                type
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


    link.style.display =
        "none";


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
        300
    );

}


function readJSON(
    file
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const reader =
                new FileReader();


            reader.onload =
                () => {

                    try {

                        resolve(
                            JSON.parse(
                                reader.result
                            )
                        );

                    }
                    catch (
                        error
                    ) {

                        reject(
                            error
                        );

                    }

                };


            reader.onerror =
                () =>
                    reject(
                        reader.error
                    );


            reader.readAsText(
                file
            );

        }
    );

}


function escapeHtml(
    value
) {

    return String(
        value ??
        ""
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


function setText(
    id,
    value
) {

    const element =
        $(id);


    if (element) {

        element.textContent =
            String(
                value ??
                ""
            );

    }

}


function setWidth(
    id,
    value
) {

    const element =
        $(id);


    if (element) {

        element.style.width =
            value;

    }

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message,
    type = "info"
) {

    const container =
        $("toastContainer");


    if (!container) {
        return;
    }


    const toast =
        document.createElement(
            "div"
        );


    const icon =
        type === "success"
            ? "✓"
            : type === "error"
                ? "!"
                : type === "warning"
                    ? "!"
                    : "i";


    toast.className =
        `toast ${type}`;


    toast.innerHTML = `

        <i>
            ${icon}
        </i>

        <div>

            <strong>
                ${
                    type === "success"
                        ? "Berhasil"
                        : type === "error"
                            ? "Error"
                            : type === "warning"
                                ? "Peringatan"
                                : "Informasi"
                }
            </strong>

            <span>
                ${escapeHtml(
                    message
                )}
            </span>

        </div>

    `;


    container.appendChild(
        toast
    );


    requestAnimationFrame(
        () => {

            toast.classList.add(
                "show"
            );

        }
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );


            setTimeout(
                () =>
                    toast.remove(),
                300
            );

        },
        3500
    );

}


/* =========================================================
   GLOBAL
========================================================= */

window.inventoryApp = {

    loginGoogle:
        loginWithGoogle,

    logout:
        logoutAdmin,

    isAdmin:
        () =>
            isAdminLoggedIn,

    data:
        () =>
            inventoryData

};

/* =========================================================
   LOW STOCK
========================================================= */

function renderLowStock() {

    const container =
        $("lowStockPreview");


    if (!container) {

        return;

    }


    const items =
        inventoryData
            .filter(
                item =>
                    Number(
                        item.jumlah
                    ) <= 2
            )
            .slice(
                0,
                5
            );


    if (!items.length) {

        container.innerHTML = `

            <div class="empty-mini">

                Tidak ada stok rendah.

            </div>

        `;


        return;

    }


    container.innerHTML =
        items.map(
            function (
                item
            ) {

                return `

                    <div class="mini-item">

                        <div class="mini-item-main">

                            <strong>

                                ${escapeHtml(
                                    item.nama
                                )}

                            </strong>

                            <span>

                                ${escapeHtml(
                                    item.ruangan
                                )}

                            </span>

                        </div>

                        <span class="mini-stock">

                            ${item.jumlah}

                        </span>

                    </div>

                `;

            }
        ).join("");

}


/* =========================================================
   RECENT
========================================================= */

function renderRecent() {

    const container =
        $("recentItems");


    if (!container) {

        return;

    }


    const items =
        [
            ...inventoryData
        ]
        .sort(
            (a,b) =>
                new Date(
                    b.tanggal
                )
                -
                new Date(
                    a.tanggal
                )
        )
        .slice(
            0,
            6
        );


    if (!items.length) {

        container.innerHTML = `

            <div class="empty-mini">

                Belum ada inventaris.

            </div>

        `;


        return;

    }


    container.innerHTML =
        items.map(
            function (
                item
            ) {

                return `

                    <div class="recent-item">

                        <div class="recent-item-main">

                            <strong>

                                ${escapeHtml(
                                    item.nama
                                )}

                            </strong>

                            <span>

                                ${escapeHtml(
                                    item.ruangan
                                )}

                                ·

                                ${item.jumlah}
                                unit

                            </span>

                        </div>

                        <span class="recent-date">

                            ${formatDate(
                                item.tanggal
                            )}

                        </span>

                    </div>

                `;

            }
        ).join("");

}


/* =========================================================
   ROOM FILTER
========================================================= */

function updateRoomFilter() {

    const select =
        $("roomFilter");


    if (!select) {

        return;

    }


    const current =
        select.value;


    const rooms =
        [
            ...new Set(
                inventoryData.map(
                    item =>
                        item.ruangan
                )
            )
        ]
        .sort(
            (a,b) =>
                a.localeCompare(
                    b,
                    "id"
                )
        );


    select.innerHTML = `

        <option value="all">

            Semua Ruangan

        </option>

    `;


    rooms.forEach(
        function (
            room
        ) {

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
        rooms.includes(
            current
        )
    ) {

        select.value =
            current;

    }

}


/* =========================================================
   MONITORING
========================================================= */

function updateMonitoring() {

    const total =
        inventoryData.length;


    const good =
        inventoryData.filter(
            item =>
                item.kondisi ===
                "Baik"
        ).length;


    const light =
        inventoryData.filter(
            item =>
                item.kondisi ===
                "Ringan"
        ).length;


    const heavy =
        inventoryData.filter(
            item =>
                item.kondisi ===
                "Berat"
        ).length;


    const low =
        inventoryData.filter(
            item =>
                Number(
                    item.jumlah
                ) <= 2
        ).length;


    if ($("monitorTotal")) {

        $("monitorTotal")
            .textContent =
            total;

    }


    if ($("monitorGood")) {

        $("monitorGood")
            .textContent =
            good;

    }


    if ($("monitorLowStock")) {

        $("monitorLowStock")
            .textContent =
            low;

    }


    if ($("healthGoodCount")) {

        $("healthGoodCount")
            .textContent =
            good;

    }


    if ($("healthLightCount")) {

        $("healthLightCount")
            .textContent =
            light;

    }


    if ($("healthHeavyCount")) {

        $("healthHeavyCount")
            .textContent =
            heavy;

    }


    renderRooms();

}


/* =========================================================
   ROOM OVERVIEW
========================================================= */

function renderRooms() {

    const container =
        $("roomOverview");


    if (!container) {

        return;

    }


    const roomData =
        {};


    inventoryData.forEach(
        function (
            item
        ) {

            roomData[
                item.ruangan
            ] =

                (
                    roomData[
                        item.ruangan
                    ]
                    ||
                    0
                )

                +

                Number(
                    item.jumlah ||
                    0
                );

        }
    );


    const rooms =
        Object.entries(
            roomData
        )
        .sort(
            (a,b) =>
                b[1] -
                a[1]
        );


    if (!rooms.length) {

        container.innerHTML = `

            <div class="empty-mini">

                Belum ada data ruangan.

            </div>

        `;


        return;

    }


    const max =
        Math.max(
            ...rooms.map(
                item =>
                    item[1]
            ),
            1
        );


    container.innerHTML =
        rooms
            .slice(
                0,
                8
            )
            .map(
                function (
                    [
                        room,
                        count
                    ]
                ) {

                    const width =
                        Math.round(
                            count /
                            max *
                            100
                        );


                    return `

                        <div class="room-row">

                            <div class="room-name">

                                ${escapeHtml(
                                    room
                                )}

                            </div>

                            <div class="room-bar">

                                <div
                                    style="width:${width}%"
                                ></div>

                            </div>

                            <strong>

                                ${count}

                            </strong>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   STATISTICS
========================================================= */

function renderStatistics() {

    const total =
        inventoryData.length;


    const good =
        inventoryData.filter(
            item =>
                item.kondisi ===
                "Baik"
        ).length;


    const light =
        inventoryData.filter(
            item =>
                item.kondisi ===
                "Ringan"
        ).length;


    const heavy =
        inventoryData.filter(
            item =>
                item.kondisi ===
                "Berat"
        ).length;


    if ($("donutTotal")) {

        $("donutTotal")
            .textContent =
            total;

    }


    const goodPercent =
        total

            ? Math.round(
                good /
                total *
                100
            )

            : 0;


    const lightPercent =
        total

            ? Math.round(
                light /
                total *
                100
            )

            : 0;


    const heavyPercent =
        total

            ? Math.round(
                heavy /
                total *
                100
            )

            : 0;


    if ($("legendGood")) {

        $("legendGood")
            .textContent =
            `${goodPercent}%`;

    }


    if ($("legendLight")) {

        $("legendLight")
            .textContent =
            `${lightPercent}%`;

    }


    if ($("legendHeavy")) {

        $("legendHeavy")
            .textContent =
            `${heavyPercent}%`;

    }


    const startLight =
        goodPercent;


    const startHeavy =
        goodPercent +
        lightPercent;


    if ($("conditionDonut")) {

        $("conditionDonut").style.background =
            `

                conic-gradient(

                    var(--green)
                    0%
                    ${startLight}%,

                    var(--orange)
                    ${startLight}%
                    ${startHeavy}%,

                    var(--red)
                    ${startHeavy}%
                    100%

                )

            `;

    }


    const safe =
        inventoryData.filter(
            item =>
                Number(
                    item.jumlah
                ) > 2
        ).length;


    const low =
        inventoryData.filter(
            item =>
                Number(
                    item.jumlah
                ) <= 2
        ).length;


    if ($("safeStockCount")) {

        $("safeStockCount")
            .textContent =
            safe;

    }


    if ($("lowStockStat")) {

        $("lowStockStat")
            .textContent =
            low;

    }


    const safePercent =
        total

            ? Math.round(
                safe /
                total *
                100
            )

            : 0;


    const lowPercent =
        total

            ? Math.round(
                low /
                total *
                100
            )

            : 0;


    if ($("safeStockProgress")) {

        $("safeStockProgress")
            .style.width =
            `${safePercent}%`;

    }


    if ($("lowStockProgress")) {

        $("lowStockProgress")
            .style.width =
            `${lowPercent}%`;

    }


    renderCategories();

}


/* =========================================================
   CATEGORY
========================================================= */

function renderCategories() {

    const container =
        $("categoryStats");


    if (!container) {

        return;

    }


    const categories =
        {};


    inventoryData.forEach(
        function (
            item
        ) {

            categories[
                item.kategori
            ] =

                (
                    categories[
                        item.kategori
                    ]

                    ||

                    0
                )

                +

                Number(
                    item.jumlah ||
                    0
                );

        }
    );


    const list =
        Object.entries(
            categories
        )
        .sort(
            (a,b) =>
                b[1] -
                a[1]
        )
        .slice(
            0,
            8
        );


    if (!list.length) {

        container.innerHTML = `

            <div class="empty-mini">

                Belum ada kategori.

            </div>

        `;


        return;

    }


    const max =
        Math.max(
            ...list.map(
                item =>
                    item[1]
            ),
            1
        );


    container.innerHTML =
        list
            .map(
                function (
                    [
                        name,
                        count
                    ]
                ) {

                    const width =
                        Math.round(
                            count /
                            max *
                            100
                        );


                    return `

                        <div class="category-item">

                            <div class="category-name">

                                ${escapeHtml(
                                    name
                                )}

                            </div>

                            <div class="category-bar">

                                <div
                                    style="width:${width}%"
                                ></div>

                            </div>

                            <strong>

                                ${count}

                            </strong>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   ACTIVITY
========================================================= */

function loadActivity() {

    try {

        const saved =
            localStorage.getItem(
                ACTIVITY_KEY
            );


        activityData =
            saved

                ? JSON.parse(
                    saved
                )

                : [];


    } catch {

        activityData =
            [];

    }

}


function saveActivity() {

    localStorage.setItem(
        ACTIVITY_KEY,
        JSON.stringify(
            activityData.slice(
                0,
                50
            )
        )
    );

}


function addActivity(
    text,
    icon
) {

    activityData.unshift({

        id:
            createId(),

        text:
            text,

        icon:
            icon ||
            "fa-circle-info",

        time:
            new Date()
                .toISOString()

    });


    activityData =
        activityData.slice(
            0,
            50
        );


    saveActivity();

    renderActivity();

}


function renderActivity() {

    const container =
        $("activityLog");


    if (!container) {

        return;

    }


    if (
        !activityData.length
    ) {

        container.innerHTML = `

            <div class="empty-mini">

                Belum ada aktivitas.

            </div>

        `;


        return;

    }


    container.innerHTML =
        activityData
            .slice(
                0,
                15
            )
            .map(
                function (
                    item
                ) {

                    return `

                        <div class="activity-item">

                            <div class="activity-icon">

                                <i class="fa-solid ${escapeHtml(
                                    item.icon
                                )}"></i>

                            </div>


                            <div class="activity-text">

                                <strong>

                                    ${escapeHtml(
                                        item.text
                                    )}

                                </strong>

                                <span>

                                    Sistem Inventaris

                                </span>

                            </div>


                            <div class="activity-time">

                                ${formatTime(
                                    item.time
                                )}

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   STORAGE
========================================================= */

function updateStorage() {

    try {

        const data =
            localStorage.getItem(
                STORAGE_KEY
            ) ||
            "";


        const bytes =
            new Blob(
                [
                    data
                ]
            ).size;


        const percent =
            Math.min(

                100,

                Math.round(

                    bytes /

                    (
                        5 *
                        1024 *
                        1024
                    )

                    *

                    100

                )

            );


        if ($("monitorStorage")) {

            $("monitorStorage")
                .textContent =
                `${percent}%`;

        }


        if ($("terminalStorage")) {

            $("terminalStorage")
                .textContent =
                `${percent}%`;

        }


    } catch {

        if ($("monitorStorage")) {

            $("monitorStorage")
                .textContent =
                "0%";

        }


        if ($("terminalStorage")) {

            $("terminalStorage")
                .textContent =
                "0%";

        }

    }

}


/* =========================================================
   AUTO BACKUP
========================================================= */

function createAutoBackup() {

    try {

        localStorage.setItem(
            AUTO_BACKUP_KEY,
            JSON.stringify({

                version:
                    "5.3",

                createdAt:
                    new Date()
                        .toISOString(),

                inventory:
                    inventoryData,

                activities:
                    activityData

            })
        );


    } catch (error) {

        console.error(
            error
        );

    }

}

/* =========================================================
   BACKUP
========================================================= */

function createBackup() {

    if (
        !inventoryData.length
    ) {

        showToast(
            "Belum ada data untuk backup.",
            "info"
        );


        return;

    }


    const backup = {

        version:
            "5.3",

        createdAt:
            new Date()
                .toISOString(),

        inventory:
            inventoryData,

        activities:
            activityData

    };


    createAutoBackup();


    downloadFile(
        JSON.stringify(
            backup,
            null,
            2
        ),
        `inventory-backup-${fileDate()}.json`,
        "application/json"
    );


    addActivity(
        "Membuat backup data",
        "fa-database"
    );


    showToast(
        "Backup berhasil dibuat.",
        "success"
    );

}


/* =========================================================
   RESTORE
========================================================= */

function handleRestore(
    event
) {

    const file =
        event.target.files?.[0];


    if (!file) {

        return;

    }


    readJSON(
        file
    )
    .then(
        function (
            data
        ) {

            if (

                !data

                ||

                !Array.isArray(
                    data.inventory
                )

            ) {

                throw new Error(
                    "Backup tidak valid."
                );

            }


            openConfirmModal(
                "Restore Backup",
                "Data saat ini akan diganti dengan isi backup.",
                function () {

                    createAutoBackup();


                    inventoryData =
                        normalizeData(
                            data.inventory
                        );


                    if (
                        Array.isArray(
                            data.activities
                        )
                    ) {

                        activityData =
                            data.activities;


                        saveActivity();

                    }


                    saveData();

                    renderAll();


                    addActivity(
                        "Memulihkan backup",
                        "fa-clock-rotate-left"
                    );


                    showToast(
                        "Backup berhasil dipulihkan.",
                        "success"
                    );

                }
            );

        }
    )
    .catch(
        function () {

            showToast(
                "File backup tidak valid.",
                "error"
            );

        }
    )
    .finally(
        function () {

            event.target.value =
                "";

        }
    );

}


/* =========================================================
   EXPORT CSV
========================================================= */

function exportCSV() {

    if (
        !inventoryData.length
    ) {

        showToast(
            "Belum ada data.",
            "info"
        );


        return;

    }


    const headers = [

        "Kode Inventaris",

        "Nama Barang",

        "Kategori",

        "Ruangan",

        "Jumlah",

        "Kondisi",

        "Keterangan",

        "Tanggal"

    ];


    const rows =
        inventoryData.map(
            function (
                item
            ) {

                return [

                    item.kodeInventaris,

                    item.nama,

                    item.kategori,

                    item.ruangan,

                    item.jumlah,

                    item.kondisi,

                    item.keterangan,

                    formatDate(
                        item.tanggal
                    )

                ];

            }
        );


    const csv = [

        headers,

        ...rows

    ]
    .map(
        row =>
            row
                .map(
                    csvEscape
                )
                .join(",")
    )
    .join("\n");


    downloadFile(
        "\uFEFF" + csv,
        `inventaris-${fileDate()}.csv`,
        "text/csv;charset=utf-8;"
    );


    addActivity(
        "Export data CSV",
        "fa-file-export"
    );


    showToast(
        "Data berhasil diexport.",
        "success"
    );

}


/* =========================================================
   FILTER RESET
========================================================= */

function resetFilters() {

    if ($("searchInput")) {

        $("searchInput").value =
            "";

    }


    if ($("roomFilter")) {

        $("roomFilter").value =
            "all";

    }


    if ($("conditionFilter")) {

        $("conditionFilter").value =
            "all";

    }


    if ($("sortFilter")) {

        $("sortFilter").value =
            "newest";

    }


    renderInventory();

}


/* =========================================================
   CONFIRM
========================================================= */

function openConfirmModal(
    title,
    message,
    callback
) {

    if ($("confirmTitle")) {

        $("confirmTitle").textContent =
            title;

    }


    if ($("confirmMessage")) {

        $("confirmMessage").textContent =
            message;

    }


    confirmCallback =
        callback;


    $("confirmModal")
        ?.classList.add(
            "show"
        );

}


function closeConfirmModal() {

    $("confirmModal")
        ?.classList.remove(
            "show"
        );


    confirmCallback =
        null;

}


/* =========================================================
   THEME
========================================================= */

function loadTheme() {

    const saved =
        localStorage.getItem(
            THEME_KEY
        );


    const dark =
        saved ===
        "dark";


    document.body.classList.toggle(
        "dark",
        dark
    );


    updateThemeUI(
        dark
    );

}


function toggleTheme() {

    const dark =
        document.body.classList.toggle(
            "dark"
        );


    localStorage.setItem(
        THEME_KEY,
        dark
            ? "dark"
            : "light"
    );


    updateThemeUI(
        dark
    );

}


function updateThemeUI(
    dark
) {

    if (
        $("themeButton")
    ) {

        $("themeButton").innerHTML =

            dark

                ? `

                    <span>

                        <i class="fa-solid fa-sun"></i>

                        Light Mode

                    </span>

                    <i class="fa-solid fa-toggle-on"></i>

                  `

                : `

                    <span>

                        <i class="fa-solid fa-moon"></i>

                        Dark Mode

                    </span>

                    <i class="fa-solid fa-toggle-off"></i>

                  `;

    }


    if (
        $("mobileThemeButton")
    ) {

        $("mobileThemeButton").innerHTML =

            dark

                ? `<i class="fa-solid fa-sun"></i>`

                : `<i class="fa-solid fa-moon"></i>`;

    }

}


/* =========================================================
   CLOCK
========================================================= */

function updateClock() {

    const now =
        new Date();


    if (
        $("liveClock")
    ) {

        $("liveClock")
            .textContent =
            now.toLocaleTimeString(
                "id-ID",
                {

                    hour:
                        "2-digit",

                    minute:
                        "2-digit",

                    second:
                        "2-digit"

                }
            );

    }


    if (
        $("liveDate")
    ) {

        $("liveDate")
            .textContent =
            now.toLocaleDateString(
                "id-ID",
                {

                    weekday:
                        "long",

                    day:
                        "numeric",

                    month:
                        "long",

                    year:
                        "numeric"

                }
            );

    }

}


/* =========================================================
   FOOTER YEAR
========================================================= */

function updateFooterYear() {

    if (
        $("footerYear")
    ) {

        $("footerYear")
            .textContent =
            new Date()
                .getFullYear();

    }

}


/* =========================================================
   PWA
========================================================= */

async function registerServiceWorker() {

    if (
        !("serviceWorker" in navigator)
    ) {

        return;

    }


    if (
        location.protocol ===
        "file:"
    ) {

        return;

    }


    try {

        await navigator
            .serviceWorker
            .register(
                "service-worker.js"
            );

    } catch (error) {

        console.warn(
            "Service Worker error:",
            error
        );

    }

}


async function installPWA() {

    if (
        !deferredInstallPrompt
    ) {

        showToast(
            "Installasi belum tersedia di browser ini.",
            "info"
        );


        return;

    }


    deferredInstallPrompt
        .prompt();


    try {

        await deferredInstallPrompt
            .userChoice;

    } catch {

        /* ignore */

    }


    deferredInstallPrompt =
        null;


    $("installButton")
        ?.classList.add(
            "hidden"
        );

}


/* =========================================================
   CLEAR ACTIVITY
========================================================= */

function clearActivities() {

    if (
        !activityData.length
    ) {

        showToast(
            "Aktivitas sudah kosong.",
            "info"
        );


        return;

    }


    openConfirmModal(
        "Bersihkan Aktivitas",
        "Semua aktivitas akan dihapus.",
        function () {

            activityData =
                [];


            saveActivity();

            renderActivity();


            showToast(
                "Aktivitas berhasil dibersihkan.",
                "success"
            );

        }
    );

}


/* =========================================================
   HELPERS
========================================================= */

function createId() {

    if (

        window.crypto

        &&

        crypto.randomUUID

    ) {

        return crypto.randomUUID();

    }


    return (

        Date.now()
            .toString(36)

        +

        Math.random()
            .toString(36)
            .slice(2)

    );

}


function conditionLabel(
    condition
) {

    if (
        condition ===
        "Ringan"
    ) {

        return "Rusak Ringan";

    }


    if (
        condition ===
        "Berat"
    ) {

        return "Rusak Berat";

    }


    return "Baik";

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

        return "-";

    }


    return date.toLocaleDateString(
        "id-ID",
        {

            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric"

        }
    );

}


function formatTime(
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

        return "-";

    }


    return date.toLocaleTimeString(
        "id-ID",
        {

            hour:
                "2-digit",

            minute:
                "2-digit"

        }
    );

}


function fileDate() {

    const date =
        new Date();


    return [

        date.getFullYear(),

        String(
            date.getMonth() +
            1
        ).padStart(
            2,
            "0"
        ),

        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        )

    ].join("-");

}


function csvEscape(
    value
) {

    const text =
        String(
            value ??
            ""
        );


    if (

        text.includes(",")
        ||

        text.includes('"')
        ||

        text.includes("\n")

    ) {

        return `"${text.replace(
            /"/g,
            '""'
        )}"`;

    }


    return text;

}


/* =========================================================
   DOWNLOAD
========================================================= */

function downloadFile(
    content,
    filename,
    type
) {

    const blob =
        new Blob(
            [
                content
            ],
            {
                type
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
        function () {

            URL.revokeObjectURL(
                url
            );

        },
        100
    );

}


/* =========================================================
   READ JSON
========================================================= */

function readJSON(
    file
) {

    return new Promise(
        function (
            resolve,
            reject
        ) {

            const reader =
                new FileReader();


            reader.onload =
                function () {

                    try {

                        resolve(
                            JSON.parse(
                                reader.result
                            )
                        );


                    } catch (error) {

                        reject(
                            error
                        );

                    }

                };


            reader.onerror =
                reject;


            reader.readAsText(
                file
            );

        }
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(
    value
) {

    return String(
        value ??
        ""
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
   TOAST
========================================================= */

function showToast(
    message,
    type = "info"
) {

    const container =
        $("toastContainer");


    if (!container) {

        return;

    }


    let icon =
        "fa-circle-info";


    let title =
        "Informasi";


    if (
        type ===
        "success"
    ) {

        icon =
            "fa-circle-check";


        title =
            "Berhasil";

    }


    if (
        type ===
        "error"
    ) {

        icon =
            "fa-circle-xmark";


        title =
            "Error";

    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        `toast ${type}`;


    toast.innerHTML = `

        <i class="fa-solid ${icon}"></i>

        <div>

            <strong>

                ${title}

            </strong>

            <span>

                ${escapeHtml(
                    message
                )}

            </span>

        </div>

    `;


    container.appendChild(
        toast
    );


    setTimeout(
        function () {

            toast.remove();

        },
        3000
    );

}
