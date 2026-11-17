
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let monthlyBudget = Number(localStorage.getItem("monthlyBudget")) || 0;
let categoryChart = null;
let monthlyChart = null;

function addExpense() {
    let name = document.getElementById("expenseName").value;
    let amount = Number(document.getElementById("expenseAmount").value);
    let category = document.getElementById("expenseCategory").value;

    if (name.trim() === "" || amount <= 0 || category === "") {
        alert("Please enter valid details!");
        return;
    }

    expenses.push({
        name: name,
        amount: amount,
        category: category,
        date: new Date()
    });

    localStorage.setItem("expenses", JSON.stringify(expenses));

    displayExpenses();

    document.getElementById("expenseName").value = "";
    document.getElementById("expenseAmount").value = "";
    document.getElementById("expenseCategory").value = "";
}

function displayExpenses() {
    let list = document.getElementById("expenseList");
    list.innerHTML = "";

    let total = 0;
    let monthlyTotal = 0;

    let categoryTotals = {
        Food: 0,
        Travel: 0,
        Education: 0,
        Shopping: 0,
        Other: 0
    };

    expenses.forEach(function(expense, index) {
        total += Number(expense.amount);

        if (categoryTotals[expense.category] !== undefined) {
            categoryTotals[expense.category] += Number(expense.amount);
        }

        let expenseDate = new Date(expense.date);
        let currentDate = new Date();

        if (
            !isNaN(expenseDate.getTime()) &&
            expenseDate.getMonth() === currentDate.getMonth() &&
            expenseDate.getFullYear() === currentDate.getFullYear()
        ) {
            monthlyTotal += Number(expense.amount);
        }

        let item = document.createElement("li");

        let dateText = isNaN(expenseDate.getTime())
            ? ""
            : expenseDate.toLocaleDateString();

        item.innerText = expense.name + " - ₹" + expense.amount +
            " (" + expense.category + ") - " + dateText + " ";

        let editButton = document.createElement("button");
        editButton.innerText = "Edit";

        editButton.onclick = function() {
            editExpense(index);
        };

        item.appendChild(editButton);

        let deleteButton = document.createElement("button");
        deleteButton.innerText = "Delete";

        deleteButton.onclick = function() {
            deleteExpense(index);
        };

        item.appendChild(deleteButton);
        list.appendChild(item);
    });

    document.getElementById("totalExpenses").innerText = "₹" + total;
    document.getElementById("monthlytotal").innerText = "₹" + monthlyTotal;
    updateBudget();

    let summary = "";

    for (let category in categoryTotals) {
        summary += `<li>${category}: ₹${categoryTotals[category]}</li>`;
    }

    document.getElementById("categorySummary").innerHTML = summary;
    updateCharts();

    searchExpenses();
}

function deleteExpense(index) {
    expenses.splice(index, 1);

    localStorage.setItem("expenses", JSON.stringify(expenses));

    displayExpenses();
}

function editExpense(index) {
    let newName = prompt("Enter new expense name:", expenses[index].name);

    if (newName === null) return;

    let newAmount = Number(prompt("Enter new amount:", expenses[index].amount));

    let newCategory = prompt(
        "Enter category (Food, Travel, Education, Shopping, Other):",
        expenses[index].category
    );

    if (
        newName.trim() === "" ||
        newAmount <= 0 ||
        !["Food", "Travel", "Education", "Shopping", "Other"].includes(newCategory)
    ) {
        alert("Please enter valid details!");
        return;
    }

    expenses[index].name = newName;
    expenses[index].amount = newAmount;
    expenses[index].category = newCategory;

    localStorage.setItem("expenses", JSON.stringify(expenses));

    displayExpenses();
}

function searchExpenses() {
    let searchInput = document.getElementById("searchExpense");
    let categoryInput = document.getElementById("categoryFilter");

    if (!searchInput || !categoryInput) return;

    let searchValue = searchInput.value.toLowerCase().trim();
    let selectedCategory = categoryInput.value.toLowerCase();

    let items = document.querySelectorAll("#expenseList li");

    items.forEach(function(item, index) {
        let expense = expenses[index];

        let matchesName = expense.name.toLowerCase().includes(searchValue);

        let matchesCategory =
            selectedCategory === "" ||
            expense.category.toLowerCase() === selectedCategory;

        item.style.display =
            matchesName && matchesCategory ? "" : "none";
    });
}

function filterExpenses() {
    searchExpenses();
}

