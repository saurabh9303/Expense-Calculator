let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
const chartCtx = document.getElementById("chart").getContext("2d");
let chartInstance;

function addTransaction() {
  const desc = document.getElementById("desc").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);
  const date = document.getElementById("date").value;
  const category = document.getElementById("category").value;
  const type = document.getElementById("type").value;

  if (!desc || isNaN(amount) || !date) {
    alert("Please fill all valid details");
    return;
  }

  transactions.push({ desc, amount, date, category, type });
  saveAndRender();
  document.getElementById("desc").value = "";
  document.getElementById("amount").value = "";
  document.getElementById("date").value = "";
}

function saveAndRender() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  updateUI();
}

function deleteTransaction(index) {
  transactions.splice(index, 1);
  saveAndRender();
}

function updateUI() {
  const list = document.getElementById("transactions");
  const balance = document.getElementById("balance");
  list.innerHTML = "";

  const filtered = getFilteredTransactions();

  let income = 0, expense = 0;

  filtered.forEach((t, i) => {
    const li = document.createElement("li");
    li.className = t.type;
    li.innerHTML = `
      ${t.date} - ${t.desc} (${t.category}): ₹${t.amount.toFixed(2)}
      <button class="delete-btn" onclick="deleteTransaction(${transactions.indexOf(t)})">✖</button>
    `;
    list.appendChild(li);
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  });

  balance.textContent = `₹${(income - expense).toFixed(2)}`;
  updateChart(income, expense);
}

function getFilteredTransactions() {
  const month = document.getElementById("month-filter").value;
  const category = document.getElementById("category-filter").value;
  return transactions.filter(t => {
    const matchMonth = month ? t.date.startsWith(month) : true;
    const matchCategory = category ? t.category === category : true;
    return matchMonth && matchCategory;
  });
}

function filterTransactions() {
  updateUI();
}

function updateChart(income, expense) {
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(chartCtx, {
    type: 'doughnut',
    data: {
      labels: ['Income', 'Expense'],
      datasets: [{
        data: [income, expense],
        backgroundColor: ['#2ecc71', '#e74c3c']
      }]
    }
  });
}

function exportCSV() {
  let csv = "Description,Amount,Type,Category,Date\n";
  transactions.forEach(t => {
    csv += `${t.desc},${t.amount},${t.type},${t.category},${t.date}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "transactions.csv";
  a.click();
}

document.getElementById("toggle-theme").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

function showAllActivity() {
  const modal = document.getElementById("activity-modal");
  const list = document.getElementById("activity-list");
  modal.style.display = "flex";
  list.innerHTML = "";

  if (transactions.length === 0) {
    list.innerHTML = "<li>No transactions yet</li>";
    return;
  }

  transactions.forEach(t => {
    const li = document.createElement("li");
    li.textContent = `${t.date} - ${t.desc} (${t.category}) - ₹${t.amount} [${t.type}]`;
    list.appendChild(li);
  });
}

function closeActivityModal() {
  document.getElementById("activity-modal").style.display = "none";
}

updateUI();
