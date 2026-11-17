const menu = document.querySelector('#site-menu');
const menuButton = document.querySelector('[aria-controls="site-menu"]');
const form = document.querySelector('#contact-form');
const email = document.querySelector('#contact-email');
const draft = document.querySelector('#draft');
const openDraft = document.querySelector('#open-draft');
const draftStatus = document.querySelector('#draft-status');
const result = document.querySelector('#draft-result');
const fields = form.querySelectorAll('input, textarea');
const tour = document.querySelector('#nest-tour');
const slides = tour.querySelectorAll('.carousel-item');
const previousSlide = tour.querySelector('[data-bs-slide="prev"]');
const nextSlide = tour.querySelector('[data-bs-slide="next"]');
const progress = document.querySelector('#tour-progress');
const slideCount = document.querySelector('#tour-count');

menu.addEventListener('show.bs.offcanvas', () => menuButton.setAttribute('aria-expanded', 'true'));
menu.addEventListener('hide.bs.offcanvas', () => menuButton.setAttribute('aria-expanded', 'false'));
menu.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || !menu.classList.contains('show')) return;

  const heading = document.querySelector(link.hash).querySelector('h2');
  menu.addEventListener('hidden.bs.offcanvas', () => heading.focus({ preventScroll: true }), { once: true });
  bootstrap.Offcanvas.getInstance(menu).hide();
});

tour.addEventListener('slid.bs.carousel', event => {
  const step = event.to + 1;
  slideCount.textContent = `${step} з ${slides.length}`;
  progress.setAttribute('aria-valuenow', String(step));
  progress.firstElementChild.style.width = `${100 * step / slides.length}%`;
  previousSlide.disabled = step === 1;
  nextSlide.disabled = step === slides.length;

  if (document.activeElement === previousSlide && previousSlide.disabled) nextSlide.focus();
  if (document.activeElement === nextSlide && nextSlide.disabled) previousSlide.focus();
});

function updateField(field) {
  const valid = field.validity.valid && field.value.trim().length > 0;
  field.classList.toggle('is-invalid', !valid);
  field.setAttribute('aria-invalid', String(!valid));
}

const draftTip = draftStatus.textContent;
document.querySelector('#prepare-draft').disabled = false;
form.noValidate = true;
form.addEventListener('submit', event => {
  event.preventDefault();
  fields.forEach(updateField);

  const invalidField = form.querySelector('.is-invalid');
  if (invalidField) {
    invalidField.focus();
    return;
  }

  const values = new FormData(form);
  draft.value = `${values.get('message').trim()}\n\n${values.get('name').trim()}`;
  const subject = encodeURIComponent('Повідомлення з сайту-візитки');
  const body = encodeURIComponent(draft.value.replace(/\n/g, '\r\n'));
  openDraft.href = `${email.href}?subject=${subject}&body=${body}`;
  draftStatus.textContent = draftTip;
  result.hidden = false;
  openDraft.click();
});

form.addEventListener('input', event => {
  if (event.target.classList.contains('is-invalid')) updateField(event.target);
  result.hidden = true;
  draft.value = '';
  openDraft.removeAttribute('href');
});

document.querySelector('#copy-draft').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(draft.value);
    draftStatus.textContent = draftTip;
    if (window.bootstrap) {
      bootstrap.Toast.getOrCreateInstance(document.querySelector('#copy-toast')).show();
    } else {
      draftStatus.textContent = 'Текст скопійовано.';
    }
  } catch {
    draft.focus();
    draft.select();
    draftStatus.textContent = 'Текст виділено. Скопіюйте його вручну.';
  }
});
