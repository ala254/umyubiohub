// Supabase Configuration
const SUPABASE_URL = 'https://psojlbebapzgclighavti.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_U4ufzD0hkyrXvOJta235rg_jiHOGdWF';

// Initialize Supabase client
let supabase;

// DOM Elements
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const forgotModal = document.getElementById('forgotModal');
const authNavBtn = document.getElementById('authNavBtn');

// Check if Supabase is available
async function initSupabase() {
    if (typeof supabaseJs !== 'undefined') {
        supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        checkAuth();
    } else {
        console.log('Supabase not loaded, using demo mode');
        // Demo mode for presentation
        setupDemoMode();
    }
}

// Demo mode for testing without backend
function setupDemoMode() {
    window.demoMode = true;
    console.log('Running in demo mode');
    
    // Mock user data
    window.mockUser = null;
    
    // Override auth functions
    window.mockLogin = (email, password) => {
        if (email.includes('@umyu.edu.ng')) {
            window.mockUser = { email, user_metadata: { full_name: email.split('@')[0] } };
            localStorage.setItem('umyu_user', JSON.stringify(window.mockUser));
            window.location.href = 'dashboard.html';
            return true;
        }
        alert('Please use a valid UMYU email');
        return false;
    };
    
    window.mockSignup = (data) => {
        window.mockUser = { email: data.email, user_metadata: { full_name: data.name } };
        localStorage.setItem('umyu_user', JSON.stringify(window.mockUser));
        alert('Registration successful! Please check your email for verification (demo mode)');
        window.location.href = 'dashboard.html';
    };
}

// Check authentication status
async function checkAuth() {
    if (window.demoMode) {
        const user = localStorage.getItem('umyu_user');
        if (user && window.location.pathname.includes('dashboard.html')) {
            displayDashboardContent(JSON.parse(user));
        } else if (!user && window.location.pathname.includes('dashboard.html')) {
            window.location.href = 'index.html';
        }
        return;
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user && window.location.pathname.includes('dashboard.html')) {
        displayDashboardContent(user);
    } else if (!user && window.location.pathname.includes('dashboard.html')) {
        window.location.href = 'index.html';
    }
}

// Display dashboard after login
function displayDashboardContent(user) {
    document.getElementById('userName').textContent = user.user_metadata?.full_name || user.email?.split('@')[0];
    document.getElementById('userEmail').textContent = user.email;
    loadMaterials();
    loadRecentUploads();
}

// Load materials from Supabase or demo data
async function loadMaterials() {
    const materialsGrid = document.getElementById('materialsGrid');
    if (!materialsGrid) return;
    
    let materials = [];
    
    if (window.demoMode) {
        // Demo materials data
        materials = [
            { id: 1, title: 'Introduction to Biochemistry', course: 'BCH 201', level: '200', type: 'pdf', uploader: 'Dr. Ahmad', downloads: 245, saved: false },
            { id: 2, title: 'Protein Structure & Function', course: 'BCH 301', level: '300', type: 'pdf', uploader: 'Prof. Musa', downloads: 189, saved: true },
            { id: 3, title: 'Enzyme Kinetics - Past Questions', course: 'BCH 302', level: '300', type: 'pdf', uploader: 'Dept. of Biochemistry', downloads: 567, saved: false },
            { id: 4, title: 'Cell Biology Lecture Notes', course: 'BIO 101', level: '100', type: 'docx', uploader: 'Dr. Fatima', downloads: 890, saved: false },
            { id: 5, title: 'Metabolic Pathways Complete Guide', course: 'BCH 401', level: '400', type: 'pdf', uploader: 'Prof. Bello', downloads: 432, saved: true },
            { id: 6, title: 'Practical Manual - Lab Techniques', course: 'BCH 205', level: '200', type: 'pdf', uploader: 'Lab Department', downloads: 678, saved: false },
            { id: 7, title: 'Molecular Biology Research Paper', course: 'BCH 402', level: '400', type: 'pdf', uploader: 'Dr. Sani', downloads: 234, saved: false },
            { id: 8, title: 'GST 101 - Communication Skills', course: 'GST 101', level: '100', type: 'ppt', uploader: 'GST Dept', downloads: 345, saved: true },
        ];
    } else {
        // Fetch from Supabase
        const { data } = await supabase.from('materials').select('*').order('created_at', { ascending: false });
        materials = data || [];
    }
    
    renderMaterials(materials, materialsGrid);
}

