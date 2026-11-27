const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", () => {

  const user =
    document.getElementById("username");

  const savedName =
    localStorage.getItem("username");

  console.log(savedName);

  if(user){
user.innerText =
      savedName && savedName !== "undefined"
      ? savedName
      : "User";
  }
});

if (!token) {
  window.location.href = "login.html";
}

let lineChart;
let pieChart;
let barChart;
let radarChart;
let dayChart;
let selectedDays = 30;

// LOAD SAVED THEME
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}


// Line CHARTS (Animated + Tooltips)
async function renderLineChart() {

  const allLogs = await loadLogs();

const logs = filterLogsByDays(allLogs, selectedDays);

  const labels = logs.map(l => formatDate(l.date));
  const productivity = logs.map(l => l.productivity || 0);

  const ctx = document.getElementById("lineChart").getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, 0, 300);

  gradient.addColorStop(0, "rgba(99,102,241,0.35)");
  gradient.addColorStop(1, "rgba(99,102,241,0.02)");

  if (lineChart) {
  lineChart.destroy();
}

lineChart = new Chart(ctx, {
    type: "line",

    data: {
      labels,

      datasets: [{
        label: "Productivity",

        data: productivity,

        borderColor: "#6366f1",
        backgroundColor: gradient,

        fill: true,

        tension: 0.4,
        borderWidth: 3,

        pointRadius: 5,
        pointHoverRadius: 7,

        pointBackgroundColor: "#6366f1"
      }]
    },

    options: chartOptions()
  });
}

async function renderRadarChart() {

  const allLogs = await loadLogs();

const logs = filterLogsByDays(allLogs, selectedDays);

  if (!logs.length) return;

  const avg = logs.reduce((acc, log) => {

    acc.tasks += log.tasksCompleted || 0;
    acc.focus += log.focusHours || 0;
    acc.score += log.productivity || 0;
    acc.hours += log.hoursWorked || 0;
    acc.count++;

    return acc;

  }, {
    tasks: 0,
    focus: 0,
    score: 0,
    hours: 0,
    count: 0
  });
if (radarChart) {
  radarChart.destroy();
}

radarChart = new Chart(document.getElementById("radarChart"), {

    type: "radar",

    data: {
      labels: ["Tasks", "Focus", "Score", "Hours"],

      datasets: [{
        label: "Performance",

        data: [
          avg.tasks / avg.count,
          avg.focus / avg.count,
          avg.score / avg.count,
          avg.hours / avg.count
        ],

        borderColor: "#6366f1",

        backgroundColor: "rgba(99,102,241,0.25)",

        pointBackgroundColor: "#6366f1",

        borderWidth: 3
      }]
    },

    options: {
      responsive:true,
  maintainAspectRatio:false,
  resizeDelay:0,

      plugins: {
        legend: {
          labels: {
            font: {
              size: 14,
              weight: "600"
            }
          }
        }
      },

      scales: {
        r: {
          angleLines: {
            color: "rgba(156,163,175,0.2)"
          },

          grid: {
            color: "rgba(156,163,175,0.2)"
          },

          pointLabels: {
            font: {
              size: 14,
              weight: "600"
            }
          },

          ticks: {
            backdropColor: "transparent"
          }
        }
      }
    }
  });
}

// Pie CHARTS
async function renderPieChart() {

  const allLogs = await loadLogs();

const logs = filterLogsByDays(allLogs, selectedDays);

  const categoryMap = {};

  logs.forEach(log => {
    categoryMap[log.category] =
      (categoryMap[log.category] || 0) + log.hoursWorked;
  });

  const labels = Object.keys(categoryMap);
  const data = Object.values(categoryMap);

if (pieChart) {
  pieChart.destroy();
}

pieChart = new Chart(document.getElementById("pieChart"), {

    type: "doughnut",

    data: {
      labels,

      datasets: [{
        data,

        borderWidth: 0,

        hoverOffset: 15,

        backgroundColor: [
          "#6366f1",
          "#10b981",
          "#f59e0b",
          "#ef4444",
          "#8b5cf6"
        ]
      }]
    },

    options: {
      responsive:true,
  maintainAspectRatio:false,
  resizeDelay:0,

      cutout: "60%",

      plugins: {
        legend: {
          position: "top",
          labels: {
            padding: 20,
            font: {
              size: 13,
              weight: "600"
            }
          }
        }
      }
    }
  });
}


