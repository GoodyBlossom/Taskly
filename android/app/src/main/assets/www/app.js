(function () {
  var storageKey = "task-flow.tasks.v2";
  var tasks = [];
  var filter = "all";

  var form = document.getElementById("taskForm");
  var input = document.getElementById("taskInput");
  var list = document.getElementById("taskList");
  var emptyState = document.getElementById("emptyState");
  var clearDone = document.getElementById("clearDone");
  var progressNumber = document.getElementById("progressNumber");
  var progressFill = document.getElementById("progressFill");
  var activeCount = document.getElementById("activeCount");
  var doneCount = document.getElementById("doneCount");
  var totalCount = document.getElementById("totalCount");
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));

  function loadTasks() {
    try {
      tasks = JSON.parse(localStorage.getItem(storageKey) || "[]");
    } catch (error) {
      tasks = [];
    }
  }

  function saveTasks() {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
  }

  function getVisibleTasks() {
    if (filter === "active") {
      return tasks.filter(function (task) {
        return !task.completed;
      });
    }

    if (filter === "completed") {
      return tasks.filter(function (task) {
        return task.completed;
      });
    }

    return tasks;
  }

  function updateStats() {
    var completed = tasks.filter(function (task) {
      return task.completed;
    }).length;
    var active = tasks.length - completed;
    var progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

    activeCount.textContent = String(active);
    doneCount.textContent = String(completed);
    totalCount.textContent = String(tasks.length);
    progressNumber.textContent = progress + "%";
    progressFill.style.width = progress + "%";
    clearDone.hidden = completed === 0;
  }

  function renderTasks() {
    var visibleTasks = getVisibleTasks();
    list.innerHTML = "";

    emptyState.hidden = visibleTasks.length > 0;
    emptyState.querySelector("h2").textContent = tasks.length ? "Nothing here" : "Fresh slate";
    emptyState.querySelector("p").textContent = tasks.length
      ? "Switch filters or add a new task."
      : "Add one focused task to begin.";

    visibleTasks.forEach(function (task) {
      var item = document.createElement("li");
      item.className = "task-card" + (task.completed ? " done" : "");

      var check = document.createElement("button");
      check.className = "check";
      check.type = "button";
      check.textContent = task.completed ? "OK" : "";
      check.setAttribute("aria-label", task.completed ? "Mark task active" : "Mark task complete");
      check.addEventListener("click", function () {
        toggleTask(task.id);
      });

      var body = document.createElement("button");
      body.className = "task-body";
      body.type = "button";
      body.addEventListener("click", function () {
        toggleTask(task.id);
      });

      var title = document.createElement("p");
      title.className = "task-title";
      title.textContent = task.title;

      var meta = document.createElement("p");
      meta.className = "task-meta";
      meta.textContent = task.completed ? "Completed" : "Active";

      body.appendChild(title);
      body.appendChild(meta);

      var remove = document.createElement("button");
      remove.className = "delete";
      remove.type = "button";
      remove.textContent = "Delete";
      remove.addEventListener("click", function () {
        deleteTask(task.id);
      });

      item.appendChild(check);
      item.appendChild(body);
      item.appendChild(remove);
      list.appendChild(item);
    });

    updateStats();
  }

  function addTask(title) {
    tasks.unshift({
      id: String(Date.now()) + "-" + Math.random().toString(16).slice(2),
      title: title,
      completed: false,
      createdAt: Date.now()
    });
    saveTasks();
    renderTasks();
  }

  function toggleTask(id) {
    tasks = tasks.map(function (task) {
      if (task.id !== id) {
        return task;
      }

      return {
        id: task.id,
        title: task.title,
        completed: !task.completed,
        createdAt: task.createdAt
      };
    });
    saveTasks();
    renderTasks();
  }

  function deleteTask(id) {
    tasks = tasks.filter(function (task) {
      return task.id !== id;
    });
    saveTasks();
    renderTasks();
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var title = input.value.trim();

    if (!title) {
      return;
    }

    addTask(title);
    input.value = "";
    input.focus();
  });

  clearDone.addEventListener("click", function () {
    tasks = tasks.filter(function (task) {
      return !task.completed;
    });
    saveTasks();
    renderTasks();
  });

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      filter = button.dataset.filter || "all";
      filterButtons.forEach(function (item) {
        item.classList.toggle("active", item === button);
      });
      renderTasks();
    });
  });

  loadTasks();
  renderTasks();
})();
