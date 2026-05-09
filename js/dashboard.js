// UMYU BioHub - Dashboard JavaScript
// Complete functionality for student dashboard

// ==================== GLOBAL VARIABLES ====================
let currentUser = null;
let allMaterials = [];
let savedMaterialsList = [];
let downloadHistoryList = [];
let currentFilters = {
    level: '',
    type: '',
    course: '',
    search: ''
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    setupEventListeners();
    loadUserData();
    loadMaterials();
    loadSavedMaterials();
    loadDownloadHistory();
    loadRecentUploads();
    loadRecommendations();
    initializeTimetable();
    initializeAcademicCalendar();
});

// ==================== INITIALIZATION FUNCTIONS ====================
function initializeDashboard() {
    // Check if user is logged in
    const userData = localStorage.getItem('umyu_user');
    if (!userData && !window.demoMode) {
        window.location.href = 'index.html';
        return;
    }
    
    if (userData) {
        currentUser = JSON.parse(userData);
        updateUserGreeting();
    } else {
        // Demo user
        currentUser = {
            email: 'student@umyu.edu.ng',
            user_metadata: { full_name: 'Demo Student' },
            level: '300'
        };
        updateUserGreeting();
    }
    
    // Apply saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }
}

function updateUserGreeting() {
    const userName = currentUser?.user_metadata?.full_name || 
                     currentUser?.email?.split('@')[0] || 
                     'Student';
    const greetingElement = document.getElementById('userName');
    if (greetingElement) {
        greetingElement.textContent = userName;
    }
    
    // Update time-based greeting
    const hour = new Date().getHours();
    let timeGreeting = 'Good ';
    if (hour < 12) timeGreeting += 'Morning';
    else if (hour < 17) timeGreeting += 'Afternoon';
    else timeGreeting += 'Evening';
    
    const timeElement = document.getElementById('timeGreeting');
    if (timeElement) {
        timeElement.textContent = timeGreeting;
    }
}

function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 400));
    }
    
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
    
    // Filter listeners
    const levelFilter = document.getElementById('levelFilter');
    if (levelFilter) {
        levelFilter.addEventListener('change', (e) => {
            currentFilters.level = e.target.value;
            applyFilters();
        });
    }
    
    const typeFilter = document.getElementById('typeFilter');
    if (typeFilter) {
        typeFilter.addEventListener('change', (e) => {
            currentFilters.type = e.target.value;
            applyFilters();
        });
    }
    
    const courseFilter = document.getElementById('courseFilter');
    if (courseFilter) {
        courseFilter.addEventListener('change', (e) => {
            currentFilters.course = e.target.value;
            applyFilters();
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
    
    // Category cards
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            if (category) {
                document.getElementById('courseFilter').value = category;
                currentFilters.course = category;
                applyFilters();
            }
        });
    });
    
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadMaterials();
        });
    }
}

// ==================== DEBOUNCE FUNCTION ====================
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

// ==================== SEARCH FUNCTION ====================
function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        currentFilters.search = searchInput.value.toLowerCase();
        applyFilters();
    }
}