// MODAL
function openModal() {
  document.getElementById("modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}


function showPage(pageId) {
  // hide all pages
  document.querySelectorAll(".page").forEach(p => p.style.display = "none");

  // show selected
  document.getElementById(pageId).style.display = "block";

  // update active sidebar
  document.querySelectorAll(".sidebar a").forEach(a => a.classList.remove("active"));
  event.target.classList.add("active");
}

function logout() {

  localStorage.removeItem("token");

  window.location.href = "login.html";
}

async function renderBarChart() {

  const allLogs = await loadLogs();

const logs = filterLogsByDays(allLogs, selectedDays);

  const { labels, tasks, hours } = processData(logs);
if (barChart) {
  barChart.destroy();
}

barChart = new Chart(document.getElementById("barChart"), {

    type: "bar",

    data: {
      labels,

      datasets: [
        {
          label: "Tasks",
          data: tasks,
          backgroundColor: "#6366f1",
          borderRadius: 10,
          borderSkipped: false
        },

        {
          label: "Hours",
          data: hours,
          backgroundColor: "#10b981",
          borderRadius: 10,
          borderSkipped: false
        }
      ]
    },

    options: chartOptions()
  });
}

async function saveData() {

  const date = document.getElementById("date").value;
  const hoursWorked = document.getElementById("hoursWorked").value;
  const tasksCompleted = document.getElementById("tasksCompleted").value;

  // ❌ VALIDATION
  if (!date || !hoursWorked || !tasksCompleted) {
    alert("❌ Please fill all required fields!");
    return;
  }

  const data = {
    date: document.getElementById("date").value,
    category: document.getElementById("category").value,
    hoursWorked: Number(document.getElementById("hoursWorked").value),
    tasksCompleted: Number(document.getElementById("tasksCompleted").value),
    tasksPlanned: Number(document.getElementById("tasksPlanned").value),
    focusHours: Number(document.getElementById("focusHours").value),
    meetingHours: Number(document.getElementById("meetingHours").value),

    energy: selectedEnergy,   // ✅ FIXED (button-based energy)

    productivity: Number(document.getElementById("productivity").value),
    notes: document.getElementById("notes").value
  };

  try {
    const res = await fetch(`${window.API_BASE}/log`, {
  method: "POST",

  headers: {
    "Content-Type": "application/json",
    "Authorization": token
  },

  body: JSON.stringify(data)
});

    const result = await res.json();
    alert(result.message);

    resetForm();
    
    // 🔥 Update UI after saving
    updateDashboard();
    renderBarChart();
    renderLineChart();
    renderPieChart();
    renderRadarChart();
    renderRecentActivity();

  } catch (err) {
    console.error(err);
    alert("Error saving data");
  }
}

async function loadLogs() {

  const res = await fetch(`${window.API_BASE}/logs`, {

    headers: {
      "Authorization": token
    }

  });

  const logs = await res.json();

  return logs;
}

function filterLogsByDays(logs, days) {

  const now = new Date();

  return logs.filter(log => {

    const logDate = new Date(log.date);

    const diffTime = now - logDate;

    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    return diffDays <= days;
  });
}

function processData(logs) {
  const labels = [];
  const tasks = [];
  const hours = [];

  logs.forEach(log => {
    labels.push(log.date);
    tasks.push(log.tasksCompleted || 0);
    hours.push(log.hoursWorked || 0);
  });

  return { labels, tasks, hours };
}   

async function updateDashboard() {

  const logs = await loadLogs();

  if (!logs || logs.length === 0) return;

  // CURRENT DATE
  const now = new Date();

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const lastMonth =
    currentMonth === 0 ? 11 : currentMonth - 1;

  const lastMonthYear =
    currentMonth === 0
      ? currentYear - 1
      : currentYear;

  // FILTER CURRENT MONTH
  const currentLogs = logs.filter(log => {

    const d = new Date(log.date);

    return (
      d.getMonth() === currentMonth &&
      d.getFullYear() === currentYear
    );
  });

  // FILTER LAST MONTH
  const previousLogs = logs.filter(log => {

    const d = new Date(log.date);

    return (
      d.getMonth() === lastMonth &&
      d.getFullYear() === lastMonthYear
    );
  });

  // TOTALS
  const currentHours =
    currentLogs.reduce(
      (sum,l) => sum + (l.hoursWorked || 0),
      0
    );

  const previousHours =
    previousLogs.reduce(
      (sum,l) => sum + (l.hoursWorked || 0),
      0
    );

  const currentTasks =
    currentLogs.reduce(
      (sum,l) => sum + (l.tasksCompleted || 0),
      0
    );

  const previousTasks =
    previousLogs.reduce(
      (sum,l) => sum + (l.tasksCompleted || 0),
      0
    );

  const currentProductivity =
    currentLogs.length
      ? currentLogs.reduce(
          (sum,l) => sum + (l.productivity || 0),
          0
        ) / currentLogs.length
      : 0;

  const previousProductivity =
    previousLogs.length
      ? previousLogs.reduce(
          (sum,l) => sum + (l.productivity || 0),
          0
        ) / previousLogs.length
      : 0;

  // PERCENT CHANGE
  function calculateGrowth(current, previous) {

    if (previous === 0) return 100;

    return (
      ((current - previous) / previous) * 100
    ).toFixed(0);
  }

  const hoursGrowth =
    calculateGrowth(currentHours, previousHours);

  const tasksGrowth =
    calculateGrowth(currentTasks, previousTasks);

  const productivityGrowth =
    calculateGrowth(
      currentProductivity,
      previousProductivity
    );

  // UPDATE UI

  document.getElementById("totalHours").innerHTML = `
    ${currentHours}h
    <p class="card-sub">
      Last ${currentLogs.length} entries
    </p>
    <span class="growth positive">
      +${hoursGrowth}% 
    </span>
    <span class="growth-text">
      vs last month
    </span>
  `;

  document.getElementById("totalTasks").innerHTML = `
    ${currentTasks}
    <p class="card-sub">
      Last ${currentLogs.length} entries
    </p>
    <span class="growth positive">
      +${tasksGrowth}% 
    </span>
    <span class="growth-text">
      vs last month
    </span>
  `;

  document.getElementById("avgProductivity").innerHTML = `
    ${currentProductivity.toFixed(1)}/10
    <p class="card-sub">
      Self-rated score
    </p>
    <span class="growth positive">
      +${productivityGrowth}% 
    </span>
    <span class="growth-text">
      vs last month
    </span>
  `;

  document.getElementById("totalEntries").innerHTML = `
    ${currentLogs.length}
    <p class="card-sub">
      Productivity logs
    </p>
  `;
}

function updateSlider(val) {
  document.getElementById("scoreValue").innerText = val;
}

let selectedEnergy = "Medium";

// ENERGY BUTTON
function setEnergy(btn, value) {
  document.querySelectorAll(".energy-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  selectedEnergy = value;
}

function changeFilter(days, btn) {

  selectedDays = days;

  // ACTIVE BUTTON
  document.querySelectorAll(".filter-btn")
    .forEach(b => b.classList.remove("active"));

  btn.classList.add("active");

  // REFRESH CHARTS
  renderBarChart();
  renderLineChart();
  renderPieChart();
  renderRadarChart();
  renderDayChart();
}

// RESET
function resetForm() {
  document.querySelectorAll("input, textarea").forEach(el => el.value = "");
  document.getElementById("productivity").value = 7;
  document.getElementById("score").innerText = 7;

  selectedEnergy = "Medium";
  document.querySelectorAll(".energy-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".energy-btn")[1].classList.add("active");
}

async function updateAnalytics() {
  const logs = await loadLogs();
  if (!logs.length) return;

  // 🔥 Peak Day
  const dayCount = {};
  logs.forEach(l => {
    const day = new Date(l.date).toLocaleDateString("en-US", { weekday: "long" });
    dayCount[day] = (dayCount[day] || 0) + l.tasksCompleted;
  });

  const peakDay = Object.keys(dayCount).reduce((a, b) =>
    dayCount[a] > dayCount[b] ? a : b
  );

  document.getElementById("peakDay").innerText = peakDay;

  // 🔥 Avg Tasks
  const totalTasks = logs.reduce((sum, l) => sum + (l.tasksCompleted || 0), 0);
  document.getElementById("avgTasks").innerText =
    (totalTasks / logs.length).toFixed(1);

  // 🔥 Focus Ratio
  const totalFocus = logs.reduce((sum, l) => sum + (l.focusHours || 0), 0);
  const totalHours = logs.reduce((sum, l) => sum + (l.hoursWorked || 0), 0);

  const ratio = totalHours ? (totalFocus / totalHours) * 100 : 0;
  document.getElementById("focusRatio").innerText =
    ratio.toFixed(0) + "%";
}

async function renderDayChart() {

  const allLogs = await loadLogs();

const logs = filterLogsByDays(allLogs, selectedDays);

  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  const data = [0,0,0,0,0,0,0];

  logs.forEach(log => {

    const d = new Date(log.date).getDay();

    const index = d === 0 ? 6 : d - 1;

    data[index] += log.tasksCompleted || 0;
  });
if (dayChart) {
  dayChart.destroy();
}

dayChart = new Chart(document.getElementById("dayChart"), {

    type: "bar",

    data: {
      labels: days,

      datasets: [{
        label: "Tasks",

        data,

        backgroundColor: "#6366f1",

        borderRadius: 12,
        borderSkipped: false,

        barThickness: 40
      }]
    },

    options: chartOptions()
  });
}

async function renderRecentActivity() {
  const logs = await loadLogs();
  const container = document.getElementById("recentList");

  container.innerHTML = "";

  const recentLogs = logs.slice(-5).reverse();

  if (!logs.length) {
  container.innerHTML = `
    <div style="text-align:center; padding:30px; color:#9ca3af;">
      No activity yet 🚀<br>
      Start logging your work!
    </div>
  `;
  return;
}

  recentLogs.forEach(log => {

    const energy = log.energy || "Medium";

    let energyClass = "medium";
    if (energy === "Low") energyClass = "low";
    if (energy === "High") energyClass = "high";

    const item = document.createElement("div");
    item.className = `activity-item ${energyClass}`;

    item.innerHTML = `
     <div class="activity-icon">✔</div>

      <div class="activity-content">
        <div class="activity-top">
          <span class="activity-date">${formatDate(log.date)}</span>
          <span class="tag ${energyClass}">${energy}</span>
        </div>

        <div class="activity-meta">
          <span>⏱ ${log.hoursWorked || 0}h</span>
          <span>✔ ${log.tasksCompleted || 0}</span>
          <span>⚡ ${log.productivity || 0}/10</span>
        </div>
      </div>
    `;

    container.appendChild(item);
  });
 

}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function toggleTheme() {

  document.body.classList.toggle("dark");

  const btn = document.querySelector(".theme-toggle");

  if (document.body.classList.contains("dark")) {

    localStorage.setItem("theme", "dark");

    btn.innerHTML = "☀️";

  } else {

    localStorage.setItem("theme", "light");

    btn.innerHTML = "🌙";
  }
}

window.onload = () => {

  const btn = document.querySelector(".theme-toggle");

  if (document.body.classList.contains("dark")) {
    btn.innerHTML = "☀️";
  }

  updateDashboard();
  updateAnalytics();
  renderBarChart();
  renderLineChart();
  renderPieChart();
  renderRadarChart();
  renderDayChart();
  renderRecentActivity();
};

function chartOptions() {

  const isDark = document.body.classList.contains("dark");

  return {
responsive:true,
  maintainAspectRatio:false,
  resizeDelay:0,

    interaction: {
      intersect: false,
      mode: "index"
    },

    plugins: {

      legend: {
        labels: {
          color: isDark ? "#f9fafb" : "#374151",
          font: {
            size: 13,
            weight: "600"
          }
        }
      }
    },

    scales: {

      x: {
        ticks: {
          color: isDark ? "#d1d5db" : "#6b7280"
        },

        grid: {
          color: isDark
            ? "rgba(255,255,255,0.05)"
            : "rgba(0,0,0,0.05)"
        }
      },

      y: {
        beginAtZero: true,

        ticks: {
          color: isDark ? "#d1d5db" : "#6b7280"
        },

        grid: {
          color: isDark
            ? "rgba(255,255,255,0.05)"
            : "rgba(0,0,0,0.05)"
        }
      }
    }
  };
}