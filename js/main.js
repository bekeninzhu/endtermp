/* Skill Swap Endterm interaction layer — original JavaScript and jQuery effects. */
(function(){
  'use strict';
  const db=window.SkillSwap;
  if(!db)return;
  const $id=id=>document.getElementById(id);
  const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;};
  const norm=text=>String(text||'').trim().toLowerCase();
  const titleSkill=text=>String(text||'').trim();
  const offers=db.getOffers();

  // jQuery animation 1: smooth in-page navigation. stop(true) avoids stacked animations.
  if(window.jQuery){window.jQuery('a[href^="#"]').on('click',function(event){const href=this.getAttribute('href');if(!href||href==='#')return;const target=document.querySelector(href);if(!target)return;event.preventDefault();window.jQuery('html,body').stop(true).animate({scrollTop:window.jQuery(target).offset().top-82},440);history.replaceState(null,'',href);});}

  if(document.body.dataset.page==='home')initHome();
  if(document.body.dataset.page==='join')initJoin();

  function initHome(){
    const grid=$id('offersGrid');
    const search=$id('searchInput');
    const categoryButtons=[...document.querySelectorAll('#filterChips [data-category]')];
    const sort=$id('sortSelect');
    const savedButton=$id('savedFilter');
    const loadMore=$id('loadMore');
    const clearSearch=$id('clearSearch');
    const savedCount=$id('savedCount');
    let chosenCategory='All',onlySaved=false,showLimit=6;
    let saved=new Set(db.read(db.SAVED_KEY,[]).map(String));
    $id('statOffers').textContent=String(offers.length);
    $id('statSkills').textContent=String(new Set(offers.flatMap(item=>[norm(item.teaches),norm(item.wants)])).size);
    function updateSavedCount(){savedCount.textContent=String(saved.size);}
    function filtered(){
      const query=norm(search.value);
      let list=offers.filter(item=>{
        const cat=chosenCategory==='All'||item.category===chosenCategory;
        const matches=!query||[item.name,item.teaches,item.wants,item.category,item.level].some(x=>norm(x).includes(query));
        return cat&&matches&&(!onlySaved||saved.has(String(item.id)));
      });
      if(sort.value==='az')list.sort((a,b)=>a.name.localeCompare(b.name));
      if(sort.value==='za')list.sort((a,b)=>b.name.localeCompare(a.name));
      return list;
    }
    function createCard(item,index){
      const card=el('article','offer-card');card.style.setProperty('--avatar-bg',item.color||'#c7b5ff');card.style.setProperty('--card-glow',item.color||'#aa91fd');card.style.animationDelay=`${Math.min(index,5)*55}ms`;
      const top=el('div','offer-top');
      const person=el('div','offer-person');const avatar=el('div','avatar',(item.name||'S').slice(0,1).toUpperCase());avatar.setAttribute('aria-hidden','true');
      const identity=el('div');identity.append(el('h3','person-name',item.name),el('p','person-caption','Skill Swap member'));person.append(avatar,identity);
      const save=el('button','save-button',saved.has(String(item.id))?'♥':'♡');save.type='button';save.setAttribute('aria-label',(saved.has(String(item.id))?'Remove saved offer for ':'Save offer for ')+item.name);save.setAttribute('aria-pressed',String(saved.has(String(item.id))));
      save.addEventListener('click',()=>{const id=String(item.id);if(saved.has(id))saved.delete(id);else saved.add(id);db.write(db.SAVED_KEY,[...saved]);updateSavedCount();if(onlySaved)render();else{const isSaved=saved.has(id);save.textContent=isSaved?'♥':'♡';save.setAttribute('aria-pressed',String(isSaved));save.setAttribute('aria-label',(isSaved?'Remove saved offer for ':'Save offer for ')+item.name);}});
      top.append(person,save);const category=el('div','offer-category',item.category);
      const line=el('div','skills-line');const teaches=el('div');teaches.append(el('small','', 'CAN TEACH'),el('strong','skill-highlight',item.teaches));const arrows=el('span','skills-arrow','⇄');arrows.setAttribute('aria-label','in exchange for');const learns=el('div');learns.append(el('small','','WANTS TO LEARN'),el('strong','',item.wants));line.append(teaches,arrows,learns);
      const bottom=el('div','offer-bottom');bottom.append(el('span','level-badge',item.level));const link=el('a','request-link','Offer a swap ↗');const params=new URLSearchParams({offer:item.name,teach:item.wants,learn:item.teaches});link.href=`join.html?${params.toString()}`;link.setAttribute('aria-label',`Create a swap offer for ${item.name}, who teaches ${item.teaches}`);bottom.append(link);
      card.append(top,category,line,bottom);return card;
    }
    function render(){
      const visible=filtered();grid.replaceChildren(...visible.slice(0,showLimit).map(createCard));$id('visibleCount').textContent=String(visible.length);
      $id('emptyState').hidden=visible.length!==0;loadMore.hidden=visible.length<=showLimit;clearSearch.hidden=search.value.length===0;updateSavedCount();
    }
    categoryButtons.forEach(button=>button.addEventListener('click',()=>{chosenCategory=button.dataset.category;showLimit=6;categoryButtons.forEach(chip=>{const active=chip===button;chip.classList.toggle('active',active);chip.setAttribute('aria-pressed',String(active));});render();}));
    search.addEventListener('input',()=>{showLimit=6;render();});sort.addEventListener('change',render);
    clearSearch.addEventListener('click',()=>{search.value='';showLimit=6;render();search.focus();});
    savedButton.addEventListener('click',()=>{onlySaved=!onlySaved;savedButton.setAttribute('aria-pressed',String(onlySaved));showLimit=6;render();});
    loadMore.addEventListener('click',()=>{showLimit+=6;render();});
    $id('resetFilters').addEventListener('click',()=>{search.value='';chosenCategory='All';onlySaved=false;showLimit=6;sort.value='featured';savedButton.setAttribute('aria-pressed','false');categoryButtons.forEach(chip=>{const selected=chip.dataset.category==='All';chip.classList.toggle('active',selected);chip.setAttribute('aria-pressed',String(selected));});render();search.focus();});
    render();
    setupMatcher();
    setupFaq();
  }
  function setupMatcher(){
    const teach=$id('myTeach'),learn=$id('myLearn'),form=$id('matchForm'),error=$id('matchError'),result=$id('matchResult');
    const skills=[...new Set(offers.flatMap(o=>[titleSkill(o.teaches),titleSkill(o.wants)]))].sort((a,b)=>a.localeCompare(b));
    for(const skill of skills){for(const select of [teach,learn]){const opt=el('option','',skill);opt.value=skill;select.append(opt);}}
    form.addEventListener('submit',event=>{
      event.preventDefault();
      const give=db.cleanSkill(teach.value),want=db.cleanSkill(learn.value);
      const valid=give&&want&&give!==want;
      error.hidden=Boolean(valid);if(!valid){error.textContent=!give||!want?'Choose a skill in both boxes first.':'Choose two different skills to find a swap.';result.hidden=true;return;}
      const mutual=offers.filter(o=>db.cleanSkill(o.teaches)===want&&db.cleanSkill(o.wants)===give);
      const teachMatches=offers.filter(o=>db.cleanSkill(o.teaches)===want);
      result.replaceChildren();
      result.append(el('strong','',mutual.length?`${mutual.length} perfect mutual ${mutual.length===1?'match':'matches'} ✳`:`${teachMatches.length} possible learning ${teachMatches.length===1?'match':'matches'} ✦`));
      const text=mutual.length?`You teach ${teach.value}, and ${mutual.map(o=>o.name).join(', ')} can teach ${learn.value} in return.`:teachMatches.length?`${teachMatches.map(o=>o.name).join(', ')} can teach ${learn.value}. They want a different skill, but you can still offer a swap.`:`We have no one teaching ${learn.value} in the current list. Add your offer and help the community grow.`;
      result.append(el('p','',text));
      const jump=el('a','','Create your offer ↗');jump.href=`join.html?${new URLSearchParams({teach:teach.value,learn:learn.value})}`;result.append(jump);
      // jQuery animation 2: reveal matched results without queue buildup.
      if(window.jQuery){window.jQuery(result).stop(true,true).hide().removeAttr('hidden').slideDown(250);}else result.hidden=false;
    });
    [teach,learn].forEach(input=>input.addEventListener('change',()=>{error.hidden=true;}));
  }
  function setupFaq(){
    document.querySelectorAll('.faq-question').forEach(button=>{
      const panel=$id(button.getAttribute('aria-controls'));
      button.addEventListener('click',()=>{
        const shouldOpen=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(shouldOpen));
        // jQuery animation 3: FAQ accordion slides with stop() preventing stacked clicks.
        if(window.jQuery){const $panel=window.jQuery(panel);$panel.stop(true,true);if(shouldOpen)$panel.hide().removeAttr('hidden').slideDown(230);else $panel.slideUp(230,()=>{panel.hidden=true;});}
        else panel.hidden=!shouldOpen;
      });
    });
  }
  function initJoin(){
    const schedule=$id('scheduleList');
    for(const entry of db.meetings){const row=el('div','schedule-item');const day=el('span','schedule-day',entry.day);const detail=el('div','schedule-info');detail.append(el('strong','',entry.name),el('small','',entry.venue));row.append(day,detail,el('span','schedule-time',entry.time));schedule.append(row);}
    $id('scheduleTotal').textContent=`${db.meetings.length} example sessions per week`;
    const form=$id('joinForm');const names=['fullName','email','teach','learn','level','day','about','consent'];
    const fields=Object.fromEntries(names.map(id=>[id,$id(id)]));
    const success=$id('formSuccess');let submitted=false;
    const url=new URLSearchParams(location.search);
    if(url.has('teach'))fields.teach.value=(url.get('teach')||'').slice(0,50);
    if(url.has('learn'))fields.learn.value=(url.get('learn')||'').slice(0,50);
    if(url.has('offer')){const label=document.querySelector('.form-chip');label.textContent=`YOUR SWAP IDEA WITH ${String(url.get('offer')).slice(0,40).toUpperCase()} ✳`;}
    function validationMessage(id){
      const val=fields[id].type==='checkbox'?fields[id].checked:fields[id].value.trim();
      switch(id){
        case 'fullName':return val.length<5||val.split(/\s+/).length<2?'Enter your first and last name (at least 5 characters).':'';
        case 'email':return !/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(val)?'Enter a valid email address (like you@example.com).':'';
        case 'teach':return val.length<3?'Add a skill you can teach (at least 3 characters).':'';
        case 'learn':return val.length<3?'Add a skill you want to learn (at least 3 characters).':db.cleanSkill(val)===db.cleanSkill(fields.teach.value)?'Choose a different skill from the one you teach.':'';
        case 'level':return !val?'Choose your current skill level.':'';
        case 'day':return !val?'Select a preferred meetup day.':'';
        case 'consent':return !val?'Please confirm you understand how this demo stores offers.':'';
        default:return '';
      }
    }
    function showFieldState(id){
      const input=fields[id],error=$id(id+'Error'),message=validationMessage(id);
      if(error)error.textContent=message;
      input.classList.toggle('is-invalid',!!message);input.classList.toggle('is-valid',!message&&Boolean(input.type==='checkbox'?input.checked:input.value.trim()));
      input.setAttribute('aria-invalid',String(!!message));return !message;
    }
    for(const id of names){
      const input=fields[id];
      const eventName=['level','day','consent'].includes(id)?'change':'input';
      input.addEventListener(eventName,()=>{
        if(id==='about')$id('aboutCounter').textContent=`${input.value.length} / 180`;
        if(submitted||input.dataset.touched==='true')showFieldState(id);
        if(id==='teach'&&fields.learn.dataset.touched==='true')showFieldState('learn');
      });
      input.addEventListener('blur',()=>{input.dataset.touched='true';if(id!=='about')showFieldState(id);});
    }
    form.addEventListener('submit',event=>{
      event.preventDefault();submitted=true;
      const checks=['fullName','email','teach','learn','level','day','consent'];
      const valid=checks.map(showFieldState).every(Boolean);
      if(!valid){const first=checks.find(id=>validationMessage(id));if(first)fields[first].focus();return;}
      const fullName=fields.fullName.value.trim().replace(/\s+/g,' ');
      const record={id:'u_'+Date.now(),name:fullName.split(' ')[0],teaches:fields.teach.value.trim(),wants:fields.learn.value.trim(),category:detectCategory(fields.teach.value),level:fields.level.value,color:'#bbff70',symbol:'✳'};
      const existing=db.read(db.USER_KEY,[]).filter(o=>o&&typeof o==='object').slice(0,13);
      const saved=db.write(db.USER_KEY,[record,...existing]);
      const heading=success.querySelector('strong'),description=success.querySelector('p');
      heading.textContent=saved?'Your offer is live in this browser!':'Your form is valid!';
      if(!saved){description.textContent='Form checked successfully, but this browser blocked local storage. Nothing was sent to a server.';}
      else{description.replaceChildren(document.createTextNode('Success! Your form has been cleared. See it on the '));const link=el('a','','Explore page');link.href='index.html#discover';description.append(link,document.createTextNode('. This demo does not send messages or registrations to a server.'));}
      form.reset();submitted=false;for(const id of names){fields[id].classList.remove('is-valid','is-invalid');fields[id].removeAttribute('aria-invalid');fields[id].dataset.touched='false';const error=$id(id+'Error');if(error)error.textContent='';}
      $id('aboutCounter').textContent='0 / 180';
      // jQuery animation 4: fade-in success feedback after a valid, cleared form.
      if(window.jQuery){window.jQuery(success).stop(true,true).hide().removeAttr('hidden').fadeIn(320);}else success.hidden=false;
      success.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});
    });
    $id('dismissSuccess').addEventListener('click',()=>{if(window.jQuery)window.jQuery(success).stop(true,true).fadeOut(170,()=>{success.hidden=true;});else success.hidden=true;});
  }
  function detectCategory(skill){
    const text=norm(skill);
    if(/design|photo|illustrat|draw|figma|ui|ux/.test(text))return 'Design';
    if(/code|python|html|css|java|web|program/.test(text))return 'Coding';
    if(/english|french|german|language|speak|turkish/.test(text))return 'Languages';
    if(/math|excel|statistic|science/.test(text))return 'Academic';
    return 'Creative';
  }
})();