displayExpenses();
function setBudget() {
    let budget = Number(document.getElementById("monthlyBudget").value);

    if (budget <= 0) {
        alert("Please enter a valid budget!");
        return;
    }

    monthlyBudget = budget;

    localStorage.setItem("monthlyBudget", monthlyBudget);

    displayExpenses();
}

function updateBudget() {
    let monthlyTotal = Number(
        document.getElementById("monthlytotal").innerText.replace("₹", "")
    );

    let remaining = monthlyBudget - monthlyTotal;

    document.getElementById("budgetAmount").innerText =
        "Budget: ₹" + monthlyBudget;

    document.getElementById("remainingBudget").innerText =
        remaining >= 0
        ? "Remaining: ₹" + remaining
        : "Over budget: ₹" + Math.abs(remaining);

    let progress = monthlyBudget > 0
        ? Math.min(100, (monthlyTotal / monthlyBudget) * 100)
        : 0;

    document.getElementById("budgetProgress").value = progress;

    let status = document.getElementById("budgetStatus");

if (monthlyBudget === 0) {
    status.innerText = "Please set your monthly budget.";
    status.style.color = "gray";
} else if (monthlyTotal > monthlyBudget) {
    status.innerText = "Warning! You have exceeded your budget.";
    status.style.color = "red";
} else if (monthlyTotal >= monthlyBudget * 0.8) {
    status.innerText = "Warning! You have used 80% of your budget.";
    status.style.color = "orange";
} else {
    status.innerText = "Budget is under control!";
    status.style.color = "green";
}
}

function generateReport() {
    let period = document.getElementById("reportPeriod").value;
    let reportList = document.getElementById("reportList");

    reportList.innerHTML = "";

    let total = 0;
    let today = new Date();

    let filteredExpenses = expenses.filter(function(expense) {
        let date = new Date(expense.date);

        if (isNaN(date.getTime())) return false;

        if (period === "daily") {
            return date.toDateString() === today.toDateString();
        }

        if (period === "weekly") {
            let difference = today - date;
            return difference >= 0 && difference < 7 * 24 * 60 * 60 * 1000;
        }

        if (period === "monthly") {
            return date.getMonth() === today.getMonth() &&
                   date.getFullYear() === today.getFullYear();
        }
    });

    filteredExpenses.forEach(function(expense) {
        total += Number(expense.amount);

        let item = document.createElement("li");

        item.innerText = expense.name + " - ₹" +
            expense.amount + " (" + expense.category + ")";

        reportList.appendChild(item);
    });

    document.getElementById("reportTotal").innerText =
        "Total: ₹" + total;

    if (filteredExpenses.length === 0) {
        reportList.innerHTML = "<li>No expenses found.</li>";
    }
}