// ==================== MATERIALS DATA ====================
function getDemoMaterials() {
    return [
        { 
            id: 1, 
            title: 'Introduction to Biochemistry', 
            course_code: 'BCH 201', 
            course_name: 'General Biochemistry',
            level: '200', 
            type: 'lecture_note', 
            file_type: 'pdf',
            uploader: 'Dr. Ahmad Bello', 
            downloads: 245, 
            views: 1890,
            saved: false,
            description: 'Comprehensive introduction to fundamental biochemistry concepts',
            uploaded_at: '2025-02-10T10:00:00Z',
            tags: ['biochemistry', 'intro', 'BCH201']
        },
        { 
            id: 2, 
            title: 'Protein Structure & Function', 
            course_code: 'BCH 301', 
            course_name: 'Advanced Biochemistry',
            level: '300', 
            type: 'lecture_note', 
            file_type: 'pdf',
            uploader: 'Prof. Musa Ibrahim', 
            downloads: 189, 
            views: 2340,
            saved: true,
            description: 'Detailed analysis of protein structure, folding, and function',
            uploaded_at: '2025-02-08T14:30:00Z',
            tags: ['proteins', 'structure', 'BCH301']
        },
        { 
            id: 3, 
            title: 'Enzyme Kinetics - Past Questions', 
            course_code: 'BCH 302', 
            course_name: 'Enzymology',
            level: '300', 
            type: 'past_question', 
            file_type: 'pdf',
            uploader: 'Dept. of Biochemistry', 
            downloads: 567, 
            views: 4560,
            saved: false,
            description: 'Past examination questions with solutions',
            uploaded_at: '2025-02-05T09:15:00Z',
            tags: ['past questions', 'enzymes', 'exam']
        },
        { 
            id: 4, 
            title: 'Cell Biology Lecture Notes', 
            course_code: 'BIO 101', 
            course_name: 'General Biology',
            level: '100', 
            type: 'lecture_note', 
            file_type: 'docx',
            uploader: 'Dr. Fatima Sani', 
            downloads: 890, 
            views: 5670,
            saved: false,
            description: 'Complete lecture notes for Cell Biology',
            uploaded_at: '2025-02-01T11:00:00Z',
            tags: ['cell biology', 'BIO101']
        },
        { 
            id: 5, 
            title: 'Metabolic Pathways Complete Guide', 
            course_code: 'BCH 401', 
            course_name: 'Metabolism',
            level: '400', 
            type: 'research', 
            file_type: 'pdf',
            uploader: 'Prof. Bello Umar', 
            downloads: 432, 
            views: 3210,
            saved: true,
            description: 'Comprehensive guide to all major metabolic pathways',
            uploaded_at: '2025-01-28T13:20:00Z',
            tags: ['metabolism', 'pathways', 'BCH401']
        },
        { 
            id: 6, 
            title: 'Practical Manual - Lab Techniques', 
            course_code: 'BCH 205', 
            course_name: 'Biochemistry Practical',
            level: '200', 
            type: 'practical', 
            file_type: 'pdf',
            uploader: 'Lab Department', 
            downloads: 678, 
            views: 4120,
            saved: false,
            description: 'Laboratory manual for biochemistry practical sessions',
            uploaded_at: '2025-01-25T15:45:00Z',
            tags: ['practical', 'lab', 'techniques']
        },
        { 
            id: 7, 
            title: 'Molecular Biology Research Paper', 
            course_code: 'BCH 402', 
            course_name: 'Molecular Biology',
            level: '400', 
            type: 'research', 
            file_type: 'pdf',
            uploader: 'Dr. Sani Abubakar', 
            downloads: 234, 
            views: 1870,
            saved: false,
            description: 'Current research in molecular biology techniques',
            uploaded_at: '2025-01-20T09:30:00Z',
            tags: ['molecular biology', 'research', 'BCH402']
        },
        { 
            id: 8, 
            title: 'GST 101 - Communication Skills', 
            course_code: 'GST 101', 
            course_name: 'Communication in English',
            level: '100', 
            type: 'lecture_note', 
            file_type: 'ppt',
            uploader: 'GST Dept', 
            downloads: 345, 
            views: 2780,
            saved: true,
            description: 'Effective communication and study skills',
            uploaded_at: '2025-01-18T12:00:00Z',
            tags: ['GST', 'communication', 'english']
        },
        { 
            id: 9, 
            title: 'Advanced Enzymology - Lecture Series', 
            course_code: 'BCH 401', 
            course_name: 'Advanced Enzymology',
            level: '400', 
            type: 'lecture_note', 
            file_type: 'pdf',
            uploader: 'Prof. Musa Ibrahim', 
            downloads: 156, 
            views: 1240,
            saved: false,
            description: 'Advanced concepts in enzyme mechanisms',
            uploaded_at: '2025-02-12T08:00:00Z',
            tags: ['enzymology', 'advanced', 'BCH401']
        },
        { 
            id: 10, 
            title: 'Lipid Metabolism - Assignment', 
            course_code: 'BCH 302', 
            course_name: 'Metabolism',
            level: '300', 
            type: 'assignment', 
            file_type: 'docx',
            uploader: 'Dr. Ahmad Bello', 
            downloads: 423, 
            views: 2890,
            saved: false,
            description: 'Assignment on lipid metabolism and related disorders',
            uploaded_at: '2025-02-09T14:00:00Z',
            tags: ['lipids', 'metabolism', 'assignment']
        }
    ];
}

// ==================== LOAD MATERIALS ====================
function loadMaterials() {
    const materialsGrid = document.getElementById('materialsGrid');
    if (!materialsGrid) return;
    
    // Show loading state
    materialsGrid.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading materials...</div>';
    
    // Simulate network delay
    setTimeout(() => {
        if (window.demoMode || !window.supabase) {
            allMaterials = getDemoMaterials();
        } else {
            // Fetch from Supabase
            fetchMaterialsFromSupabase();
            return;
        }
        
        renderMaterials(allMaterials);
        updateMaterialCount(allMaterials.length);
    }, 500);
}

async function fetchMaterialsFromSupabase() {
    try {
        const { data, error } = await supabase
            .from('materials')
            .select('*')
            .eq('is_approved', true)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        allMaterials = data;
        renderMaterials(allMaterials);
        updateMaterialCount(allMaterials.length);
    } catch (error) {
        console.error('Error fetching materials:', error);
        // Fallback to demo data
        allMaterials = getDemoMaterials();
        renderMaterials(allMaterials);
    }
}

