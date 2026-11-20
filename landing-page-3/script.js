(function(){
  const timeZone='America/New_York';
  const shortDate=document.querySelector('[data-masterclass-date-short]');
  const countdown=document.querySelector('[data-masterclass-countdown]');
  const finalSession=document.querySelector('[data-final-session]');

  function parts(date){
    const arr=new Intl.DateTimeFormat('en-US',{
      timeZone,year:'numeric',month:'2-digit',day:'2-digit',
      hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'
    }).formatToParts(date);
    const v={};arr.forEach(p=>{if(p.type!=='literal')v[p.type]=p.value;});
    return {year:+v.year,month:+v.month,day:+v.day,hour:+v.hour,minute:+v.minute,second:+v.second};
  }
  function offset(date){
    const p=parts(date);
    return Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second)-date.getTime();
  }
  function easternToUtc(year,month,day,hour){
    const guess=new Date(Date.UTC(year,month-1,day,hour,0,0));
    let o=offset(guess);let target=new Date(guess.getTime()-o);
    const corrected=offset(target);if(corrected!==o)target=new Date(guess.getTime()-corrected);
    return target;
  }
  function nextSession(now){
    const p=parts(now);
    for(let add=0;add<8;add++){
      const d=new Date(Date.UTC(p.year,p.month-1,p.day+add,12));
      const wd=d.getUTCDay();
      let hour=null;
      if(wd===0)hour=15;
      if(wd===3)hour=19;
      if(hour===null)continue;
      const c=easternToUtc(d.getUTCFullYear(),d.getUTCMonth()+1,d.getUTCDate(),hour);
      if(c>now)return c;
    }
  }
  function ordinal(n){
    if(n%100>=11&&n%100<=13)return n+'th';
    if(n%10===1)return n+'st';
    if(n%10===2)return n+'nd';
    if(n%10===3)return n+'rd';
    return n+'th';
  }
  function zone(date){
    return new Intl.DateTimeFormat('en-US',{timeZone,timeZoneName:'short'})
      .formatToParts(date).find(p=>p.type==='timeZoneName')?.value||'ET';
  }
  function sessionText(date){
    const weekday=new Intl.DateTimeFormat('en-US',{timeZone,weekday:'long'}).format(date);
    const month=new Intl.DateTimeFormat('en-US',{timeZone,month:'long'}).format(date);
    const day=+new Intl.DateTimeFormat('en-US',{timeZone,day:'numeric'}).format(date);
    const time=new Intl.DateTimeFormat('en-US',{timeZone,hour:'numeric',hour12:true}).format(date);
    return weekday+' '+ordinal(day)+' '+month+' · '+time+' '+zone(date);
  }

  let target=nextSession(new Date());

  function labels(){
    if(!target)return;
    const text=sessionText(target);
    if(shortDate)shortDate.textContent=text.toUpperCase();
    if(finalSession)finalSession.textContent='Reserve your seat for '+text+'.';
  }

  function tick(){
    const now=new Date();
    if(!target||now>=target){target=nextSession(new Date(now.getTime()+1000));labels();}
    if(!target||!countdown)return;
    const total=Math.max(0,Math.floor((target-now)/1000));
    const d=Math.floor(total/86400);
    const h=Math.floor((total%86400)/3600);
    const m=Math.floor((total%3600)/60);
    const s=total%60;
    const nums=countdown.querySelectorAll('strong');
    if(nums.length>=4){
      nums[0].textContent=String(d).padStart(2,'0');
      nums[1].textContent=String(h).padStart(2,'0');
      nums[2].textContent=String(m).padStart(2,'0');
      nums[3].textContent=String(s).padStart(2,'0');
    }
  }

  labels();tick();setInterval(tick,1000);
})();