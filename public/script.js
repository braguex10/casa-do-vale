// Opening intro + hero reveal
const intro = document.getElementById('intro');
const hero = document.querySelector('.hero');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function revealHero() {
  hero.classList.add('in-view');
}

if (intro) {
  if (prefersReducedMotion) {
    intro.remove();
    revealHero();
  } else {
    document.documentElement.classList.add('intro-active');
    setTimeout(() => {
      intro.classList.add('intro-hide');
      document.documentElement.classList.remove('intro-active');
      revealHero();
    }, 1500);
    intro.addEventListener('transitionend', (e) => {
      if (e.propertyName === 'transform') intro.remove();
    });
  }
} else {
  revealHero();
}

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Fade-in on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Booking form — submits to the backend, which emails the request
const form = document.getElementById('bookingForm');
const note = document.getElementById('formNote');
const submitBtn = form.querySelector('.btn-submit');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());

  if (data.checkin && data.checkout && data.checkout <= data.checkin) {
    note.textContent = 'A data de check-out deve ser posterior à de check-in.';
    note.style.color = '#e07a5f';
    return;
  }

  const originalLabel = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'A enviar...';
  note.textContent = '';

  try {
    const res = await fetch('/api/reservar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();

    if (result.ok) {
      note.textContent = 'Pedido enviado! Entraremos em contacto brevemente.';
      note.style.color = 'var(--accent)';
      form.reset();
    } else {
      note.textContent = result.error || 'Não foi possível enviar o pedido.';
      note.style.color = '#e07a5f';
    }
  } catch (err) {
    note.textContent = 'Erro de ligação. Tente novamente ou contacte-nos diretamente.';
    note.style.color = '#e07a5f';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalLabel;
  }
});