function renderMaterials(materials) {
    const materialsGrid = document.getElementById('materialsGrid');
    if (!materialsGrid) return;
    
    if (!materials || materials.length === 0) {
        materialsGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No materials found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }
    
    materialsGrid.innerHTML = materials.map(material => `
        <div class="material-card fade-in-up" data-id="${material.id}">
            <div class="material-icon">
                <i class="fas fa-file-${getFileIcon(material.file_type || material.type)}"></i>
            </div>
            <div class="material-title">${escapeHtml(material.title)}</div>
            <div class="material-meta">
                <span><i class="fas fa-code-branch"></i> ${material.course_code}</span>
                <span><i class="fas fa-graduation-cap"></i> ${material.level} Level</span>
            </div>
            <div class="material-meta">
                <span><i class="fas fa-user"></i> ${escapeHtml(material.uploader)}</span>
                <span><i class="fas fa-download"></i> ${formatNumber(material.downloads)}</span>
                <span><i class="fas fa-eye"></i> ${formatNumber(material.views)}</span>
            </div>
            <div class="material-description">${escapeHtml(material.description || '').substring(0, 80)}${material.description?.length > 80 ? '...' : ''}</div>
            <div class="material-actions">
                <button onclick="viewMaterial(${material.id})" class="action-btn view-btn">
                    <i class="fas fa-eye"></i> View
                </button>
                <button onclick="downloadMaterial(${material.id})" class="action-btn download-btn">
                    <i class="fas fa-download"></i> Download
                </button>
                <button onclick="toggleSaveMaterial(${material.id})" class="action-btn save-btn ${material.saved ? 'saved' : ''}">
                    <i class="fas fa-${material.saved ? 'bookmark' : 'bookmark-regular'}"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function getFileIcon(fileType) {
    const icons = {
        'pdf': 'pdf',
        'docx': 'word',
        'ppt': 'powerpoint',
        'pptx': 'powerpoint',
        'default': 'alt'
    };
    return icons[fileType] || icons.default;
}

function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateMaterialCount(count) {
    const countElement = document.getElementById('materialCount');
    if (countElement) {
        countElement.textContent = count;
    }
}

// ==================== FILTER FUNCTIONALITY ====================
function applyFilters() {
    let filtered = [...allMaterials];
    
    // Filter by level
    if (currentFilters.level) {
        filtered = filtered.filter(m => m.level === currentFilters.level);
    }
    
    // Filter by type
    if (currentFilters.type) {
        filtered = filtered.filter(m => m.type === currentFilters.type);
    }
    
    // Filter by course category
    if (currentFilters.course) {
        filtered = filtered.filter(m => m.course_code.startsWith(currentFilters.course));
    }
    
    // Filter by search
    if (currentFilters.search) {
        const searchTerm = currentFilters.search.toLowerCase();
        filtered = filtered.filter(m => 
            m.title.toLowerCase().includes(searchTerm) ||
            m.course_code.toLowerCase().includes(searchTerm) ||
            m.uploader.toLowerCase().includes(searchTerm) ||
            (m.tags && m.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );
    }
    
    renderMaterials(filtered);
    updateMaterialCount(filtered.length);
}

// ==================== RECENT UPLOADS ====================
function loadRecentUploads() {
    const recentContainer = document.getElementById('recentUploads');
    if (!recentContainer) return;
    
    const recentMaterials = [...allMaterials]
        .sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at))
        .slice(0, 5);
    
    recentContainer.innerHTML = recentMaterials.map(material => `
        <div class="recent-item" onclick="viewMaterial(${material.id})">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <i class="fas fa-file-${getFileIcon(material.file_type)}" style="font-size: 1.2rem;"></i>
                <div>
                    <div class="recent-title">${escapeHtml(material.title)}</div>
                    <div class="recent-meta">${material.course_code} • ${formatRelativeTime(material.uploaded_at)}</div>
                </div>
            </div>
            <button onclick="event.stopPropagation(); downloadMaterial(${material.id})" class="download-icon">
                <i class="fas fa-download"></i>
            </button>
        </div>
    `).join('');
}

function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
}

// ==================== SAVED MATERIALS ====================
function loadSavedMaterials() {
    const savedContainer = document.getElementById('savedMaterials');
    if (!savedContainer) return;
    
    const saved = allMaterials.filter(m => m.saved);
    savedMaterialsList = saved;
    
    if (saved.length === 0) {
        savedContainer.innerHTML = '<div class="empty-state">No saved materials yet. Click the bookmark icon on any material to save it.</div>';
        return;
    }
    
    savedContainer.innerHTML = saved.map(material => `
        <div class="saved-item">
            <div style="display: flex; align-items: center; gap: 1rem; flex: 1;" onclick="viewMaterial(${material.id})">
                <i class="fas fa-file-${getFileIcon(material.file_type)}"></i>
                <div>
                    <div class="saved-title">${escapeHtml(material.title)}</div>
                    <div class="saved-meta">${material.course_code}</div>
                </div>
            </div>
            <button onclick="unsaveMaterial(${material.id})" class="remove-saved">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
    `).join('');
}

function toggleSaveMaterial(materialId) {
    const material = allMaterials.find(m => m.id === materialId);
    if (material) {
        material.saved = !material.saved;
        
        if (material.saved) {
            showNotification('Material saved to your bookmarks!', 'success');
        } else {
            showNotification('Material removed from saved items', 'info');
        }
        
        // Re-render affected sections
        renderMaterials(applyFiltersResult());
        loadSavedMaterials();
    }
}

function unsaveMaterial(materialId) {
    const material = allMaterials.find(m => m.id === materialId);
    if (material) {
        material.saved = false;
        loadSavedMaterials();
        renderMaterials(applyFiltersResult());
        showNotification('Material removed from saved items', 'info');
    }
}

function applyFiltersResult() {
    let filtered = [...allMaterials];
    if (currentFilters.level) filtered = filtered.filter(m => m.level === currentFilters.level);
    if (currentFilters.type) filtered = filtered.filter(m => m.type === currentFilters.type);
    if (currentFilters.course) filtered = filtered.filter(m => m.course_code.startsWith(currentFilters.course));
    if (currentFilters.search) {
        const term = currentFilters.search.toLowerCase();
        filtered = filtered.filter(m => m.title.toLowerCase().includes(term));
    }
    return filtered;
}

// ==================== DOWNLOAD HISTORY ====================
function loadDownloadHistory() {
    const historyContainer = document.getElementById('downloadHistory');
    if (!historyContainer) return;
    
    // Load from localStorage or use demo data
    const savedHistory = localStorage.getItem('downloadHistory');
    if (savedHistory) {
        downloadHistoryList = JSON.parse(savedHistory);
    } else {
        downloadHistoryList = [
            { id: 1, title: 'Introduction to Biochemistry', course: 'BCH 201', date: '2025-02-15' },
            { id: 3, title: 'Enzyme Kinetics - Past Questions', course: 'BCH 302', date: '2025-02-14' },
            { id: 6, title: 'Practical Manual - Lab Techniques', course: 'BCH 205', date: '2025-02-12' }
        ];
    }
    
    if (downloadHistoryList.length === 0) {
        historyContainer.innerHTML = '<div class="empty-state">No download history yet. Download materials to see them here.</div>';
        return;
    }
    
    historyContainer.innerHTML = downloadHistoryList.slice(0, 5).map(item => `
        <div class="history-item" onclick="viewMaterial(${item.id})">
            <i class="fas fa-file-download"></i>
            <div>
                <div class="history-title">${escapeHtml(item.title)}</div>
                <div class="history-meta">${item.course} • Downloaded on ${new Date(item.date).toLocaleDateString()}</div>
            </div>
        </div>
    `).join('');
}

function addToDownloadHistory(materialId, materialTitle, courseCode) {
    const newEntry = {
        id: materialId,
        title: materialTitle,
        course: courseCode,
        date: new Date().toISOString().split('T')[0]
    };
    
    downloadHistoryList.unshift(newEntry);
    // Keep only last 20 items
    if (downloadHistoryList.length > 20) downloadHistoryList.pop();
    
    localStorage.setItem('downloadHistory', JSON.stringify(downloadHistoryList));
    loadDownloadHistory();
}

// ==================== MATERIAL ACTIONS ====================
window.viewMaterial = function(materialId) {
    const material = allMaterials.find(m => m.id === materialId);
    if (material) {
        // Increment views
        material.views = (material.views || 0) + 1;
        
        // Show material preview modal
        showMaterialPreview(material);
    }
};

window.downloadMaterial = function(materialId) {
    const material = allMaterials.find(m => m.id === materialId);
    if (material) {
        // Increment downloads
        material.downloads = (material.downloads || 0) + 1;
        
        // Add to download history
        addToDownloadHistory(materialId, material.title, material.course_code);
        
        // Simulate file download
        showNotification(`Downloading "${material.title}"...`, 'success');
        
        // In production, this would trigger actual file download
        setTimeout(() => {
            alert(`File would be downloaded: ${material.title}.${material.file_type}\n\nIn production, this would be served from Cloudinary.`);
        }, 500);
        
        // Update the displayed count
        renderMaterials(applyFiltersResult());
    }
};

window.toggleSaveMaterial = toggleSaveMaterial;
window.unsaveMaterial = unsaveMaterial;

function showMaterialPreview(material) {
    // Create modal for material preview
    const modal = document.createElement('div');
    modal.className = 'modal material-preview-modal';
    modal.innerHTML = `
        <div class="modal-content glass" style="max-width: 600px;">
            <span class="close-modal" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <div style="text-align: center; margin-bottom: 1rem;">
                <i class="fas fa-file-${getFileIcon(material.file_type)}" style="font-size: 3rem; color: var(--secondary);"></i>
            </div>
            <h2>${escapeHtml(material.title)}</h2>
            <div style="display: flex; gap: 1rem; margin: 1rem 0; flex-wrap: wrap;">
                <span class="badge"><i class="fas fa-code-branch"></i> ${material.course_code}</span>
                <span class="badge"><i class="fas fa-graduation-cap"></i> ${material.level} Level</span>
                <span class="badge"><i class="fas fa-user"></i> ${escapeHtml(material.uploader)}</span>
            </div>
            <p style="margin: 1rem 0;">${escapeHtml(material.description || 'No description available.')}</p>
            <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                <button class="btn-primary" onclick="downloadMaterial(${material.id}); this.closest('.modal').remove();">
                    <i class="fas fa-download"></i> Download
                </button>
                <button class="btn-outline" onclick="toggleSaveMaterial(${material.id}); this.closest('.modal').remove();">
                    <i class="fas fa-${material.saved ? 'bookmark' : 'bookmark-regular'}"></i> ${material.saved ? 'Saved' : 'Save'}
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

// ==================== NOTIFICATION SYSTEM ====================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
    `;
    
    // Add styles if not present
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: var(--glass-bg);
                backdrop-filter: blur(12px);
                border-radius: 12px;
                padding: 1rem 1.5rem;
                display: flex;
                align-items: center;
                gap: 1rem;
                z-index: 9999;
                animation: slideIn 0.3s ease-out;
                border-left: 4px solid;
                box-shadow: var(--shadow);
            }
            .notification-success { border-left-color: #2ecc71; }
            .notification-error { border-left-color: #e74c3c; }
            .notification-info { border-left-color: #3498db; }
            .notification-content { display: flex; align-items: center; gap: 0.5rem; }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

// ==================== RECOMMENDATIONS (AI FEATURE) ====================
function loadRecommendations() {
    const recommendationsContainer = document.getElementById('recommendations');
    if (!recommendationsContainer) return;
    
    // AI-based recommendations based on user's level and saved materials
    const userLevel = currentUser?.level || '300';
    const savedCourses = savedMaterialsList.map(m => m.course_code);
    
    // Find materials that match user's level and not already saved
    const recommended = allMaterials
        .filter(m => m.level === userLevel && !m.saved)
        .sort((a, b) => b.downloads - a.downloads)
        .slice(0, 3);
    
    if (recommended.length === 0) {
        recommendationsContainer.innerHTML = '<div class="empty-state">Check back later for personalized recommendations based on your interests.</div>';
        return;
    }
    
    recommendationsContainer.innerHTML = recommended.map(material => `
        <div class="recommendation-item" onclick="viewMaterial(${material.id})">
            <i class="fas fa-star" style="color: #f39c12;"></i>
            <div>
                <div class="rec-title">${escapeHtml(material.title)}</div>
                <div class="rec-meta">${material.course_code} • ${formatNumber(material.downloads)} downloads</div>
            </div>
            <button onclick="event.stopPropagation(); downloadMaterial(${material.id})" class="download-rec">
                <i class="fas fa-download"></i>
            </button>
        </div>
    `).join('');
}

// ==================== TIMETABLE ====================
function initializeTimetable() {
    const timetableContainer = document.getElementById('timetablePreview');
    if (!timetableContainer) return;
    
    const userLevel = currentUser?.level || '300';
    
    // Demo timetable data based on level
    const timetables = {
        '100': [
            { day: 'Monday', course: 'CHM 101', time: '9:00 AM', venue: 'LT1' },
            { day: 'Wednesday', course: 'BIO 101', time: '11:00 AM', venue: 'LT2' },
            { day: 'Friday', course: 'GST 101', time: '2:00 PM', venue: 'Hall A' }
        ],
        '200': [
            { day: 'Monday', course: 'BCH 201', time: '9:00 AM', venue: 'LT1' },
            { day: 'Tuesday', course: 'CHM 201', time: '10:00 AM', venue: 'Chem Lab' },
            { day: 'Thursday', course: 'BCH 205 (Practical)', time: '2:00 PM', venue: 'Biochem Lab' }
        ],
        '300': [
            { day: 'Monday', course: 'BCH 301', time: '9:00 AM', venue: 'LT1' },
            { day: 'Wednesday', course: 'BCH 302', time: '11:00 AM', venue: 'LT2' },
            { day: 'Friday', course: 'BCH 303', time: '2:00 PM', venue: 'Hall B' }
        ],
        '400': [
            { day: 'Monday', course: 'BCH 401', time: '9:00 AM', venue: 'LT1' },
            { day: 'Tuesday', course: 'BCH 402', time: '10:00 AM', venue: 'LT2' },
            { day: 'Thursday', course: 'Research Seminar', time: '2:00 PM', venue: 'Conference Room' }
        ],
        '500': [
            { day: 'Monday', course: 'Project Supervision', time: '10:00 AM', venue: 'Office' },
            { day: 'Wednesday', course: 'BCH 501', time: '1:00 PM', venue: 'LT1' },
            { day: 'Friday', course: 'Research Meeting', time: '3:00 PM', venue: 'Lab' }
        ]
    };
    
    const userTimetable = timetables[userLevel] || timetables['300'];
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayClasses = userTimetable.filter(t => t.day === today);
    
    let html = '';
    if (todayClasses.length > 0) {
        html = `<div class="today-section"><strong>Today's Classes (${today})</strong></div>`;
        todayClasses.forEach(t => {
            html += `
                <div class="timetable-item">
                    <span><i class="fas fa-clock"></i> ${t.time}</span>
                    <span><strong>${t.course}</strong></span>
                    <span><i class="fas fa-map-marker-alt"></i> ${t.venue}</span>
                </div>
            `;
        });
    }
    
    html += `<div class="week-preview"><strong>This Week's Schedule</strong></div>`;
    userTimetable.slice(0, 4).forEach(t => {
        html += `
            <div class="timetable-item">
                <span><i class="fas fa-calendar-day"></i> ${t.day}</span>
                <span>${t.course}</span>
                <span>${t.time}</span>
            </div>
        `;
    });
    
    timetableContainer.innerHTML = html;
    
    // Add styles if not present
    if (!document.querySelector('#timetable-styles')) {
        const style = document.createElement('style');
        style.id = 'timetable-styles';
        style.textContent = `
            .timetable-item {
                display: flex;
                justify-content: space-between;
                padding: 0.5rem 0;
                border-bottom: 1px solid var(--glass-border);
                font-size: 0.9rem;
            }
            .today-section {
                margin-bottom: 0.5rem;
                color: var(--secondary);
            }
            .week-preview {
                margin: 0.8rem 0 0.5rem;
            }
        `;
        document.head.appendChild(style);
    }
}

