/* =========================================================
   FIREBASE ADMIN LOGIN - TAMBAHAN
   Firebase hanya digunakan untuk autentikasi Admin.
   Data inventaris tetap memakai LocalStorage seperti kode asli.
========================================================= */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCGYXZYJroOjIsBw0PD2h6KqoEyZb-Gxw",
  authDomain: "sistem-inventaris-ruangan-2026.firebaseapp.com",
  projectId: "sistem-inventaris-ruangan-2026",
  storageBucket: "sistem-inventaris-ruangan-2026.firebasestorage.app",
  messagingSenderId: "760181965978",
  appId: "1:760181965978:web:a444ceb2d29676b9e30b23",
  measurementId: "G-W1Z7CFXX0M"
};

let firebaseApp = null;
let firebaseAuth = null;
let firebaseUser = null;
let firebaseFns = null;
let firebaseAuthReady = false;
let firebaseLoading = null;

function loadFirebaseAuth() {

  if (firebaseFns) {
    return Promise.resolve(firebaseFns);
  }

  if (firebaseLoading) {
    return firebaseLoading;
  }

  firebaseLoading = Promise.all([
    import(
      "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js"
    ),
    import(
      "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js"
    )
  ])
    .then(
      ([appModule, authModule]) => {

        firebaseApp =
          appModule.initializeApp(
            FIREBASE_CONFIG
          );

        firebaseFns =
          authModule;

        firebaseAuth =
          authModule.getAuth(
            firebaseApp
          );

        return authModule
          .setPersistence(
            firebaseAuth,
            authModule.browserLocalPersistence
          )
          .then(
            () => firebaseFns
          );

      }
    )
    .catch(
      (error) => {

        firebaseLoading = null;

        throw error;

      }
    );

  return firebaseLoading;

}


/* =========================================================
   ADMIN LOGIN UI
========================================================= */

function updateAdminLoginUI() {

  const button =
    document.getElementById(
      "loginButton"
    );

  const name =
    document.getElementById(
      "adminName"
    );

  const role =
    document.getElementById(
      "adminRole"
    );

  const avatar =
    document.getElementById(
      "adminAvatar"
    );

  const dot =
    document.getElementById(
      "loginStatusDot"
    );


  if (!button) {
    return;
  }


  if (firebaseUser) {

    if (name) {

      name.textContent =
        firebaseUser.displayName ||
        firebaseUser.email ||
        "Admin";

    }


    if (role) {

      role.textContent =
        "Administrator • Online";

    }


    if (avatar) {

      avatar.innerHTML = `
        <svg aria-hidden="true">
          <use href="#icon-shield"></use>
        </svg>
      `;

    }


    dot?.classList.add(
      "logged-in"
    );


    button.title =
      "Klik untuk logout Admin";


    button.setAttribute(
      "aria-label",
      "Logout Admin"
    );

  }

  else {

    if (name) {

      name.textContent =
        "MarcelZuhdan";

    }


    if (role) {

      role.textContent =
        "Login Admin";

    }


    if (avatar) {

      avatar.innerHTML = `
        <svg aria-hidden="true">
          <use href="#icon-shield"></use>
        </svg>
      `;

    }


    dot?.classList.remove(
      "logged-in"
    );


    button.title =
      "Klik untuk Login Admin";


    button.setAttribute(
      "aria-label",
      "Login Admin"
    );

  }

}


/* =========================================================
   LOGIN ERROR
========================================================= */

function showLoginError(
  message
) {

  const error =
    document.getElementById(
      "loginError"
    );


  if (error) {

    error.textContent =
      message || "";

  }

}


/* =========================================================
   OPEN LOGIN
========================================================= */

function openLoginModal() {

  const modal =
    document.getElementById(
      "loginModal"
    );


  if (!modal) {
    return;
  }


  if (firebaseUser) {

    logoutAdmin();

    return;

  }


  showLoginError(
    ""
  );


  const status =
    document.getElementById(
      "googleLoginStatus"
    );


  if (status) {

    status.textContent =
      "";

  }


  modal.classList.add(
    "show"
  );


  modal.setAttribute(
    "aria-hidden",
    "false"
  );


  setTimeout(
    () => {

      document
        .getElementById(
          "loginEmail"
        )
        ?.focus();

    },
    80
  );

}


/* =========================================================
   CLOSE LOGIN
========================================================= */

function closeLoginModal() {

  const modal =
    document.getElementById(
      "loginModal"
    );


  if (!modal) {
    return;
  }


  modal.classList.remove(
    "show"
  );


  modal.setAttribute(
    "aria-hidden",
    "true"
  );


  showLoginError(
    ""
  );

}


/* =========================================================
   FIREBASE AUTH STATE
========================================================= */

async function setupFirebaseAuth() {

  try {

    await loadFirebaseAuth();


    firebaseFns.onAuthStateChanged(
      firebaseAuth,
      (user) => {

        firebaseUser =
          user || null;


        firebaseAuthReady =
          true;


        updateAdminLoginUI();

      }
    );

  }

  catch (error) {

    console.warn(
      "Firebase Auth belum tersedia:",
      error
    );


    firebaseAuthReady =
      false;


    updateAdminLoginUI();

  }

}


/* =========================================================
   FIREBASE ERROR
========================================================= */

function getFirebaseErrorMessage(
  error
) {

  const code =
    error?.code || "";


  const messages = {

    "auth/invalid-credential":
      "Email atau password Admin salah.",

    "auth/invalid-email":
      "Format email tidak valid.",

    "auth/user-disabled":
      "Akun Admin sedang dinonaktifkan.",

    "auth/too-many-requests":
      "Terlalu banyak percobaan. Coba lagi nanti.",

    "auth/popup-closed-by-user":
      "Login Google dibatalkan.",

    "auth/popup-blocked":
      "Popup diblokir browser. Izinkan popup lalu coba lagi.",

    "auth/network-request-failed":
      "Koneksi internet bermasalah.",

    "auth/operation-not-allowed":
      "Metode login belum diaktifkan di Firebase."

  };


  return (
    messages[code] ||
    error?.message ||
    "Login Admin gagal. Coba lagi."
  );

}


/* =========================================================
   LOGIN EMAIL + PASSWORD
========================================================= */

async function loginAdminEmail(
  event
) {

  event.preventDefault();


  const email =
    document
      .getElementById(
        "loginEmail"
      )
      ?.value
      .trim();


  const password =
    document
      .getElementById(
        "loginPassword"
      )
      ?.value ||
    "";


  if (
    !email ||
    !password
  ) {

    showLoginError(
      "Email dan password wajib diisi."
    );

    return;

  }


  showLoginError(
    ""
  );


  const submit =
    document.querySelector(
      "#loginForm .login-submit"
    );


  if (submit) {

    submit.disabled =
      true;


    submit.dataset.originalText =
      submit.textContent;


    submit.textContent =
      "Memproses...";

  }


  try {

    await loadFirebaseAuth();


    await firebaseFns.signInWithEmailAndPassword(
      firebaseAuth,
      email,
      password
    );


    closeLoginModal();


    showToast(
      "Login Berhasil",
      "Akses Administrator telah aktif."
    );

  }

  catch (error) {

    console.error(
      error
    );


    showLoginError(
      getFirebaseErrorMessage(
        error
      )
    );

  }

  finally {

    if (submit) {

      submit.disabled =
        false;


      submit.textContent =
        submit.dataset.originalText ||
        "Masuk sebagai Admin";

    }

  }

}


