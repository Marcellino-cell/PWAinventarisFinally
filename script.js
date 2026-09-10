/* =========================================================
   SISTEM INVENTARIS RUANGAN
   JAVASCRIPT V5.5
   FIREBASE GOOGLE LOGIN + LOCAL ADMIN
========================================================= */


/* =========================================================
   FIREBASE IMPORT
========================================================= */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

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


/* =========================================================
   FIREBASE CONFIG
   DIAMBIL DARI FIREBASE CONSOLE
========================================================= */

const firebaseConfig = {
    apiKey: "AIzaSyBnX15kPEoGJs5bpzSj4jFppDCjk5Tqn7Q",
    authDomain: "sistem-inventaris-ruangan.firebaseapp.com",
    projectId: "sistem-inventaris-ruangan",
    storageBucket: "sistem-inventaris-ruangan.firebasestorage.app",
    messagingSenderId: "51229283718",
    appId: "1:51229283718:web:71f83bfd9b48d73e2c4807",
    measurementId: "G-WLSQCGDSJE"
};


/* =========================================================
   INITIALIZE FIREBASE
========================================================= */

const firebaseApp =
    initializeApp(
        firebaseConfig
    );


/* =========================================================
   FIREBASE AUTH
========================================================= */

const auth =
    getAuth(
        firebaseApp
    );


/* =========================================================
   GOOGLE PROVIDER
========================================================= */

const googleProvider =
    new GoogleAuthProvider();


googleProvider.setCustomParameters({
    prompt: "select_account"
});


/* =========================================================
   STORAGE KEYS
========================================================= */

const STORAGE_KEY =
    "roomInventoryData_v55";

const THEME_KEY =
    "roomInventoryTheme_v55";

const ACTIVITY_KEY =
    "roomInventoryActivity_v55";

const AUTO_BACKUP_KEY =
    "roomInventoryAutoBackup_v55";

const AUTH_KEY =
    "roomInventoryAdminAuth_v55";

const GOOGLE_USER_KEY =
    "roomInventoryGoogleUser_v55";


const OLD_STORAGE_KEYS = [
    "roomInventoryData_v54",
    "roomInventoryData_v53",
    "roomInventoryData_v5",
    "roomInventoryData_v4",
    "roomInventoryData_v3"
];


/* =========================================================
   LOCAL ADMIN
========================================================= */

const ADMIN_USERNAME =
    "admin";

const ADMIN_PASSWORD =
    "admin123";


/* =========================================================
   GLOBAL VARIABLES
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

        updateFooterYear();

        setInterval(
            updateClock,
            1000
        );

        registerServiceWorker();

        setupFirebaseAuth();

        hideSplash();

    }

    catch (error) {

        console.error(
            "Initialization error:",
            error
        );

        showToast(
            "Terjadi error saat memuat sistem.",
            "error"
        );

        hideSplash();

    }

}


/* =========================================================
   FIREBASE AUTH SETUP
========================================================= */

async function setupFirebaseAuth() {

    try {

        await setPersistence(
            auth,
            browserLocalPersistence
        );


        onAuthStateChanged(
            auth,
            function (user) {

                if (user) {

                    currentGoogleUser =
                        user;

                    isAdminLoggedIn =
                        true;


                    localStorage.setItem(
                        AUTH_KEY,
                        "google-admin"
                    );


                    localStorage.setItem(
                        GOOGLE_USER_KEY,
                        JSON.stringify({

                            uid:
                                user.uid,

                            email:
                                user.email || "",

                            displayName:
                                user.displayName ||
                                "Google Admin",

                            photoURL:
                                user.photoURL ||
                                ""

                        })
                    );


                    updateAuthUI();


                    showGoogleAccount(
                        user
                    );

                }

                else {

                    currentGoogleUser =
                        null;


                    const localAuth =
                        localStorage.getItem(
                            AUTH_KEY
                        );


                    if (
                        localAuth !==
                        "local-admin"
                    ) {

                        isAdminLoggedIn =
                            false;

                        localStorage.removeItem(
                            AUTH_KEY
                        );

                        localStorage.removeItem(
                            GOOGLE_USER_KEY
                        );

                    }


                    updateAuthUI();

                    clearGoogleAccount();

                }

            }
        );


        try {

            const redirectResult =
                await getRedirectResult(
                    auth
                );


            if (
                redirectResult &&
                redirectResult.user
            ) {

                const user =
                    redirectResult.user;

                isAdminLoggedIn =
                    true;

                currentGoogleUser =
                    user;


                localStorage.setItem(
                    AUTH_KEY,
                    "google-admin"
                );


                localStorage.setItem(
                    GOOGLE_USER_KEY,
                    JSON.stringify({

                        uid:
                            user.uid,

                        email:
                            user.email || "",

                        displayName:
                            user.displayName ||
                            "Google Admin",

                        photoURL:
                            user.photoURL ||
                            ""

                    })
                );


                updateAuthUI();

                closeLoginModal();


                addActivity(
                    `Login Google: ${
                        user.email ||
                        "Google Admin"
                    }`,
                    "fa-google"
                );


                showToast(
                    "Login Google berhasil. Anda sekarang Admin.",
                    "success"
                );

            }

        }

        catch (error) {

            if (
                error &&
                error.code !==
                "auth/no-auth-event"
            ) {

                console.error(
                    "Redirect result error:",
                    error
                );

                showGoogleError(
                    error
                );

            }

        }

    }

    catch (error) {

        console.error(
            "Firebase Auth initialization error:",
            error
        );

        showGoogleError(
            error
        );

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
        &&
        auth.currentUser
    ) {

        isAdminLoggedIn =
            true;

    }

    else {

        isAdminLoggedIn =
            false;

    }


    updateAuthUI();

}


/* =========================================================
   AUTH UI
========================================================= */

function updateAuthUI() {

    const button =
        $("loginButton");

    const text =
        $("loginButtonText");

    const dot =
        $("loginStatusDot");


    if (!button) {
        return;
    }


    if (isAdminLoggedIn) {

        if (text) {

            text.textContent =
                currentGoogleUser
                    ? "Google Admin"
                    : "Logout Admin";

        }


        if (dot) {

            dot.classList.add(
                "logged-in"
            );

        }


        button.title =
            currentGoogleUser
                ? "Google Admin - Klik untuk logout"
                : "Logout Admin";

    }

    else {

        if (text) {

            text.textContent =
                "Login Admin";

        }


        if (dot) {

            dot.classList.remove(
                "logged-in"
            );

        }


        button.title =
            "Login Admin";

    }

}


/* =========================================================
   OPEN LOGIN MODAL
========================================================= */