// ==================== ACADEMIC CALENDAR ====================
function initializeAcademicCalendar() {
    const calendarContainer = document.getElementById('academicCalendar');
    if (!calendarContainer) return;
    
    const events = [
        { date: '2025-03-15', title: 'Mid-Semester Exams Begin', type: 'exam' },
        { date: '2025-03-25', title: 'Mid-Semester Break', type: 'holiday' },
        { date: '2025-04-01', title: 'Lectures Resume', type: 'lecture' },
        { date: '2025-05-10', title: 'Final Exams Start', type: 'exam' },
        { date: '2025-06-05', title: 'End of Session', type: 'other' }
    ];
    
    const now = new Date();
    const upcomingEvents = events
        .filter(e => new Date(e.date) > now)
        .slice(0, 3);
    
    calendarContainer.innerHTML = upcomingEvents.map(event => `
        <div class="calendar-event event-${event.type}">
            <div class="event-date">${new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            <div class="event-title">${event.title}</div>
            <div class="event-type">${event.type}</div>
        </div>
    `).join('');
    
    // Add styles
    if (!document.querySelector('#calendar-styles')) {
        const style = document.createElement('style');
        style.id = 'calendar-styles';
        style.textContent = `
            .calendar-event {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.8rem;
                border-bottom: 1px solid var(--glass-border);
            }
            .event-date {
                font-weight: bold;
                color: var(--secondary);
            }
            .event-exam { border-left: 3px solid #e74c3c; }
            .event-holiday { border-left: 3px solid #f39c12; }
            .event-lecture { border-left: 3px solid #3498db; }
        `;
        document.head.appendChild(style);
    }
}