/* =========================================================
   LOGIN GOOGLE
========================================================= */

async function loginAdminGoogle() {

  showLoginError(
    ""
  );


  const status =
    document.getElementById(
      "googleLoginStatus"
    );


  if (status) {

    status.textContent =
      "Menghubungkan ke Google...";

  }


  try {

    await loadFirebaseAuth();


    const provider =
      new firebaseFns.GoogleAuthProvider();


    await firebaseFns.signInWithPopup(
      firebaseAuth,
      provider
    );


    closeLoginModal();


    showToast(
      "Login Google Berhasil",
      "Akses Administrator telah aktif."
    );

  }

  catch (error) {

    console.error(
      error
    );


    if (status) {

      status.textContent =
        getFirebaseErrorMessage(
          error
        );

    }

  }

}


/* =========================================================
   LOGOUT ADMIN
========================================================= */

async function logoutAdmin() {

  try {

    await loadFirebaseAuth();


    await firebaseFns.signOut(
      firebaseAuth
    );


    showToast(
      "Logout Berhasil",
      "Akses Administrator telah dikunci kembali."
    );

  }

  catch (error) {

    console.error(
      error
    );


    showToast(
      "Logout Gagal",
      getFirebaseErrorMessage(
        error
      ),
      "warning"
    );

  }

}


/* =========================================================
   ADMIN GUARD
========================================================= */

function requireFirebaseAdmin(
  action
) {

  if (firebaseUser) {

    return true;

  }


  showToast(
    "Login Admin Diperlukan",
    `Silakan login Admin untuk ${action}.`,
    "warning"
  );


  openLoginModal();


  return false;

}


/* =========================================================
   INVENTARISIT 2.2
   FUTURISTIC IT SYSTEM
========================================================= */


/* =========================================================
   LINK FOOTER
========================================================= */

const FOOTER_LINKS = {

  github:
    "https://github.com/Marcellino-cell",

  linkedin:
    "https://www.linkedin.com/feed/",

  gps:
    "https://maps.app.goo.gl/LF7XkcsbJNuz49Hg7?g_st=aw",

  phone:
    "https://wa.me/qr/UEMXPUCB4JO3L1"

};


/* =========================================================
   CONFIG
========================================================= */

const STORAGE_KEY =
  "inventarisIT_data";

const THEME_KEY =
  "inventarisIT_theme";

const APP_VERSION =
  "2.2";

const LOGO_PATH =
  "icon/logo 1.jpeg";


/* =========================================================
   STATE
========================================================= */

let inventory = [];

let pendingDeleteId =
  null;

let deferredInstallPrompt =
  null;

let toastTimer =
  null;


/* =========================================================
   DOM HELPERS
========================================================= */

const $ = (id) =>
  document.getElementById(
    id
  );


const $$ = (selector) =>
  [
    ...document.querySelectorAll(
      selector
    )
  ];


/* =========================================================
   ELEMENTS
========================================================= */

const els = {

  splash:
    $("splashScreen"),

  app:
    $("app"),

  sidebar:
    $("sidebar"),

  mobileMenu:
    $("mobileMenu"),

  mobileClose:
    $("mobileClose"),

  themeToggle:
    $("themeToggle"),

  themeIcon:
    $("themeIcon"),

  installButton:
    $("installButton"),

  breadcrumbText:
    $("breadcrumbText"),

  totalItems:
    $("totalItems"),

  goodItems:
    $("goodItems"),

  minorItems:
    $("minorItems"),

  majorItems:
    $("majorItems"),

  heroTotal:
    $("heroTotal"),

  goodPercent:
    $("goodPercent"),

  minorPercent:
    $("minorPercent"),

  majorPercent:
    $("majorPercent"),

  goodProgress:
    $("goodProgress"),

  minorProgress:
    $("minorProgress"),

  majorProgress:
    $("majorProgress"),

  goodProgressText:
    $("goodProgressText"),

  minorProgressText:
    $("minorProgressText"),

  majorProgressText:
    $("majorProgressText"),

  recentInventory:
    $("recentInventory"),

  searchInput:
    $("searchInput"),

  roomFilter:
    $("roomFilter"),

  conditionFilter:
    $("conditionFilter"),

  resetFilters:
    $("resetFilters"),

  inventoryGrid:
    $("inventoryGrid"),

  inventoryCount:
    $("inventoryCount"),

  form:
    $("inventoryForm"),

  editId:
    $("editId"),

  itemName:
    $("itemName"),

  itemCode:
    $("itemCode"),

  itemRoom:
    $("itemRoom"),

  itemQuantity:
    $("itemQuantity"),

  formTitle:
    $("formTitle"),

  submitText:
    $("submitText"),

  cancelEdit:
    $("cancelEdit"),

  resetForm:
    $("resetForm"),

  donutChart:
    $("donutChart"),

  chartTotal:
    $("chartTotal"),

  legendGood:
    $("legendGood"),

  legendMinor:
    $("legendMinor"),

  legendMajor:
    $("legendMajor"),

  roomStatistics:
    $("roomStatistics"),

  exportButton:
    $("exportButton"),

  importButton:
    $("importButton"),

  importInput:
    $("importInput"),

  backupButton:
    $("backupButton"),

  restoreButton:
    $("restoreButton"),

  restoreInput:
    $("restoreInput"),

  clearDataButton:
    $("clearDataButton"),

  toast:
    $("toast"),

  toastTitle:
    $("toastTitle"),

  toastMessage:
    $("toastMessage"),

  toastClose:
    $("toastClose"),

  confirmModal:
    $("confirmModal"),

  cancelDelete:
    $("cancelDelete"),

  confirmDelete:
    $("confirmDelete"),

  bootProgressBar:
    $("bootProgressBar"),

  bootStatus:
    $("bootStatus"),

  log1:
    $("log1"),

  log2:
    $("log2"),

  log3:
    $("log3"),

  log4:
    $("log4")

};


/* =========================================================
   SAFE HTML
========================================================= */

function escapeHTML(
  value
) {

  return String(
    value ?? ""
  ).replace(
    /[&<>'"]/g,
    (char) => {

      const map = {

        "&":
          "&amp;",

        "<":
          "&lt;",

        ">":
          "&gt;",

        "'":
          "&#39;",

        '"':
          "&quot;"

      };


      return map[char];

    }
  );

}


/* =========================================================
   FORMAT NUMBER
========================================================= */

function formatNumber(
  value
) {

  return new Intl.NumberFormat(
    "id-ID"
  ).format(
    Number(value) || 0
  );

}


/* =========================================================
   FORMAT DATE
========================================================= */

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


  return new Intl.DateTimeFormat(
    "id-ID",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric"
    }
  ).format(
    date
  );

}


/* =========================================================
   GET INITIALS
========================================================= */

function getInitials(
  name
) {

  return String(
    name ||
      "IT"
  )
    .trim()
    .split(
      /\s+/
    )
    .slice(
      0,
      2
    )
    .map(
      (word) =>
        word[0]
    )
    .join("")
    .toUpperCase() ||
    "IT";

}