function openLoginModal() {

    if (isAdminLoggedIn) {

        logoutAdmin();

        return;

    }


    const modal =
        $("loginModal");


    if (modal) {

        modal.classList.add(
            "show"
        );

    }


    document.body.classList.add(
        "modal-open"
    );


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
   CLOSE LOGIN MODAL
========================================================= */

function closeLoginModal() {

    $("loginModal")
        ?.classList.remove(
            "show"
        );


    document.body.classList.remove(
        "modal-open"
    );

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

        if (auth.currentUser) {

            signOut(
                auth
            ).catch(
                function (error) {

                    console.warn(
                        "Firebase logout:",
                        error
                    );

                }
            );

        }


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

        clearGoogleAccount();

        closeLoginModal();


        addActivity(
            "Login Admin lokal",
            "fa-right-to-bracket"
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
   GOOGLE STATUS
========================================================= */

function showGoogleStatus(
    message,
    error = false
) {

    const element =
        $("googleLoginStatus");


    if (!element) {
        return;
    }


    element.innerHTML = `
        <div class="google-status-message ${error ? "error" : ""}">
            <i class="fa-solid ${
                error
                    ? "fa-circle-xmark"
                    : "fa-circle-info"
            }"></i>
            <span>
                ${escapeHtml(message)}
            </span>
        </div>
    `;

}


/* =========================================================
   GOOGLE ERROR
========================================================= */

function showGoogleError(
    error
) {

    if (!error) {
        return;
    }


    const code =
        error.code ||
        "";


    console.error(
        "======================================"
    );


    console.error(
        "GOOGLE FIREBASE ERROR"
    );


    console.error(
        "CODE:",
        code
    );


    console.error(
        "MESSAGE:",
        error.message
    );


    console.error(
        "FULL ERROR:",
        error
    );


    console.error(
        "======================================"
    );


    let message =
        error.message ||
        "Login Google gagal.";


    switch (code) {

        case "auth/api-key-not-valid":

            message =
                "API key Firebase tidak valid. Periksa Firebase Config.";

            break;


        case "auth/invalid-api-key":

            message =
                "API key Firebase tidak valid.";

            break;


        case "auth/unauthorized-domain":

            message =
                "Domain website belum ditambahkan di Firebase Authorized Domains.";

            break;


        case "auth/popup-blocked":

            message =
                "Popup Google diblokir oleh browser.";

            break;


        case "auth/popup-closed-by-user":

            message =
                "Jendela login Google ditutup.";

            break;


        case "auth/cancelled-popup-request":

            message =
                "Permintaan login Google dibatalkan.";

            break;


        case "auth/operation-not-allowed":

            message =
                "Google Sign-In belum diaktifkan di Firebase.";

            break;


        case "auth/network-request-failed":

            message =
                "Koneksi internet bermasalah.";

            break;


        case "auth/too-many-requests":

            message =
                "Terlalu banyak percobaan login. Tunggu beberapa saat.";

            break;


        case "auth/popup-timeout":

            message =
                "Popup Google tidak memberikan respons.";

            break;


        case "auth/web-storage-unsupported":

            message =
                "Browser tidak mendukung penyimpanan yang diperlukan Firebase.";

            break;

    }


    showGoogleStatus(
        message,
        true
    );


    showToast(
        message,
        "error"
    );

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

        button.classList.add(
            "loading"
        );

    }


    showGoogleStatus(
        "Menghubungkan ke Google..."
    );


    console.log(
        "[Firebase Google] Login dimulai..."
    );


    try {

        const result =
            await signInWithPopup(
                auth,
                googleProvider
            );


        if (
            !result ||
            !result.user
        ) {

            throw new Error(
                "User Google tidak ditemukan."
            );

        }


        const user =
            result.user;


        isAdminLoggedIn =
            true;

        currentGoogleUser =
            user;


        localStorage.setItem(
            AUTH_KEY,
            "google-admin"
        );


        localStorage.setItem(
            GOOGLE_USER_KEY,
            JSON.stringify({

                uid:
                    user.uid,

                email:
                    user.email || "",

                displayName:
                    user.displayName ||
                    "Google Admin",

                photoURL:
                    user.photoURL ||
                    ""

            })
        );


        updateAuthUI();

        showGoogleAccount(
            user
        );

        closeLoginModal();


        addActivity(
            `Login Google: ${
                user.email ||
                "Google Admin"
            }`,
            "fa-google"
        );


        showToast(
            `Selamat datang, ${
                user.displayName ||
                "Google Admin"
            }!`,
            "success"
        );

    }

    catch (error) {

        console.error(
            "[Firebase Google] Login gagal:",
            error
        );


        showGoogleError(
            error
        );

    }

    finally {

        googleLoginBusy =
            false;


        if (button) {

            button.disabled =
                false;

            button.classList.remove(
                "loading"
            );

        }

    }

}


/* =========================================================
   GOOGLE ACCOUNT UI
========================================================= */

function showGoogleAccount(
    user
) {

    if (!user) {
        return;
    }


    const account =
        $("googleAccount");


    const name =
        $("googleAccountName");


    const email =
        $("googleAccountEmail");


    const avatar =
        $("googleAccountAvatar");


    if (name) {

        name.textContent =
            user.displayName ||
            "Google Admin";

    }


    if (email) {

        email.textContent =
            user.email ||
            "";

    }


    if (avatar) {

        if (user.photoURL) {

            avatar.src =
                user.photoURL;

            avatar.style.display =
                "block";

        }

        else {

            avatar.style.display =
                "none";

        }

    }


    if (account) {

        account.classList.add(
            "show"
        );

    }

}


/* =========================================================
   CLEAR GOOGLE ACCOUNT
========================================================= */

function clearGoogleAccount() {

    const account =
        $("googleAccount");


    if (account) {

        account.classList.remove(
            "show"
        );

    }

}


/* =========================================================
   LOGOUT ADMIN
========================================================= */

async function logoutAdmin() {

    try {

        if (
            currentGoogleUser ||
            auth.currentUser
        ) {

            await signOut(
                auth
            );

        }

    }

    catch (error) {

        console.warn(
            "Firebase signOut error:",
            error
        );

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

    clearGoogleAccount();


    addActivity(
        "Logout Admin",
        "fa-right-from-bracket"
    );


    showToast(
        "Anda telah logout.",
        "success"
    );

}


/* =========================================================
   THEME
========================================================= */

function loadTheme() {

    const saved =
        localStorage.getItem(
            THEME_KEY
        );


    if (
        saved ===
        "dark"
    ) {

        document.body.classList.add(
            "dark-mode"
        );

    }

    else {

        document.body.classList.remove(
            "dark-mode"
        );

    }

}


/* =========================================================
   TOGGLE THEME
========================================================= */

function toggleTheme() {

    const isDark =
        document.body.classList.toggle(
            "dark-mode"
        );


    localStorage.setItem(
        THEME_KEY,
        isDark
            ? "dark"
            : "light"
    );


    updateThemeIcon();


    addActivity(
        isDark
            ? "Mengaktifkan mode gelap"
            : "Mengaktifkan mode terang",
        isDark
            ? "fa-moon"
            : "fa-sun"
    );

}


/* =========================================================
   UPDATE THEME ICON
========================================================= */

function updateThemeIcon() {

    const icon =
        $("themeIcon");


    if (!icon) {
        return;
    }


    const isDark =
        document.body.classList.contains(
            "dark-mode"
        );


    icon.className =
        isDark
            ? "fa-solid fa-sun"
            : "fa-solid fa-moon";

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


        if (saved) {

            const parsed =
                JSON.parse(
                    saved
                );


            if (
                Array.isArray(
                    parsed
                )
            ) {

                inventoryData =
                    parsed;

                return;

            }

        }


        for (
            const oldKey
            of OLD_STORAGE_KEYS
        ) {

            const oldData =
                localStorage.getItem(
                    oldKey
                );


            if (oldData) {

                try {

                    const parsed =
                        JSON.parse(
                            oldData
                        );


                    if (
                        Array.isArray(
                            parsed
                        )
                    ) {

                        inventoryData =
                            parsed;


                        saveData();


                        return;

                    }

                }

                catch (
                    migrationError
                ) {

                    console.warn(
                        "Migration error:",
                        migrationError
                    );

                }

            }

        }


        inventoryData = [];

    }

    catch (error) {

        console.error(
            "Load data error:",
            error
        );

        inventoryData = [];

    }

}


/* =========================================================
   SAVE DATA
========================================================= */

function saveData() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
                inventoryData
            )
        );

    }

    catch (error) {

        console.error(
            "Save data error:",
            error
        );

        showToast(
            "Data gagal disimpan.",
            "error"
        );

    }

}


/* =========================================================
   LOAD ACTIVITY
========================================================= */

function loadActivity() {

    try {

        const saved =
            localStorage.getItem(
                ACTIVITY_KEY
            );


        if (saved) {

            const parsed =
                JSON.parse(
                    saved
                );


            if (
                Array.isArray(
                    parsed
                )
            ) {

                activityData =
                    parsed;

                return;

            }

        }


        activityData = [];

    }

    catch (error) {

        console.error(
            "Load activity error:",
            error
        );

        activityData = [];

    }

}


/* =========================================================
   SAVE ACTIVITY
========================================================= */

function saveActivity() {

    try {

        localStorage.setItem(
            ACTIVITY_KEY,
            JSON.stringify(
                activityData
            )
        );

    }

    catch (error) {

        console.error(
            "Save activity error:",
            error
        );

    }

}


/* =========================================================
   ADD ACTIVITY
========================================================= */

function addActivity(
    text,
    icon = "fa-circle"
) {

    const item = {

        id:
            Date.now(),

        text:
            text,

        icon:
            icon,

        time:
            new Date()
                .toISOString()

    };


    activityData.unshift(
        item
    );


    if (
        activityData.length >
        100
    ) {

        activityData =
            activityData.slice(
                0,
                100
            );

    }


    saveActivity();

    renderActivity();

}


/* =========================================================
   RENDER ACTIVITY
========================================================= */

