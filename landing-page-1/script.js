const modal = document.getElementById('registration-modal');
const openers = document.querySelectorAll('[data-open-registration]');
const closers = document.querySelectorAll('[data-close-registration]');

function openRegistration(){
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
  setTimeout(() => modal.querySelector('input')?.focus(), 100);
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
const calcApproval = document.getElementById('calc-approval');
const calcFees = document.getElementById('calc-fees');

function updateCalculator(){
  const customers = Math.max(0, parseFloat(calcCustomers.value) || 0);
  const price = Math.max(0, parseFloat(calcPrice.value) || 0);
  const approvalRate = Math.min(100, Math.max(0, parseFloat(calcApproval.value) || 0)) / 100;
  const feeRate = Math.min(100, Math.max(0, parseFloat(calcFees.value) || 0)) / 100;

  const approved = customers * approvalRate;
  const revenue = approved * price;
  const costs = revenue * feeRate;
  const profit = revenue - costs;

  document.getElementById('result-approved').textContent = numberFmt.format(Math.round(approved));
  document.getElementById('result-revenue').textContent = currency.format(revenue);
  document.getElementById('result-costs').textContent = '-' + currency.format(costs);
  document.getElementById('result-profit').textContent = currency.format(profit);
}
[calcCustomers, calcPrice, calcApproval, calcFees].forEach(input => {
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
