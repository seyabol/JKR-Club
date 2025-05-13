// /public/js/main.js

export function toggleDropdown() {
  const menu = document.getElementById('dropdownMenu');
  menu.classList.toggle('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('dropdownToggle');
  toggleBtn?.addEventListener('click', toggleDropdown);

  document.addEventListener('click', (e) => {
    const menu = document.getElementById('dropdownMenu');
    if (!menu.contains(e.target) && !toggleBtn.contains(e.target)) {
      menu.classList.add('hidden');
    }
  });
});