function renderActivity() {

    const container =
        $("activityList");


    if (!container) {
        return;
    }


    if (
        !activityData.length
    ) {

        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-clock-rotate-left"></i>
                <p>Belum ada aktivitas.</p>
            </div>
        `;

        return;

    }


    container.innerHTML =
        activityData
            .slice(0, 20)
            .map(
                function (item) {

                    const date =
                        new Date(
                            item.time
                        );


                    return `
                        <div class="activity-item">
                            <div class="activity-icon">
                                <i class="fa-solid ${escapeHtml(item.icon || "fa-circle")}"></i>
                            </div>

                            <div class="activity-content">
                                <div class="activity-text">
                                    ${escapeHtml(item.text || "")}
                                </div>

                                <div class="activity-time">
                                    ${formatDateTime(date)}
                                </div>
                            </div>
                        </div>
                    `;

                }
            )
            .join("");


}


/* =========================================================
   BIND EVENTS
========================================================= */

function bindEvents() {

    $("loginButton")
        ?.addEventListener(
            "click",
            openLoginModal
        );


    $("closeLoginModal")
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


    $("themeToggle")
        ?.addEventListener(
            "click",
            toggleTheme
        );


    $("addInventoryButton")
        ?.addEventListener(
            "click",
            openAddModal
        );


    $("closeInventoryModal")
        ?.addEventListener(
            "click",
            closeInventoryModal
        );


    $("inventoryForm")
        ?.addEventListener(
            "submit",
            handleInventorySubmit
        );


    $("cancelInventoryButton")
        ?.addEventListener(
            "click",
            closeInventoryModal
        );


    $("searchInput")
        ?.addEventListener(
            "input",
            handleSearch
        );


    $("roomFilter")
        ?.addEventListener(
            "change",
            handleSearch
        );


    $("statusFilter")
        ?.addEventListener(
            "change",
            handleSearch
        );


    $("clearSearch")
        ?.addEventListener(
            "click",
            clearSearch
        );


    $("confirmCancel")
        ?.addEventListener(
            "click",
            closeConfirmModal
        );


    $("confirmAction")
        ?.addEventListener(
            "click",
            executeConfirm
        );


    $("clearActivityButton")
        ?.addEventListener(
            "click",
            clearActivities
        );


    $("exportButton")
        ?.addEventListener(
            "click",
            exportData
        );


    $("importInput")
        ?.addEventListener(
            "change",
            importData
        );


    window.addEventListener(
        "beforeinstallprompt",
        handleInstallPrompt
    );


    window.addEventListener(
        "appinstalled",
        function () {

            deferredInstallPrompt =
                null;

            showToast(
                "Aplikasi berhasil diinstal.",
                "success"
            );

        }
    );


    document.addEventListener(
        "click",
        handleGlobalClick
    );


    document.addEventListener(
        "keydown",
        handleKeyboard
    );


    window.addEventListener(
        "click",
        function (event) {

            const modal =
                $("loginModal");


            if (
                event.target ===
                modal
            ) {

                closeLoginModal();

            }

        }
    );


    updateThemeIcon();

}


/* =========================================================
   GLOBAL CLICK
========================================================= */

function handleGlobalClick(
    event
) {

    const editButton =
        event.target.closest(
            "[data-edit-id]"
        );


    if (editButton) {

        const id =
            editButton.dataset.editId;


        editInventory(
            id
        );

        return;

    }


    const deleteButton =
        event.target.closest(
            "[data-delete-id]"
        );


    if (deleteButton) {

        const id =
            deleteButton.dataset.deleteId;


        deleteInventory(
            id
        );

        return;

    }


    const viewButton =
        event.target.closest(
            "[data-view-id]"
        );


    if (viewButton) {

        const id =
            viewButton.dataset.viewId;


        viewInventory(
            id
        );

        return;

    }

}


/* =========================================================
   KEYBOARD
========================================================= */

function handleKeyboard(
    event
) {

    if (
        event.key ===
        "Escape"
    ) {

        closeLoginModal();

        closeInventoryModal();

        closeConfirmModal();

        closeViewModal();

    }


    if (
        event.ctrlKey &&
        event.key.toLowerCase() ===
        "k"
    ) {

        event.preventDefault();

        $("searchInput")
            ?.focus();

    }

}


/* =========================================================
   SEARCH
========================================================= */

function handleSearch() {

    const search =
        $("searchInput")
            ?.value
            .trim()
            .toLowerCase() ||
        "";


    const room =
        $("roomFilter")
            ?.value ||
        "";


    const status =
        $("statusFilter")
            ?.value ||
        "";


    const filtered =
        inventoryData.filter(
            function (item) {

                const text =
                    [
                        item.name,
                        item.room,
                        item.category,
                        item.code,
                        item.description
                    ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                const searchMatch =
                    !search ||
                    text.includes(
                        search
                    );


                const roomMatch =
                    !room ||
                    item.room ===
                    room;


                const statusMatch =
                    !status ||
                    item.status ===
                    status;


                return (
                    searchMatch &&
                    roomMatch &&
                    statusMatch
                );

            }
        );


    renderTable(
        filtered
    );


    updateResultInfo(
        filtered.length
    );

}


/* =========================================================
   CLEAR SEARCH
========================================================= */

function clearSearch() {

    if ($("searchInput")) {
        $("searchInput")
            .value =
            "";
    }


    if ($("roomFilter")) {
        $("roomFilter")
            .value =
            "";
    }


    if ($("statusFilter")) {
        $("statusFilter")
            .value =
            "";
    }


    renderAll();

}


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {

    renderTable(
        inventoryData
    );

    renderStats();

    renderRoomDistribution();

    renderActivity();

    updateAuthUI();

    updateThemeIcon();

}


/* =========================================================
   UPDATE RESULT INFO
========================================================= */

function updateResultInfo(
    count
) {

    const element =
        $("resultInfo");


    if (!element) {
        return;
    }


    element.textContent =
        `${count} data ditemukan`;

}


/* =========================================================
   RENDER TABLE
========================================================= */

function renderTable(
    data
) {

    const tbody =
        $("inventoryTableBody");


    if (!tbody) {
        return;
    }


    if (!data.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="8">
                    <div class="empty-state table-empty">
                        <i class="fa-solid fa-box-open"></i>
                        <h3>Belum ada data</h3>
                        <p>Data inventaris belum tersedia.</p>
                    </div>
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        data.map(
            function (item, index) {

                const statusClass =
                    getStatusClass(
                        item.status
                    );


                return `
                    <tr>
                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            <div class="item-name-cell">
                                <strong>
                                    ${escapeHtml(item.name || "-")}
                                </strong>

                                ${
                                    item.code
                                        ? `
                                            <span>
                                                ${escapeHtml(item.code)}
                                            </span>
                                        `
                                        : ""
                                }
                            </div>
                        </td>

                        <td>
                            <span class="room-badge">
                                ${escapeHtml(item.room || "-")}
                            </span>
                        </td>

                        <td>
                            ${escapeHtml(item.category || "-")}
                        </td>

                        <td>
                            <span class="status-badge ${statusClass}">
                                ${escapeHtml(item.status || "-")}
                            </span>
                        </td>

                        <td>
                            ${escapeHtml(
                                item.quantity ??
                                0
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.updatedAt
                                    ? formatDate(
                                        item.updatedAt
                                    )
                                    : "-"
                            )}
                        </td>

                        <td>
                            <div class="table-actions">

                                <button
                                    type="button"
                                    class="action-btn view"
                                    data-view-id="${escapeHtml(String(item.id))}"
                                    title="Lihat"
                                >
                                    <i class="fa-solid fa-eye"></i>
                                </button>

                                ${
                                    isAdminLoggedIn
                                        ? `
                                            <button
                                                type="button"
                                                class="action-btn edit"
                                                data-edit-id="${escapeHtml(String(item.id))}"
                                                title="Edit"
                                            >
                                                <i class="fa-solid fa-pen"></i>
                                            </button>

                                            <button
                                                type="button"
                                                class="action-btn delete"
                                                data-delete-id="${escapeHtml(String(item.id))}"
                                                title="Hapus"
                                            >
                                                <i class="fa-solid fa-trash"></i>
                                            </button>
                                        `
                                        : ""
                                }

                            </div>
                        </td>
                    </tr>
                `;

            }
        )
        .join("");

}


/* =========================================================
   RENDER STATS
========================================================= */

function renderStats() {

    const total =
        inventoryData.length;


    const totalQuantity =
        inventoryData.reduce(
            function (
                sum,
                item
            ) {

                return (
                    sum +
                    Number(
                        item.quantity || 0
                    )
                );

            },
            0
        );


    const good =
        inventoryData.filter(
            function (item) {

                return (
                    item.status ===
                    "Baik"
                );

            }
        )
        .length;


    const damaged =
        inventoryData.filter(
            function (item) {

                return (
                    item.status ===
                    "Rusak"
                );

            }
        )
        .length;


    const unavailable =
        inventoryData.filter(
            function (item) {

                return (
                    item.status ===
                    "Tidak Layak"
                );

            }
        )
        .length;


    setText(
        "totalItems",
        total
    );


    setText(
        "totalQuantity",
        totalQuantity
    );


    setText(
        "goodItems",
        good
    );


    setText(
        "damagedItems",
        damaged
    );


    setText(
        "unavailableItems",
        unavailable
    );


    setText(
        "activityCount",
        activityData.length
    );

}


/* =========================================================
   ROOM DISTRIBUTION
========================================================= */

function renderRoomDistribution() {

    const canvas =
        $("roomDistributionChart");


    if (!canvas) {
        return;
    }


    const ctx =
        canvas.getContext(
            "2d"
        );


    if (!ctx) {
        return;
    }


    const rooms = {};


    inventoryData.forEach(
        function (item) {

            const room =
                item.room ||
                "Lainnya";


            rooms[room] =
                (
                    rooms[room] ||
                    0
                ) +
                Number(
                    item.quantity || 0
                );

        }
    );


    const labels =
        Object.keys(
            rooms
        );


    const values =
        Object.values(
            rooms
        );


    const wrapper =
        canvas.parentElement;


    const width =
        wrapper?.clientWidth ||
        300;


    const height =
        wrapper?.clientHeight ||
        300;


    const dpr =
        window.devicePixelRatio ||
        1;


    canvas.width =
        width *
        dpr;


    canvas.height =
        height *
        dpr;


    canvas.style.width =
        `${width}px`;


    canvas.style.height =
        `${height}px`;


    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    if (!labels.length) {

        ctx.beginPath();

        ctx.arc(
            width / 2,
            height / 2,
            Math.min(
                width,
                height
            ) *
            0.27,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#e5e7eb";

        ctx.fill();


        ctx.fillStyle =
            "#64748b";

        ctx.font =
            "600 14px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.fillText(
            "Belum ada data",
            width / 2,
            height / 2
        );


        return;

    }


    const total =
        values.reduce(
            function (
                sum,
                value
            ) {

                return (
                    sum +
                    value
                );

            },
            0
        );


    const centerX =
        width / 2;


    const centerY =
        height / 2;


    const radius =
        Math.min(
            width,
            height
        ) *
        0.32;


    const colors = [
        "#43c7b5",
        "#3b82f6",
        "#8b5cf6",
        "#f59e0b",
        "#ef4444",
        "#06b6d4",
        "#84cc16",
        "#ec4899"
    ];


    let currentAngle =
        -Math.PI / 2;


    values.forEach(
        function (
            value,
            index
        ) {

            const sliceAngle =
                (
                    value /
                    total
                ) *
                Math.PI *
                2;


            ctx.beginPath();

            ctx.moveTo(
                centerX,
                centerY
            );

            ctx.arc(
                centerX,
                centerY,
                radius,
                currentAngle,
                currentAngle +
                    sliceAngle
            );

            ctx.closePath();


            ctx.fillStyle =
                colors[
                    index %
                    colors.length
                ];

            ctx.fill();


            currentAngle +=
                sliceAngle;

        }
    );


    ctx.beginPath();

    ctx.arc(
        centerX,
        centerY,
        radius *
            0.58,
        0,
        Math.PI * 2
    );


    ctx.fillStyle =
        getComputedStyle(
            document.body
        ).backgroundColor ||
        "#ffffff";


    ctx.fill();


    ctx.fillStyle =
        getComputedStyle(
            document.body
        ).color ||
        "#0f172a";


    ctx.font =
        "700 24px Arial";

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";


    ctx.fillText(
        total,
        centerX,
        centerY - 7
    );


    ctx.font =
        "500 12px Arial";


    ctx.fillStyle =
        "#64748b";


    ctx.fillText(
        "Barang",
        centerX,
        centerY + 15
    );


    const legend =
        $("roomDistributionLegend");


    if (legend) {

        legend.innerHTML =
            labels
                .map(
                    function (
                        label,
                        index
                    ) {

                        const percentage =
                            total
                                ? (
                                    values[index] /
                                    total
                                ) *
                                100
                                : 0;


                        return `
                            <div class="chart-legend-item">

                                <span
                                    class="legend-dot"
                                    style="
                                        background:${
                                            colors[
                                                index %
                                                colors.length
                                            ]
                                        }
                                    "
                                ></span>

                                <span class="legend-name">
                                    ${escapeHtml(label)}
                                </span>

                                <span class="legend-value">
                                    ${values[index]}
                                    (${percentage.toFixed(1)}%)
                                </span>

                            </div>
                        `;

                    }
                )
                .join("");

    }

}


/* =========================================================
   OPEN ADD MODAL
========================================================= */

function openAddModal() {

    if (!isAdminLoggedIn) {

        showToast(
            "Silakan login sebagai Admin terlebih dahulu.",
            "warning"
        );

        openLoginModal();

        return;

    }


    editingId =
        null;


    const title =
        $("inventoryModalTitle");


    if (title) {

        title.textContent =
            "Tambah Inventaris";

    }


    $("inventoryForm")
        ?.reset();


    const hiddenId =
        $("inventoryId");


    if (hiddenId) {

        hiddenId.value =
            "";

    }


    openInventoryModal();

}


/* =========================================================
   OPEN INVENTORY MODAL
========================================================= */

function openInventoryModal() {

    const modal =
        $("inventoryModal");


    if (!modal) {
        return;
    }


    modal.classList.add(
        "show"
    );


    document.body.classList.add(
        "modal-open"
    );

}


/* =========================================================
   CLOSE INVENTORY MODAL
========================================================= */

function closeInventoryModal() {

    const modal =
        $("inventoryModal");


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }


    document.body.classList.remove(
        "modal-open"
    );


    editingId =
        null;

}


/* =========================================================
   HANDLE INVENTORY SUBMIT
========================================================= */

function handleInventorySubmit(
    event
) {

    event.preventDefault();


    if (!isAdminLoggedIn) {

        showToast(
            "Anda harus login sebagai Admin.",
            "warning"
        );

        return;

    }


    const id =
        $("inventoryId")
            ?.value
            .trim() ||
        "";


    const name =
        $("inventoryName")
            ?.value
            .trim() ||
        "";


    const room =
        $("inventoryRoom")
            ?.value
            .trim() ||
        "";


    const category =
        $("inventoryCategory")
            ?.value
            .trim() ||
        "";


    const code =
        $("inventoryCode")
            ?.value
            .trim() ||
        "";


    const quantity =
        Number(
            $("inventoryQuantity")
                ?.value ||
            0
        );


    const status =
        $("inventoryStatus")
            ?.value ||
        "Baik";


    const description =
        $("inventoryDescription")
            ?.value
            .trim() ||
        "";


    if (!name) {

        showToast(
            "Nama barang wajib diisi.",
            "warning"
        );

        return;

    }


    if (!room) {

        showToast(
            "Ruangan wajib dipilih.",
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
            "Jumlah barang tidak valid.",
            "warning"
        );

        return;

    }


    const now =
        new Date()
            .toISOString();


    if (id) {

        const index =
            inventoryData.findIndex(
                function (item) {

                    return String(
                        item.id
                    ) ===
                    String(
                        id
                    );

                }
            );


        if (index === -1) {

            showToast(
                "Data tidak ditemukan.",
                "error"
            );

            return;

        }


        inventoryData[index] = {

            ...inventoryData[index],

            name,

            room,

            category,

            code,

            quantity,

            status,

            description,

            updatedAt:
                now

        };


        addActivity(
            `Mengubah inventaris: ${name}`,
            "fa-pen"
        );


        showToast(
            "Data inventaris berhasil diperbarui.",
            "success"
        );

    }

    else {

        const item = {

            id:
                Date.now()
                .toString(),

            name,

            room,

            category,

            code,

            quantity,

            status,

            description,

            createdAt:
                now,

            updatedAt:
                now

        };


        inventoryData.unshift(
            item
        );


        addActivity(
            `Menambahkan inventaris: ${name}`,
            "fa-plus"
        );


        showToast(
            "Data inventaris berhasil ditambahkan.",
            "success"
        );

    }


    saveData();

    closeInventoryModal();

    renderAll();

}


/* =========================================================
   EDIT INVENTORY
========================================================= */

function editInventory(
    id
) {

    if (!isAdminLoggedIn) {

        showToast(
            "Silakan login sebagai Admin terlebih dahulu.",
            "warning"
        );

        return;

    }


    const item =
        inventoryData.find(
            function (entry) {

                return String(
                    entry.id
                ) ===
                String(
                    id
                );

            }
        );


    if (!item) {

        showToast(
            "Data tidak ditemukan.",
            "error"
        );

        return;

    }


    editingId =
        String(id);


    const title =
        $("inventoryModalTitle");


    if (title) {

        title.textContent =
            "Edit Inventaris";

    }


    setValue(
        "inventoryId",
        item.id
    );

    setValue(
        "inventoryName",
        item.name
    );

    setValue(
        "inventoryRoom",
        item.room
    );

    setValue(
        "inventoryCategory",
        item.category
    );

    setValue(
        "inventoryCode",
        item.code
    );

    setValue(
        "inventoryQuantity",
        item.quantity
    );

    setValue(
        "inventoryStatus",
        item.status
    );

    setValue(
        "inventoryDescription",
        item.description
    );


    openInventoryModal();

}


/* =========================================================
   DELETE INVENTORY
========================================================= */

function deleteInventory(
    id
) {

    if (!isAdminLoggedIn) {

        showToast(
            "Silakan login sebagai Admin terlebih dahulu.",
            "warning"
        );

        return;

    }


    const item =
        inventoryData.find(
            function (entry) {

                return String(
                    entry.id
                ) ===
                String(
                    id
                );

            }
        );


    if (!item) {

        showToast(
            "Data tidak ditemukan.",
            "error"
        );

        return;

    }


    openConfirmModal(
        "Hapus Inventaris",
        `Apakah Anda yakin ingin menghapus "${item.name}"?`,
        function () {

            inventoryData =
                inventoryData.filter(
                    function (entry) {

                        return String(
                            entry.id
                        ) !==
                        String(
                            id
                        );

                    }
                );


            saveData();


            addActivity(
                `Menghapus inventaris: ${item.name}`,
                "fa-trash"
            );


            renderAll();


            showToast(
                "Data inventaris berhasil dihapus.",
                "success"
            );

        }
    );

}


/* =========================================================
   VIEW INVENTORY
========================================================= */

function viewInventory(
    id
) {

    const item =
        inventoryData.find(
            function (entry) {

                return String(
                    entry.id
                ) ===
                String(
                    id
                );

            }
        );


    if (!item) {

        showToast(
            "Data tidak ditemukan.",
            "error"
        );

        return;

    }


    const modal =
        $("viewInventoryModal");


    const content =
        $("viewInventoryContent");


    if (!modal || !content) {
        return;
    }


    content.innerHTML = `

        <div class="detail-grid">

            <div class="detail-item">
                <span class="detail-label">
                    Nama Barang
                </span>

                <strong>
                    ${escapeHtml(item.name || "-")}
                </strong>
            </div>


            <div class="detail-item">
                <span class="detail-label">
                    Kode Barang
                </span>

                <strong>
                    ${escapeHtml(item.code || "-")}
                </strong>
            </div>


            <div class="detail-item">
                <span class="detail-label">
                    Ruangan
                </span>

                <strong>
                    ${escapeHtml(item.room || "-")}
                </strong>
            </div>


            <div class="detail-item">
                <span class="detail-label">
                    Kategori
                </span>

                <strong>
                    ${escapeHtml(item.category || "-")}
                </strong>
            </div>


            <div class="detail-item">
                <span class="detail-label">
                    Jumlah
                </span>

                <strong>
                    ${escapeHtml(String(item.quantity ?? 0))}
                </strong>
            </div>


            <div class="detail-item">
                <span class="detail-label">
                    Status
                </span>

                <span class="status-badge ${getStatusClass(item.status)}">
                    ${escapeHtml(item.status || "-")}
                </span>
            </div>


            <div class="detail-item full">
                <span class="detail-label">
                    Deskripsi
                </span>

                <p>
                    ${escapeHtml(item.description || "Tidak ada deskripsi.")}
                </p>
            </div>


            <div class="detail-item">
                <span class="detail-label">
                    Dibuat
                </span>

                <strong>
                    ${item.createdAt
                        ? formatDateTime(
                            new Date(
                                item.createdAt
                            )
                        )
                        : "-"
                    }
                </strong>
            </div>


            <div class="detail-item">
                <span class="detail-label">
                    Diperbarui
                </span>

                <strong>
                    ${item.updatedAt
                        ? formatDateTime(
                            new Date(
                                item.updatedAt
                            )
                        )
                        : "-"
                    }
                </strong>
            </div>

        </div>

    `;


    modal.classList.add(
        "show"
    );


    document.body.classList.add(
        "modal-open"
    );

}


/* =========================================================
   CLOSE VIEW MODAL
========================================================= */

function closeViewModal() {

    $("viewInventoryModal")
        ?.classList.remove(
            "show"
        );


    document.body.classList.remove(
        "modal-open"
    );

}


/* =========================================================
   CONFIRM MODAL
========================================================= */

function openConfirmModal(
    title,
    message,
    callback
) {

    const modal =
        $("confirmModal");


    const titleElement =
        $("confirmTitle");


    const messageElement =
        $("confirmMessage");


    if (!modal) {
        return;
    }


    if (titleElement) {

        titleElement.textContent =
            title;

    }


    if (messageElement) {

        messageElement.textContent =
            message;

    }


    confirmCallback =
        callback;


    modal.classList.add(
        "show"
    );


    document.body.classList.add(
        "modal-open"
    );

}


/* =========================================================
   CLOSE CONFIRM MODAL
========================================================= */

function closeConfirmModal() {

    $("confirmModal")
        ?.classList.remove(
            "show"
        );


    document.body.classList.remove(
        "modal-open"
    );


    confirmCallback =
        null;

}


/* =========================================================
   EXECUTE CONFIRM
========================================================= */

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
   CLEAR ACTIVITIES
========================================================= */

function clearActivities() {

    if (!isAdminLoggedIn) {

        showToast(
            "Silakan login sebagai Admin terlebih dahulu.",
            "warning"
        );

        return;

    }


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
        "Hapus Aktivitas",
        "Apakah Anda yakin ingin menghapus seluruh riwayat aktivitas?",
        function () {

            activityData = [];

            saveActivity();

            renderActivity();

            renderStats();


            showToast(
                "Riwayat aktivitas berhasil dihapus.",
                "success"
            );

        }
    );

}


/* =========================================================
   EXPORT DATA
========================================================= */

function exportData() {

    const payload = {

        app:
            "Sistem Inventaris Ruangan",

        version:
            "5.5",

        exportedAt:
            new Date()
                .toISOString(),

        inventory:
            inventoryData,

        activity:
            activityData

    };


    const blob =
        new Blob(
            [
                JSON.stringify(
                    payload,
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


    const anchor =
        document.createElement(
            "a"
        );


    anchor.href =
        url;


    anchor.download =
        `inventaris-ruangan-${formatFileDate(new Date())}.json`;


    document.body.appendChild(
        anchor
    );


    anchor.click();


    anchor.remove();


    URL.revokeObjectURL(
        url
    );


    addActivity(
        "Export data inventaris",
        "fa-file-export"
    );


    showToast(
        "Data berhasil diexport.",
        "success"
    );

}


/* =========================================================
   IMPORT DATA
========================================================= */

function importData(
    event
) {

    if (!isAdminLoggedIn) {

        showToast(
            "Silakan login sebagai Admin terlebih dahulu.",
            "warning"
        );

        event.target.value =
            "";

        return;

    }


    const file =
        event.target.files?.[0];


    if (!file) {
        return;
    }


    const reader =
        new FileReader();


    reader.onload =
        function () {

            try {

                const parsed =
                    JSON.parse(
                        reader.result
                    );


                const importedInventory =
                    Array.isArray(
                        parsed
                            ?.inventory
                    )
                        ? parsed.inventory
                        : Array.isArray(
                            parsed
                        )
                            ? parsed
                            : null;


                if (
                    !importedInventory
                ) {

                    throw new Error(
                        "Format data tidak valid."
                    );

                }


                openConfirmModal(
                    "Import Data",
                    `Import ${importedInventory.length} data inventaris dan mengganti data saat ini?`,
                    function () {

                        inventoryData =
                            importedInventory;


                        if (
                            Array.isArray(
                                parsed?.activity
                            )
                        ) {

                            activityData =
                                parsed.activity;

                        }


                        saveData();

                        saveActivity();

                        renderAll();


                        addActivity(
                            "Import data inventaris",
                            "fa-file-import"
                        );


                        showToast(
                            "Data berhasil diimport.",
                            "success"
                        );

                    }
                );

            }

            catch (error) {

                console.error(
                    "Import error:",
                    error
                );


                showToast(
                    "File import tidak valid.",
                    "error"
                );

            }

            finally {

                event.target.value =
                    "";

            }

        };


    reader.readAsText(
        file
    );

}


/* =========================================================
   INSTALL PROMPT
========================================================= */

function handleInstallPrompt(
    event
) {

    event.preventDefault();


    deferredInstallPrompt =
        event;


    const installButton =
        $("installButton");


    if (installButton) {

        installButton.classList.add(
            "show"
        );

    }

}


/* =========================================================
   INSTALL APP
========================================================= */

async function installApp() {

    if (!deferredInstallPrompt) {

        showToast(
            "Install prompt belum tersedia.",
            "info"
        );

        return;

    }


    deferredInstallPrompt
        .prompt();


    const choice =
        await deferredInstallPrompt
            .userChoice;


    if (
        choice.outcome ===
        "accepted"
    ) {

        showToast(
            "Aplikasi sedang diinstal.",
            "success"
        );

    }


    deferredInstallPrompt =
        null;


    const installButton =
        $("installButton");


    if (installButton) {

        installButton.classList.remove(
            "show"
        );

    }

}


/* =========================================================
   SERVICE WORKER
========================================================= */

function registerServiceWorker() {

    if (
        !("serviceWorker" in navigator)
    ) {
        return;
    }


    window.addEventListener(
        "load",
        function () {

            navigator.serviceWorker
                .register(
                    "service-worker.js"
                )
                .then(
                    function (registration) {

                        console.log(
                            "Service Worker registered:",
                            registration.scope
                        );

                    }
                )
                .catch(
                    function (error) {

                        console.error(
                            "Service Worker registration failed:",
                            error
                        );

                    }
                );

        }
    );

}


/* =========================================================
   SPLASH SCREEN
========================================================= */

function hideSplash() {

    const splash =
        $("splashScreen");


    if (!splash) {
        return;
    }


    setTimeout(
        function () {

            splash.classList.add(
                "hide"
            );


            setTimeout(
                function () {

                    splash.style.display =
                        "none";

                },
                500
            );

        },
        700
    );

}


/* =========================================================
   CLOCK
========================================================= */

function updateClock() {

    const element =
        $("liveClock");


    if (!element) {
        return;
    }


    const now =
        new Date();


    element.textContent =
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


/* =========================================================
   FOOTER YEAR
========================================================= */

function updateFooterYear() {

    setText(
        "footerYear",
        new Date()
            .getFullYear()
    );

}


/* =========================================================
   HELPER: SET TEXT
========================================================= */

function setText(
    id,
    value
) {

    const element =
        $(id);


    if (element) {

        element.textContent =
            String(
                value ?? ""
            );

    }

}


/* =========================================================
   HELPER: SET VALUE
========================================================= */

function setValue(
    id,
    value
) {

    const element =
        $(id);


    if (element) {

        element.value =
            value ??
            "";

    }

}


/* =========================================================
   HELPER: STATUS CLASS
========================================================= */

function getStatusClass(
    status
) {

    switch (
        String(
            status ||
            ""
        )
            .toLowerCase()
    ) {

        case "baik":
            return "status-good";


        case "rusak":
            return "status-damaged";


        case "tidak layak":
            return "status-unavailable";


        default:
            return "status-default";

    }

}


/* =========================================================
   HELPER: FORMAT DATE
========================================================= */

function formatDate(
    value
) {

    const date =
        value instanceof Date
            ? value
            : new Date(
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
                "2-digit",

            year:
                "numeric"
        }
    );

}


/* =========================================================
   HELPER: FORMAT DATETIME
========================================================= */

function formatDateTime(
    value
) {

    const date =
        value instanceof Date
            ? value
            : new Date(
                value
            );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return date.toLocaleString(
        "id-ID",
        {
            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric",

            hour:
                "2-digit",

            minute:
                "2-digit"
        }
    );

}


/* =========================================================
   HELPER: FORMAT FILE DATE
========================================================= */

function formatFileDate(
    date
) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        )
        .padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        )
        .padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


/* =========================================================
   HELPER: ESCAPE HTML
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
   WINDOW EXPORTS
========================================================= */

window.openLoginModal =
    openLoginModal;

window.closeLoginModal =
    closeLoginModal;

window.loginWithGoogle =
    loginWithGoogle;

window.logoutAdmin =
    logoutAdmin;

window.toggleTheme =
    toggleTheme;

window.openAddModal =
    openAddModal;

window.closeInventoryModal =
    closeInventoryModal;

window.closeConfirmModal =
    closeConfirmModal;

window.executeConfirm =
    executeConfirm;

window.closeViewModal =
    closeViewModal;

window.exportData =
    exportData;

window.installApp =
    installApp;

window.clearSearch =
    clearSearch;

window.clearActivities =
    clearActivities;

    if (
        target ===
        "monitoring"
    ) {

        updateMonitoring();

        renderActivity();

    }


    if (
        target ===
        "statistics"
    ) {

        renderStatistics();

    }

}


/* =========================================================
   ADD INVENTORY
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


    if (
        $("modalTitle")
    ) {

        $("modalTitle")
            .textContent =
            "Tambah Inventaris";

    }


    $("inventoryForm")
        ?.reset();


    if (
        $("inventoryId")
    ) {

        $("inventoryId")
            .value =
            "";

    }


    if (
        $("inventoryQuantity")
    ) {

        $("inventoryQuantity")
            .value =
            "1";

    }


    if (
        $("inventoryCondition")
    ) {

        $("inventoryCondition")
            .value =
            "Baik";

    }


    $("inventoryModal")
        ?.classList.add(
            "show"
        );


    document.body.classList.add(
        "modal-open"
    );


    setTimeout(
        function () {

            $("inventoryCode")
                ?.focus();

        },
        100
    );

}


/* =========================================================
   EDIT INVENTORY
========================================================= */

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
            function (entry) {

                return (
                    entry.id ===
                    id
                );

            }
        );


    if (!item) {

        showToast(
            "Data inventaris tidak ditemukan.",
            "error"
        );

        return;

    }


    editingId =
        id;


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
        item.keterangan;


    $("inventoryModal")
        ?.classList.add(
            "show"
        );


    document.body.classList.add(
        "modal-open"
    );

}


/* =========================================================
   CLOSE INVENTORY
========================================================= */

function closeInventoryModal() {

    $("inventoryModal")
        ?.classList.remove(
            "show"
        );


    document.body.classList.remove(
        "modal-open"
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
            ?.value
            .trim() ||
        "";


    const name =
        $("inventoryName")
            ?.value
            .trim() ||
        "";


    const category =
        $("inventoryCategory")
            ?.value
            .trim() ||
        "";


    const room =
        $("inventoryRoom")
            ?.value
            .trim() ||
        "";


    const quantity =
        Number(
            $("inventoryQuantity")
                ?.value
        );


    const condition =
        $("inventoryCondition")
            ?.value ||
        "Baik";


    const notes =
        $("inventoryNotes")
            ?.value
            .trim() ||
        "";


    if (
        !code ||
        !name ||
        !category ||
        !room
    ) {

        showToast(
            "Semua field wajib diisi.",
            "error"
        );

        return;

    }


    if (
        !Number.isFinite(
            quantity
        )
        ||
        quantity < 0
    ) {

        showToast(
            "Jumlah tidak valid.",
            "error"
        );

        return;

    }


    const duplicate =
        inventoryData.find(
            function (item) {

                return (
                    item.kodeInventaris
                        .toLowerCase()
                    ===
                    code.toLowerCase()
                    &&
                    item.id !==
                    editingId
                );

            }
        );


    if (duplicate) {

        showToast(
            "Kode inventaris sudah digunakan.",
            "error"
        );

        return;

    }


    if (editingId) {

        const index =
            inventoryData.findIndex(
                function (item) {

                    return (
                        item.id ===
                        editingId
                    );

                }
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
   DELETE INVENTORY
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
            function (entry) {

                return (
                    entry.id ===
                    id
                );

            }
        );


    if (!item) {

        showToast(
            "Data tidak ditemukan.",
            "error"
        );

        return;

    }


    openConfirmModal(
        "Hapus Inventaris",
        `Yakin ingin menghapus "${item.nama}"?`,
        function () {

            inventoryData =
                inventoryData.filter(
                    function (entry) {

                        return (
                            entry.id !==
                            id
                        );

                    }
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
   RENDER INVENTORY
========================================================= */

function renderInventory() {

    const tbody =
        $("inventoryTableBody");


    if (!tbody) {
        return;
    }


    const search =
        (
            $("searchInput")
                ?.value ||
            ""
        )
            .toLowerCase()
            .trim();


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
            function (item) {

                const searchMatch =
                    !search ||
                    item.kodeInventaris
                        .toLowerCase()
                        .includes(
                            search
                        ) ||
                    item.nama
                        .toLowerCase()
                        .includes(
                            search
                        ) ||
                    item.kategori
                        .toLowerCase()
                        .includes(
                            search
                        ) ||
                    item.ruangan
                        .toLowerCase()
                        .includes(
                            search
                        );


                const roomMatch =
                    room ===
                    "all" ||
                    item.ruangan ===
                    room;


                const conditionMatch =
                    condition ===
                    "all" ||
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
        function (a, b) {

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
                    b.jumlah -
                    a.jumlah
                );

            }


            if (
                sort ===
                "stockLow"
            ) {

                return (
                    a.jumlah -
                    b.jumlah
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
        function (item) {

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

                    ${item.jumlah}

                </td>


                <td>

                    <span
                        class="condition-badge ${item.kondisi.toLowerCase()}"
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

                            <i
                                class="fa-solid fa-pen"
                            ></i>

                        </button>


                        <button
                            class="icon-button delete delete-button"
                            type="button"
                            title="Hapus"
                        >

                            <i
                                class="fa-solid fa-trash"
                            ></i>

                        </button>

                    </div>

                </td>

            `;


            row.querySelector(
                ".edit-button"
            )?.addEventListener(
                "click",
                function () {

                    openEditModal(
                        item.id
                    );

                }
            );


            row.querySelector(
                ".delete-button"
            )?.addEventListener(
                "click",
                function () {

                    deleteInventory(
                        item.id
                    );

                }
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
            result.length !== 0
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
            function (
                sum,
                item
            ) {

                return (
                    sum +
                    Number(
                        item.jumlah ||
                        0
                    )
                );

            },
            0
        );


    setText(
        "dashboardTotal",
        total
    );


    setText(
        "dashboardGood",
        good
    );


    setText(
        "dashboardAttention",
        attention
    );


    setText(
        "dashboardStock",
        totalStock
    );


    const totalElement =
        $("totalInventory");


    if (
        totalElement
    ) {

        totalElement.textContent =
            total;

    }


    const goodElement =
        $("goodInventory");


    if (
        goodElement
    ) {

        goodElement.textContent =
            good;

    }


    const attentionElement =
        $("attentionInventory");


    if (
        attentionElement
    ) {

        attentionElement.textContent =
            attention;

    }


    const stockElement =
        $("stockInventory");


    if (
        stockElement
    ) {

        stockElement.textContent =
            totalStock;

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

}


/* =========================================================
   MONITORING
========================================================= */

function updateMonitoring() {

    const monitoringList =
        $("monitoringList");


    if (!monitoringList) {
        return;
    }


    const needsAttention =
        inventoryData.filter(
            function (item) {

                return (
                    item.kondisi !==
                    "Baik"
                );

            }
        );


    if (
        !needsAttention.length
    ) {

        monitoringList.innerHTML = `

            <div class="empty-monitoring">

                <div class="empty-monitoring-icon">

                    <i
                        class="fa-solid fa-circle-check"
                    ></i>

                </div>


                <h3>
                    Semua kondisi baik
                </h3>


                <p>
                    Tidak ada inventaris yang membutuhkan perhatian.
                </p>

            </div>

        `;

        return;

    }


    monitoringList.innerHTML =
        needsAttention
            .map(
                function (item) {

                    return `

                        <div class="monitoring-item">

                            <div class="monitoring-status ${item.kondisi.toLowerCase()}">

                                <i
                                    class="fa-solid ${
                                        item.kondisi ===
                                        "Rusak"
                                            ? "fa-triangle-exclamation"
                                            : "fa-circle-exclamation"
                                    }"
                                ></i>

                            </div>


                            <div class="monitoring-content">

                                <strong>
                                    ${escapeHtml(
                                        item.nama
                                    )}
                                </strong>


                                <span>
                                    ${escapeHtml(
                                        item.kodeInventaris
                                    )}
                                </span>


                                <small>

                                    ${escapeHtml(
                                        item.ruangan
                                    )}
                                    •
                                    ${conditionLabel(
                                        item.kondisi
                                    )}

                                </small>

                            </div>


                            <button
                                class="monitoring-edit-button"
                                type="button"
                                data-id="${escapeHtml(
                                    String(
                                        item.id
                                    )
                                )}"
                            >

                                <i
                                    class="fa-solid fa-pen"
                                ></i>

                            </button>

                        </div>

                    `;

                }
            )
            .join("");


    monitoringList
        .querySelectorAll(
            ".monitoring-edit-button"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        openEditModal(
                            button.dataset.id
                        );

                    }
                );

            }
        );

}


