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


// Weekly masterclass schedule: Wednesday 7 PM ET and Sunday 3 PM ET
(function initMasterclassSchedule(){
  const timeZone = 'America/New_York';
  const countdowns = document.querySelectorAll('[data-masterclass-countdown]');
  const dateLabels = document.querySelectorAll('[data-masterclass-date]');
  const shortDateLabels = document.querySelectorAll('[data-masterclass-date-short]');
  if(!countdowns.length && !dateLabels.length && !shortDateLabels.length) return;

  const easternPartsFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  });

  function getEasternParts(date){
    const parts = easternPartsFormatter.formatToParts(date);
    const values = {};
    parts.forEach(part => {
      if(part.type !== 'literal') values[part.type] = part.value;
    });
    return {
      year: Number(values.year),
      month: Number(values.month),
      day: Number(values.day),
      hour: Number(values.hour),
      minute: Number(values.minute),
      second: Number(values.second)
    };
  }

  function getTimeZoneOffsetMs(date){
    const p = getEasternParts(date);
    const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    return asUtc - date.getTime();
  }

  function easternLocalToUtc(year, month, day, hour, minute = 0){
    const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
    let offset = getTimeZoneOffsetMs(utcGuess);
    let target = new Date(utcGuess.getTime() - offset);

    // Re-check using the target itself so DST changes remain accurate year-round.
    const correctedOffset = getTimeZoneOffsetMs(target);
    if(correctedOffset !== offset){
      target = new Date(utcGuess.getTime() - correctedOffset);
    }
    return target;
  }

  function getNextSession(now){
    const easternNow = getEasternParts(now);

    for(let addDays = 0; addDays < 8; addDays++){
      const calendarDate = new Date(Date.UTC(
        easternNow.year,
        easternNow.month - 1,
        easternNow.day + addDays,
        12,
        0,
        0
      ));

      const weekday = calendarDate.getUTCDay();
      let sessionHour = null;

      if(weekday === 0) sessionHour = 15; // Sunday 3 PM Eastern
      if(weekday === 3) sessionHour = 19; // Wednesday 7 PM Eastern
      if(sessionHour === null) continue;

      const candidate = easternLocalToUtc(
        calendarDate.getUTCFullYear(),
        calendarDate.getUTCMonth() + 1,
        calendarDate.getUTCDate(),
        sessionHour
      );

      if(candidate.getTime() > now.getTime()){
        return candidate;
      }
    }

    return null;
  }

  function ordinal(day){
    if(day % 100 >= 11 && day % 100 <= 13) return day + 'th';
    if(day % 10 === 1) return day + 'st';
    if(day % 10 === 2) return day + 'nd';
    if(day % 10 === 3) return day + 'rd';
    return day + 'th';
  }

  function getZoneLabel(date){
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'short'
    }).formatToParts(date).find(part => part.type === 'timeZoneName')?.value || 'ET';
  }

  function formatSessionDate(date){
    const dayName = new Intl.DateTimeFormat('en-US', {
      timeZone,
      weekday: 'long'
    }).format(date);

    const monthName = new Intl.DateTimeFormat('en-US', {
      timeZone,
      month: 'long'
    }).format(date);

    const day = Number(new Intl.DateTimeFormat('en-US', {
      timeZone,
      day: 'numeric'
    }).format(date));

    const time = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: 'numeric',
      hour12: true
    }).format(date);

    return `${dayName} ${ordinal(day)} ${monthName} at ${time} ${getZoneLabel(date)}`;
  }

  function formatShortSessionDate(date){
    const weekday = new Intl.DateTimeFormat('en-US', {
      timeZone,
      weekday: 'short'
    }).format(date).toUpperCase();

    const month = new Intl.DateTimeFormat('en-US', {
      timeZone,
      month: 'short'
    }).format(date).toUpperCase();

    const day = Number(new Intl.DateTimeFormat('en-US', {
      timeZone,
      day: 'numeric'
    }).format(date));

    const time = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: 'numeric',
      hour12: true
    }).format(date);

    return `${weekday} ${ordinal(day).toUpperCase()} ${month} · ${time} ${getZoneLabel(date)}`;
  }

  let target = getNextSession(new Date());

  function updateSessionLabels(){
    if(!target) return;
    const full = formatSessionDate(target);
    const short = formatShortSessionDate(target);
    dateLabels.forEach(el => el.textContent = full);
    shortDateLabels.forEach(el => el.textContent = short);
  }

  function renderCountdown(){
    const now = new Date();

    if(!target || now.getTime() >= target.getTime()){
      target = getNextSession(new Date(now.getTime() + 1000));
      updateSessionLabels();
    }

    if(!target) return;

    const remaining = Math.max(0, target.getTime() - now.getTime());
    const totalSeconds = Math.floor(remaining / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const value = days > 0
      ? `${days}D ${String(hours).padStart(2,'0')}H ${String(minutes).padStart(2,'0')}M ${String(seconds).padStart(2,'0')}S`
      : `${String(hours).padStart(2,'0')}H ${String(minutes).padStart(2,'0')}M ${String(seconds).padStart(2,'0')}S`;

    countdowns.forEach(el => {
      el.textContent = value;
      el.setAttribute(
        'aria-label',
        `Next masterclass starts in ${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`
      );
    });
  }

  updateSessionLabels();
  renderCountdown();
  setInterval(renderCountdown, 1000);
})();

