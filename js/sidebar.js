function loadSidebar() {
    console.log('Loading sidebar...');
    fetch('/sidebar.html')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            console.log('Sidebar loaded successfully');
            document.body.insertAdjacentHTML('afterbegin', data);
            
            // Add event listeners to all sidebar links
            const sidebarLinks = document.querySelectorAll('#mySidebar a');
            sidebarLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    // Store the state before navigation
                    localStorage.setItem('sidebarOpen', 'true');
                    console.log('Saving sidebar state:', true);
                });
            });

            // Set initial state if it doesn't exist
            if (!localStorage.getItem('sidebarOpen')) {
                localStorage.setItem('sidebarOpen', 'false');
            }

            // Restore sidebar state
            const sidebarOpen = localStorage.getItem('sidebarOpen') === 'true';
            console.log('Loading sidebar state:', sidebarOpen);
            
            const sidebar = document.getElementById("mySidebar");
            const main = document.getElementById("main");
            
            if (sidebarOpen) {
                sidebar.style.width = "250px";
                main.style.marginLeft = "250px";
            } else {
                sidebar.style.width = "0";
                main.style.marginLeft = "0";
            }
        })
        .catch(error => {
            console.error('Error loading sidebar:', error);
            const fallbackButton = `
                <div id="mySidebar" class="sidebar">
                    <a href="index.html">Home</a>
                    <a href="page1.html">Page 1</a>
                </div>
                <span class="menu-btn" onclick="toggleNav()">☰</span>
            `;
            document.body.insertAdjacentHTML('afterbegin', fallbackButton);
        });
}

function toggleNav() {
    const sidebar = document.getElementById("mySidebar");
    const main = document.getElementById("main");
    const isOpen = sidebar.style.width === "250px";
    
    if (isOpen) {
        sidebar.style.width = "0";
        main.style.marginLeft = "0";
        localStorage.setItem('sidebarOpen', 'false');
        console.log('Toggled sidebar closed');
    } else {
        sidebar.style.width = "250px";
        main.style.marginLeft = "250px";
        localStorage.setItem('sidebarOpen', 'true');
        console.log('Toggled sidebar open');
    }
}

// Initialize sidebar when DOM is ready
document.addEventListener('DOMContentLoaded', loadSidebar);