/* =========================================================
   STATISTICS
========================================================= */

function renderStatistics() {

    const totalStock =
        inventoryData.reduce(
            function (
                sum,
                item
            ) {

                return (
                    sum +
                    Number(
                        item.jumlah ||
                        0
                    )
                );

            },
            0
        );


    const rooms = {};


    inventoryData.forEach(
        function (item) {

            const room =
                item.ruangan ||
                "Lainnya";


            rooms[room] =
                (
                    rooms[room] ||
                    0
                ) +
                Number(
                    item.jumlah ||
                    0
                );

        }
    );


    const categories = {};


    inventoryData.forEach(
        function (item) {

            const category =
                item.kategori ||
                "Lainnya";


            categories[category] =
                (
                    categories[category] ||
                    0
                ) +
                Number(
                    item.jumlah ||
                    0
                );

        }
    );


    const conditions = {

        Baik:
            0,

        Rusak:
            0,

        "Tidak Layak":
            0

    };


    inventoryData.forEach(
        function (item) {

            if (
                Object.prototype.hasOwnProperty.call(
                    conditions,
                    item.kondisi
                )
            ) {

                conditions[
                    item.kondisi
                ] +=
                    Number(
                        item.jumlah ||
                        0
                    );

            }

        }
    );


    setText(
        "statTotalItems",
        inventoryData.length
    );


    setText(
        "statTotalStock",
        totalStock
    );


    setText(
        "statTotalRooms",
        Object.keys(
            rooms
        ).length
    );


    setText(
        "statTotalCategories",
        Object.keys(
            categories
        ).length
    );


    renderRoomChart(
        rooms
    );


    renderConditionChart(
        conditions
    );


    renderCategoryChart(
        categories
    );

}


