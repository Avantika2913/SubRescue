const STORAGE_KEY = "subrescue.commitments.v1";
const NOTICE_KEY = "subrescue.notified.v1";
const formDialog = document.querySelector("#commitment-dialog");
const commitmentForm = document.querySelector("#commitment-form");
const listElement = document.querySelector("#commitment-list");
const emptyState = document.querySelector("#empty-state");
const searchInput = document.querySelector("#search-input");
const toastElement = document.querySelector("#toast");
let commitments = loadCommitments();
let toastTimer;

function loadCommitments() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved.filter(isValidCommitment) : [];
  } catch {
    return [];
  }
}

function isValidCommitment(item) {
  return item && typeof item.id === "string" && typeof item.name === "string" &&
    Number.isFinite(Number(item.amount)) && typeof item.nextDate === "string" &&
    !Number.isNaN(parseDate(item.nextDate).getTime());
}

function saveCommitments() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(commitments));
}

function parseDate(value) {
  return new Date(`${value}T12:00:00`);
}

function dayDifference(dateValue) {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return Math.round((parseDate(dateValue) - today) / 86400000);
}

function formatMoney(amount, currency) {
  try {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Number(amount));
  } catch {
    return `${currency} ${Number(amount).toFixed(2)}`;
  }
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(parseDate(value));
}

function dateLabel(days) {
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function safeManageUrl(value) {
  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "";
  } catch {
    return "";
  }
}

function renderCommitments() {
  const active = commitments.filter((item) => !item.archived);
  const searchTerm = searchInput.value.trim().toLocaleLowerCase();
  const visible = active
    .filter((item) => `${item.name} ${item.provider || ""}`.toLocaleLowerCase().includes(searchTerm))
    .sort((first, second) => parseDate(first.nextDate) - parseDate(second.nextDate));
  const next30Days = active.filter((item) => {
    const days = dayDifference(item.nextDate);
    return days >= 0 && days <= 30;
  });

  const totalsByCurrency = next30Days.reduce((totals, item) => {
    const currency = item.currency || "INR";
    totals.set(currency, (totals.get(currency) || 0) + Number(item.amount));
    return totals;
  }, new Map());
  document.querySelector("#total-due").textContent = totalsByCurrency.size
    ? [...totalsByCurrency].map(([currency, amount]) => formatMoney(amount, currency)).join(" + ")
    : formatMoney(0, "INR");
  document.querySelector("#upcoming-count").textContent = active.length;
  document.querySelector("#today-label").textContent = new Intl.DateTimeFormat("en-IN", {
    weekday: "long", day: "numeric", month: "long",
  }).format(new Date());

  listElement.innerHTML = visible.map(renderRow).join("");
  listElement.hidden = visible.length === 0;
  emptyState.hidden = active.length > 0;
  document.querySelector("#no-results").hidden = active.length === 0 || visible.length > 0;
  bindRowActions();
}

function renderRow(item) {
  const days = dayDifference(item.nextDate);
  const safeLink = item.manageUrl ? safeManageUrl(item.manageUrl) : "";
  const recurrenceLabels = { weekly: "Weekly", monthly: "Monthly", quarterly: "Every 3 months", yearly: "Yearly" };
  const reminderLabel = item.reminderDays === 5 ? "5-day reminder" : `${item.reminderDays}-day reminder`;
  return `<article class="commitment-row ${days < 0 ? "is-overdue" : ""}">
    <div class="date-tile"><span>${escapeHtml(formatDate(item.nextDate).split(" ")[0])}</span><small>${escapeHtml(formatDate(item.nextDate).split(" ")[1])}</small></div>
    <div class="commitment-info"><div class="commitment-title-line"><h3>${escapeHtml(item.name)}</h3><span class="date-status">${escapeHtml(dateLabel(days))}</span></div>
      <p>${escapeHtml(item.provider || "Recurring commitment")} <span class="meta-dot">·</span> ${escapeHtml(recurrenceLabels[item.cadence] || "Recurring")} <span class="meta-dot">·</span> ${escapeHtml(reminderLabel)}</p>
      ${safeLink ? `<a class="manage-link" href="${escapeHtml(safeLink)}" target="_blank" rel="noopener noreferrer">Manage with provider <span aria-hidden="true">↗</span></a>` : ""}
    </div>
    <div class="commitment-end"><strong>${escapeHtml(formatMoney(item.amount, item.currency || "INR"))}</strong>
      <div class="row-actions"><button class="row-action" type="button" data-edit="${escapeHtml(item.id)}">Edit</button><button class="row-action row-archive" type="button" data-archive="${escapeHtml(item.id)}">Archive</button></div>
    </div>
  </article>`;
}

function bindRowActions() {
  listElement.querySelectorAll("[data-edit]").forEach((button) => button.addEventListener("click", () => openForm(button.dataset.edit)));
  listElement.querySelectorAll("[data-archive]").forEach((button) => button.addEventListener("click", () => archiveCommitment(button.dataset.archive)));
}