function renderMaterials(materials, container) {
    container.innerHTML = materials.map(material => `
        <div class="material-card fade-in-up">
            <div class="material-icon">
                <i class="fas fa-file-${material.type === 'pdf' ? 'pdf' : material.type === 'docx' ? 'word' : 'powerpoint'}"></i>
            </div>
            <div class="material-title">${material.title}</div>
            <div class="material-meta">
                <span><i class="fas fa-code-branch"></i> ${material.course}</span>
                <span><i class="fas fa-graduation-cap"></i> ${material.level}</span>
            </div>
            <div class="material-meta">
                <span><i class="fas fa-user"></i> ${material.uploader}</span>
                <span><i class="fas fa-download"></i> ${material.downloads}</span>
            </div>
            <div class="material-actions">
                <button onclick="viewMaterial(${material.id})"><i class="fas fa-eye"></i> View</button>
                <button onclick="downloadMaterial(${material.id})"><i class="fas fa-download"></i> Download</button>
                <button onclick="saveMaterial(${material.id})" class="${material.saved ? 'saved' : ''}">
                    <i class="fas fa-${material.saved ? 'bookmark' : 'bookmark-regular'}"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Load recent uploads for dashboard
async function loadRecentUploads() {
    const recentContainer = document.getElementById('recentUploads');
    if (!recentContainer) return;
    
    let recent = [];
    
    if (window.demoMode) {
        recent = [
            { title: 'Advanced Enzymology - Lecture 5', course: 'BCH 401', date: '2025-02-15' },
            { title: 'Lipid Metabolism Notes', course: 'BCH 302', date: '2025-02-14' },
            { title: 'Practical - Spectrophotometry', course: 'BCH 205', date: '2025-02-13' },
        ];
    }
    
    recentContainer.innerHTML = recent.map(item => `
        <div class="recent-item">
            <i class="fas fa-file-alt"></i>
            <div>
                <div class="recent-title">${item.title}</div>
                <div class="recent-meta">${item.course} • ${new Date(item.date).toLocaleDateString()}</div>
            </div>
        </div>
    `).join('');
}

// Search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', debounce(async (e) => {
        const query = e.target.value.toLowerCase();
        let materials = [];
        
        if (window.demoMode) {
            const allMaterials = await getDemoMaterials();
            materials = allMaterials.filter(m => 
                m.title.toLowerCase().includes(query) ||
                m.course.toLowerCase().includes(query) ||
                m.uploader.toLowerCase().includes(query)
            );
        }
        
        const materialsGrid = document.getElementById('materialsGrid');
        if (materialsGrid) renderMaterials(materials, materialsGrid);
    }, 300));
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Event listeners for auth
document.addEventListener('DOMContentLoaded', () => {
    initSupabase();
    setupSearch();
    setupThemeToggle();
    setupLevelFilters();
    initChatbot();
    
    // Auth button handlers
    authNavBtn?.addEventListener('click', () => {
        loginModal.style.display = 'flex';
    });
    
    document.getElementById('getStartedBtn')?.addEventListener('click', () => {
        loginModal.style.display = 'flex';
    });
    
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            loginModal.style.display = 'none';
            signupModal.style.display = 'none';
            forgotModal.style.display = 'none';
        });
    });
    
    // Tab switching
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            loginModal.style.display = tabName === 'login' ? 'flex' : 'none';
            signupModal.style.display = tabName === 'signup' ? 'flex' : 'none';
        });
    });
    
    // Form submissions
    document.getElementById('loginForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        const password = e.target.querySelector('input[type="password"]').value;
        
        if (window.demoMode) {
            window.mockLogin(email, password);
        } else {
            // Supabase login
            supabase.auth.signInWithPassword({ email, password });
        }
    });
    
    document.getElementById('signupForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = e.target.querySelector('input[placeholder="Full Name"]').value;
        const email = e.target.querySelector('input[type="email"]').value;
        const matric = e.target.querySelector('input[placeholder="Matric Number"]').value;
        const level = e.target.querySelector('select').value;
        const password = e.target.querySelectorAll('input[type="password"]')[0].value;
        
        if (window.demoMode) {
            window.mockSignup({ name, email, matric, level, password });
        }
    });
    
    document.getElementById('googleAuthBtn')?.addEventListener('click', () => {
        if (window.demoMode) {
            window.mockLogin('student@umyu.edu.ng', 'demo');
        } else {
            supabase.auth.signInWithOAuth({ provider: 'google' });
        }
    });
    
    document.getElementById('forgotPasswordLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'none';
        forgotModal.style.display = 'flex';
    });
});

function setupThemeToggle() {
    const toggle = document.querySelector('.theme-toggle');
    toggle?.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
    });
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') document.body.classList.add('light-mode');
}

function setupLevelFilters() {
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const level = btn.dataset.level;
            
            let materials = [];
            if (window.demoMode) {
                const allMaterials = await getDemoMaterials();
                materials = allMaterials.filter(m => m.level === level);
            }
            
            const materialsGrid = document.getElementById('materialsGrid');
            if (materialsGrid) renderMaterials(materials, materialsGrid);
        });
    });
}

async function getDemoMaterials() {
    return [
        { id: 1, title: 'Introduction to Biochemistry', course: 'BCH 201', level: '200', type: 'pdf', uploader: 'Dr. Ahmad', downloads: 245, saved: false },
        { id: 2, title: 'Protein Structure & Function', course: 'BCH 301', level: '300', type: 'pdf', uploader: 'Prof. Musa', downloads: 189, saved: true },
        { id: 3, title: 'Enzyme Kinetics - Past Questions', course: 'BCH 302', level: '300', type: 'pdf', uploader: 'Dept. of Biochemistry', downloads: 567, saved: false },
        { id: 4, title: 'Cell Biology Lecture Notes', course: 'BIO 101', level: '100', type: 'docx', uploader: 'Dr. Fatima', downloads: 890, saved: false },
        { id: 5, title: 'Metabolic Pathways Complete Guide', course: 'BCH 401', level: '400', type: 'pdf', uploader: 'Prof. Bello', downloads: 432, saved: true },
        { id: 6, title: 'Practical Manual - Lab Techniques', course: 'BCH 205', level: '200', type: 'pdf', uploader: 'Lab Department', downloads: 678, saved: false },
    ];
}

// Global functions for UI actions
window.viewMaterial = (id) => {
    alert(`Opening material ${id} - This would open a PDF viewer in production`);
};

window.downloadMaterial = (id) => {
    alert(`Downloading material ${id} - File would be downloaded`);
};

window.saveMaterial = (id) => {
    alert(`Material ${id} saved to your bookmarks`);
};

// CGPA Calculator
function initCGPAcalculator() {
    const calcBtn = document.getElementById('calculateCgpa');
    if (!calcBtn) return;
    
    calcBtn.addEventListener('click', () => {
        const grades = {
            'A': 5.0, 'B': 4.0, 'C': 3.0, 'D': 2.0, 'E': 1.0, 'F': 0.0
        };
        // Simple CGPA calculation logic
        alert('CGPA Calculator - Add your courses and grades to calculate');
    });
}