/* =========================================================
   ROOM CHART
========================================================= */

function renderRoomChart(
    rooms
) {

    const container =
        $("roomChart");


    if (!container) {
        return;
    }


    const entries =
        Object.entries(
            rooms
        );


    if (!entries.length) {

        container.innerHTML = `

            <div class="chart-empty">

                <i
                    class="fa-solid fa-chart-pie"
                ></i>

                <span>
                    Belum ada data
                </span>

            </div>

        `;

        return;

    }


    const max =
        Math.max(
            ...entries.map(
                entry =>
                    entry[1]
            ),
            1
        );


    container.innerHTML =
        entries
            .map(
                function (
                    [name, value]
                ) {

                    const percent =
                        (
                            value /
                            max
                        ) *
                        100;


                    return `

                        <div class="bar-chart-row">

                            <div class="bar-chart-label">

                                <span>
                                    ${escapeHtml(
                                        name
                                    )}
                                </span>

                                <strong>
                                    ${value}
                                </strong>

                            </div>


                            <div class="bar-chart-track">

                                <div
                                    class="bar-chart-fill"
                                    style="
                                        width:${percent}%;
                                    "
                                ></div>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   CONDITION CHART
========================================================= */

function renderConditionChart(
    conditions
) {

    const container =
        $("conditionChart");


    if (!container) {
        return;
    }


    const total =
        Object.values(
            conditions
        )
        .reduce(
            (
                sum,
                value
            ) =>
                sum +
                value,
            0
        );


    if (!total) {

        container.innerHTML = `

            <div class="chart-empty">

                <i
                    class="fa-solid fa-chart-pie"
                ></i>

                <span>
                    Belum ada data
                </span>

            </div>

        `;

        return;

    }


    container.innerHTML =
        Object.entries(
            conditions
        )
        .map(
            function (
                [name, value]
            ) {

                const percent =
                    (
                        value /
                        total
                    ) *
                    100;


                return `

                    <div class="condition-stat">

                        <div class="condition-stat-header">

                            <span>
                                ${escapeHtml(
                                    name
                                )}
                            </span>

                            <strong>
                                ${value}
                            </strong>

                        </div>


                        <div class="condition-stat-bar">

                            <div
                                class="condition-stat-fill condition-${name
                                    .toLowerCase()
                                    .replace(
                                        /\s+/g,
                                        "-"
                                    )}"
                                style="
                                    width:${percent}%;
                                "
                            ></div>

                        </div>


                        <small>
                            ${percent.toFixed(
                                1
                            )}%
                        </small>

                    </div>

                `;

            }
        )
        .join("");

}


/* =========================================================
   CATEGORY CHART
========================================================= */

function renderCategoryChart(
    categories
) {

    const container =
        $("categoryChart");


    if (!container) {
        return;
    }


    const entries =
        Object.entries(
            categories
        );


    if (!entries.length) {

        container.innerHTML = `

            <div class="chart-empty">

                <i
                    class="fa-solid fa-chart-column"
                ></i>

                <span>
                    Belum ada data
                </span>

            </div>

        `;

        return;

    }


    entries.sort(
        function (
            a,
            b
        ) {

            return (
                b[1] -
                a[1]
            );

        }
    );


    const top =
        entries.slice(
            0,
            8
        );


    const max =
        Math.max(
            ...top.map(
                entry =>
                    entry[1]
            ),
            1
        );


    container.innerHTML =
        top
            .map(
                function (
                    [name, value]
                ) {

                    const percent =
                        (
                            value /
                            max
                        ) *
                        100;


                    return `

                        <div class="category-chart-row">

                            <div class="category-chart-info">

                                <span>
                                    ${escapeHtml(
                                        name
                                    )}
                                </span>

                                <strong>
                                    ${value}
                                </strong>

                            </div>


                            <div class="category-chart-track">

                                <div
                                    class="category-chart-fill"
                                    style="
                                        width:${percent}%;
                                    "
                                ></div>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   ACTIVITY
========================================================= */

function renderActivity() {

    const container =
        $("activityList");


    if (!container) {
        return;
    }


    if (
        !activityData.length
    ) {

        container.innerHTML = `

            <div class="activity-empty">

                <i
                    class="fa-solid fa-clock-rotate-left"
                ></i>

                <h3>
                    Belum ada aktivitas
                </h3>

                <p>
                    Aktivitas sistem akan muncul di sini.
                </p>

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
                function (
                    item
                ) {

                    return `

                        <div class="activity-item">

                            <div class="activity-icon">

                                <i
                                    class="fa-solid ${
                                        item.icon ||
                                        "fa-circle"
                                    }"
                                ></i>

                            </div>


                            <div class="activity-content">

                                <strong>
                                    ${escapeHtml(
                                        item.text
                                    )}
                                </strong>


                                <span>
                                    ${formatDateTime(
                                        item.time
                                    )}
                                </span>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   CLEAR ACTIVITIES
========================================================= */

function clearActivities() {

    if (
        !requireAdmin(
            "menghapus riwayat aktivitas"
        )
    ) {

        return;

    }


    if (
        !activityData.length
    ) {

        showToast(
            "Riwayat aktivitas sudah kosong.",
            "info"
        );

        return;

    }


    openConfirmModal(
        "Hapus Aktivitas",
        "Yakin ingin menghapus semua aktivitas?",
        function () {

            activityData =
                [];


            localStorage.removeItem(
                ACTIVITY_KEY
            );


            renderActivity();


            showToast(
                "Riwayat aktivitas berhasil dihapus.",
                "success"
            );

        }
    );

}


/* =========================================================
   CONFIRM MODAL
========================================================= */

function openConfirmModal(
    title,
    message,
    callback
) {

    const modal =
        $("confirmModal");


    if (!modal) {
        return;
    }


    confirmCallback =
        callback;


    setText(
        "confirmTitle",
        title
    );


    setText(
        "confirmMessage",
        message
    );


    modal.classList.add(
        "show"
    );


    document.body.classList.add(
        "modal-open"
    );

}


/* =========================================================
   CLOSE CONFIRM
========================================================= */

function closeConfirmModal() {

    $("confirmModal")
        ?.classList.remove(
            "show"
        );


    document.body.classList.remove(
        "modal-open"
    );


    confirmCallback =
        null;

}


/* =========================================================
   EXPORT CSV
========================================================= */

function exportCSV() {

    const headers = [

        "Kode Inventaris",
        "Nama",
        "Kategori",
        "Ruangan",
        "Jumlah",
        "Kondisi",
        "Tanggal",
        "Keterangan"

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

                    formatDate(
                        item.tanggal
                    ),

                    item.keterangan

                ];

            }
        );


    const csvRows = [

        headers,

        ...rows

    ];


    const csv =
        csvRows
            .map(
                function (
                    row
                ) {

                    return row
                        .map(
                            function (
                                value
                            ) {

                                return `"${String(
                                    value ??
                                    ""
                                )
                                    .replace(
                                        /"/g,
                                        '""'
                                    )}"`;

                            }
                        )
                        .join(",");

                }
            )
            .join("\n");


    const blob =
        new Blob(
            [
                "\uFEFF" +
                csv
            ],
            {
                type:
                    "text/csv;charset=utf-8;"
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
        `inventaris-ruangan-${formatFileDate(
            new Date()
        )}.csv`;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );


    addActivity(
        "Export data CSV",
        "fa-file-export"
    );


    showToast(
        "Data berhasil diexport ke CSV.",
        "success"
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
            "5.5",

        createdAt:
            new Date()
                .toISOString(),

        inventory:
            inventoryData,

        activity:
            activityData

    };


    localStorage.setItem(
        AUTO_BACKUP_KEY,
        JSON.stringify(
            backup
        )
    );


    const blob =
        new Blob(
            [
                JSON.stringify(
                    backup,
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
        `backup-inventaris-${formatFileDate(
            new Date()
        )}.json`;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
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
            "melakukan restore data"
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


    const reader =
        new FileReader();


    reader.onload =
        function () {

            try {

                const backup =
                    JSON.parse(
                        reader.result
                    );


                if (
                    !Array.isArray(
                        backup.inventory
                    )
                ) {

                    throw new Error(
                        "Format backup tidak valid."
                    );

                }


                openConfirmModal(
                    "Restore Data",
                    `Restore ${backup.inventory.length} data inventaris dari backup ini?`,
                    function () {

                        inventoryData =
                            backup.inventory;


                        if (
                            Array.isArray(
                                backup.activity
                            )
                        ) {

                            activityData =
                                backup.activity;

                        }


                        saveData();

                        saveActivity();

                        renderAll();


                        addActivity(
                            "Restore backup data",
                            "fa-rotate-left"
                        );


                        showToast(
                            "Data berhasil direstore.",
                            "success"
                        );

                    }
                );

            }

            catch (
                error
            ) {

                console.error(
                    "Restore error:",
                    error
                );


                showToast(
                    "File backup tidak valid.",
                    "error"
                );

            }


            event.target.value =
                "";

        };


    reader.readAsText(
        file
    );

}


/* =========================================================
   SAVE DATA
========================================================= */

function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
            inventoryData
        )
    );

}


/* =========================================================
   LOAD DATA
========================================================= */

function loadData() {

    try {

        const current =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (current) {

            inventoryData =
                JSON.parse(
                    current
                );

            return;

        }


        for (
            const key
            of OLD_STORAGE_KEYS
        ) {

            const oldData =
                localStorage.getItem(
                    key
                );


            if (!oldData) {
                continue;
            }


            try {

                const parsed =
                    JSON.parse(
                        oldData
                    );


                if (
                    Array.isArray(
                        parsed
                    )
                ) {

                    inventoryData =
                        parsed;


                    saveData();


                    return;

                }

            }

            catch (
                migrationError
            ) {

                console.warn(
                    "Migration error:",
                    migrationError
                );

            }

        }


        inventoryData =
            [];

    }

    catch (
        error
    ) {

        console.error(
            "Load data error:",
            error
        );


        inventoryData =
            [];

    }

}


/* =========================================================
   LOAD ACTIVITY
========================================================= */

function loadActivity() {

    try {

        const saved =
            localStorage.getItem(
                ACTIVITY_KEY
            );


        if (saved) {

            const parsed =
                JSON.parse(
                    saved
                );


            activityData =
                Array.isArray(
                    parsed
                )
                    ? parsed
                    : [];

        }

        else {

            activityData =
                [];

        }

    }

    catch (
        error
    ) {

        console.error(
            "Load activity error:",
            error
        );


        activityData =
            [];

    }

}


/* =========================================================
   ADD ACTIVITY
========================================================= */

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
            "fa-circle",

        time:
            new Date()
                .toISOString()

    });


    if (
        activityData.length >
        100
    ) {

        activityData =
            activityData.slice(
                0,
                100
            );

    }


    localStorage.setItem(
        ACTIVITY_KEY,
        JSON.stringify(
            activityData
        )
    );


    renderActivity();

}

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


    setText(
        "terminalTotal",
        total
    );


    updateHealth();


    renderRecent();


    renderLowStock();

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


        setWidth(
            "healthProgress",
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
   RECENT ITEMS
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
                function (a, b) {

                    return (
                        new Date(
                            b.tanggal
                        ) -
                        new Date(
                            a.tanggal
                        )
                    );

                }
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
                function (item) {

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
                function (item) {

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
            )
            .join("");

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
                function (a, b) {

                    return a.localeCompare(
                        b,
                        "id"
                    );

                }
            );


    select.innerHTML = `
        <option value="all">
            Semua Ruangan
        </option>
    `;


    rooms.forEach(
        function (room) {

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


    renderRooms();


    updateStorage();

}


/* =========================================================
   ROOMS
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
        function (item) {

            roomData[
                item.ruangan
            ] = (
                roomData[
                    item.ruangan
                ] ||
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
                function (a, b) {

                    return (
                        b[1] -
                        a[1]
                    );

                }
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
                function (entry) {

                    const room =
                        entry[0];


                    const count =
                        entry[1];


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


    const donut =
        $("conditionDonut");


    if (donut) {

        const goodEnd =
            goodPercent;


        const lightEnd =
            goodPercent +
            lightPercent;


        donut.style.background =

            `conic-gradient(

                var(--green)
                0% ${goodEnd}%,

                var(--orange)
                ${goodEnd}% ${lightEnd}%,

                var(--red)
                ${lightEnd}% 100%

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


    const categories =
        {};


    inventoryData.forEach(
        function (item) {

            categories[
                item.kategori
            ] = (
                categories[
                    item.kategori
                ] ||
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
                function (a, b) {

                    return (
                        b[1] -
                        a[1]
                    );

                }
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
                function (entry) {

                    const name =
                        entry[0];


                    const count =
                        entry[1];


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


        if (
            !Array.isArray(
                activityData
            )
        ) {

            activityData =
                [];

        }

    }

    catch (
        error
    ) {

        activityData =
            [];

    }

}


function saveActivity() {

    try {

        localStorage.setItem(
            ACTIVITY_KEY,
            JSON.stringify(
                activityData
            )
        );

    }

    catch (
        error
    ) {

        console.error(
            "Save activity error:",
            error
        );

    }

}

    );
}


/* =========================================================
   ADD ACTIVITY
========================================================= */

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


/* =========================================================
   RENDER ACTIVITY
========================================================= */

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
                20
            )
            .map(
                function (item) {

                    return `
                        <div class="activity-item">

                            <div class="activity-icon">

                                <i
                                    class="fa-solid ${escapeHtml(
                                        item.icon
                                    )}"
                                ></i>

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
                    )
                    *
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

    catch (error) {

        console.error(
            "Storage error:",
            error
        );


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
   AUTO BACKUP
========================================================= */

function createAutoBackup() {

    try {

        localStorage.setItem(
            AUTO_BACKUP_KEY,
            JSON.stringify({

                version:
                    "5.5",

                createdAt:
                    new Date()
                        .toISOString(),

                inventory:
                    inventoryData,

                activities:
                    activityData

            })
        );

    }

    catch (error) {

        console.error(
            "Auto backup error:",
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
            "5.5",

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


    readJSON(file)
        .then(
            function (data) {

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
            function (error) {

                console.error(
                    "Restore error:",
                    error
                );


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
            function (item) {

                return [

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

                ];

            }
        );


    const csv =
        [
            headers,
            ...rows
        ]
            .map(
                function (row) {

                    return row
                        .map(
                            csvEscape
                        )
                        .join(",");

                }
            )
            .join("\n");


    downloadFile(
        "\uFEFF" +
        csv,
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
   RESET FILTER
========================================================= */

function resetFilters() {

    if ($("searchInput")) {

        $("searchInput")
            .value =
            "";

    }


    if ($("roomFilter")) {

        $("roomFilter")
            .value =
            "all";

    }


    if ($("conditionFilter")) {

        $("conditionFilter")
            .value =
            "all";

    }


    if ($("sortFilter")) {

        $("sortFilter")
            .value =
            "newest";

    }


    renderInventory();

}


/* =========================================================
   CONFIRM MODAL
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


    document.body.classList.add(
        "modal-open"
    );

}


function closeConfirmModal() {

    $("confirmModal")
        ?.classList.remove(
            "show"
        );


    document.body.classList.remove(
        "modal-open"
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

    if ($("themeButton")) {

        $("themeButton").innerHTML =

            dark

                ? `
                    <span>

                        <i
                            class="fa-solid fa-sun"
                        ></i>

                        Light Mode

                    </span>

                    <i
                        class="fa-solid fa-toggle-on"
                    ></i>
                  `

                : `
                    <span>

                        <i
                            class="fa-solid fa-moon"
                        ></i>

                        Dark Mode

                    </span>

                    <i
                        class="fa-solid fa-toggle-off"
                    ></i>
                  `;

    }


    if ($("mobileThemeButton")) {

        $("mobileThemeButton")
            .innerHTML =

            dark

                ? `
                    <i
                        class="fa-solid fa-sun"
                    ></i>
                  `

                : `
                    <i
                        class="fa-solid fa-moon"
                    ></i>
                  `;

    }

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
   FOOTER YEAR
========================================================= */

function updateFooterYear() {

    const year =
        new Date()
            .getFullYear();


    document
        .querySelectorAll(
            "#footerYear"
        )
        .forEach(
            function (element) {

                element.textContent =
                    year;

            }
        );

}


/* =========================================================
   PWA INSTALL
========================================================= */

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

        deferredInstallPrompt.prompt();


        await deferredInstallPrompt
            .userChoice;

    }

    catch (error) {

        console.warn(
            "Install error:",
            error
        );

    }


    deferredInstallPrompt =
        null;


    $("installButton")
        ?.classList.add(
            "hidden"
        );

}


/* =========================================================
   SERVICE WORKER
========================================================= */

async function registerServiceWorker() {

    if (
        !(
            "serviceWorker"
            in navigator
        )
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

        const registration =
            await navigator.serviceWorker.register(
                "service-worker.js",
                {
                    updateViaCache:
                        "none"
                }
            );


        registration.update();


        console.info(
            "Service Worker aktif."
        );

    }

    catch (error) {

        console.warn(
            "Service Worker error:",
            error
        );

    }

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
   YEAR / CLOCK SUPPORT
========================================================= */

setInterval(
    updateClock,
    1000
);


/* =========================================================
   WINDOW RESIZE
========================================================= */

window.addEventListener(
    "resize",
    function () {

        renderStatistics();

    }
);


/* =========================================================
   SERVICE WORKER UPDATE
========================================================= */

if (
    "serviceWorker"
    in navigator
) {

    navigator.serviceWorker.addEventListener(
        "controllerchange",
        function () {

            console.info(
                "Service Worker controller berubah."
            );

        }
    );

}

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
        function () {

            splash.classList.add(
                "hide"
            );

        },
        600
    );

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

}


/* =========================================================
   UTILITIES
========================================================= */

function setText(
    id,
    value
) {

    const element =
        $(id);


    if (element) {

        element.textContent =
            value;

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


function createId() {

    if (
        window.crypto &&
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
                type:
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
        function () {

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

                    }

                    catch (error) {

                        reject(
                            error
                        );

                    }

                };


            reader.onerror =
                function () {

                    reject(
                        reader.error
                    );

                };


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


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message,
    type =
        "info"
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


    else if (
        type ===
        "error"
    ) {

        icon =
            "fa-circle-xmark";


        title =
            "Error";

    }


    else if (
        type ===
        "warning"
    ) {

        icon =
            "fa-triangle-exclamation";


        title =
            "Peringatan";

    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        `toast ${type}`;


    toast.innerHTML = `

        <i
            class="fa-solid ${icon}"
        ></i>


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


    requestAnimationFrame(
        function () {

            toast.classList.add(
                "show"
            );

        }
    );


    setTimeout(
        function () {

            toast.classList.remove(
                "show"
            );


            setTimeout(
                function () {

                    toast.remove();

                },
                300
            );

        },
        3500
    );

}


/* =========================================================
   GLOBAL DEBUG
========================================================= */

window.inventoryApp = {

    auth:

        auth,


    loginGoogle:

        loginWithGoogle,


    loginGoogleRedirect:

        loginWithGoogleRedirect,


    logout:

        logoutAdmin,


    currentUser:

        function () {

            return (

                auth.currentUser ||

                null

            );

        },


    isAdmin:

        function () {

            return (

                isAdminLoggedIn

            );

        }

};

window.inventoryApp = {

    auth:
        auth,

    loginGoogle:
        loginWithGoogle,

    loginGoogleRedirect:
        loginWithGoogleRedirect,

    logout:
        logoutAdmin,

    currentUser:
        function () {

            return (
                auth.currentUser ||
                null
            );

        },

    isAdmin:
        function () {

            return (
                isAdminLoggedIn
            );

        }

};