function downloadReport() {
    let period = document.getElementById("reportPeriod").value;

    let today = new Date();
    let total = 0;

    let reportData = [
        ["Expense Name", "Amount", "Category", "Date"]
    ];

    expenses.forEach(function(expense) {
        let date = new Date(expense.date);
        let include = false;

        if (isNaN(date.getTime())) return;

        if (period === "daily") {
            include = date.toDateString() === today.toDateString();
        } else if (period === "weekly") {
            let difference = today - date;
            include = difference >= 0 && difference < 7 * 24 * 60 * 60 * 1000;
        } else if (period === "monthly") {
            include = date.getMonth() === today.getMonth() &&
                      date.getFullYear() === today.getFullYear();
        }

        if (include) {
            total += Number(expense.amount);

            reportData.push([
                expense.name,
                expense.amount,
                expense.category,
                date.toLocaleDateString()
            ]);
        }
    });

    reportData.push(["Total", total, "", ""]);

    let csv = reportData.map(function(row) {
        return row.map(function(value) {
            return '"' + String(value).replace(/"/g, '""') + '"';
        }).join(",");
    }).join("\n");

    let blob = new Blob([csv], { type: "text/csv" });
    let url = URL.createObjectURL(blob);

    let link = document.createElement("a");
    link.href = url;
    link.download = period + "-expense-report.csv";
    link.click();

    URL.revokeObjectURL(url);
}

function updateCharts() {

    let categories = {
        Food: 0,
        Travel: 0,
        Education: 0,
        Shopping: 0,
        Other: 0
    };

    expenses.forEach(function(expense) {
        if (categories[expense.category] !== undefined) {
            categories[expense.category] += Number(expense.amount);
        }
    });

    if (categoryChart) {
        categoryChart.destroy();
    }

    categoryChart = new Chart(
        document.getElementById("categoryChart"),
        {
            type: "pie",
            data: {
                labels: Object.keys(categories),
                datasets: [{
                    data: Object.values(categories)
                }]
            }
        }
    );

    let months = [];
    let monthlyAmounts = [];

    for (let i = 5; i >= 0; i--) {
        let date = new Date();
        date.setDate(1);
        date.setMonth(date.getMonth() - i);

        months.push(date.toLocaleString("default", {
            month: "short",
            year: "numeric"
        }));

        let total = 0;

        expenses.forEach(function(expense) {
            let expenseDate = new Date(expense.date);

            if (
                expenseDate.getMonth() === date.getMonth() &&
                expenseDate.getFullYear() === date.getFullYear()
            ) {
                total += Number(expense.amount);
            }
        });

        monthlyAmounts.push(total);
    }

    if (monthlyChart) {
        monthlyChart.destroy();
    }

    monthlyChart = new Chart(
        document.getElementById("monthlyChart"),
        {
            type: "bar",
            data: {
                labels: months,
                datasets: [{
                    label: "Monthly Expenses",
                    data: monthlyAmounts
                }]
            }
        }
    );
}
function resetBudget() {
    let confirmReset = confirm("Are you sure you want to reset your monthly budget?");

    if (!confirmReset) {
        return;
    }

    monthlyBudget = 0;

    localStorage.removeItem("monthlyBudget");

    document.getElementById("monthlyBudget").value = "";

    displayExpenses();
}
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");

    let button = document.getElementById("darkModeButton");

    if (document.body.classList.contains("dark-mode")) {
        button.innerHTML = "☀️ Light Mode";
        localStorage.setItem("theme", "dark");
    } else {
        button.innerHTML = "🌙 Dark Mode";
        localStorage.setItem("theme", "light");
    }
}
function saveProfile() {
    let name = document.getElementById("studentName").value;
    let college = document.getElementById("collegeName").value;
    let course = document.getElementById("courseName").value;
    let year = document.getElementById("studentYear").value;

    if (name.trim() === "") {
        alert("Please enter your name!");
        return;
    }

    let profile = {
        name: name,
        college: college,
        course: course,
        year: year
    };

    localStorage.setItem("studentProfile", JSON.stringify(profile));

    document.getElementById("welcomeMessage").innerHTML =
        "Welcome, " + name + "!";

    alert("Profile saved successfully!");
}

let savedProfile = JSON.parse(localStorage.getItem("studentProfile"));

if (savedProfile) {
    document.getElementById("studentName").value = savedProfile.name;
    document.getElementById("collegeName").value = savedProfile.college;
    document.getElementById("courseName").value = savedProfile.course;
    document.getElementById("studentYear").value = savedProfile.year;

    document.getElementById("welcomeMessage").innerHTML =
        "Welcome, " + savedProfile.name + "!";
}
function editProfile() {
    let profile = JSON.parse(localStorage.getItem("studentProfile"));

    if (!profile) {
        alert("Please save your profile first!");
        return;
    }

    document.getElementById("studentName").value = profile.name;
    document.getElementById("collegeName").value = profile.college;
    document.getElementById("courseName").value = profile.course;
    document.getElementById("studentYear").value = profile.year;

    alert("You can now edit your profile details!");
}
function uploadProfilePicture() {
    let file = document.getElementById("profileImage").files[0];

    if (!file) {
        alert("Please select a picture first!");
        return;
    }

    if (!file.type.startsWith("image/")) {
        alert("Please select a valid image!");
        return;
    }

    let reader = new FileReader();

    reader.onload = function(event) {
        let imageData = event.target.result;

        localStorage.setItem("profilePicture", imageData);

        let picture = document.getElementById("profilePicture");
        picture.src = imageData;
        picture.style.display = "block";
    };

    reader.readAsDataURL(file);
}
let savedPicture = localStorage.getItem("profilePicture");

if (savedPicture) {
    let picture = document.getElementById("profilePicture");
    picture.src = savedPicture;
    picture.style.display = "block";
}
function removeProfilePicture() {
    localStorage.removeItem("profilePicture");

    let picture = document.getElementById("profilePicture");

    picture.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    picture.style.display = "block";

    document.getElementById("profileImage").value = "";

    alert("Profile picture removed successfully!");
}
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    document.getElementById("darkModeButton").innerHTML = "☀️ Light Mode";
}