// ==================== CGPA CALCULATOR ====================
function addCourse() {
    const container = document.getElementById('coursesList');
    if (!container) return;
    
    const newCourse = document.createElement('div');
    newCourse.className = 'course-input';
    newCourse.innerHTML = `
        <input type="text" placeholder="Course Code" class="course-code-input" style="width: 35%;">
        <select class="grade-select" style="width: 30%;">
            <option value="5.0">A (5.0)</option>
            <option value="4.0">B (4.0)</option>
            <option value="3.0">C (3.0)</option>
            <option value="2.0">D (2.0)</option>
            <option value="1.0">E (1.0)</option>
            <option value="0.0">F (0.0)</option>
        </select>
        <input type="number" placeholder="Credits" class="credit-input" style="width: 20%;" value="3" min="1" max="6">
        <button onclick="removeCourse(this)" class="remove-course"><i class="fas fa-trash-alt"></i></button>
    `;
    container.appendChild(newCourse);
}

function removeCourse(button) {
    button.parentElement.remove();
}

function calculateCGPA() {
    const courses = document.querySelectorAll('#coursesList .course-input');
    let totalPoints = 0;
    let totalCredits = 0;
    
    courses.forEach(course => {
        const gradeSelect = course.querySelector('.grade-select');
        const creditInput = course.querySelector('.credit-input');
        
        if (gradeSelect && creditInput) {
            const grade = parseFloat(gradeSelect.value);
            const credits = parseFloat(creditInput.value);
            
            if (!isNaN(grade) && !isNaN(credits) && credits > 0) {
                totalPoints += grade * credits;
                totalCredits += credits;
            }
        }
    });
    
    const cgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
    const resultDiv = document.getElementById('cgpaResult');
    
    let gradeClass = '';
    let message = '';
    if (cgpa >= 4.5) {
        gradeClass = 'first-class';
        message = 'Excellent! First Class Honours';
    } else if (cgpa >= 3.5) {
        gradeClass = 'second-class-upper';
        message = 'Good! Second Class Upper';
    } else if (cgpa >= 2.5) {
        gradeClass = 'second-class-lower';
        message = 'Second Class Lower';
    } else if (cgpa >= 1.5) {
        gradeClass = 'third-class';
        message = 'Third Class';
    } else {
        gradeClass = 'pass';
        message = 'Pass';
    }
    
    resultDiv.innerHTML = `
        <div class="cgpa-result ${gradeClass}">
            <span class="cgpa-value">${cgpa}</span>
            <span class="cgpa-message">/ 5.0 - ${message}</span>
        </div>
    `;
    
    // Save to localStorage
    const cgpaData = {
        cgpa: cgpa,
        totalCredits: totalCredits,
        coursesCount: courses.length,
        calculatedAt: new Date().toISOString()
    };
    localStorage.setItem('lastCgpaCalculation', JSON.stringify(cgpaData));
}

