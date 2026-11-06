
const API_URL = "/api/applications";

let applications = [];
let editingId = null;

// HTML elements

const modal = document.getElementById("applicationModal");
const form = document.getElementById("applicationForm");
const rows = document.getElementById("applicationRows");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

// Open application form

document.getElementById("openForm").onclick = function () {
    editingId = null;
    form.reset();

    form.elements.date.value =
        new Date().toISOString().slice(0, 10);

    modal.classList.add("show");
};

// Close application form

document.getElementById("closeForm").onclick = function () {
    editingId = null;
    modal.classList.remove("show");
};

// Load applications from backend

async function loadApplications() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load applications");
        }

        applications = await response.json();
        displayApplications();

    } catch (error) {
        console.error("Loading error:", error);
        alert("Unable to load applications from backend.");
    }
}

// Add or Update application

form.addEventListener("submit", async function (event) {

    event.preventDefault();

    const data = new FormData(form);

    const company = data.get("company").trim();
    const role = data.get("role").trim();
    const date = data.get("date");
    const interviewDate = data.get("interviewDate");

    // Form validation

    if (!company || !role || !date) {
        alert("Please fill all required fields.");
        return;
    }

    if (interviewDate && interviewDate < date) {
        alert("Interview date cannot be before application date.");
        return;
    }

    const application = {
        company: company,
        role: role,
        type: data.get("type"),
        status: data.get("status"),
        date: date,
        interviewDate: interviewDate || null,
        notes: data.get("notes")
    };

    try {
        const isEditing = editingId !== null;

        const response = await fetch(
            isEditing ? `${API_URL}/${editingId}` : API_URL,
            {
                method: isEditing ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(application)
            }
        );

        if (!response.ok) {
            throw new Error("Save failed");
        }

        alert(isEditing
            ? "Application updated successfully!"
            : "Application added successfully!");

        editingId = null;
        form.reset();
        modal.classList.remove("show");

        await loadApplications();

    } catch (error) {
        console.error("Save error:", error);
        alert("Unable to save application. Check backend.");
    }
});

// Display applications

function displayApplications() {

    rows.innerHTML = "";

    const search = searchInput.value.toLowerCase();
    const filter = statusFilter.value;

    const filtered = applications.filter(function (app) {

        const matchesSearch =
            app.company.toLowerCase().includes(search) ||
            app.role.toLowerCase().includes(search);

        const matchesStatus =
            filter === "All" || app.status === filter;

        return matchesSearch && matchesStatus;
    });

    document.getElementById("emptyState").style.display =
        filtered.length === 0 ? "block" : "none";

    filtered.forEach(function (app) {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHTML(app.company)}</td>
            <td>${escapeHTML(app.role)}</td>
            <td>${escapeHTML(app.type)}</td>
            <td>${formatDate(app.date)}</td>
            <td>${escapeHTML(app.status)}</td>
            <td>
                <button class="edit-btn" data-id="${app.id}">
                    Edit
                </button>

                <button class="delete-btn" data-id="${app.id}">
                    Delete
                </button>
            </td>
        `;

        rows.appendChild(row);

    });

    updateStatistics();
    displayInterviews();
}

// Prevent HTML injection

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, function (char) {

        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[char];

    });
}

// Format dates

function formatDate(value) {

    if (!value) return "—";

    return new Date(value + "T00:00:00")
        .toLocaleDateString("en-IN");
}

// Edit and Delete application

rows.addEventListener("click", async function (event) {

    const id = Number(event.target.dataset.id);

    // Edit application

    if (event.target.matches(".edit-btn")) {

        const app = applications.find(item => item.id === id);

        if (!app) return;

        editingId = id;

        form.elements.company.value = app.company;
        form.elements.role.value = app.role;
        form.elements.type.value = app.type;
        form.elements.status.value = app.status;
        form.elements.date.value = app.date || "";
        form.elements.interviewDate.value = app.interviewDate || "";
        form.elements.notes.value = app.notes || "";

        modal.classList.add("show");

        return;
    }

    // Delete application

    if (event.target.matches(".delete-btn")) {

        if (!confirm("Delete this application?")) return;

        try {

            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                throw new Error("Delete failed");
            }

            await loadApplications();

        } catch (error) {

            console.error("Delete error:", error);
            alert("Unable to delete application.");

        }
    }
});

// Search applications

searchInput.addEventListener("input", displayApplications);

// Filter applications

statusFilter.addEventListener("change", displayApplications);

// Dashboard statistics

function updateStatistics() {

    document.getElementById("totalCount").textContent =
        applications.length;

    document.getElementById("progressCount").textContent =
        applications.filter(app =>
            ["Applied", "Under Review"].includes(app.status)
        ).length;

    document.getElementById("interviewCount").textContent =
        applications.filter(app =>
            app.status === "Interview"
        ).length;

    document.getElementById("offerCount").textContent =
        applications.filter(app =>
            app.status === "Offer"
        ).length;
}

// Upcoming interviews

function displayInterviews() {

    const interviewList =
        document.getElementById("interviewList");

    interviewList.innerHTML = "";

    const interviews = applications.filter(app =>
        app.status === "Interview" && app.interviewDate
    );

    if (interviews.length === 0) {

        interviewList.textContent =
            "No upcoming interviews yet.";

        return;
    }

    interviews.forEach(function (app) {

        const card = document.createElement("div");

        card.className = "interview-card";

        card.innerHTML = `
            <strong>${escapeHTML(app.company)}</strong>
            <p>${escapeHTML(app.role)}</p>
            <p>Interview date: ${formatDate(app.interviewDate)}</p>
        `;

        interviewList.appendChild(card);

    });
}

// Initial dashboard load

loadApplications();