/* =========================================================
   CONDITION CLASS
========================================================= */

function getConditionClass(
  condition
) {

  if (
    condition ===
      "Rusak Ringan"
  ) {

    return "minor";

  }


  if (
    condition ===
      "Rusak Berat"
  ) {

    return "major";

  }


  return "good";

}


/* =========================================================
   FOOTER
========================================================= */

function createFooterHTML() {

  const github =
    FOOTER_LINKS.github.trim();

  const linkedin =
    FOOTER_LINKS.linkedin.trim();

  const gps =
    FOOTER_LINKS.gps.trim();

  const phone =
    FOOTER_LINKS.phone.trim();


  return `

    <footer class="page-footer">

      <div class="footer-main">

        <div class="footer-brand">

          <div class="footer-logo">

            <img
              src="${LOGO_PATH}"
              alt="Logo InventarisIT"
              class="footer-logo-image"
            >

          </div>


          <div>

            <strong>
              Inventaris<span>IT</span>
            </strong>

            <p>
              Sistem Inventaris Ruangan
            </p>

          </div>

        </div>


        <div class="footer-links">

          <a
            href="${escapeHTML(github || "#")}"
            target="_blank"
            rel="noopener noreferrer"
            class="footer-link github"
            ${github
              ? ""
              : 'data-empty-link="true"'}
          >

            <svg>
              <use href="#icon-github"></use>
            </svg>

            GitHub

          </a>


          <a
            href="${escapeHTML(linkedin || "#")}"
            target="_blank"
            rel="noopener noreferrer"
            class="footer-link linkedin"
            ${linkedin
              ? ""
              : 'data-empty-link="true"'}
          >

            <svg>
              <use href="#icon-linkedin"></use>
            </svg>

            LinkedIn

          </a>


          <a
            href="${escapeHTML(gps || "#")}"
            target="_blank"
            rel="noopener noreferrer"
            class="footer-link gps"
            ${gps
              ? ""
              : 'data-empty-link="true"'}
          >

            <svg>
              <use href="#icon-location"></use>
            </svg>

            GPS

          </a>


          <a
            href="${escapeHTML(phone || "#")}"
            class="footer-link phone"
            ${phone
              ? ""
              : 'data-empty-link="true"'}
          >

            <svg>
              <use href="#icon-phone"></use>
            </svg>

            Telepon

          </a>

        </div>

      </div>


      <div class="footer-bottom">

        <span>
          © ${new Date().getFullYear()} InventarisIT
        </span>

        <span>
          Created by MarcellinoZuhdan
        </span>

        <span class="footer-status">

          <i></i>

          System Online

        </span>

      </div>

    </footer>

  `;

}


function renderPageFooters() {

  $$(".page-footer-container")
    .forEach(
      (container) => {

        container.innerHTML =
          createFooterHTML();

      }
    );

}


/* =========================================================
   CUSTOM LOGO
========================================================= */

function applyCustomLogo() {

  const splashLogo =
    document.querySelector(
      ".boot-logo"
    );


  if (splashLogo) {

    splashLogo.innerHTML = `

      <img
        src="${LOGO_PATH}"
        alt="Logo InventarisIT"
        class="custom-logo boot-custom-logo"
      >

      <div class="boot-ring ring-one"></div>

      <div class="boot-ring ring-two"></div>

    `;

  }


  const brandBox =
    document.querySelector(
      ".brand-box"
    );


  if (brandBox) {

    brandBox.innerHTML = `

      <img
        src="${LOGO_PATH}"
        alt="Logo InventarisIT"
        class="sidebar-logo custom-logo"
      >

    `;

  }


  $$(".footer-logo")
    .forEach(
      (logo) => {

        logo.innerHTML = `

          <img
            src="${LOGO_PATH}"
            alt="Logo InventarisIT"
            class="footer-logo-image custom-logo"
          >

        `;

      }
    );

}


/* =========================================================
   STORAGE
========================================================= */

function loadInventory() {

  try {

    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );


    const parsed =
      raw
        ? JSON.parse(
            raw
          )
        : [];


    inventory =
      Array.isArray(
        parsed
      )
        ? parsed.filter(
            isValidInventoryRecord
          )
        : [];

  }

  catch (error) {

    console.error(
      "LocalStorage:",
      error
    );


    inventory = [];

  }

}


function isValidInventoryRecord(
  item
) {

  return (

    item &&

    typeof item ===
      "object" &&

    typeof item.id ===
      "string" &&

    typeof item.name ===
      "string" &&

    Number.isFinite(
      Number(
        item.quantity
      )
    )

  );

}


function saveInventory() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      inventory
    )
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

  const icon =
    els.toast.querySelector(
      ".toast-icon"
    );


  if (
    type ===
      "warning"
  ) {

    els.toast.style.borderColor =
      "rgba(255,180,75,.2)";


    icon.style.color =
      "var(--orange)";


    icon.style.background =
      "rgba(255,180,75,.09)";


    icon.innerHTML = `

      <svg>
        <use href="#icon-warning"></use>
      </svg>

    `;

  }

  else {

    els.toast.style.borderColor =
      "rgba(39,224,161,.16)";


    icon.style.color =
      "var(--green)";


    icon.style.background =
      "rgba(39,224,161,.08)";


    icon.innerHTML = `

      <svg>
        <use href="#icon-check"></use>
      </svg>

    `;

  }


  els.toastTitle.textContent =
    title;


  els.toastMessage.textContent =
    message;


  els.toast.classList.add(
    "show"
  );


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(
      () => {

        els.toast.classList.remove(
          "show"
        );

      },
      3500
    );

}


/* =========================================================
   NAVIGATION
========================================================= */

