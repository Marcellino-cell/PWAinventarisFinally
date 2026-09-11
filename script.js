/* =========================================================
   INVENTARISIT 2.2
   FUTURISTIC IT SYSTEM
========================================================= */


/* =========================================================
   LINK FOOTER
   CUKUP ISI BAGIAN INI
========================================================= */

const FOOTER_LINKS = {

  github:
    "ISI_LINK_GITHUB_KAMU",

  linkedin:
    "ISI_LINK_LINKEDIN_KAMU",

  gps:
    "ISI_LINK_GPS_KAMU",

  phone:
    "ISI_LINK_TELEPON_KAMU"

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

const LOGO_PATH = "icon/logo 1.jpeg";


/* =========================================================
   STATE
========================================================= */

let inventory = [];

let pendingDeleteId = null;

let deferredInstallPrompt = null;

let toastTimer = null;


/* =========================================================
   DOM HELPERS
========================================================= */

const $ = (id) =>
  document.getElementById(id);


const $$ = (selector) =>
  [...document.querySelectorAll(selector)];


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

function escapeHTML(value) {

  return String(
    value ?? ""
  ).replace(
    /[&<>'"]/g,
    (char) => {

      const map = {

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"

      };

      return map[char];

    }
  );

}


/* =========================================================
   FORMAT
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


function formatDate(
  value
) {

  const date =
    new Date(value);


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
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  ).format(date);

}


function getInitials(
  name
) {

  return String(
    name || "IT"
  )
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(
      (word) =>
        word[0]
    )
    .join("")
    .toUpperCase() || "IT";

}


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
            <img src="${LOGO_PATH}" alt="Logo InventarisIT" class="footer-logo-image">
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
            ${github ? "" : 'data-empty-link="true"'}
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
            ${linkedin ? "" : 'data-empty-link="true"'}
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
            ${gps ? "" : 'data-empty-link="true"'}
          >

            <svg>
              <use href="#icon-location"></use>
            </svg>

            GPS

          </a>


          <a
            href="${escapeHTML(phone || "#")}"
            class="footer-link phone"
            ${phone ? "" : 'data-empty-link="true"'}
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
   LOGO FILE: icons/logo 1.jpeg
========================================================= */

function applyCustomLogo() {

  const splashLogo = document.querySelector(".boot-logo");

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

  const brandBox = document.querySelector(".brand-box");

  if (brandBox) {
    brandBox.innerHTML = `
      <img
        src="${LOGO_PATH}"
        alt="Logo InventarisIT"
        class="sidebar-logo custom-logo"
      >
    `;
  }

  $$(".footer-logo").forEach((logo) => {
    logo.innerHTML = `
      <img
        src="${LOGO_PATH}"
        alt="Logo InventarisIT"
        class="footer-logo-image custom-logo"
      >
    `;
  });
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
        ? JSON.parse(raw)
        : [];


    inventory =
      Array.isArray(parsed)
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
      Number(item.quantity)
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
    type === "warning"
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
    !validPages.includes(page)
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
    page === "add"
      ? "DATA ENTRY"
      : page.toUpperCase();


  els.sidebar.classList.remove(
    "open"
  );


  window.scrollTo({

    top: 0,

    behavior: "smooth"

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

}


/* =========================================================
   TOTALS
========================================================= */

function getTotals() {

  return inventory.reduce(
    (result, item) => {

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
      total: 0,
      good: 0,
      minor: 0,
      major: 0
    }
  );

}


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


  const gp =
    percentage(
      totals.good,
      totals.total
    );


  const mp =
    percentage(
      totals.minor,
      totals.total
    );


  const rp =
    percentage(
      totals.major,
      totals.total
    );


  els.heroTotal.textContent =
    formatNumber(
      totals.total
    );


  els.totalItems.textContent =
    formatNumber(
      totals.total
    );


  els.goodItems.textContent =
    formatNumber(
      totals.good
    );


  els.minorItems.textContent =
    formatNumber(
      totals.minor
    );


  els.majorItems.textContent =
    formatNumber(
      totals.major
    );


  els.goodPercent.textContent =
    `${gp}% dari total unit`;


  els.minorPercent.textContent =
    `${mp}% dari total unit`;


  els.majorPercent.textContent =
    `${rp}% dari total unit`;


  els.goodProgress.style.width =
    `${gp}%`;


  els.minorProgress.style.width =
    `${mp}%`;


  els.majorProgress.style.width =
    `${rp}%`;


  els.goodProgressText.textContent =
    `${gp}%`;


  els.minorProgressText.textContent =
    `${mp}%`;


  els.majorProgressText.textContent =
    `${rp}%`;


  const recent =

    [...inventory]

      .sort(
        (a,b) =>
          new Date(
            b.updatedAt ||
            b.createdAt
          ) -
          new Date(
            a.updatedAt ||
            a.createdAt
          )
      )

      .slice(
        0,
        5
      );


  els.recentInventory.innerHTML =

    recent.length

      ? recent
          .map(
            (item) => `

              <div class="recent-row">

                <div class="item-avatar">

                  ${escapeHTML(
                    getInitials(
                      item.name
                    )
                  )}

                </div>


                <div class="recent-main">

                  <strong>
                    ${escapeHTML(
                      item.name
                    )}
                  </strong>

                  <small>

                    ${escapeHTML(
                      item.code
                    )}

                    •

                    ${escapeHTML(
                      item.room
                    )}

                    •

                    ${formatNumber(
                      item.quantity
                    )}
                    unit

                  </small>

                </div>


                <span
                  class="condition-pill ${getConditionClass(
                    item.condition
                  )}"
                >

                  ${escapeHTML(
                    item.condition
                  )}

                </span>

              </div>

            `
          )

          .join("")


      : `

          <div class="empty-state">

            <strong>
              Belum ada inventaris
            </strong>

            <span>
              Tambahkan data pertama.
            </span>

          </div>

        `;

}


/* =========================================================
   INVENTORY FILTER
========================================================= */

function getFilteredInventory() {

  const query =
    els.searchInput.value
      .trim()
      .toLowerCase();


  const room =
    els.roomFilter.value;


  const condition =
    els.conditionFilter.value;


  return inventory

    .filter(
      (item) => {

        const name =
          String(
            item.name || ""
          )
          .toLowerCase();


        const code =
          String(
            item.code || ""
          )
          .toLowerCase();


        const searchMatch =

          !query ||

          name.includes(
            query
          ) ||

          code.includes(
            query
          );


        const roomMatch =

          !room ||

          item.room ===
            room;


        const conditionMatch =

          !condition ||

          item.condition ===
            condition;


        return (

          searchMatch &&

          roomMatch &&

          conditionMatch

        );

      }
    )


    .sort(
      (a,b) =>

        new Date(
          b.updatedAt ||
          b.createdAt
        ) -

        new Date(
          a.updatedAt ||
          a.createdAt
        )

    );

}


/* =========================================================
   INVENTORY RENDER
========================================================= */

function renderInventory() {

  const data =
    getFilteredInventory();


  els.inventoryCount.textContent =
    `${data.length} DATA / ${inventory.length} TOTAL`;


  if (
    !data.length
  ) {

    els.inventoryGrid.innerHTML = `

      <div
        class="empty-state"
        style="grid-column:1/-1"
      >

        <strong>
          ${
            inventory.length
              ? "Data tidak ditemukan"
              : "Belum ada inventaris"
          }
        </strong>

        <span>
          ${
            inventory.length
              ? "Coba ubah pencarian atau filter."
              : "Tambahkan inventaris pertama."
          }
        </span>

      </div>

    `;


    return;

  }


  els.inventoryGrid.innerHTML =

    data.map(
      (item) => `

        <article
          class="inventory-card"
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
                    item.code
                  )}
                </small>

              </div>

            </div>


            <span
              class="condition-pill ${getConditionClass(
                item.condition
              )}"
            >

              ${escapeHTML(
                item.condition
              )}

            </span>

          </div>


          <div
            class="inventory-detail"
          >

            <div class="detail-cell">

              <span>
                RUANGAN
              </span>

              <strong>
                ${escapeHTML(
                  item.room
                )}
              </strong>

            </div>


            <div class="detail-cell">

              <span>
                JUMLAH
              </span>

              <strong>
                ${formatNumber(
                  item.quantity
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
                class="card-action"
                data-action="edit"
                data-id="${escapeHTML(
                  item.id
                )}"
                title="Edit"
              >

                <svg>
                  <use href="#icon-edit"></use>
                </svg>

              </button>


              <button
                class="card-action delete"
                data-action="delete"
                data-id="${escapeHTML(
                  item.id
                )}"
                title="Hapus"
              >

                <svg>
                  <use href="#icon-trash"></use>
                </svg>

              </button>

            </div>

          </div>

        </article>

      `
    ).join("");

}


/* =========================================================
   STATISTICS
========================================================= */

function renderStatistics() {

  const totals =
    getTotals();


  const gp =
    percentage(
      totals.good,
      totals.total
    );


  const mp =
    percentage(
      totals.minor,
      totals.total
    );


  const startMajor =
    gp + mp;


  els.chartTotal.textContent =
    formatNumber(
      totals.total
    );


  els.legendGood.textContent =
    formatNumber(
      totals.good
    );


  els.legendMinor.textContent =
    formatNumber(
      totals.minor
    );


  els.legendMajor.textContent =
    formatNumber(
      totals.major
    );


  els.donutChart.style.background = `

    conic-gradient(

      var(--green)
      0 ${gp}%,

      var(--orange)
      ${gp}% ${startMajor}%,

      var(--red)
      ${startMajor}% 100%

    )

  `;


  const rooms = {};


  inventory.forEach(
    (item) => {

      const room =
        item.room ||
        "Lainnya";


      rooms[room] =
        (
          rooms[room] ||
          0
        ) +
        Number(
          item.quantity ||
          0
        );

    }
  );


  const roomData =
    Object.entries(
      rooms
    ).sort(
      (a,b) =>
        b[1] -
        a[1]
    );


  const maximum =
    roomData[0]?.[1] || 1;


  els.roomStatistics.innerHTML =

    roomData.length

      ? roomData
          .map(
            ([room,count]) => `

              <div
                class="room-row"
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
                >

                  <i
                    style="
                      width:${Math.round(
                        count /
                        maximum *
                        100
                      )}%
                    "
                  ></i>

                </div>


                <strong>
                  ${formatNumber(
                    count
                  )}
                </strong>

              </div>

            `
          )
          .join("")


      : `

          <div class="empty-state">

            <strong>
              Belum ada data ruangan
            </strong>

            <span>
              Statistik akan muncul setelah data ditambahkan.
            </span>

          </div>

        `;

}


/* =========================================================
   FORM
========================================================= */

function resetFormToAdd() {

  els.form.reset();

  els.editId.value =
    "";

  els.formTitle.textContent =
    "Tambah Inventaris";

  els.submitText.textContent =
    "Simpan Data";

  els.cancelEdit.classList.add(
    "hidden"
  );


  const good =
    document.querySelector(
      'input[name="condition"][value="Baik"]'
    );


  if (good) {

    good.checked =
      true;

  }

}


function editRecord(
  id
) {

  const item =
    inventory.find(
      (row) =>
        row.id === id
    );


  if (!item) {
    return;
  }


  els.editId.value =
    item.id;


  els.itemName.value =
    item.name;


  els.itemCode.value =
    item.code;


  els.itemRoom.value =
    item.room;


  els.itemQuantity.value =
    item.quantity;


  const radio =
    document.querySelector(
      `input[name="condition"][value="${CSS.escape(
        item.condition
      )}"]`
    );


  if (radio) {

    radio.checked =
      true;

  }


  els.formTitle.textContent =
    "Edit Inventaris";


  els.submitText.textContent =
    "Simpan Perubahan";


  els.cancelEdit.classList.remove(
    "hidden"
  );


  navigate(
    "add"
  );

}

function getFormData() {

  const name =
    els.itemName.value.trim();


  const code =
    els.itemCode.value
      .trim()
      .toUpperCase();


  const room =
    els.itemRoom.value;


  const quantity =
    Number(
      els.itemQuantity.value
    );


  const condition =
    document.querySelector(
      'input[name="condition"]:checked'
    )?.value ||
    "Baik";


  if (

    !name ||
    !code ||
    !room ||

    !Number.isInteger(
      quantity
    ) ||

    quantity < 1

  ) {

    return null;

  }


  return {

    name,
    code,
    room,
    quantity,
    condition

  };

}


function handleFormSubmit(
  event
) {

  event.preventDefault();


  const data =
    getFormData();


  if (!data) {

    showToast(

      "Input Belum Lengkap",

      "Periksa semua field yang wajib diisi.",

      "warning"

    );


    return;

  }


  const editingId =
    els.editId.value;


  const duplicate =
    inventory.some(
      (row) =>

        row.id !==
          editingId &&

        row.code
          .toLowerCase() ===
          data.code
            .toLowerCase()

    );


  if (duplicate) {

    showToast(

      "Kode Duplikat",

      "Kode inventaris sudah digunakan.",

      "warning"

    );


    return;

  }


  if (editingId) {

    const index =
      inventory.findIndex(
        (row) =>
          row.id ===
          editingId
      );


    if (
      index === -1
    ) {

      return;

    }


    inventory[index] = {

      ...inventory[index],

      ...data,

      updatedAt:
        new Date().toISOString()

    };


    showToast(

      "Data Diperbarui",

      `${data.name} berhasil diperbarui.`

    );

  }

  else {

    const id =
      window.crypto?.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;


    inventory.push({

      id,

      ...data,

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString()

    });


    showToast(

      "Data Tersimpan",

      `${data.name} berhasil ditambahkan.`

    );

  }


  saveInventory();

  resetFormToAdd();

  renderAll();

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

  const item =
    inventory.find(
      (row) =>
        row.id === id
    );


  if (!item) {
    return;
  }


  pendingDeleteId =
    id;


  els.confirmModal.classList.add(
    "show"
  );

}


function closeDeleteModal() {

  pendingDeleteId =
    null;


  els.confirmModal.classList.remove(
    "show"
  );

}


function confirmDeleteRecord() {

  if (
    !pendingDeleteId
  ) {

    return;

  }


  const item =
    inventory.find(
      (row) =>
        row.id ===
        pendingDeleteId
    );


  inventory =
    inventory.filter(
      (row) =>
        row.id !==
        pendingDeleteId
    );


  saveInventory();

  closeDeleteModal();

  renderAll();


  showToast(

    "Data Dihapus",

    `${item?.name || "Data"} berhasil dihapus.`

  );

}


/* =========================================================
   DOWNLOAD JSON
========================================================= */

function downloadJSON(
  filename,
  data
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
    1000
  );

}


/* =========================================================
   EXPORT
========================================================= */

function exportInventory() {

  if (
    !inventory.length
  ) {

    showToast(

      "Tidak Ada Data",

      "Belum ada inventaris untuk diekspor.",

      "warning"

    );


    return;

  }


  downloadJSON(

    `inventarisIT-export-${new Date().toISOString().slice(0,10)}.json`,

    {

      type:
        "inventarisIT-inventory-export",

      version:
        APP_VERSION,

      exportedAt:
        new Date().toISOString(),

      inventory

    }

  );


  showToast(

    "Export Berhasil",

    "Data inventaris berhasil diunduh."

  );

}


/* =========================================================
   NORMALIZE IMPORT
========================================================= */

function normalizeImportedInventory(
  data
) {

  if (
    !Array.isArray(data)
  ) {

    throw new Error(
      "Format data inventaris tidak valid."
    );

  }


  const result =
    data.map(
      (item,index) => {

        const record = {

          id:

            typeof item.id ===
              "string"

              ? item.id

              : `${Date.now()}-${index}-${Math.random()}`,

          name:

            String(
              item.name || ""
            ).trim(),

          code:

            String(
              item.code || ""
            )
              .trim()
              .toUpperCase(),

          room:

            String(
              item.room ||
              "Lainnya"
            ).trim(),

          quantity:

            Number(
              item.quantity
            ),

          condition:

            [
              "Baik",
              "Rusak Ringan",
              "Rusak Berat"
            ].includes(
              item.condition
            )

              ? item.condition

              : "Baik",

          createdAt:

            item.createdAt ||
            new Date().toISOString(),

          updatedAt:

            item.updatedAt ||
            new Date().toISOString()

        };


        if (

          !record.name ||

          !record.code ||

          !Number.isInteger(
            record.quantity
          ) ||

          record.quantity < 1

        ) {

          throw new Error(
            `Data ke-${index + 1} tidak valid.`
          );

        }


        return record;

      }
    );


  const codes =
    new Set();


  result.forEach(
    (item) => {

      const code =
        item.code
          .toLowerCase();


      if (
        codes.has(code)
      ) {

        throw new Error(
          `Kode duplikat: ${item.code}`
        );

      }


      codes.add(
        code
      );

    }
  );


  return result;

}


async function handleImport(
  file
) {

  if (!file) {
    return;
  }


  try {

    const json =
      JSON.parse(
        await file.text()
      );


    const data =
      Array.isArray(json)
        ? json
        : json.inventory;


    const imported =
      normalizeImportedInventory(
        data
      );


    inventory =
      imported;


    saveInventory();

    renderAll();


    showToast(

      "Import Berhasil",

      `${imported.length} data berhasil diimport.`

    );

  }

  catch (error) {

    showToast(

      "Import Gagal",

      error.message ||
        "File JSON tidak valid.",

      "warning"

    );

  }

  finally {

    els.importInput.value =
      "";

  }

}


/* =========================================================
   BACKUP
========================================================= */

function backupLocalStorage() {

  const backup = {

    type:
      "inventarisIT-localStorage-backup",

    version:
      APP_VERSION,

    createdAt:
      new Date().toISOString(),

    localStorage: {

      [STORAGE_KEY]:
        localStorage.getItem(
          STORAGE_KEY
        ),

      [THEME_KEY]:
        localStorage.getItem(
          THEME_KEY
        )

    }

  };


  downloadJSON(

    `inventarisIT-backup-${Date.now()}.json`,

    backup

  );


  showToast(

    "Backup Berhasil",

    "Snapshot LocalStorage berhasil dibuat."

  );

}


/* =========================================================
   RESTORE
========================================================= */

async function handleRestore(
  file
) {

  if (!file) {
    return;
  }


  try {

    const json =
      JSON.parse(
        await file.text()
      );


    if (

      !json ||

      json.type !==
        "inventarisIT-localStorage-backup" ||

      !json.localStorage

    ) {

      throw new Error(
        "File backup InventarisIT tidak valid."
      );

    }


    const rawInventory =
      json.localStorage[
        STORAGE_KEY
      ];


    const restored =

      rawInventory

        ? normalizeImportedInventory(

            JSON.parse(
              rawInventory
            )

          )

        : [];


    inventory =
      restored;


    saveInventory();


    const restoredTheme =
      json.localStorage[
        THEME_KEY
      ];


    if (

      restoredTheme ===
        "dark" ||

      restoredTheme ===
        "light"

    ) {

      setTheme(
        restoredTheme
      );

    }


    renderAll();


    showToast(

      "Restore Berhasil",

      `${inventory.length} data berhasil dipulihkan.`

    );

  }

  catch (error) {

    showToast(

      "Restore Gagal",

      error.message ||
        "Backup tidak valid.",

      "warning"

    );

  }

  finally {

    els.restoreInput.value =
      "";

  }

}


/* =========================================================
   CLEAR ALL
========================================================= */

function clearAllData() {

  if (
    !inventory.length
  ) {

    showToast(

      "Tidak Ada Data",

      "Inventaris sudah kosong.",

      "warning"

    );


    return;

  }


  const approved =
    confirm(

      "Apakah Anda yakin ingin menghapus SEMUA data inventaris?"

    );


  if (!approved) {
    return;
  }


  inventory = [];


  saveInventory();

  renderAll();


  showToast(

    "Semua Data Dihapus",

    "Seluruh inventaris telah dihapus."

  );

}

/* =========================================================
   THEME
========================================================= */

function setTheme(
  theme
) {

  const selected =
    theme === "light"
      ? "light"
      : "dark";


  document.documentElement.dataset.theme =
    selected;


  localStorage.setItem(
    THEME_KEY,
    selected
  );


  if (
    selected === "dark"
  ) {

    els.themeIcon.innerHTML = `

      <use href="#icon-moon"></use>

    `;

  }

  else {

    els.themeIcon.innerHTML = `

      <use href="#icon-sun"></use>

    `;

  }


  els.themeToggle.title =

    selected === "dark"

      ? "Aktif: Dark Mode"

      : "Aktif: Light Mode";

}


function initTheme() {

  const saved =
    localStorage.getItem(
      THEME_KEY
    );


  const preferred =

    saved ||

    (

      window.matchMedia?.(
        "(prefers-color-scheme: light)"
      ).matches

        ? "light"

        : "dark"

    );


  setTheme(
    preferred
  );

}


/* =========================================================
   PWA
========================================================= */

function registerPWA() {

  if (

    "serviceWorker" in
      navigator &&

    location.protocol !==
      "file:"

  ) {

    window.addEventListener(
      "load",
      () => {

        navigator.serviceWorker
          .register(
            "service-worker.js"
          )
          .catch(
            (error) => {

              console.warn(
                "Service Worker:",
                error
              );

            }
          );

      }
    );

  }


  window.addEventListener(
    "beforeinstallprompt",
    (event) => {

      event.preventDefault();

      deferredInstallPrompt =
        event;

      els.installButton.classList.remove(
        "hidden"
      );

    }
  );


  window.addEventListener(
    "appinstalled",
    () => {

      deferredInstallPrompt =
        null;

      els.installButton.classList.add(
        "hidden"
      );


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

      const pageButton =
        event.target.closest(
          "[data-page]"
        );


      if (pageButton) {

        event.preventDefault();


        if (
          pageButton.dataset.page ===
            "add"
        ) {

          resetFormToAdd();

        }


        navigate(
          pageButton.dataset.page
        );


        return;

      }


      const actionButton =
        event.target.closest(
          "[data-action]"
        );


      if (actionButton) {

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

        }


        if (
          action ===
            "delete"
        ) {

          askDelete(
            id
          );

        }


        return;

      }


      const emptyLink =
        event.target.closest(
          "[data-empty-link]"
        );


      if (emptyLink) {

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

  setupNavigation();


  /* MOBILE */

  els.mobileMenu.addEventListener(
    "click",
    () => {

      els.sidebar.classList.add(
        "open"
      );

    }
  );


  els.mobileClose.addEventListener(
    "click",
    () => {

      els.sidebar.classList.remove(
        "open"
      );

    }
  );


  /* THEME */

  els.themeToggle.addEventListener(
    "click",
    () => {

      const current =
        document.documentElement.dataset.theme;


      setTheme(

        current === "dark"
          ? "light"
          : "dark"

      );

    }
  );


  /* FORM */

  els.form.addEventListener(
    "submit",
    handleFormSubmit
  );


  els.cancelEdit.addEventListener(
    "click",
    resetFormToAdd
  );


  els.resetForm.addEventListener(
    "click",
    () => {

      setTimeout(
        resetFormToAdd,
        0
      );

    }
  );


  /* SEARCH */

  els.searchInput.addEventListener(
    "input",
    renderInventory
  );


  /* FILTER */

  els.roomFilter.addEventListener(
    "change",
    renderInventory
  );


  els.conditionFilter.addEventListener(
    "change",
    renderInventory
  );


  els.resetFilters.addEventListener(
    "click",
    () => {

      els.searchInput.value =
        "";

      els.roomFilter.value =
        "";

      els.conditionFilter.value =
        "";

      renderInventory();

    }
  );


  /* DELETE */

  els.cancelDelete.addEventListener(
    "click",
    closeDeleteModal
  );


  els.confirmDelete.addEventListener(
    "click",
    confirmDeleteRecord
  );


  els.confirmModal.addEventListener(
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


  /* ESC */

  document.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key ===
          "Escape"
      ) {

        closeDeleteModal();

        els.sidebar.classList.remove(
          "open"
        );

      }

    }
  );


  /* TOAST */

  els.toastClose.addEventListener(
    "click",
    () => {

      els.toast.classList.remove(
        "show"
      );

    }
  );


  /* EXPORT */

  els.exportButton.addEventListener(
    "click",
    exportInventory
  );


  /* IMPORT */

  els.importButton.addEventListener(
    "click",
    () => {

      els.importInput.click();

    }
  );


  els.importInput.addEventListener(
    "change",
    (event) => {

      handleImport(
        event.target.files[0]
      );

    }
  );


  /* BACKUP */

  els.backupButton.addEventListener(
    "click",
    backupLocalStorage
  );


  /* RESTORE */

  els.restoreButton.addEventListener(
    "click",
    () => {

      els.restoreInput.click();

    }
  );


  els.restoreInput.addEventListener(
    "change",
    (event) => {

      handleRestore(
        event.target.files[0]
      );

    }
  );


  /* CLEAR */

  els.clearDataButton.addEventListener(
    "click",
    clearAllData
  );


  /* INSTALL */

  els.installButton.addEventListener(
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


      deferredInstallPrompt.prompt();


      await deferredInstallPrompt.userChoice;


      deferredInstallPrompt =
        null;


      els.installButton.classList.add(
        "hidden"
      );

    }
  );

}


/* =========================================================
   RENDER
========================================================= */

function renderAll() {

  renderDashboard();

  renderInventory();

  renderStatistics();

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
    (stage,index) => {

      setTimeout(
        () => {

          els.bootProgressBar.style.width =
            `${stage.progress}%`;


          els.bootStatus.textContent =
            stage.status;


          if (
            index === 0
          ) {

            els.log1.textContent =
              stage.log;

          }


          if (
            index === 1
          ) {

            els.log2.textContent =
              stage.log;

          }


          if (
            index === 2
          ) {

            els.log3.textContent =
              stage.log;

          }


          if (
            index === 3
          ) {

            els.log4.textContent =
              stage.log;

          }

        },
        index * 420
      );

    }
  );


  setTimeout(
    () => {

      els.splash.classList.add(
        "is-hidden"
      );


      els.app.classList.remove(
        "is-hidden"
      );


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

function boot() {

  initTheme();

  loadInventory();

  setupEvents();

  renderPageFooters();

  applyCustomLogo();

  registerPWA();

  renderAll();

  runBootSequence();

}


document.addEventListener(
  "DOMContentLoaded",
  boot
);

/* =========================================================
   FORM EVENTS
========================================================= */

els.form.addEventListener(
  "submit",
  handleFormSubmit
);


els.cancelEdit.addEventListener(
  "click",
  resetFormToAdd
);


els.resetForm.addEventListener(
  "click",
  () => {

    setTimeout(
      resetFormToAdd,
      0
    );

  }
);


/* =========================================================
   SEARCH
========================================================= */

els.searchInput.addEventListener(
  "input",
  renderInventory
);


/* =========================================================
   FILTER
========================================================= */

els.roomFilter.addEventListener(
  "change",
  renderInventory
);


els.conditionFilter.addEventListener(
  "change",
  renderInventory
);


els.resetFilters.addEventListener(
  "click",
  () => {

    els.searchInput.value =
      "";

    els.roomFilter.value =
      "";

    els.conditionFilter.value =
      "";

    renderInventory();

  }
);


/* =========================================================
   DELETE
========================================================= */

els.cancelDelete.addEventListener(
  "click",
  closeDeleteModal
);


els.confirmDelete.addEventListener(
  "click",
  confirmDeleteRecord
);


els.confirmModal.addEventListener(
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


/* =========================================================
   ESC
========================================================= */

document.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key ===
        "Escape"
    ) {

      closeDeleteModal();

      els.sidebar.classList.remove(
        "open"
      );

    }

  }
);


/* =========================================================
   TOAST
========================================================= */

els.toastClose.addEventListener(
  "click",
  () => {

    els.toast.classList.remove(
      "show"
    );

  }
);


/* =========================================================
   EXPORT
========================================================= */

els.exportButton.addEventListener(
  "click",
  exportInventory
);


/* =========================================================
   IMPORT
========================================================= */

els.importButton.addEventListener(
  "click",
  () => {

    els.importInput.click();

  }
);


els.importInput.addEventListener(
  "change",
  (event) => {

    handleImport(
      event.target.files[0]
    );

  }
);


/* =========================================================
   BACKUP
========================================================= */

els.backupButton.addEventListener(
  "click",
  backupLocalStorage
);


/* =========================================================
   RESTORE
========================================================= */

els.restoreButton.addEventListener(
  "click",
  () => {

    els.restoreInput.click();

  }
);


els.restoreInput.addEventListener(
  "change",
  (event) => {

    handleRestore(
      event.target.files[0]
    );

  }
);


/* =========================================================
   CLEAR
========================================================= */

els.clearDataButton.addEventListener(
  "click",
  clearAllData
);


/* =========================================================
   INSTALL
========================================================= */

els.installButton.addEventListener(
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


    deferredInstallPrompt.prompt();


    await deferredInstallPrompt.userChoice;


    deferredInstallPrompt =
      null;


    els.installButton.classList.add(
      "hidden"
    );

  }
);


/* =========================================================
   RENDER
========================================================= */

function renderAll() {

  renderDashboard();

  renderInventory();

  renderStatistics();

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
    (stage,index) => {

      setTimeout(
        () => {

          els.bootProgressBar.style.width =
            `${stage.progress}%`;


          els.bootStatus.textContent =
            stage.status;


          if (
            index === 0
          ) {

            els.log1.textContent =
              stage.log;

          }


          if (
            index === 1
          ) {

            els.log2.textContent =
              stage.log;

          }


          if (
            index === 2
          ) {

            els.log3.textContent =
              stage.log;

          }


          if (
            index === 3
          ) {

            els.log4.textContent =
              stage.log;

          }

        },
        index * 420
      );

    }
  );


  setTimeout(
    () => {

      els.splash.classList.add(
        "is-hidden"
      );


      els.app.classList.remove(
        "is-hidden"
      );


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

function boot() {

  initTheme();

  loadInventory();

  setupEvents();

  renderPageFooters();

  applyCustomLogo();

  registerPWA();

  renderAll();

  runBootSequence();

}


document.addEventListener(
  "DOMContentLoaded",
  boot
);
