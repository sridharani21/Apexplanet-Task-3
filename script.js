
        const API_KEY = "f4c5f5fd12434940968b3a806fdca07e";
        const BASE_URL = "https://newsapi.org/v2/everything?q=";
        
        let currentCategory = 'technology';
        let articles = [];

        
        const newsGrid = document.getElementById('news-grid');
        const loading = document.getElementById('loading');
        const sectionTitle = document.getElementById('section-title');
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        const mobileSearchInput = document.getElementById('mobile-search-input');
        const mobileSearchBtn = document.getElementById('mobile-search-btn');
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileNav = document.getElementById('mobile-nav');

        
        document.addEventListener('DOMContentLoaded', () => {
            fetchNews('technology');
            setupEventListeners();
        });

        function setupEventListeners() {
            
            document.querySelectorAll('.nav-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const category = e.target.dataset.category;
                    if (category) {
                        setActiveCategory(category);
                        fetchNews(category);
                        currentCategory = category;
                        
                      
                        mobileNav.classList.remove('active');
                    }
                });
            });

      
            searchBtn.addEventListener('click', performSearch);
            mobileSearchBtn.addEventListener('click', () => {
                const query = mobileSearchInput.value.trim();
                if (query) {
                    searchNews(query);
                    mobileNav.classList.remove('active');
                }
            });

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') performSearch();
            });

            mobileSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = mobileSearchInput.value.trim();
                    if (query) {
                        searchNews(query);
                        mobileNav.classList.remove('active');
                    }
                }
            });

      
            mobileMenuBtn.addEventListener('click', () => {
                mobileNav.classList.toggle('active');
            });

           
            document.addEventListener('click', (e) => {
                if (!e.target.closest('nav')) {
                    mobileNav.classList.remove('active');
                }
            });
        }

        function performSearch() {
            const query = searchInput.value.trim();
            if (query) {
                searchNews(query);
            }
        }

        function setActiveCategory(category) {
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
                if (item.dataset.category === category) {
                    item.classList.add('active');
                }
            });
        }

        async function fetchNews(category) {
            showLoading();
            sectionTitle.textContent = `Latest ${category.charAt(0).toUpperCase() + category.slice(1)} News`;
            
            try {
                const response = await fetch(`${BASE_URL}${category}&sortBy=publishedAt&pageSize=20&apiKey=${API_KEY}`);
                const data = await response.json();
                
                if (data.status === 'ok') {
                    articles = data.articles.filter(article => 
                        article.urlToImage && 
                        article.title && 
                        article.description &&
                        !article.title.includes('[Removed]')
                    );
                    displayNews(articles);
                } else {
                    showError('Failed to fetch news. Please try again later.');
                }
            } catch (error) {
                console.error('Error fetching news:', error);
                showError('Network error. Please check your connection.');
            }
        }

        async function searchNews(query) {
            showLoading();
            sectionTitle.textContent = `Search Results for "${query}"`;
            clearActiveCategory();
            
            try {
                const response = await fetch(`${BASE_URL}${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=20&apiKey=${API_KEY}`);
                const data = await response.json();
                
                if (data.status === 'ok') {
                    articles = data.articles.filter(article => 
                        article.urlToImage && 
                        article.title && 
                        article.description &&
                        !article.title.includes('[Removed]')
                    );
                    displayNews(articles);
                } else {
                    showError('No results found. Try a different search term.');
                }
            } catch (error) {
                console.error('Error searching news:', error);
                showError('Search failed. Please try again.');
            }
        }

        function clearActiveCategory() {
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
        }

        function showLoading() {
            loading.style.display = 'flex';
            newsGrid.innerHTML = '';
        }

        function hideLoading() {
            loading.style.display = 'none';
        }

        function displayNews(articles) {
            hideLoading();
            
            if (articles.length === 0) {
                newsGrid.innerHTML = '<div style="text-align: center; color: var(--text-secondary); font-size: 1.125rem;">No news articles found.</div>';
                return;
            }

            newsGrid.innerHTML = articles.map(article => createNewsCard(article)).join('');
            
            
            document.querySelectorAll('.news-card').forEach((card, index) => {
                card.addEventListener('click', () => {
                    window.open(articles[index].url, '_blank');
                });
            });
        }

        function createNewsCard(article) {
            const publishedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            const title = article.title.length > 80 ? article.title.substring(0, 80) + '...' : article.title;
            const description = article.description.length > 150 ? article.description.substring(0, 150) + '...' : article.description;

            return `
                <div class="news-card">
                    <img src="${article.urlToImage}" alt="News image" class="card-image" onerror="this.src='https://via.placeholder.com/400x200/404040/ffffff?text=No+Image'">
                    <div class="card-content">
                        <h3 class="card-title">${title}</h3>
                        <div class="card-meta">
                            <span>${article.source.name}</span>
                            <span>•</span>
                            <span>${publishedDate}</span>
                        </div>
                        <p class="card-description">${description}</p>
                    </div>
                </div>
            `;
        }

        function showError(message) {
            hideLoading();
            newsGrid.innerHTML = `<div style="text-align: center; color: var(--text-secondary); font-size: 1.125rem;">${message}</div>`;
        }