// ==================== VIEW FULL TIMETABLE ====================
function viewFullTimetable() {
    const userLevel = currentUser?.level || '300';
    
    const timetables = {
        '100': [
            { day: 'Monday', courses: [{ code: 'CHM 101', name: 'General Chemistry I', time: '9:00-11:00', venue: 'LT1' }] },
            { day: 'Tuesday', courses: [{ code: 'BIO 101', name: 'General Biology I', time: '10:00-12:00', venue: 'LT2' }] },
            { day: 'Wednesday', courses: [{ code: 'GST 101', name: 'Communication Skills', time: '9:00-11:00', venue: 'Hall A' }] },
            { day: 'Thursday', courses: [{ code: 'MTH 101', name: 'Mathematics', time: '11:00-13:00', venue: 'LT1' }] },
            { day: 'Friday', courses: [{ code: 'CHM 103', name: 'Chemistry Practical', time: '14:00-17:00', venue: 'Chem Lab' }] }
        ],
        '200': [
            { day: 'Monday', courses: [{ code: 'BCH 201', name: 'Intro to Biochemistry', time: '9:00-11:00', venue: 'LT1' }] },
            { day: 'Tuesday', courses: [{ code: 'CHM 201', name: 'Organic Chemistry', time: '10:00-12:00', venue: 'LT2' }] },
            { day: 'Wednesday', courses: [{ code: 'BIO 201', name: 'Genetics', time: '9:00-11:00', venue: 'LT1' }] },
            { day: 'Thursday', courses: [{ code: 'BCH 205', name: 'Biochemistry Practical', time: '14:00-17:00', venue: 'Biochem Lab' }] },
            { day: 'Friday', courses: [{ code: 'GST 201', name: 'Nigerian Heritage', time: '11:00-13:00', venue: 'Hall B' }] }
        ],
        '300': [
            { day: 'Monday', courses: [{ code: 'BCH 301', name: 'Protein Structure', time: '9:00-11:00', venue: 'LT1' }] },
            { day: 'Tuesday', courses: [{ code: 'BCH 302', name: 'Enzyme Kinetics', time: '10:00-12:00', venue: 'LT2' }] },
            { day: 'Wednesday', courses: [{ code: 'BCH 303', name: 'Metabolism I', time: '9:00-11:00', venue: 'LT1' }] },
            { day: 'Thursday', courses: [{ code: 'BCH 305', name: 'Molecular Biology', time: '11:00-13:00', venue: 'LT2' }] },
            { day: 'Friday', courses: [{ code: 'BCH 307', name: 'Biochemistry Practical', time: '14:00-17:00', venue: 'Biochem Lab' }] }
        ],
        '400': [
            { day: 'Monday', courses: [{ code: 'BCH 401', name: 'Advanced Enzymology', time: '9:00-11:00', venue: 'LT1' }] },
            { day: 'Tuesday', courses: [{ code: 'BCH 402', name: 'Metabolism II', time: '10:00-12:00', venue: 'LT2' }] },
            { day: 'Wednesday', courses: [{ code: 'BCH 403', name: 'Research Methods', time: '9:00-11:00', venue: 'LT1' }] },
            { day: 'Thursday', courses: [{ code: 'BCH 405', name: 'Seminar', time: '13:00-15:00', venue: 'Conference Rm' }] },
            { day: 'Friday', courses: [{ code: 'BCH 407', name: 'Project Work', time: '14:00-17:00', venue: 'Research Lab' }] }
        ],
        '500': [
            { day: 'Monday', courses: [{ code: 'BCH 501', name: 'Advanced Research', time: '10:00-12:00', venue: 'LT1' }] },
            { day: 'Wednesday', courses: [{ code: 'BCH 502', name: 'Seminar Series', time: '13:00-15:00', venue: 'Conference Rm' }] },
            { day: 'Friday', courses: [{ code: 'BCH 598', name: 'Project Defense Prep', time: '14:00-17:00', venue: 'Lab' }] }
        ]
    };
    
    const levelTimetable = timetables[userLevel] || timetables['300'];
    
    let modalContent = `
        <div class="modal-content glass" style="max-width: 800px; max-height: 80vh; overflow-y: auto;">
            <span class="close-modal" onclick="this.closest('.modal').remove()">&times;</span>
            <h2><i class="fas fa-calendar-alt"></i> Full Weekly Timetable - ${userLevel} Level</h2>
            <div class="full-timetable">
    `;
    
    levelTimetable.forEach(day => {
        modalContent += `
            <div class="timetable-day">
                <h3 class="day-header">${day.day}</h3>
                ${day.courses.map(course => `
                    <div class="timetable-course">
                        <div class="course-code">${course.code}</div>
                        <div class="course-name">${course.name}</div>
                        <div class="course-time"><i class="fas fa-clock"></i> ${course.time}</div>
                        <div class="course-venue"><i class="fas fa-map-marker-alt"></i> ${course.venue}</div>
                    </div>
                `).join('')}
            </div>
        `;
    });
    
    modalContent += `
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = modalContent;
    document.body.appendChild(modal);
    
    // Add styles
    if (!document.querySelector('#timetable-modal-styles')) {
        const style = document.createElement('style');
        style.id = 'timetable-modal-styles';
        style.textContent = `
            .full-timetable {
                display: grid;
                gap: 1rem;
                margin-top: 1rem;
            }
            .timetable-day {
                background: rgba(255,255,255,0.05);
                border-radius: 12px;
                padding: 1rem;
            }
            .day-header {
                color: var(--secondary);
                margin-bottom: 0.8rem;
                border-bottom: 2px solid var(--secondary);
                display: inline-block;
            }
            .timetable-course {
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 0.5rem;
                padding: 0.5rem 0;
                border-bottom: 1px solid var(--glass-border);
            }
            .course-code {
                font-weight: bold;
                min-width: 80px;
            }
            .course-name {
                flex: 1;
            }
            .course-time, .course-venue {
                font-size: 0.85rem;
                opacity: 0.8;
            }
        `;
        document.head.appendChild(style);
    }
}

// ==================== DISCUSSION FORUM ====================
function viewDiscussionForum() {
    showNotification('Discussion Forum - In production, this would load forum posts and discussions.', 'info');
    alert('Discussion Forum Feature\n\nThis would include:\n- Create new discussion posts\n- Comment on existing posts\n- Upvote/downvote system\n- Course-specific discussion threads\n- Lecturer Q&A sections');
}

// ==================== LOGOUT FUNCTION ====================
function handleLogout() {
    if (window.demoMode) {
        localStorage.removeItem('umyu_user');
        window.location.href = 'index.html';
    } else if (window.supabase) {
        supabase.auth.signOut().then(() => {
            window.location.href = 'index.html';
        });
    } else {
        localStorage.removeItem('umyu_user');
        window.location.href = 'index.html';
    }
}

// ==================== LOAD USER DATA ====================
function loadUserData() {
    // Load user stats
    const statsContainer = document.getElementById('userStats');
    if (statsContainer) {
        const downloadCount = downloadHistoryList.length;
        const savedCount = savedMaterialsList.length;
        
        statsContainer.innerHTML = `
            <div class="stat-badge"><i class="fas fa-download"></i> ${downloadCount} Downloads</div>
            <div class="stat-badge"><i class="fas fa-bookmark"></i> ${savedCount} Saved</div>
        `;
    }
}

// ==================== EXPORT FUNCTIONS FOR GLOBAL USE ====================
window.addCourse = addCourse;
window.removeCourse = removeCourse;
window.calculateCGPA = calculateCGPA;
window.viewFullTimetable = viewFullTimetable;
window.viewDiscussionForum = viewDiscussionForum;