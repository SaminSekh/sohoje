// Sidebar toggle (mobile)
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const menuCloseBtns = document.querySelectorAll('.menuClose');

// Open / Toggle
menuBtn.addEventListener('click', () => {
  sidebar.classList.toggle('open');
});

// Close (for all close buttons)
menuCloseBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    sidebar.classList.remove('open');
  });
});



    // Theme toggle with localStorage
    const themeBtn = document.getElementById('themeBtn');
    const themeLabel = document.getElementById('themeLabel');

    function setTheme(mode){
      document.documentElement.setAttribute('data-theme', mode);
      localStorage.setItem('theme', mode);
      themeLabel.textContent = (mode === 'dark') ? 'লাইট' : 'ডার্ক';
    }
    const saved = localStorage.getItem('theme');
    setTheme(saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

    themeBtn.addEventListener('click', ()=>{
      const current = document.documentElement.getAttribute('data-theme');
      setTheme(current === 'light' ? 'dark' : 'light');
    });

    // Accessible Accordion
    const headers = document.querySelectorAll('.accordion-header');

    headers.forEach((btn) => {
      btn.addEventListener('click', () => togglePanel(btn));
      btn.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); togglePanel(btn); }
      });
    });

    function togglePanel(btn){
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const panelId = btn.getAttribute('aria-controls');
      const panel = document.getElementById(panelId);

      // Close others (optional)
      document.querySelectorAll('.accordion-header').forEach(h=>{
        if(h!==btn){ h.setAttribute('aria-expanded','false'); }
      });
      document.querySelectorAll('.accordion-panel').forEach(p=>{
        if(p!==panel){ p.classList.remove('open'); }
      });

      btn.setAttribute('aria-expanded', String(!expanded));
      panel.classList.toggle('open');

      // Smooth scroll into view when opened on mobile
      if(!expanded){
        setTimeout(()=>{ panel.scrollIntoView({behavior:'smooth', block:'nearest'}); }, 100);
      }
    }