function navigate(
  page
) {

  const validPages = [

    "dashboard",

    "inventory",

    "add",

    "stats"

  ];


  if (
    !validPages.includes(
      page
    )
  ) {

    page =
      "dashboard";

  }


  $$(".page")
    .forEach(
      (section) => {

        section.classList.remove(
          "active-page"
        );

      }
    );


  const target =
    $("page-" + page);


  if (target) {

    target.classList.add(
      "active-page"
    );

  }


  $$(".nav-item")
    .forEach(
      (button) => {

        button.classList.toggle(
          "active",
          button.dataset.page ===
            page
        );

      }
    );


  els.breadcrumbText.textContent =
    page ===
      "add"
      ? "DATA ENTRY"
      : page.toUpperCase();


  els.sidebar.classList.remove(
    "open"
  );


  window.scrollTo({

    top:
      0,

    behavior:
      "smooth"

  });


  if (
    page ===
      "inventory"
  ) {

    renderInventory();

  }


  if (
    page ===
      "stats"
  ) {

    renderStatistics();

  }

/* =========================================================
   TOTALS
========================================================= */

function getTotals() {

  return inventory.reduce(

    (
      result,
      item
    ) => {

      const quantity =
        Math.max(
          0,
          Number(
            item.quantity
          ) || 0
        );


      result.total +=
        quantity;


      if (
        item.condition ===
          "Rusak Ringan"
      ) {

        result.minor +=
          quantity;

      }

      else if (
        item.condition ===
          "Rusak Berat"
      ) {

        result.major +=
          quantity;

      }

      else {

        result.good +=
          quantity;

      }


      return result;

    },

    {

      total:
        0,

      good:
        0,

      minor:
        0,

      major:
        0

    }

  );

}


/* =========================================================
   PERCENTAGE
========================================================= */

function percentage(
  value,
  total
) {

  return total

    ? Math.round(
        value /
        total *
        100
      )

    : 0;

}


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

  const totals =
    getTotals();


  const goodPercent =
    percentage(
      totals.good,
      totals.total
    );


  const minorPercent =
    percentage(
      totals.minor,
      totals.total
    );


  const majorPercent =
    percentage(
      totals.major,
      totals.total
    );


  if (els.totalItems) {

    els.totalItems.textContent =
      formatNumber(
        totals.total
      );

  }


  if (els.goodItems) {

    els.goodItems.textContent =
      formatNumber(
        totals.good
      );

  }


  if (els.minorItems) {

    els.minorItems.textContent =
      formatNumber(
        totals.minor
      );

  }


  if (els.majorItems) {

    els.majorItems.textContent =
      formatNumber(
        totals.major
      );

  }


  if (els.heroTotal) {

    els.heroTotal.textContent =
      formatNumber(
        totals.total
      );

  }


  if (els.goodPercent) {

    els.goodPercent.textContent =
      `${goodPercent}%`;

  }


  if (els.minorPercent) {

    els.minorPercent.textContent =
      `${minorPercent}%`;

  }


  if (els.majorPercent) {

    els.majorPercent.textContent =
      `${majorPercent}%`;

  }


  if (els.goodProgress) {

    els.goodProgress.style.width =
      `${goodPercent}%`;

  }


  if (els.minorProgress) {

    els.minorProgress.style.width =
      `${minorPercent}%`;

  }


  if (els.majorProgress) {

    els.majorProgress.style.width =
      `${majorPercent}%`;

  }


  if (els.goodProgressText) {

    els.goodProgressText.textContent =
      `${goodPercent}%`;

  }


  if (els.minorProgressText) {

    els.minorProgressText.textContent =
      `${minorPercent}%`;

  }


  if (els.majorProgressText) {

    els.majorProgressText.textContent =
      `${majorPercent}%`;

  }


  renderRecentInventory();

}


/* =========================================================
   RECENT INVENTORY
========================================================= */

