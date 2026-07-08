document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const companyGrid = document.getElementById('companyGrid');
    const resultsCount = document.getElementById('resultsCount');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const globalLoader = document.getElementById('globalLoader');

    let companiesData = [];
    let currentFilter = 'all';

    // Initialize the app
    async function init() {
        // MOCK_COMPANIES comes from mockData.js
        // In a real scenario, this would be a fetch() call to a backend API or CSV
        companiesData = MOCK_COMPANIES.map(company => ({
            ...company,
            workspaceStatus: 'checking' // 'checking', 'gw-user', 'gw-opportunity', 'error'
        }));

        renderCompanies(companiesData);
        await checkAllDomains();
    }

    // Function to check MX records using Google DNS API
    async function checkGoogleWorkspace(domain) {
        try {
            const response = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
            const data = await response.json();
            
            if (data.Status !== 0 || !data.Answer) {
                // No MX records found or DNS error
                return 'gw-opportunity';
            }

            // Check if any MX record data points to google.com
            const isWorkspace = data.Answer.some(record => {
                if (record.type === 15) { // MX record type
                    const mxTarget = record.data.toLowerCase();
                    return mxTarget.includes('google.com') || mxTarget.includes('googlemail.com');
                }
                return false;
            });

            return isWorkspace ? 'gw-user' : 'gw-opportunity';
        } catch (error) {
            console.error(`Error checking domain ${domain}:`, error);
            return 'error';
        }
    }

    // Check all domains sequentially or in parallel
    async function checkAllDomains() {
        globalLoader.classList.remove('hidden');
        
        // Use Promise.all to check them concurrently (for performance)
        const checkPromises = companiesData.map(async (company, index) => {
            const status = await checkGoogleWorkspace(company.domain);
            companiesData[index].workspaceStatus = status;
            
            // Re-render the specific card
            updateCompanyCard(company.id, status);
        });

        await Promise.all(checkPromises);
        globalLoader.classList.add('hidden');
        
        // Re-apply filter in case it was changed during loading
        applyFilterAndSearch();
    }

    function createCompanyCardHTML(company) {
        let statusBadge = '';
        switch(company.workspaceStatus) {
            case 'checking':
                statusBadge = '<div class="status-badge status-checking"><div class="spinner"></div> Checking...</div>';
                break;
            case 'gw-user':
                statusBadge = '<div class="status-badge status-workspace"><i class="fa-solid fa-check-circle"></i> Uses Workspace</div>';
                break;
            case 'gw-opportunity':
                statusBadge = '<div class="status-badge status-opportunity"><i class="fa-solid fa-star"></i> Opportunity</div>';
                break;
            case 'error':
                statusBadge = '<div class="status-badge status-error"><i class="fa-solid fa-triangle-exclamation"></i> DNS Error</div>';
                break;
        }

        return `
            <div class="company-card" id="card-${company.id}">
                <div class="card-header">
                    <div>
                        <h3 class="company-name">${company.name}</h3>
                    </div>
                    <span class="industry-badge">${company.industry}</span>
                </div>
                <div class="card-body">
                    <div class="info-row">
                        <i class="fa-solid fa-globe"></i>
                        <a href="https://${company.domain}" target="_blank" rel="noopener noreferrer">${company.domain}</a>
                    </div>
                    <div class="info-row">
                        <i class="fa-solid fa-location-dot"></i>
                        <span>${company.location}</span>
                    </div>
                    <div id="status-${company.id}">
                        ${statusBadge}
                    </div>
                </div>
            </div>
        `;
    }

    function updateCompanyCard(companyId, status) {
        const statusContainer = document.getElementById(`status-${companyId}`);
        if (!statusContainer) return;

        let statusBadge = '';
        switch(status) {
            case 'gw-user':
                statusBadge = '<div class="status-badge status-workspace"><i class="fa-solid fa-check-circle"></i> Uses Workspace</div>';
                break;
            case 'gw-opportunity':
                statusBadge = '<div class="status-badge status-opportunity"><i class="fa-solid fa-star"></i> Opportunity</div>';
                break;
            case 'error':
                statusBadge = '<div class="status-badge status-error"><i class="fa-solid fa-triangle-exclamation"></i> DNS Error</div>';
                break;
        }
        statusContainer.innerHTML = statusBadge;
    }

    function renderCompanies(data) {
        if (data.length === 0) {
            companyGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-secondary);">No companies found matching your criteria.</div>';
        } else {
            companyGrid.innerHTML = data.map(company => createCompanyCardHTML(company)).join('');
        }
        resultsCount.textContent = `${data.length} Companies Found`;
    }

    function applyFilterAndSearch() {
        const query = searchInput.value.toLowerCase();
        
        const filtered = companiesData.filter(company => {
            // Search match
            const matchesSearch = company.name.toLowerCase().includes(query) || 
                                  company.domain.toLowerCase().includes(query) || 
                                  company.industry.toLowerCase().includes(query);
            
            // Filter match
            let matchesFilter = true;
            if (currentFilter !== 'all') {
                matchesFilter = company.workspaceStatus === currentFilter;
            }

            return matchesSearch && matchesFilter;
        });

        renderCompanies(filtered);
    }

    // Event Listeners
    searchInput.addEventListener('input', applyFilterAndSearch);
    searchBtn.addEventListener('click', applyFilterAndSearch);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update active class
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            // Update filter
            currentFilter = e.target.getAttribute('data-filter');
            applyFilterAndSearch();
        });
    });

    // Start
    init();
});
