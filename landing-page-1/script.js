const modal = document.getElementById('registration-modal');
const openers = document.querySelectorAll('[data-open-registration]');
const closers = document.querySelectorAll('[data-close-registration]');

let webinarFormLoading = false;
let webinarFormLoaded = false;

function ensureWebinarFormLoaded(){
  if(webinarFormLoaded || webinarFormLoading) return;
  const wrapper = document.getElementById('everwebinar-registration');
  if(!wrapper) return;

  webinarFormLoading = true;
  const loading = wrapper.querySelector('.webinar-form-loading');
  const script = document.createElement('script');
  script.src = 'https://event.webinarjam.com/register/v888q0u7/embed-form?formButtonText=SAVE%20MY%20FREE%20SEAT&formAccentColor=%2329b6f6&formAccentOpacity=0.95&formBgColor=%23ffffff&formBgOpacity=1';
  script.async = true;

  script.onload = () => {
    webinarFormLoaded = true;
    webinarFormLoading = false;
    loading?.remove();
    setTimeout(() => modal.querySelector('input')?.focus(), 250);
  };

  script.onerror = () => {
    webinarFormLoading = false;
    if(loading){
      loading.textContent = 'The registration form could not load. Please close this window and try again.';
    }
  };

  wrapper.appendChild(script);
}

function openRegistration(){
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
  ensureWebinarFormLoaded();
}
function closeRegistration(){
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden','true');
  document.body.classList.remove('modal-open');
}
openers.forEach(btn => btn.addEventListener('click', openRegistration));
closers.forEach(btn => btn.addEventListener('click', closeRegistration));
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeRegistration(); });

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const video = document.getElementById('hero-vsl');
const videoOverlay = document.getElementById('video-play-overlay');
function updateVideoOverlay(){
  if(!video || !videoOverlay) return;
  if(video.paused || video.ended){
    videoOverlay.classList.remove('is-hidden');
  } else {
    videoOverlay.classList.add('is-hidden');
  }
}
if(videoOverlay && video){
  videoOverlay.addEventListener('click', () => {
    video.play();
  });
  video.addEventListener('play', updateVideoOverlay);
  video.addEventListener('pause', updateVideoOverlay);
  video.addEventListener('ended', updateVideoOverlay);
  video.addEventListener('loadeddata', updateVideoOverlay);
  updateVideoOverlay();
}
document.querySelectorAll('.speed-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const speed = parseFloat(btn.dataset.speed || '1');
    if(video){
      video.playbackRate = speed;
    }
    document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const numberFmt = new Intl.NumberFormat('en-US');

const calcCustomers = document.getElementById('calc-customers');
const calcPrice = document.getElementById('calc-price');

function updateCalculator(){
  const customers = Math.max(0, parseFloat(calcCustomers.value) || 0);
  const price = Math.max(0, parseFloat(calcPrice.value) || 0);

  const subscribers = customers;
  const revenue = subscribers * price;
  const profit = revenue;

  document.getElementById('result-approved').textContent = numberFmt.format(Math.round(subscribers));
  document.getElementById('result-revenue').textContent = currency.format(revenue);
  document.getElementById('result-profit').textContent = currency.format(profit);
  const monthOneProfitCopy = document.getElementById('month-one-profit-copy');
  if(monthOneProfitCopy){
    monthOneProfitCopy.textContent = currency.format(profit);
  }
}
[calcCustomers, calcPrice].forEach(input => {
  if(input){
    input.addEventListener('input', updateCalculator);
  }
});
updateCalculator();

const compoundingBars = document.getElementById('compounding-bars');
const newCustomers = [1000, 1900, 2800, 3700, 4600, 5500];
const membershipPrice = 30;
const approvalRate = 0.8;
const retentionRate = 0.7;

function buildCompoundingChart(){
  if(!compoundingBars) return;
  const monthlyTotals = [];
  const cohortApproved = [];

  newCustomers.forEach((count, index) => {
    cohortApproved.push(count * approvalRate);
    let approvedThisMonth = 0;

    cohortApproved.forEach((cohortCount, cohortIndex) => {
      const monthsSince = index - cohortIndex;
      approvedThisMonth += cohortCount * Math.pow(retentionRate, monthsSince);
    });

    monthlyTotals.push(approvedThisMonth * membershipPrice);
  });

  const maxValue = Math.max(...monthlyTotals);
  compoundingBars.innerHTML = '';

  monthlyTotals.forEach((value, i) => {
    const col = document.createElement('div');
    col.className = 'chart-col';

    const top = document.createElement('div');
    top.className = 'chart-value';
    top.textContent = currency.format(value);

    const bar = document.createElement('div');
    bar.className = 'chart-bar';
    bar.style.height = `${(value / maxValue) * 240 + 28}px`;

    const label = document.createElement('div');
    label.className = 'chart-label';
    label.textContent = `M${i + 1}`;

    col.append(top, bar, label);
    compoundingBars.appendChild(col);
  });
}

buildCompoundingChart();

// Q&A accordion
const faqQuestions = document.querySelectorAll('.faq-question');
faqQuestions.forEach(question => {
  question.addEventListener('click', () => {
    const item = question.closest('.faq-item');
    const isOpen = item.classList.contains('is-open');

    document.querySelectorAll('.faq-item.is-open').forEach(openItem => {
      openItem.classList.remove('is-open');
      openItem.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
    });

    if(!isOpen){
      item.classList.add('is-open');
      question.setAttribute('aria-expanded', 'true');
    }
  });
});


// Next masterclass countdown
(function initMasterclassCountdown(){
  const countdowns = document.querySelectorAll('[data-masterclass-countdown]');
  if(!countdowns.length) return;

  function getNextSession(now){
    const next = new Date(now);
    next.setMilliseconds(0);
    next.setSeconds(0);

    const hour = now.getHours();
    const minute = now.getMinutes();
    const second = now.getSeconds();

    // EverWebinar sessions are offered on the hour, with night-time sessions hidden.
    // Show the next available top-of-hour session between 07:00 and 22:00 in the viewer's local time.
    if(hour < 7){
      next.setHours(7, 0, 0, 0);
      return next;
    }

    if(hour >= 22){
      next.setDate(next.getDate() + 1);
      next.setHours(7, 0, 0, 0);
      return next;
    }

    if(minute === 0 && second <= 15){
      next.setHours(hour, 0, 0, 0);
      return next;
    }

    next.setHours(hour + 1, 0, 0, 0);
    if(next.getHours() >= 23){
      next.setDate(next.getDate() + 1);
      next.setHours(7, 0, 0, 0);
    }
    return next;
  }

  let target = getNextSession(new Date());

  function renderCountdown(){
    const now = new Date();
    if(now >= target){
      target = getNextSession(new Date(now.getTime() + 16000));
    }

    const remaining = Math.max(0, target.getTime() - now.getTime());
    const totalSeconds = Math.floor(remaining / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const value = hours > 0
      ? `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`
      : `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;

    countdowns.forEach(el => {
      el.textContent = value;
      el.setAttribute('aria-label', `Next masterclass starts in ${hours} hours, ${minutes} minutes and ${seconds} seconds`);
    });
  }

  renderCountdown();
  setInterval(renderCountdown, 1000);
})();
