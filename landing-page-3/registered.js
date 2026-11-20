(function(){
  const tz='America/New_York';
  const qs=new URLSearchParams(location.search);
  const eventDateEl=document.querySelector('[data-event-date]');
  const cardDateEl=document.querySelector('[data-card-date]');
  const countdownEl=document.querySelector('[data-countdown]');
  const calendarLink=document.getElementById('calendar-link');

  function easternParts(date){
    const p=new Intl.DateTimeFormat('en-US',{
      timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit',
      hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'
    }).formatToParts(date);
    const v={};p.forEach(x=>{if(x.type!=='literal')v[x.type]=x.value});
    return {year:+v.year,month:+v.month,day:+v.day,hour:+v.hour,minute:+v.minute,second:+v.second};
  }
  function offset(date){
    const p=easternParts(date);
    return Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second)-date.getTime();
  }
  function easternToUtc(y,m,d,h){
    const guess=new Date(Date.UTC(y,m-1,d,h,0,0));
    let o=offset(guess),target=new Date(guess.getTime()-o);
    const c=offset(target);if(c!==o)target=new Date(guess.getTime()-c);
    return target;
  }
  function nextSession(now){
    const p=easternParts(now);
    for(let i=0;i<8;i++){
      const d=new Date(Date.UTC(p.year,p.month-1,p.day+i,12));
      const wd=d.getUTCDay();
      let h=null;if(wd===0)h=15;if(wd===3)h=19;if(h===null)continue;
      const c=easternToUtc(d.getUTCFullYear(),d.getUTCMonth()+1,d.getUTCDate(),h);
      if(c>now)return c;
    }
  }
  function ordinal(n){
    if(n%100>=11&&n%100<=13)return n+'th';
    if(n%10===1)return n+'st';if(n%10===2)return n+'nd';if(n%10===3)return n+'rd';
    return n+'th';
  }
  function zone(date){
    return new Intl.DateTimeFormat('en-US',{timeZone:tz,timeZoneName:'short'})
      .formatToParts(date).find(p=>p.type==='timeZoneName')?.value||'ET';
  }
  function format(date){
    const day=new Intl.DateTimeFormat('en-US',{timeZone:tz,weekday:'long'}).format(date);
    const month=new Intl.DateTimeFormat('en-US',{timeZone:tz,month:'long'}).format(date);
    const n=+new Intl.DateTimeFormat('en-US',{timeZone:tz,day:'numeric'}).format(date);
    const time=new Intl.DateTimeFormat('en-US',{timeZone:tz,hour:'numeric',hour12:true}).format(date);
    return day+' '+ordinal(n)+' '+month+' at '+time+' '+zone(date);
  }
  function compact(date){
    const day=new Intl.DateTimeFormat('en-US',{timeZone:tz,weekday:'long'}).format(date);
    const month=new Intl.DateTimeFormat('en-US',{timeZone:tz,month:'short'}).format(date);
    const n=+new Intl.DateTimeFormat('en-US',{timeZone:tz,day:'numeric'}).format(date);
    const time=new Intl.DateTimeFormat('en-US',{timeZone:tz,hour:'numeric',hour12:true}).format(date);
    return day+', '+month+' '+ordinal(n)+' · '+time+' '+zone(date);
  }
  function googleDate(date){
    return date.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  }

  let target=null;
  const ts=Number(qs.get('wj_event_ts'));
  if(ts>0) target=new Date(ts*1000);
  if(!target||isNaN(target.getTime())) target=nextSession(new Date());

  const liveLink=qs.get('wj_lead_unique_link_live_room')||'';
  if(eventDateEl)eventDateEl.textContent=format(target);
  if(cardDateEl)cardDateEl.textContent=compact(target);

  if(calendarLink){
    const end=new Date(target.getTime()+90*60*1000);
    const details='Your VIP Club Ecom Masterclass with MR MRR.'+(liveLink?'\n\nJoin here: '+liveLink:'\n\nYour personal join link will be sent by email.');
    const u=new URL('https://calendar.google.com/calendar/render');
    u.searchParams.set('action','TEMPLATE');
    u.searchParams.set('text','VIP Club Ecom Masterclass');
    u.searchParams.set('dates',googleDate(target)+'/'+googleDate(end));
    u.searchParams.set('details',details);
    u.searchParams.set('location',liveLink||'Online');
    calendarLink.href=u.toString();
  }

  function tick(){
    if(!countdownEl)return;
    const diff=Math.max(0,target.getTime()-Date.now());
    const t=Math.floor(diff/1000);
    const d=Math.floor(t/86400),h=Math.floor((t%86400)/3600),m=Math.floor((t%3600)/60),s=t%60;
    countdownEl.textContent=(d?d+'D ':'')+String(h).padStart(2,'0')+'H '+String(m).padStart(2,'0')+'M '+String(s).padStart(2,'0')+'S';
  }
  tick();setInterval(tick,1000);

  document.querySelectorAll('.faq-question').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const item=btn.closest('.faq-item');
      const open=item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded',open?'true':'false');
    });
  });
})();