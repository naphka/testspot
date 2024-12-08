document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.querySelector('.menu-btn');
    const sidebar = document.querySelector('.sidebar');
    const main = document.getElementById('main');
    let isOpen = false;

    function toggleSidebar() {
        if (isOpen) {
            sidebar.style.width = "0";
            main.style.marginLeft = "0";
            menuBtn.classList.remove('open');
        } else {
            sidebar.style.width = "250px";
            main.style.marginLeft = "250px";
            menuBtn.classList.add('open');
        }
        isOpen = !isOpen;
    }

    menuBtn.addEventListener('click', toggleSidebar);

    // Open sidebar by default
    toggleSidebar();
});