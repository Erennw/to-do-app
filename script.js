// script.js
// Vanilla JS To-Do List
// - LocalStorage persistence
// - Filters: All / Active / Completed
// - Add via Enter key and inline validation
// - Optional dark mode

(() => {
  "use strict";

  /** Constants and references */
  const STORAGE_KEY = "todo-items";
  const THEME_KEY = "todo-theme";

  /** DOM elements */
  const taskInput = document.getElementById("taskInput");
  const addBtn = document.getElementById("addBtn");
  const taskList = document.getElementById("taskList");
  const emptyState = document.getElementById("emptyState");
  const helper = document.getElementById("helper");
  const filterButtons = Array.from(document.querySelectorAll('.chip[data-filter]'));
  const themeToggle = document.getElementById("themeToggle");

  /** App state */
  let tasks = [];
  let activeFilter = "all"; // all | active | completed

  /** LocalStorage helpers */
  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.error("Storage save error:", err);
    }
  }

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      tasks = raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error("Storage parse error:", err);
      tasks = [];
    }
  }

  /** Theme management (optional) */
  function applyThemeToDOM(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    if (themeToggle) themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
  }

  function setTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}
    applyThemeToDOM(theme);
  }

  function initTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = stored || (prefersDark ? "dark" : "light");
    applyThemeToDOM(theme);
  }

  /** UI render */
  function renderTasks() {
    taskList.innerHTML = "";

    const filtered = tasks.filter(t => {
      if (activeFilter === "active") return !t.completed;
      if (activeFilter === "completed") return t.completed;
      return true;
    });

    // Empty state
    emptyState.style.display = filtered.length === 0 ? "block" : "none";

    filtered.forEach(task => {
      const li = document.createElement("li");
      li.className = "item" + (task.completed ? " item--completed" : "");
      li.dataset.id = task.id;

      // Left: text + badge
      const left = document.createElement("div");
      left.className = "item__left";

      const p = document.createElement("p");
      p.className = "item__text";
      p.textContent = task.text;

      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = new Date(task.createdAt).toLocaleDateString();

      left.appendChild(p);
      left.appendChild(badge);

      // Right: action buttons
      const actions = document.createElement("div");
      actions.className = "item__actions";

      const completeBtn = document.createElement("button");
      completeBtn.className = "btn btn--success";
      completeBtn.type = "button";
      completeBtn.setAttribute("aria-label", "Mark as completed");
      completeBtn.title = "Mark as completed";
      completeBtn.textContent = "✅ Complete";

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn--danger";
      deleteBtn.type = "button";
      deleteBtn.setAttribute("aria-label", "Delete task");
      deleteBtn.title = "Delete task";
      deleteBtn.textContent = "🗑️ Delete";

      actions.appendChild(completeBtn);
      actions.appendChild(deleteBtn);

      li.appendChild(left);
      li.appendChild(actions);
      taskList.appendChild(li);
    });
  }

  /** Business logic */
  function createTask(text) {
    return {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2),
      text: text.trim(),
      completed: false,
      createdAt: Date.now(),
    };
  }

  function addTask() {
    const value = taskInput.value.trim();
    if (!value) {
      // Empty input feedback
      helper.textContent = "Please enter a task before adding.";
      taskInput.classList.add("is-invalid");
      setTimeout(() => taskInput.classList.remove("is-invalid"), 350);
      taskInput.focus();
      return;
    }
    helper.textContent = "";
    const task = createTask(value);
    tasks.unshift(task);
    saveAndRender();
    taskInput.value = "";
    taskInput.focus();
  }

  function toggleTask(id) {
    const idx = tasks.findIndex(t => t.id === id);
    if (idx > -1) {
      tasks[idx].completed = !tasks[idx].completed;
      saveAndRender();
    }
  }

  function deleteTask(id) {
    const idx = tasks.findIndex(t => t.id === id);
    if (idx > -1) {
      tasks.splice(idx, 1);
      saveAndRender();
    }
  }

  function applyFilter(next) {
    activeFilter = next;
    // Update visual state for filter chips
    filterButtons.forEach(btn => {
      const isActive = btn.dataset.filter === next;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });
    renderTasks();
  }

  function saveAndRender() {
    saveToStorage();
    renderTasks();
  }

  /** Event bindings */
  function bindEvents() {
    addBtn.addEventListener("click", addTask);

    // Add via Enter key
    taskInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") addTask();
    });

    // Event delegation for list actions
    taskList.addEventListener("click", (e) => {
      const target = e.target;
      const li = target.closest("li.item");
      if (!li) return;
      const id = li.dataset.id;

      if (target.matches(".btn--success")) {
        toggleTask(id);
      } else if (target.matches(".btn--danger")) {
        deleteTask(id);
      }
    });

    // Filters
    filterButtons.forEach(btn => {
      btn.addEventListener("click", () => applyFilter(btn.dataset.filter));
    });

    // Theme toggle
    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme") || "light";
        setTheme(current === "dark" ? "light" : "dark");
      });
    }
  }

  /** Initializer */
  function init() {
    initTheme();
    loadFromStorage();
    bindEvents();
    renderTasks();
  }

  // Boot
  document.addEventListener("DOMContentLoaded", init);
})();
