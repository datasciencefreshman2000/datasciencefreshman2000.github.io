const icons = () => window.lucide?.createIcons();
icons();
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
function closeMenu() {
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', '開啟選單');
}
menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
});
nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menuButton.focus(); }
});
matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  if (!reduceMotion.matches) document.body.classList.add('motion-ready');
}
const sections = [...document.querySelectorAll('main > section')];
const progress = document.querySelector('.reading-progress');
const backTop = document.querySelector('.back-top');
let scrollScheduled = false;
function updateScroll() {
  const distance = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${distance > 0 ? Math.min(1, scrollY / distance) : 0})`;
  backTop.classList.toggle('visible', scrollY > 600);
  const current = [...sections].reverse().find(section => section.getBoundingClientRect().top <= 150);
  nav.querySelectorAll('a').forEach(link => {
    if (current && link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  scrollScheduled = false;
}
addEventListener('scroll', () => {
  if (!scrollScheduled) { requestAnimationFrame(updateScroll); scrollScheduled = true; }
}, { passive: true });
addEventListener('resize', updateScroll);
updateScroll();
const slides = [
  { src: 'assets/bartending.jpg', alt: '蔡加恩在吧台前調酒', category: 'OFF THE SCREEN', title: '吧台前的專注', description: '調酒，也是觀察與練習的過程。', position: 'center 55%' },
  { src: 'assets/work.jpg', alt: '蔡加恩在電腦教室與學員一同操作電腦', category: 'LEARNING TOGETHER', title: '一起學習的時刻', description: '把自己的理解，變成能一起討論的內容。', position: '42% center' },
  { src: 'assets/club.jpg', alt: '蔡加恩在東吳調酒社活動中示範調酒', category: 'PEOPLE & COMMUNITY', title: '社團裡的交流', description: '從活動與合作中，累積課堂之外的經驗。', position: 'center 35%' }
];
const gallery = document.querySelector('.gallery');
const photo = document.querySelector('#gallery-photo');
const thumbs = [...document.querySelectorAll('.thumbnail')];
const playButton = document.querySelector('#gallery-play');
const dialog = document.querySelector('#photo-dialog');
let index = 0;
let playing = !reduceMotion.matches;
let timer;
let inView = false;
function showSlide(next, announce = false) {
  index = (next + slides.length) % slides.length;
  const slide = slides[index];
  photo.src = slide.src;
  photo.alt = slide.alt;
  photo.style.objectPosition = slide.position;
  if (!reduceMotion.matches) photo.animate([{ opacity: .35, transform: 'scale(1.025)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 450, easing: 'ease-out' });
  document.querySelector('#gallery-category').textContent = slide.category;
  document.querySelector('#gallery-title').textContent = slide.title;
  document.querySelector('#gallery-description').textContent = slide.description;
  document.querySelector('#gallery-current').textContent = String(index + 1).padStart(2, '0');
  thumbs.forEach((thumb, i) => { thumb.classList.toggle('active', i === index); thumb.setAttribute('aria-pressed', String(i === index)); });
  if (announce) document.querySelector('#gallery-announcement').textContent = `第 ${index + 1} 張：${slide.title}`;
}
// Auto-play pauses while the gallery is off screen or the user is interacting.
function syncTimer() {
  clearInterval(timer);
  if (playing && inView && !document.hidden && !dialog.open && !gallery.matches(':hover') && !gallery.contains(document.activeElement)) {
    timer = setInterval(() => showSlide(index + 1), 5500);
  }
}
function updatePlayButton() {
  const label = playing ? '暫停自動輪播' : '開始自動輪播';
  playButton.setAttribute('aria-label', label);
  playButton.title = label;
  playButton.innerHTML = `<i data-lucide="${playing ? 'pause' : 'play'}"></i>`;
  icons();
}
function manualSlide(next) { playing = false; showSlide(next, true); updatePlayButton(); syncTimer(); }
document.querySelector('#gallery-prev').addEventListener('click', () => manualSlide(index - 1));
document.querySelector('#gallery-next').addEventListener('click', () => manualSlide(index + 1));
thumbs.forEach((thumb, i) => thumb.addEventListener('click', () => manualSlide(i)));
playButton.addEventListener('click', () => { playing = !playing; updatePlayButton(); syncTimer(); });
gallery.addEventListener('mouseenter', syncTimer);
gallery.addEventListener('mouseleave', syncTimer);
gallery.addEventListener('focusin', syncTimer);
gallery.addEventListener('focusout', () => setTimeout(syncTimer, 0));
document.addEventListener('visibilitychange', syncTimer);
gallery.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); manualSlide(index + (event.key === 'ArrowRight' ? 1 : -1)); }
});
let touchStart;
let swiped = false;
document.querySelector('.photo-open').addEventListener('touchstart', event => { touchStart = event.changedTouches[0].clientX; swiped = false; }, { passive: true });
document.querySelector('.photo-open').addEventListener('touchend', event => {
  if (touchStart === undefined) return;
  const delta = event.changedTouches[0].clientX - touchStart;
  if (Math.abs(delta) > 60) { swiped = true; manualSlide(index + (delta < 0 ? 1 : -1)); }
  touchStart = undefined;
}, { passive: true });
if ('IntersectionObserver' in window) {
  new IntersectionObserver(entries => { inView = entries[0].isIntersecting; syncTimer(); }, { threshold: .25 }).observe(gallery);
} else { inView = true; syncTimer(); }
reduceMotion.addEventListener('change', event => {
  if (event.matches) { playing = false; document.body.classList.remove('motion-ready'); updatePlayButton(); syncTimer(); }
});
updatePlayButton();
document.querySelector('.photo-open').addEventListener('click', () => {
  if (swiped) { swiped = false; return; }
  const slide = slides[index];
  document.querySelector('#dialog-photo').src = slide.src;
  document.querySelector('#dialog-photo').alt = slide.alt;
  document.querySelector('#dialog-caption').textContent = slide.title;
  dialog.showModal();
  document.body.classList.add('modal-open');
  syncTimer();
});
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); syncTimer(); });