function openForm(id = "") {
  commitmentForm.reset();
  document.querySelector("#entry-id").value = id;
  document.querySelector("#dialog-title").textContent = id ? "Edit commitment" : "Add a commitment";
  commitmentForm.querySelector('[type="submit"]').textContent = id ? "Save changes" : "Save commitment";
  document.querySelector("#entry-date").min = new Date().toLocaleDateString("en-CA");
  document.querySelector("#entry-currency").value = "INR";
  document.querySelector("#entry-reminder").value = "5";

  const existing = commitments.find((item) => item.id === id);
  if (existing) {
    document.querySelector("#entry-name").value = existing.name;
    document.querySelector("#entry-provider").value = existing.provider || "";
    document.querySelector("#entry-amount").value = existing.amount;
    document.querySelector("#entry-currency").value = existing.currency || "INR";
    document.querySelector("#entry-date").value = existing.nextDate;
    document.querySelector("#entry-cadence").value = existing.cadence || "monthly";
    document.querySelector("#entry-reminder").value = String(existing.reminderDays || 5);
    document.querySelector("#entry-link").value = existing.manageUrl || "";
  }
  document.documentElement.classList.add("dialog-open");
  formDialog.showModal();
  document.querySelector("#entry-name").focus();
}

function closeForm() {
  if (formDialog.open) formDialog.close();
}

function archiveCommitment(id) {
  const item = commitments.find((entry) => entry.id === id);
  if (!item) return;
  item.archived = true;
  saveCommitments();
  renderCommitments();
  showToast(`${item.name} archived`);
}

function showToast(message) {
  toastElement.textContent = message;
  toastElement.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastElement.classList.remove("is-visible"), 2600);
}

function checkReminders() {
  const active = commitments.filter((item) => !item.archived);
  const due = active.filter((item) => {
    const days = dayDifference(item.nextDate);
    return days >= 0 && days <= Number(item.reminderDays || 5);
  });
  if (!due.length) return;
  const notice = document.querySelector("#reminder-notice");
  notice.classList.add("has-upcoming-alert");
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  let notified = [];
  try { notified = JSON.parse(localStorage.getItem(NOTICE_KEY) || "[]"); } catch { notified = []; }
  for (const item of due) {
    const noticeId = `${item.id}:${item.nextDate}`;
    if (notified.includes(noticeId)) continue;
    new Notification(`Coming up: ${item.name}`, {
      body: `${formatMoney(item.amount, item.currency || "INR")} on ${formatDate(item.nextDate)} (${dateLabel(dayDifference(item.nextDate))}).`,
      tag: noticeId,
    });
    notified.push(noticeId);
  }
  localStorage.setItem(NOTICE_KEY, JSON.stringify(notified.slice(-100)));
}

commitmentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!commitmentForm.reportValidity()) return;
  const id = document.querySelector("#entry-id").value;
  const existing = commitments.find((item) => item.id === id);
  const entry = {
    id: id || crypto.randomUUID(),
    name: document.querySelector("#entry-name").value.trim(),
    provider: document.querySelector("#entry-provider").value.trim(),
    amount: Number(document.querySelector("#entry-amount").value),
    currency: document.querySelector("#entry-currency").value,
    nextDate: document.querySelector("#entry-date").value,
    cadence: document.querySelector("#entry-cadence").value,
    reminderDays: Number(document.querySelector("#entry-reminder").value),
    manageUrl: document.querySelector("#entry-link").value.trim(),
    archived: false,
  };
  if (existing) Object.assign(existing, entry);
  else commitments.push(entry);
  saveCommitments();
  closeForm();
  renderCommitments();
  checkReminders();
  showToast(existing ? "Changes saved" : "Commitment added");
});

document.querySelectorAll("[data-open-form]").forEach((button) => button.addEventListener("click", () => openForm()));
document.querySelectorAll("[data-close-form]").forEach((button) => button.addEventListener("click", closeForm));
formDialog.addEventListener("close", () => document.documentElement.classList.remove("dialog-open"));
formDialog.addEventListener("click", (event) => { if (event.target === formDialog) closeForm(); });
searchInput.addEventListener("input", renderCommitments);
document.querySelector("#enable-alerts").addEventListener("click", async () => {
  if (!("Notification" in window)) {
    showToast("Browser alerts are not available here");
    return;
  }
  const permission = await Notification.requestPermission();
  showToast(permission === "granted" ? "Browser alerts enabled" : "Browser alert permission not granted");
  checkReminders();
});
document.querySelector("#load-example").addEventListener("click", () => {
  const soon = new Date();
  soon.setDate(soon.getDate() + 8);
  const later = new Date();
  later.setDate(later.getDate() + 21);
  const toDateInput = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  commitments.push(
    { id: crypto.randomUUID(), name: "Yoga Bar pantry order", provider: "Amazon", amount: 3000, currency: "INR", nextDate: toDateInput(soon), cadence: "monthly", reminderDays: 5, manageUrl: "", archived: false },
    { id: crypto.randomUUID(), name: "Music subscription", provider: "Spotify", amount: 119, currency: "INR", nextDate: toDateInput(later), cadence: "monthly", reminderDays: 5, manageUrl: "", archived: false },
  );
  saveCommitments();
  renderCommitments();
  showToast("Example entries added; edit or archive them anytime");
});

renderCommitments();
checkReminders();
window.setInterval(checkReminders, 60_000);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") checkReminders();
});