function renderRecentInventory() {

  if (
    !els.recentInventory
  ) {

    return;

  }


  const recent =
    [...inventory]
      .sort(
        (
          a,
          b
        ) => {

          return (

            new Date(
              b.updatedAt ||
              b.createdAt ||
              0
            ) -

            new Date(
              a.updatedAt ||
              a.createdAt ||
              0
            )

          );

        }
      )
      .slice(
        0,
        5
      );


  if (!recent.length) {

    els.recentInventory.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">

          <svg>

            <use
              href="#icon-box"
            ></use>

          </svg>

        </div>


        <strong>
          Belum ada data
        </strong>


        <p>
          Data inventaris akan muncul di sini.
        </p>

      </div>

    `;

    return;

  }


  els.recentInventory.innerHTML =
    recent
      .map(
        (item) => {

          const conditionClass =
            getConditionClass(
              item.condition
            );


          return `

            <div class="recent-item">

              <div class="recent-item-icon">

                <svg>

                  <use
                    href="#icon-box"
                  ></use>

                </svg>

              </div>


              <div class="recent-item-info">

                <strong>
                  ${escapeHTML(
                    item.name
                  )}
                </strong>


                <small>
                  ${escapeHTML(
                    item.room ||
                    "-"
                  )}
                </small>

              </div>


              <div class="recent-item-meta">

                <span
                  class="condition-badge ${conditionClass}"
                >
                  ${escapeHTML(
                    item.condition ||
                    "Baik"
                  )}
                </span>


                <small>
                  ${formatNumber(
                    item.quantity
                  )} unit
                </small>

              </div>

            </div>

          `;

        }
      )
      .join("");

}


/* =========================================================
   FILTER INVENTORY
========================================================= */

function getFilteredInventory() {

  const search =
    (
      els.searchInput?.value ||
      ""
    )
      .trim()
      .toLowerCase();


  const room =
    els.roomFilter?.value ||
    "";


  const condition =
    els.conditionFilter?.value ||
    "";


  return inventory.filter(
    (item) => {

      const searchableText = [

        item.name,

        item.code,

        item.room,

        item.condition

      ]
        .map(
          value =>
            String(
              value ?? ""
            )
        )
        .join(" ")
        .toLowerCase();


      const matchesSearch =
        !search ||
        searchableText.includes(
          search
        );


      const matchesRoom =
        !room ||
        item.room === room;


      const matchesCondition =
        !condition ||
        item.condition === condition;


      return (

        matchesSearch &&
        matchesRoom &&
        matchesCondition

      );

    }
  );

}


/* =========================================================
   RENDER INVENTORY
========================================================= */

function renderInventory() {

  if (
    !els.inventoryGrid
  ) {

    return;

  }


  const filtered =
    getFilteredInventory();


  if (els.inventoryCount) {

    els.inventoryCount.textContent =
      `${filtered.length} DATA / ${inventory.length} TOTAL`;

  }


  if (!filtered.length) {

    els.inventoryGrid.innerHTML = `

      <div
        class="empty-state"
        style="grid-column:1/-1"
      >

        <div class="empty-icon">

          <svg>

            <use
              href="#icon-box"
            ></use>

          </svg>

        </div>


        <strong>

          ${
            inventory.length
              ? "Data tidak ditemukan"
              : "Belum ada inventaris"
          }

        </strong>


        <p>

          ${
            inventory.length
              ? "Coba ubah pencarian atau filter."
              : "Tambahkan inventaris pertama."
          }

        </p>

      </div>

    `;

    return;

  }


  els.inventoryGrid.innerHTML =
    filtered
      .map(
        (item) =>
          createInventoryCard(
            item
          )
      )
      .join("");

}


/* =========================================================
   INVENTORY CARD
========================================================= */

function createInventoryCard(
  item
) {

  const conditionClass =
    getConditionClass(
      item.condition
    );


  const quantity =
    Math.max(
      0,
      Number(
        item.quantity
      ) || 0
    );


  return `

    <article
      class="inventory-card"
      data-id="${escapeHTML(
        item.id
      )}"
    >

      <div class="inventory-top">

        <div class="inventory-title">

          <div class="card-avatar">

            ${escapeHTML(
              getInitials(
                item.name
              )
            )}

          </div>


          <div>

            <strong>

              ${escapeHTML(
                item.name
              )}

            </strong>


            <small>

              ${escapeHTML(
                item.code ||
                "-"
              )}

            </small>

          </div>

        </div>


        <span
          class="condition-pill ${conditionClass}"
        >

          ${escapeHTML(
            item.condition ||
            "Baik"
          )}

        </span>

      </div>


      <div class="inventory-detail">

        <div class="detail-cell">

          <span>
            RUANGAN
          </span>


          <strong>

            ${escapeHTML(
              item.room ||
              "-"
            )}

          </strong>

        </div>


        <div class="detail-cell">

          <span>
            JUMLAH
          </span>


          <strong>

            ${formatNumber(
              quantity
            )}
            UNIT

          </strong>

        </div>

      </div>


      <div class="card-footer">

        <span class="room-pill">

          UPDATE
          ${escapeHTML(
            formatDate(
              item.updatedAt ||
              item.createdAt
            )
          )}

        </span>


        <div class="card-actions">

          <button
            type="button"
            class="card-action"
            data-action="edit"
            data-id="${escapeHTML(
              item.id
            )}"
            title="Edit"
          >

            <svg>

              <use
                href="#icon-edit"
              ></use>

            </svg>

          </button>


          <button
            type="button"
            class="card-action delete"
            data-action="delete"
            data-id="${escapeHTML(
              item.id
            )}"
            title="Hapus"
          >

            <svg>

              <use
                href="#icon-trash"
              ></use>

            </svg>

          </button>

        </div>

      </div>

    </article>

  `;

}


/* =========================================================
   FORM RESET
========================================================= */

function resetFormToAdd() {

  if (!els.form) {

    return;

  }


  els.form.reset();


  if (els.editId) {

    els.editId.value =
      "";

  }


  if (els.formTitle) {

    els.formTitle.textContent =
      "Tambah Inventaris";

  }


  if (els.submitText) {

    els.submitText.textContent =
      "Simpan Data";

  }


  if (els.cancelEdit) {

    els.cancelEdit.classList.add(
      "hidden"
    );

  }

}


/* =========================================================
   EDIT RECORD
========================================================= */

function editRecord(
  id
) {

  if (
    !requireFirebaseAdmin(
      "mengedit inventaris"
    )
  ) {

    return;

  }


  const item =
    inventory.find(
      (record) =>
        record.id ===
        id
    );


  if (!item) {

    showToast(
      "Data Tidak Ditemukan",
      "Data inventaris tidak ditemukan.",
      "warning"
    );

    return;

  }


  if (els.editId) {

    els.editId.value =
      item.id;

  }


  if (els.itemName) {

    els.itemName.value =
      item.name ||
      "";

  }


  if (els.itemCode) {

    els.itemCode.value =
      item.code ||
      "";

  }


  if (els.itemRoom) {

    els.itemRoom.value =
      item.room ||
      "";

  }


  if (els.itemQuantity) {

    els.itemQuantity.value =
      item.quantity ??
      "";

  }


  const conditionInput =
    document.getElementById(
      "itemCondition"
    );


  if (conditionInput) {

    conditionInput.value =
      item.condition ||
      "Baik";

  }


  const descriptionInput =
    document.getElementById(
      "itemDescription"
    );


  if (descriptionInput) {

    descriptionInput.value =
      item.description ||
      "";

  }


  if (els.formTitle) {

    els.formTitle.textContent =
      "Edit Inventaris";

  }


  if (els.submitText) {

    els.submitText.textContent =
      "Update Data";

  }


  if (els.cancelEdit) {

    els.cancelEdit.classList.remove(
      "hidden"
    );

  }


  navigate(
    "add"
  );

}


/* =========================================================
   FORM SUBMIT
========================================================= */

function handleFormSubmit(
  event
) {

  event.preventDefault();


  if (
    !requireFirebaseAdmin(
      "menyimpan inventaris"
    )
  ) {

    return;

  }


  const name =
    els.itemName.value.trim();


  const code =
    els.itemCode.value.trim();


  const room =
    els.itemRoom.value;


  const quantity =
    Number(
      els.itemQuantity.value
    );


  const conditionInput =
    document.getElementById(
      "itemCondition"
    );


  const condition =
    conditionInput?.value ||
    "Baik";


  const descriptionInput =
    document.getElementById(
      "itemDescription"
    );


  const description =
    descriptionInput?.value.trim() ||
    "";


  if (!name) {

    showToast(
      "Data Belum Lengkap",
      "Nama barang wajib diisi.",
      "warning"
    );


    els.itemName.focus();


    return;

  }


  if (
    !Number.isFinite(
      quantity
    ) ||
    quantity < 0
  ) {

    showToast(
      "Jumlah Tidak Valid",
      "Jumlah barang harus berupa angka 0 atau lebih.",
      "warning"
    );


    els.itemQuantity.focus();


    return;

  }


  const now =
    new Date().toISOString();


  const editId =
    els.editId.value;


  if (editId) {

    const index =
      inventory.findIndex(
        (item) =>
          item.id ===
          editId
      );


    if (
      index ===
      -1
    ) {

      showToast(
        "Data Tidak Ditemukan",
        "Data yang akan diubah tidak ditemukan.",
        "warning"
      );

      return;

    }


    inventory[index] = {

      ...inventory[index],

      name,

      code,

      room,

      quantity,

      condition,

      description,

      updatedAt:
        now

    };


    showToast(
      "Data Diperbarui",
      "Data inventaris berhasil diperbarui."
    );

  }

  else {

    const newItem = {

      id:
        crypto.randomUUID
          ? crypto.randomUUID()
          : `item-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2)}`,

      name,

      code,

      room,

      quantity,

      condition,

      description,

      createdAt:
        now,

      updatedAt:
        now

    };


    inventory.unshift(
      newItem
    );


    showToast(
      "Data Disimpan",
      "Data inventaris berhasil ditambahkan."
    );

  }


  saveInventory();


  renderAll();


  resetFormToAdd();


  navigate(
    "inventory"
  );

}

/* =========================================================
   DELETE
========================================================= */

function askDelete(
  id
) {

  if (
    !requireFirebaseAdmin(
      "menghapus inventaris"
    )
  ) {

    return;

  }


  const item =
    inventory.find(
      (record) =>
        record.id ===
        id
    );


  if (!item) {

    showToast(
      "Data Tidak Ditemukan",
      "Data inventaris tidak ditemukan.",
      "warning"
    );

    return;

  }


  pendingDeleteId =
    id;


  const deleteName =
    document.getElementById(
      "deleteItemName"
    );


  if (deleteName) {

    deleteName.textContent =
      item.name;

  }


  if (els.confirmModal) {

    els.confirmModal.classList.add(
      "show"
    );


    els.confirmModal.setAttribute(
      "aria-hidden",
      "false"
    );

  }

}


/* =========================================================
   CLOSE DELETE MODAL
========================================================= */

function closeDeleteModal() {

  pendingDeleteId =
    null;


  if (!els.confirmModal) {

    return;

  }


  els.confirmModal.classList.remove(
    "show"
  );


  els.confirmModal.setAttribute(
    "aria-hidden",
    "true"
  );

}


/* =========================================================
   CONFIRM DELETE
========================================================= */

function confirmDeleteRecord() {

  if (
    !requireFirebaseAdmin(
      "menghapus inventaris"
    )
  ) {

    return;

  }


  if (!pendingDeleteId) {

    closeDeleteModal();

    return;

  }


  const index =
    inventory.findIndex(
      (item) =>
        item.id ===
        pendingDeleteId
    );


  if (
    index ===
    -1
  ) {

    closeDeleteModal();


    showToast(
      "Data Tidak Ditemukan",
      "Data inventaris tidak ditemukan.",
      "warning"
    );


    return;

  }


  inventory.splice(
    index,
    1
  );


  saveInventory();


  closeDeleteModal();


  renderAll();


  showToast(
    "Data Dihapus",
    "Data inventaris berhasil dihapus."
  );

}


/* =========================================================
   STATISTICS
========================================================= */

function renderStatistics() {

  const totals =
    getTotals();


  /*
   * Statistik kartu
   */

  const goodPercent =
    percentage(
      totals.good,
      totals.total
    );


  const minorPercent =
    percentage(
      totals.minor,
      totals.total
    );


  const majorPercent =
    percentage(
      totals.major,
      totals.total
    );


  /*
   * Total donut
   */

  if (
    els.chartTotal
  ) {

    els.chartTotal.textContent =
      formatNumber(
        totals.total
      );

  }


  /*
   * Legend
   */

  if (
    els.legendGood
  ) {

    els.legendGood.textContent =
      formatNumber(
        totals.good
      );

  }


  if (
    els.legendMinor
  ) {

    els.legendMinor.textContent =
      formatNumber(
        totals.minor
      );

  }


  if (
    els.legendMajor
  ) {

    els.legendMajor.textContent =
      formatNumber(
        totals.major
      );

  }


  /*
   * Render donut
   */

  renderDonutChart(
    totals
  );


  /*
   * Render distribusi ruangan
   */

  renderRoomStatistics();

}


/* =========================================================
   DONUT CHART
========================================================= */

function renderDonutChart(
  totals
) {

  if (
    !els.donutChart
  ) {

    return;

  }


  const total =
    Math.max(
      0,
      Number(
        totals?.total
      ) || 0
    );


  const good =
    Math.max(
      0,
      Number(
        totals?.good
      ) || 0
    );


  const minor =
    Math.max(
      0,
      Number(
        totals?.minor
      ) || 0
    );


  const major =
    Math.max(
      0,
      Number(
        totals?.major
      ) || 0
    );


  /*
   * Persentase kondisi
   */

  const goodPercent =
    total > 0
      ? (
          good /
          total
        ) * 100
      : 0;


  const minorPercent =
    total > 0
      ? (
          minor /
          total
        ) * 100
      : 0;


  const minorEnd =
    goodPercent +
    minorPercent;


  /*
   * Donut menggunakan
   * conic-gradient.
   *
   * Jangan mengganti innerHTML
   * donut karena CSS asli memakai
   * ::before untuk bagian tengah.
   */

  if (
    total > 0
  ) {

    els.donutChart.style.background =
      `conic-gradient(
        var(--green)
        0% ${goodPercent}%,

        var(--orange)
        ${goodPercent}% ${minorEnd}%,

        var(--red)
        ${minorEnd}% 100%
      )`;

  }

  else {

    els.donutChart.style.background =
      `
      conic-gradient(
        rgba(255,255,255,.05)
        0% 100%
      )
      `;

  }


  /*
   * Buat teks tengah donut
   * hanya jika belum tersedia.
   */

  let hole =
    els.donutChart.querySelector(
      ".donut-hole"
    );


  if (!hole) {

    hole =
      document.createElement(
        "div"
      );


    hole.className =
      "donut-hole";


    hole.innerHTML = `
      <strong id="chartTotal">
        0
      </strong>

      <span>
        TOTAL UNIT
      </span>
    `;


    els.donutChart.appendChild(
      hole
    );

  }


  /*
   * Update jumlah total
   */

  const totalEl =
    hole.querySelector(
      "#chartTotal"
    );


  if (
    totalEl
  ) {

    totalEl.textContent =
      formatNumber(
        total
      );


    /*
     * Sinkronkan referensi
     * chartTotal agar tidak
     * mengarah ke elemen lama.
     */

    els.chartTotal =
      totalEl;

  }

}


/* =========================================================
   ROOM DISTRIBUTION
========================================================= */

function renderRoomStatistics() {

  if (
    !els.roomStatistics
  ) {

    return;

  }


  const rooms = {};


  /*
   * Kelompokkan inventaris
   * berdasarkan ruangan.
   */

  inventory.forEach(
    (item) => {

      const room =
        String(
          item.room ||
          "Tidak diketahui"
        ).trim() ||
        "Tidak diketahui";


      const quantity =
        Math.max(
          0,
          Number(
            item.quantity
          ) || 0
        );


      if (
        !rooms[room]
      ) {

        rooms[room] = {

          total:
            0,

          good:
            0,

          minor:
            0,

          major:
            0

        };

      }


      rooms[room].total +=
        quantity;


      if (
        item.condition ===
        "Rusak Ringan"
      ) {

        rooms[room].minor +=
          quantity;

      }

      else if (
        item.condition ===
        "Rusak Berat"
      ) {

        rooms[room].major +=
          quantity;

      }

      else {

        rooms[room].good +=
          quantity;

      }

    }
  );


  /*
   * Urutkan dari jumlah unit
   * terbanyak.
   */

  const entries =
    Object.entries(
      rooms
    ).sort(
      (a, b) =>
        b[1].total -
        a[1].total
    );


  /*
   * Belum ada data
   */

  if (
    !entries.length
  ) {

    els.roomStatistics.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">

          <svg
            aria-hidden="true"
          >

            <use
              href="#icon-location"
            ></use>

          </svg>

        </div>


        <strong>
          Belum ada statistik
        </strong>


        <p>
          Tambahkan inventaris
          untuk melihat distribusi ruangan.
        </p>

      </div>

    `;


    return;

  }


  const grandTotal =
    Math.max(
      0,
      Number(
        getTotals().total
      ) || 0
    );


  /*
   * Render sesuai CSS asli:
   *
   * .room-row
   * .room-row span
   * .room-bar
   * .room-bar i
   * .room-row strong
   */

  els.roomStatistics.innerHTML =
    entries
      .map(
        ([room, data]) => {

          const percent =
            grandTotal > 0

              ? (
                  data.total /
                  grandTotal
                ) * 100

              : 0;


          const safePercent =
            Math.max(
              0,
              Math.min(
                100,
                percent
              )
            );


          const tooltip =
            `Baik: ${formatNumber(
              data.good
            )} | Rusak Ringan: ${formatNumber(
              data.minor
            )} | Rusak Berat: ${formatNumber(
              data.major
            )}`;


          return `

            <div
              class="room-row"
              title="${escapeHTML(
                tooltip
              )}"
            >

              <span
                title="${escapeHTML(
                  room
                )}"
              >

                ${escapeHTML(
                  room
                )}

              </span>


              <div
                class="room-bar"
                aria-label="${escapeHTML(
                  room
                )} ${safePercent.toFixed(
                  1
                )}%"
              >

                <i
                  style="
                    width:${safePercent}%;
                  "
                ></i>

              </div>


              <strong>

                ${formatNumber(
                  data.total
                )}

              </strong>

            </div>

          `;

        }
      )
      .join("");

}


