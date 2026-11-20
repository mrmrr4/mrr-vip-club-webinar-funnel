(function(){
  const timeZone='America/New_York';

  function getEasternParts(date){
    const parts=new Intl.DateTimeFormat('en-US',{
      timeZone,year:'numeric',month:'2-digit',day:'2-digit',
      hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'
    }).formatToParts(date);
    const values={};
    parts.forEach(p=>{if(p.type!=='literal')values[p.type]=p.value;});
    return {
      year:Number(values.year),month:Number(values.month),day:Number(values.day),
      hour:Number(values.hour),minute:Number(values.minute),second:Number(values.second)
    };
  }

  function getOffsetMs(date){
    const p=getEasternParts(date);
    return Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second)-date.getTime();
  }

  function easternLocalToUtc(year,month,day,hour){
    const guess=new Date(Date.UTC(year,month-1,day,hour,0,0));
    let offset=getOffsetMs(guess);
    let target=new Date(guess.getTime()-offset);
    const corrected=getOffsetMs(target);
    if(corrected!==offset)target=new Date(guess.getTime()-corrected);
    return target;
  }

  function getNextSession(now){
    const p=getEasternParts(now);
    for(let add=0;add<8;add++){
      const d=new Date(Date.UTC(p.year,p.month-1,p.day+add,12,0,0));
      const weekday=d.getUTCDay();
      let hour=null;
      if(weekday===0)hour=15;
      if(weekday===3)hour=19;
      if(hour===null)continue;
      const candidate=easternLocalToUtc(
        d.getUTCFullYear(),
        d.getUTCMonth()+1,
        d.getUTCDate(),
        hour
      );
      if(candidate.getTime()>now.getTime())return candidate;
    }
    return null;
  }

  function ordinal(day){
    if(day%100>=11&&day%100<=13)return day+'th';
    if(day%10===1)return day+'st';
    if(day%10===2)return day+'nd';
    if(day%10===3)return day+'rd';
    return day+'th';
  }

  function zoneLabel(date){
    return new Intl.DateTimeFormat('en-US',{timeZone,timeZoneName:'short'})
      .formatToParts(date).find(p=>p.type==='timeZoneName')?.value||'ET';
  }

  function formatDate(date){
    const weekday=new Intl.DateTimeFormat('en-US',{timeZone,weekday:'long'}).format(date);
    const month=new Intl.DateTimeFormat('en-US',{timeZone,month:'long'}).format(date);
    const day=Number(new Intl.DateTimeFormat('en-US',{timeZone,day:'numeric'}).format(date));
    const time=new Intl.DateTimeFormat('en-US',{timeZone,hour:'numeric',hour12:true}).format(date);
    return weekday+' '+ordinal(day)+' '+month+' at '+time+' '+zoneLabel(date);
  }

  function findInboxCard(){
    const leaves=Array.from(document.querySelectorAll('strong,b,h1,h2,h3,h4,p,span,div'));
    const title=leaves.find(el=>el.children.length===0&&el.textContent.trim()==='First: check your inbox.');
    if(!title)return null;

    let node=title;
    let best=title.parentElement;
    while(node&&node.parentElement&&node.parentElement!==document.body){
      const parent=node.parentElement;
      const text=(parent.textContent||'').trim();
      if(text.includes('First: check your inbox.')&&text.includes('Your webinar access details')&&text.length<650){
        best=parent;
      }
      if(text.length>900)break;
      node=parent;
    }
    return best;
  }

  function createCard(){
    const card=document.createElement('div');
    card.className='confirmation-masterclass-card';
    card.innerHTML=
      '<div>'+
        '<div class="confirmation-masterclass-kicker"><span class="confirmation-masterclass-dot"></span>NEXT MASTERCLASS</div>'+
        '<div class="confirmation-masterclass-date">Next Masterclass on <span data-confirm-date>Loading…</span></div>'+
        '<div class="confirmation-masterclass-sub">Your seat is reserved. Keep an eye on your inbox for your access details and reminders.</div>'+
      '</div>'+
      '<div class="confirmation-masterclass-countdown-wrap">'+
        '<span class="confirmation-masterclass-countdown-label">STARTS IN</span>'+
        '<span class="confirmation-masterclass-countdown" data-confirm-countdown>--</span>'+
      '</div>';
    return card;
  }

  function init(){
    const inboxCard=findInboxCard();
    if(!inboxCard)return;

    const card=createCard();
    inboxCard.insertAdjacentElement('beforebegin',card);

    const dateEl=card.querySelector('[data-confirm-date]');
    const countdownEl=card.querySelector('[data-confirm-countdown]');
    let target=getNextSession(new Date());

    function updateDate(){
      if(target)dateEl.textContent=formatDate(target);
    }

    function tick(){
      const now=new Date();
      if(!target||now.getTime()>=target.getTime()){
        target=getNextSession(new Date(now.getTime()+1000));
        updateDate();
      }
      if(!target)return;

      const diff=Math.max(0,target.getTime()-now.getTime());
      const total=Math.floor(diff/1000);
      const days=Math.floor(total/86400);
      const hours=Math.floor((total%86400)/3600);
      const mins=Math.floor((total%3600)/60);
      const secs=total%60;

      countdownEl.textContent=
        (days>0?days+'D ':'')+
        String(hours).padStart(2,'0')+'H '+
        String(mins).padStart(2,'0')+'M '+
        String(secs).padStart(2,'0')+'S';
    }

    updateDate();
    tick();
    setInterval(tick,1000);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init,{once:true});
  }else{
    init();
  }
})();
