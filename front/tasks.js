import { getBearerTokenHeader } from "./user-localStorage.js";

const url = "https://to-do-coders.herokuapp.com/api/tasks";

const inputTask1 = document.getElementById("input-task1");
document.getElementById("btn-add-task1").addEventListener("click", addTask);

const inputTask2 = document.getElementById("input-task2");
document.getElementById("btn-add-task2").addEventListener("click", addTask);

const inputTask3 = document.getElementById("input-task3");
document.getElementById("btn-add-task3").addEventListener("click", addTask);

const list1New = document.getElementById("list1");
const list2InP = document.getElementById("list2");
const list3Done = document.getElementById("list3");

let allTasks = [];

async function loadTasks() {
  allTasks = await getTasks();

  let newTasks = allTasks.filter(task => task.state === "new");
  let inProgTasks = allTasks.filter(task => task.state === "in-progress");
  let doneTasks = allTasks.filter(task => task.state === "done");
  drawTasks(newTasks, list1New);
  drawTasks(inProgTasks, list2InP);
  drawTasks(doneTasks, list3Done);
}

async function addTask(e) {
  if (inputTask1.validity.valid) {
    e.preventDefault();
    var newTask = {
      content: inputTask1.value,
      state: "new"
    };

    var response = await sendTaskToApi(newTask);
    if (response.ok) {
      allTasks = await getTasks();

      let newTasks = allTasks.filter(task => task.state === "new");

      drawTasks(newTasks, list1New);

      inputTask1.value = "";
    } else {
      alert("Nie można było dodać taska");
    }
  }
  if (inputTask2.validity.valid) {
    e.preventDefault();
    var inProgTask = {
      content: inputTask2.value,
      state: "in-progress"
    };

    var response = await sendTaskToApi(inProgTask);
    if (response.ok) {
      allTasks = await getTasks();

      let inProgTasks = allTasks.filter(task => task.state === "in-progress");

      drawTasks(inProgTasks, list2InP);

      inputTask2.value = "";
    } else {
      alert("Nie można było dodać taska");
    }
  }
  if (inputTask3.validity.valid) {
    e.preventDefault();
    var doneTask = {
      content: inputTask3.value,
      state: "done"
    };

    var response = await sendTaskToApi(doneTask);
    if (response.ok) {
      allTasks = await getTasks();

      let doneTasks = allTasks.filter(task => task.state === "done");

      drawTasks(doneTasks, list3Done);

      inputTask3.value = "";
    } else {
      alert("Nie można było dodać taska");
    }
  }
}

async function sendTaskToApi(task) {
  const response = await fetch(url, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      Authorization: getBearerTokenHeader()
    },
    redirect: "follow",
    referrer: "no-referrer",
    body: JSON.stringify(task)
  });

  return response;
}

async function getTasks() {
  const response = await fetch(url, {
    method: "GET",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      Authorization: getBearerTokenHeader()
    },
    redirect: "follow",
    referrer: "no-referrer"
  });

  return response.json();
}

function drawTasks(tasks, ul) {
  var taskListItems = ul.getElementsByClassName("task");
  [...taskListItems].forEach(li => {
    ul.removeChild(li);
  });

  tasks.forEach(task => {
    let li = document.createElement("li");
    li.className = "list-group-item task";

    let deleteSpan = document.createElement("span");
    deleteSpan.setAttribute("class", "badge badge-danger");
    deleteSpan.innerText = "DELETE";
    deleteSpan.addEventListener("click", deleteTask);

    let inProgressSpan = document.createElement("span");
    inProgressSpan.setAttribute("class", "badge badge-warning");
    inProgressSpan.innerText = "IN-PROGRESS";
    inProgressSpan.addEventListener("click", moveToInProgressTask);

    let doneSpan = document.createElement("span");
    doneSpan.setAttribute("class", "badge badge-success");
    doneSpan.innerText = "DONE";
    doneSpan.addEventListener("click", moveToDoneTask);

    li.innerHTML = `${task.content} </br>`;
    li.appendChild(deleteSpan);
    li.appendChild(doneSpan);
    li.appendChild(inProgressSpan);
    li.setAttribute("id", task._id);
    ul.appendChild(li);
  });
}

async function deleteTask(e) {
  let taskId = e.target.parentElement.getAttribute("id");

  const response = fetch(
    `https://to-do-coders.herokuapp.com/api/tasks/${taskId}`,
    {
      method: "DELETE",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Authorization: getBearerTokenHeader()
      },
      redirect: "follow",
      referrer: "no-referrer"
    }
  );
  document.getElementById(taskId).remove();
  return response;
}

async function updateTask(id, task) {
  const response = fetch(`https://to-do-coders.herokuapp.com/api/tasks/${id}`, {
    method: "PUT",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      Authorization: getBearerTokenHeader()
    },
    redirect: "follow",
    referrer: "no-referrer",
    body: JSON.stringify(task)
  });
  return response;
}

function moveToInProgressTask(e) {
  let taskId = e.target.parentElement.getAttribute("id");
  updateTaskState(taskId, "in-progress");
}

function moveToDoneTask(e) {
  let taskId = e.target.parentElement.getAttribute("id");
  updateTaskState(taskId, "done");
}

async function updateTaskState(id, newState) {
  let updatedTask = allTasks.find(t => t._id == id);
  if (updatedTask) {
    var data = {
      content: updatedTask.content,
      state: newState
    };
    await updateTask(updatedTask._id, data);
    await loadTasks();
  }
}

export { loadTasks };