/* =========================================================
   THEME
========================================================= */

function initTheme() {

  const saved =
    localStorage.getItem(
      THEME_KEY
    );


  const theme =
    saved ===
      "light"
      ? "light"
      : "dark";


  setTheme(
    theme
  );

}


function setTheme(
  theme
) {

  document.documentElement.dataset.theme =
    theme;


  localStorage.setItem(
    THEME_KEY,
    theme
  );


  if (
    els.themeIcon
  ) {

    els.themeIcon.innerHTML = `

      <use
        href="${
          theme ===
          "dark"
            ? "#icon-sun"
            : "#icon-moon"
        }"
      ></use>

    `;

  }

}


/* =========================================================
   EXPORT INVENTORY
========================================================= */

function exportInventory() {

  if (
    !requireFirebaseAdmin(
      "mengekspor data"
    )
  ) {

    return;

  }


  const payload = {

    app:
      "InventarisIT",

    version:
      APP_VERSION,

    exportedAt:
      new Date().toISOString(),

    data:
      inventory

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
    `inventarisIT-${new Date()
      .toISOString()
      .slice(
        0,
        10
      )}.json`;


  document.body.appendChild(
    anchor
  );


  anchor.click();


  anchor.remove();


  URL.revokeObjectURL(
    url
  );


  showToast(
    "Export Berhasil",
    "Data inventaris berhasil diekspor."
  );

}


/* =========================================================
   IMPORT INVENTORY
========================================================= */

function importInventoryFile(
  event
) {

  if (
    !requireFirebaseAdmin(
      "mengimpor data"
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
    () => {

      try {

        const parsed =
          JSON.parse(
            reader.result
          );


        const imported =
          Array.isArray(
            parsed
          )
            ? parsed
            : parsed?.data;


        if (
          !Array.isArray(
            imported
          )
        ) {

          throw new Error(
            "Format file tidak valid."
          );

        }


        const valid =
          imported.filter(
            isValidInventoryRecord
          );


        if (
          !valid.length &&
          imported.length
        ) {

          throw new Error(
            "Tidak ada data inventaris yang valid."
          );

        }


        inventory =
          valid;


        saveInventory();


        renderAll();


        showToast(
          "Import Berhasil",
          `${formatNumber(
            valid.length
          )} data inventaris berhasil diimpor.`
        );

      }

      catch (error) {

        console.error(
          error
        );


        showToast(
          "Import Gagal",
          error.message ||
          "File tidak dapat dibaca.",
          "warning"
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
   BACKUP
========================================================= */

function backupInventory() {

  if (
    !requireFirebaseAdmin(
      "membuat backup"
    )
  ) {

    return;

  }


  exportInventory();

}


/* =========================================================
   RESTORE
========================================================= */

function restoreInventoryFile(
  event
) {

  if (
    !requireFirebaseAdmin(
      "melakukan restore"
    )
  ) {

    event.target.value =
      "";

    return;

  }


  importInventoryFile(
    event
  );

}


/* =========================================================
   CLEAR DATA
========================================================= */

function clearAllInventory() {

  if (
    !requireFirebaseAdmin(
      "menghapus seluruh data"
    )
  ) {

    return;

  }


  if (
    !inventory.length
  ) {

    showToast(
      "Data Kosong",
      "Belum ada data inventaris untuk dihapus.",
      "warning"
    );

    return;

  }


  const confirmed =
    window.confirm(
      "Apakah Anda yakin ingin menghapus seluruh data inventaris?"
    );


  if (
    !confirmed
  ) {

    return;

  }


  inventory = [];


  saveInventory();


  renderAll();


  showToast(
    "Data Dihapus",
    "Seluruh data inventaris berhasil dihapus."
  );

}


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {

  renderDashboard();

  renderInventory();

  renderStatistics();

}

/* =========================================================
   PWA
========================================================= */

function registerPWA() {

  /*
   * Service Worker
   */

  if (
    "serviceWorker" in navigator &&
    location.protocol !== "file:"
  ) {

    window.addEventListener(
      "load",
      () => {

        navigator.serviceWorker
          .register(
            "service-worker.js"
          )
          .then(
            (registration) => {

              console.log(
                "Service Worker aktif:",
                registration.scope
              );

            }
          )
          .catch(
            (error) => {

              console.warn(
                "Service Worker:",
                error
              );

            }
          );

      },
      {
        once: true
      }
    );

  }


  /*
   * Install PWA
   */

  window.addEventListener(
    "beforeinstallprompt",
    (event) => {

      event.preventDefault();


      deferredInstallPrompt =
        event;


      if (
        els.installButton
      ) {

        els.installButton.classList.remove(
          "hidden"
        );

      }

    },
    {
      once: false
    }
  );


  /*
   * Setelah aplikasi terpasang
   */

  window.addEventListener(
    "appinstalled",
    () => {

      deferredInstallPrompt =
        null;


      if (
        els.installButton
      ) {

        els.installButton.classList.add(
          "hidden"
        );

      }


      showToast(
        "Aplikasi Terpasang",
        "InventarisIT berhasil dipasang."
      );

    }
  );

}


/* =========================================================
   NAVIGATION EVENTS
========================================================= */

function setupNavigation() {

  document.addEventListener(
    "click",
    (event) => {

      /*
       * Navigasi halaman
       */

      const pageButton =
        event.target.closest(
          "[data-page]"
        );


      if (
        pageButton
      ) {

        event.preventDefault();


        const targetPage =
          pageButton.dataset.page;


        /*
         * Halaman tambah harus
         * membutuhkan login Admin.
         */

        if (
          targetPage ===
          "add"
        ) {

          if (
            !requireFirebaseAdmin(
              "menambah inventaris"
            )
          ) {

            return;

          }


          resetFormToAdd();

        }


        navigate(
          targetPage
        );


        return;

      }


      /*
       * Tombol action pada kartu
       */

      const actionButton =
        event.target.closest(
          "[data-action]"
        );


      if (
        actionButton
      ) {

        event.preventDefault();


        const action =
          actionButton.dataset.action;


        const id =
          actionButton.dataset.id;


        if (
          action ===
          "edit"
        ) {

          editRecord(
            id
          );


          return;

        }


        if (
          action ===
          "delete"
        ) {

          askDelete(
            id
          );


          return;

        }

      }


      /*
       * Footer link yang belum diisi
       */

      const emptyLink =
        event.target.closest(
          "[data-empty-link]"
        );


      if (
        emptyLink
      ) {

        event.preventDefault();


        showToast(
          "Link Belum Diatur",
          "Isi link pada bagian FOOTER_LINKS di script.js.",
          "warning"
        );

      }

    }
  );

}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

  /*
   * Navigation
   */

  setupNavigation();


  /*
   * MOBILE MENU
   */

  els.mobileMenu?.addEventListener(
    "click",
    () => {

      els.sidebar?.classList.add(
        "open"
      );

    }
  );


  els.mobileClose?.addEventListener(
    "click",
    () => {

      els.sidebar?.classList.remove(
        "open"
      );

    }
  );


  /*
   * LOGIN ADMIN
   */

  document
    .getElementById(
      "loginButton"
    )
    ?.addEventListener(
      "click",
      openLoginModal
    );


  document
    .getElementById(
      "closeLoginButton"
    )
    ?.addEventListener(
      "click",
      closeLoginModal
    );


  document
    .getElementById(
      "loginModal"
    )
    ?.addEventListener(
      "click",
      (event) => {

        if (
          event.target.id ===
          "loginModal"
        ) {

          closeLoginModal();

        }

      }
    );


  /*
   * FORM LOGIN
   */

  document
    .getElementById(
      "loginForm"
    )
    ?.addEventListener(
      "submit",
      loginAdminEmail
    );


  /*
   * GOOGLE LOGIN
   */

  document
    .getElementById(
      "googleLoginButton"
    )
    ?.addEventListener(
      "click",
      loginAdminGoogle
    );


  /*
   * TOGGLE PASSWORD
   */

  document
    .getElementById(
      "toggleLoginPassword"
    )
    ?.addEventListener(
      "click",
      () => {

        const input =
          document.getElementById(
            "loginPassword"
          );


        if (!input) {

          return;

        }


        input.type =
          input.type ===
          "password"

            ? "text"

            : "password";

      }
    );


  /*
   * THEME
   */

  els.themeToggle?.addEventListener(
    "click",
    () => {

      const current =
        document.documentElement
          .dataset
          .theme;


      setTheme(
        current ===
        "dark"

          ? "light"

          : "dark"
      );

    }
  );


  /*
   * FORM INVENTORY
   */

  els.form?.addEventListener(
    "submit",
    handleFormSubmit
  );


  /*
   * CANCEL EDIT
   */

  els.cancelEdit?.addEventListener(
    "click",
    resetFormToAdd
  );


  /*
   * RESET FORM
   */

  els.resetForm?.addEventListener(
    "click",
    () => {

      setTimeout(
        () => {

          resetFormToAdd();

        },
        0
      );

    }
  );


  /*
   * SEARCH
   */

  els.searchInput?.addEventListener(
    "input",
    renderInventory
  );


  /*
   * FILTER RUANGAN
   */

  els.roomFilter?.addEventListener(
    "change",
    renderInventory
  );


  /*
   * FILTER KONDISI
   */

  els.conditionFilter?.addEventListener(
    "change",
    renderInventory
  );


  /*
   * RESET FILTER
   */

  els.resetFilters?.addEventListener(
    "click",
    () => {

      if (
        els.searchInput
      ) {

        els.searchInput.value =
          "";

      }


      if (
        els.roomFilter
      ) {

        els.roomFilter.value =
          "";

      }


      if (
        els.conditionFilter
      ) {

        els.conditionFilter.value =
          "";

      }


      renderInventory();

    }
  );


  /*
   * DELETE MODAL
   */

  els.cancelDelete?.addEventListener(
    "click",
    closeDeleteModal
  );


  els.confirmDelete?.addEventListener(
    "click",
    confirmDeleteRecord
  );


  els.confirmModal?.addEventListener(
    "click",
    (event) => {

      if (
        event.target ===
        els.confirmModal
      ) {

        closeDeleteModal();

      }

    }
  );


  /*
   * ESCAPE
   */

  document.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key ===
        "Escape"
      ) {

        closeDeleteModal();

        closeLoginModal();

        els.sidebar?.classList.remove(
          "open"
        );

      }

    }
  );


  /*
   * TOAST
   */

  els.toastClose?.addEventListener(
    "click",
    () => {

      els.toast?.classList.remove(
        "show"
      );

    }
  );


  /*
   * EXPORT
   */

  els.exportButton?.addEventListener(
    "click",
    exportInventory
  );


  /*
   * IMPORT
   */

  els.importButton?.addEventListener(
    "click",
    () => {

      els.importInput?.click();

    }
  );


  els.importInput?.addEventListener(
    "change",
    (event) => {

      const file =
        event.target.files?.[0];


      if (
        file
      ) {

        importInventoryFile(
          event
        );

      }

    }
  );


  /*
   * BACKUP
   */

  els.backupButton?.addEventListener(
    "click",
    backupInventory
  );


  /*
   * RESTORE
   */

  els.restoreButton?.addEventListener(
    "click",
    () => {

      els.restoreInput?.click();

    }
  );


  els.restoreInput?.addEventListener(
    "change",
    (event) => {

      const file =
        event.target.files?.[0];


      if (
        file
      ) {

        restoreInventoryFile(
          event
        );

      }

    }
  );


  /*
   * CLEAR DATA
   */

  els.clearDataButton?.addEventListener(
    "click",
    clearAllInventory
  );


  /*
   * INSTALL
   */

  els.installButton?.addEventListener(
    "click",
    async () => {

      if (
        !deferredInstallPrompt
      ) {

        showToast(
          "Install",
          "Opsi install belum tersedia pada browser ini.",
          "warning"
        );


        return;

      }


      try {

        deferredInstallPrompt.prompt();


        await deferredInstallPrompt
          .userChoice;


      }

      catch (
        error
      ) {

        console.warn(
          "Install PWA:",
          error
        );

      }


      deferredInstallPrompt =
        null;


      els.installButton?.classList.add(
        "hidden"
      );

    }
  );

}


/* =========================================================
   BOOT ANIMATION
========================================================= */

function runBootSequence() {

  const stages = [

    {
      progress:
        20,

      status:
        "Loading application core...",

      log:
        "CORE ONLINE"
    },


    {
      progress:
        45,

      status:
        "Connecting local storage...",

      log:
        "LOCAL STORAGE READY"
    },


    {
      progress:
        70,

      status:
        "Validating environment...",

      log:
        "SECURITY CHECK PASSED"
    },


    {
      progress:
        100,

      status:
        "Launching InventarisIT...",

      log:
        "PWA ENGINE READY"
    }

  ];


  stages.forEach(
    (
      stage,
      index
    ) => {

      setTimeout(
        () => {

          if (
            els.bootProgressBar
          ) {

            els.bootProgressBar.style.width =
              `${stage.progress}%`;

          }


          if (
            els.bootStatus
          ) {

            els.bootStatus.textContent =
              stage.status;

          }


          if (
            index ===
            0 &&
            els.log1
          ) {

            els.log1.textContent =
              stage.log;

          }


          if (
            index ===
            1 &&
            els.log2
          ) {

            els.log2.textContent =
              stage.log;

          }


          if (
            index ===
            2 &&
            els.log3
          ) {

            els.log3.textContent =
              stage.log;

          }


          if (
            index ===
            3 &&
            els.log4
          ) {

            els.log4.textContent =
              stage.log;

          }

        },

        index *
        420

      );

    }
  );


  /*
   * Satu timer untuk menutup splash.
   * Tidak boleh ada boot kedua.
   */

  setTimeout(
    () => {

      if (
        els.splash
      ) {

        els.splash.classList.add(
          "is-hidden"
        );

      }


      if (
        els.app
      ) {

        els.app.classList.remove(
          "is-hidden"
        );

      }


      navigate(
        "dashboard"
      );

    },

    2050

  );

}


/* =========================================================
   BOOT
========================================================= */

let applicationBooted =
  false;


function boot() {

  /*
   * Pengaman agar boot tidak pernah
   * dijalankan dua kali.
   */

  if (
    applicationBooted
  ) {

    return;

  }


  applicationBooted =
    true;


  /*
   * Theme
   */

  initTheme();


  /*
   * Data
   */

  loadInventory();


  /*
   * Events
   */

  setupEvents();


  /*
   * Firebase
   */

  setupFirebaseAuth();


  /*
   * Admin UI
   */

  updateAdminLoginUI();


  /*
   * Footer
   */

  renderPageFooters();


  /*
   * Logo
   */

  applyCustomLogo();


  /*
   * PWA
   */

  registerPWA();


  /*
   * Render awal
   */

  renderAll();


  /*
   * Splash screen
   */

  runBootSequence();

}


/* =========================================================
   DOM READY
   ========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    boot,
    {
      once: true
    }
  );

}

else {

  boot();

}
}
