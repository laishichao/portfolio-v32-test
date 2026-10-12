const navLinks = [...document.querySelectorAll('.topbar nav a')];
const sections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      navLinks.forEach(link => link.removeAttribute('aria-current'));
      const active = navLinks.find(link => link.getAttribute('href') === `#${entry.target.id}`);
      if (active) active.setAttribute('aria-current', 'true');
    }
  }, { rootMargin: '-25% 0px -65% 0px' });
  sections.forEach(section => observer.observe(section));
}

const portfolioImages = [...document.querySelectorAll('main img')];
const lightbox = document.createElement('dialog');
lightbox.className = 'lightbox';
lightbox.setAttribute('aria-label', '图片放大预览');
lightbox.innerHTML = `
  <button class="lightbox-close" type="button" aria-label="关闭预览">×</button>
  <img alt="">
  <p></p>
`;
document.body.append(lightbox);

const lightboxImage = lightbox.querySelector('img');
const lightboxCaption = lightbox.querySelector('p');
const closeLightbox = () => lightbox.close();

portfolioImages.forEach(image => {
  image.classList.add('zoomable');
  image.tabIndex = 0;
  image.setAttribute('role', 'button');
  image.setAttribute('aria-label', `${image.alt || '作品图片'}，点击放大`);

  const openImage = () => {
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt || '作品图片放大预览';
    lightboxCaption.textContent = image.alt || '';
    lightbox.showModal();
  };

  image.addEventListener('click', openImage);
  image.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openImage();
    }
  });
});

lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', event => {
  if (event.target === lightbox) closeLightbox();
});

window.addEventListener('load', () => {
  if (!window.location.hash) return;
  const target = document.querySelector(window.location.hash);
  if (target) target.scrollIntoView({ block: 'start' });
});
