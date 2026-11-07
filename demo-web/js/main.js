// Minimal scripts for Life Coach Đức Hiếu
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.mobile-toggle');
  const menu = document.querySelector('.nav-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', () => menu.classList.toggle('open'));
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));
  }

  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Cảm ơn bạn! Yêu cầu tư vấn đã được gửi thành công.');
      form.reset();
    });
  }

  const btnSwarm = document.getElementById('btnSwarm');
  if (btnSwarm) {
    btnSwarm.addEventListener('click', () => {
      if (window.__swarmRebuild) {
        window.__swarmRebuild.toggle();
      }
    });
  }
});
