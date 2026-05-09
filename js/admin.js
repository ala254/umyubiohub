// Admin Panel JavaScript
document.addEventListener('DOMContentLoaded', () => {
    initAdminPanel();
    loadAdminStats();
    loadMaterialsTable();
    loadUsersTable();
    setupAdminTabs();
    setupUploadForm();
    setupNotificationForm();
    setupMaterialSearch();
});

function initAdminPanel() {
    // Check if user is admin (demo mode)
    const user = localStorage.getItem('umyu_user');
    if (!user && !window.demoMode) {
        window.location.href = 'index.html';
    }
    
    // Menu toggle for mobile
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('adminSidebar');
    menuToggle?.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}

function setupAdminTabs() {
    const tabs = document.querySelectorAll('.admin-nav li');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            contents.forEach(c => c.classList.remove('active'));
            document.getElementById(`${tabId}Tab`).classList.add('active');
            
            if (tabId === 'analytics') loadAnalytics();
        });
    });
}

function loadAdminStats() {
    // Demo stats
    document.getElementById('totalMaterials').textContent = '156';
    document.getElementById('totalUsers').textContent = '3,247';
    document.getElementById('totalDownloads').textContent = '12.5k';
    document.getElementById('pendingApprovals').textContent = '8';
    
    // Recent activity
    const activity = [
        { user: 'Ahmad Bello', action: 'Downloaded', material: 'BCH 301 Notes', time: '5 mins ago' },
        { user: 'Fatima Sani', action: 'Uploaded', material: 'Past Questions', time: '1 hour ago' },
        { user: 'Prof. Musa', action: 'Reviewed', material: 'Research Paper', time: '3 hours ago' },
    ];
    
    const tbody = document.getElementById('recentActivity');
    tbody.innerHTML = activity.map(a => `
        <tr><td>${a.user}</td><td>${a.action}</td><td>${a.material}</td><td>${a.time}</td></tr>
    `).join('');
}

function loadMaterialsTable() {
    const materials = [
        { id: 1, title: 'Introduction to Biochemistry', course: 'BCH 201', level: '200', downloads: 245, status: 'Approved' },
        { id: 2, title: 'Enzyme Kinetics', course: 'BCH 302', level: '300', downloads: 189, status: 'Pending' },
        { id: 3, title: 'Metabolic Pathways', course: 'BCH 401', level: '400', downloads: 432, status: 'Approved' },
    ];
    
    const tbody = document.getElementById('materialsList');
    tbody.innerHTML = materials.map(m => `
        <tr>
            <td>${m.title}</td>
            <td>${m.course}</td>
            <td>${m.level}</td>
            <td>${m.downloads}</td>
            <td><span style="color: ${m.status === 'Approved' ? '#2ecc71' : '#f39c12'}">${m.status}</span></td>
            <td>
                <button class="btn-warning" onclick="approveMaterial(${m.id})" style="padding: 0.3rem 0.8rem;">Approve</button>
                <button class="btn-danger" onclick="deleteMaterial(${m.id})" style="padding: 0.3rem 0.8rem;">Delete</button>
            </td>
        </tr>
    `).join('');
}

function loadUsersTable() {
    const users = [
        { name: 'Ahmad Bello', email: 'ahmad@umyu.edu.ng', matric: 'U2021/BCH/001', level: '300', role: 'student' },
        { name: 'Dr. Musa Ibrahim', email: 'musa@umyu.edu.ng', matric: 'STAFF001', level: 'Staff', role: 'admin' },
    ];
    
    const tbody = document.getElementById('usersList');
    tbody.innerHTML = users.map(u => `
        <tr>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td>${u.matric}</td>
            <td>${u.level}</td>
            <td>${u.role}</td>
            <td>
                <button onclick="toggleUserRole('${u.email}')" class="btn-warning" style="padding: 0.3rem 0.8rem;">Toggle Role</button>
                <button onclick="deleteUser('${u.email}')" class="btn-danger" style="padding: 0.3rem 0.8rem;">Remove</button>
            </td>
        </tr>
    `).join('');
}

function setupUploadForm() {
    const form = document.getElementById('uploadForm');
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('materialTitle').value;
        const course = document.getElementById('courseCode').value;
        const level = document.getElementById('level').value;
        const file = document.getElementById('materialFile').files[0];
        
        if (file) {
            alert(`Material "${title}" uploaded successfully! (File: ${file.name})\n\nIn production, this would be stored in Cloudinary and saved to Supabase.`);
            form.reset();
            loadMaterialsTable(); // Refresh table
        } else {
            alert('Please select a file to upload');
        }
    });
}

function setupNotificationForm() {
    const form = document.getElementById('notificationForm');
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('notifTitle').value;
        const message = document.getElementById('notifMessage').value;
        const audience = document.getElementById('notifAudience').value;
        
        alert(`Notification sent to ${audience === 'all' ? 'all students' : audience + ' level'}:\n\n${title}\n${message}\n\nIn production, this would use Firebase Cloud Messaging.`);
        form.reset();
    });
}

function setupMaterialSearch() {
    const searchInput = document.getElementById('materialSearch');
    searchInput?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#materialsList tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
    });
}

function loadAnalytics() {
    // Chart.js or similar would be used here
    console.log('Loading analytics charts...');
}

// Global admin functions
window.approveMaterial = (id) => {
    alert(`Material ${id} approved! In production, this would update the database.`);
    loadMaterialsTable();
};

window.deleteMaterial = (id) => {
    if (confirm('Are you sure you want to delete this material?')) {
        alert(`Material ${id} deleted.`);
        loadMaterialsTable();
    }
};

window.toggleUserRole = (email) => {
    alert(`Toggled role for ${email}`);
};

window.deleteUser = (email) => {
    if (confirm(`Remove user ${email}?`)) {
        alert(`User ${email} removed.`);
    }
};