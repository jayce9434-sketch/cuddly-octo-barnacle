(() => {
'use strict';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const canvas = $('#gameCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

const screens = ['menu','game','mutation','pause','settings','codex','owner','gameover'];
const SAVE_KEY = 'molt_zero_save_v1';
const OWNER_CODE = 'WestvirgiNA';

const BUGS = {
  mantis:{name:'MANTIS',desc:'Fast melee hunter. Wide scythe strike, pounce special, high dash recovery.',speed:255,hp:105,attack:22,dashCd:.78,color:'#9df56f',accent:'#d8ffc6'},
  moth:{name:'MOTH',desc:'Mobile ranged specimen. Fires scale bursts, phase-wing special, highest movement speed.',speed:285,hp:82,attack:16,dashCd:.68,color:'#c08bff',accent:'#f0dfff'},
  stag:{name:'STAG',desc:'Heavy shell bruiser. Horn bash, brace special, highest shell and knockback.',speed:220,hp:135,attack:27,dashCd:.95,color:'#e7b75b',accent:'#ffe4a8'}
};

const MUTATIONS = [
 {id:'razor',name:'Razor Forelegs',tier:'PREDATOR',tag:'MELEE',desc:'+35% strike damage. Scythe blades extend visibly.',apply:s=>{s.attackMul*=1.35;s.body.razor=true;}},
 {id:'wing',name:'Glass Wings',tier:'MOBILITY',tag:'DASH',desc:'+22% speed and dash cooldown reduced.',apply:s=>{s.speedMul*=1.22;s.dashMul*=.78;s.body.wings=true;}},
 {id:'plate',name:'Basalt Plates',tier:'SHELL',tag:'DEFENSE',desc:'+45 max shell and gain layered armor plates.',apply:s=>{s.maxHp+=45;s.hp+=45;s.body.plates=true;}},
 {id:'venom',name:'Venom Sacs',tier:'PREDATOR',tag:'DOT',desc:'Strikes poison enemies for damage over time.',apply:s=>{s.venom+=7;s.body.venom=true;}},
 {id:'spine',name:'Recoil Spines',tier:'SHELL',tag:'COUNTER',desc:'Contact attackers take 12 damage.',apply:s=>{s.thorns+=12;s.body.spines=true;}},
 {id:'lung',name:'Tracheal Overdrive',tier:'MOBILITY',tag:'SPEED',desc:'+18% movement and +20% attack rate.',apply:s=>{s.speedMul*=1.18;s.attackRate*=1.2;s.body.lung=true;}},
 {id:'eye',name:'Compound Overclock',tier:'SENSE',tag:'CRIT',desc:'+18% critical chance.',apply:s=>{s.crit+=.18;s.body.eye=true;}},
 {id:'jaw',name:'Crushing Mandibles',tier:'PREDATOR',tag:'KNOCKBACK',desc:'+22% damage and stronger knockback.',apply:s=>{s.attackMul*=1.22;s.knock*=1.5;s.body.jaw=true;}},
 {id:'regen',name:'Molt Tissue',tier:'SHELL',tag:'REPAIR',desc:'Repair 2 shell every 3 seconds while moving.',apply:s=>{s.regen+=2;s.body.regen=true;}},
 {id:'dashcut',name:'Blade Dash',tier:'MOBILITY',tag:'DASH',desc:'Dashing slices enemies for 30 damage.',apply:s=>{s.dashDamage+=30;s.body.dashblade=true;}},
 {id:'scale',name:'Irritant Scales',tier:'MOTH',tag:'RANGED',desc:'Projectiles split once on impact.',apply:s=>{s.splitShot=true;s.body.scales=true;}},
 {id:'charge',name:'Capacitor Abdomen',tier:'MOLT',tag:'CHARGE',desc:'Molt charge gain increased by 45%.',apply:s=>{s.chargeMul*=1.45;s.body.capacitor=true;}},
 {id:'blood',name:'Predatory Hemolymph',tier:'PREDATOR',tag:'LIFESTEAL',desc:'Heal 4% of strike damage dealt.',apply:s=>{s.lifesteal+=.04;s.body.blood=true;}},
 {id:'ghost',name:'Ghost Cuticle',tier:'MOBILITY',tag:'PHASE',desc:'Brief invulnerability after each dash.',apply:s=>{s.dashIFrames+=.32;s.body.ghost=true;}},
 {id:'horn',name:'Forked Horn',tier:'STAG',tag:'BASH',desc:'Dash impact damage +35 and horn grows.',apply:s=>{s.dashDamage+=35;s.knock*=1.25;s.body.horn=true;}},
 {id:'pollen',name:'Toxic Pollen',tier:'MOTH',tag:'FIELD',desc:'Special leaves a damaging pollen cloud.',apply:s=>{s.pollen=true;s.body.pollen=true;}},
 {id:'raptor',name:'Raptorial Lock',tier:'MANTIS',tag:'EXECUTE',desc:'Deal +60% damage to enemies below 30% health.',apply:s=>{s.execute=.6;s.body.raptor=true;}},
 {id:'shellburst',name:'Shell Burst',tier:'SHELL',tag:'BREAK',desc:'Taking heavy damage emits a 34 damage shockwave.',apply:s=>{s.shellBurst=true;s.body.burst=true;}},
 {id:'antenna',name:'Long Antennae',tier:'SENSE',tag:'LOOT',desc:'Chitin drops pull toward you from farther away.',apply:s=>{s.magnet=230;s.body.antenna=true;}},
 {id:'double',name:'Twin Reflex',tier:'PREDATOR',tag:'COMBO',desc:'Every fourth strike repeats at 65% power.',apply:s=>{s.doubleHit=true;s.body.twin=true;}},
 {id:'acid',name:'Acid Gland',tier:'MOLT',tag:'BURST',desc:'Molt eruption leaves acid pools.',apply:s=>{s.acid=true;s.body.acid=true;}},
 {id:'leap',name:'Spring Femurs',tier:'MOBILITY',tag:'LEAP',desc:'Dash distance +45%.',apply:s=>{s.dashDist*=1.45;s.body.spring=true;}},
 {id:'fortress',name:'Fortress Carapace',tier:'SHELL',tag:'ARMOR',desc:'Reduce incoming damage by 20%.',apply:s=>{s.damageTaken*=.8;s.body.fortress=true;}},
 {id:'fury',name:'Low-Shell Fury',tier:'PREDATOR',tag:'RISK',desc:'Below 35% shell, attack speed rises by 60%.',apply:s=>{s.fury=true;s.body.fury=true;}},
 {id:'orb',name:'Luminous Organ',tier:'MOLT',tag:'ORBIT',desc:'A damage orb circles your body.',apply:s=>{s.orbs+=1;s.body.orb=true;}},
 {id:'echo',name:'Echo Wing',tier:'MOBILITY',tag:'SPECIAL',desc:'Special cooldown reduced by 35%.',apply:s=>{s.specialMul*=.65;s.body.echo=true;}},
 {id:'hive',name:'Brood Signal',tier:'SENSE',tag:'ALLY',desc:'Freeing a captive spawns a temporary ally.',apply:s=>{s.broodSignal=true;s.body.signal=true;}},
 {id:'shock',name:'Static Setae',tier:'MOLT',tag:'CHAIN',desc:'Critical hits arc 14 damage to a nearby enemy.',apply:s=>{s.chain=true;s.body.shock=true;}},
 {id:'eclipse',name:'Eclipse Shell',tier:'RARE',tag:'HYBRID',desc:'+15% speed, +20 shell, +12% crit.',apply:s=>{s.speedMul*=1.15;s.maxHp+=20;s.hp+=20;s.crit+=.12;s.body.eclipse=true;}},
 {id:'zero',name:'Zero Molt',tier:'ANOMALY',tag:'ULTIMATE',desc:'Molt eruption repeats after 0.6 seconds at 55% power.',apply:s=>{s.zeroMolt=true;s.body.zero=true;}}
];

const ENEMY_TYPES = {
 ant:{name:'Soldier Ant',r:13,hp:42,speed:110,dmg:9,color:'#c86d4b',ai:'chase'},
 roach:{name:'Roach Runner',r:14,hp:55,speed:155,dmg:10,color:'#8c694e',ai:'rush'},
 earwig:{name:'Earwig',r:15,hp:66,speed:105,dmg:14,color:'#b08162',ai:'chase'},
 silver:{name:'Silverfish',r:10,hp:30,speed:180,dmg:7,color:'#9eb7bd',ai:'zig'},
 termite:{name:'Termite Guard',r:16,hp:82,speed:92,dmg:15,color:'#d4c59a',ai:'chase'},
 wasp:{name:'Paper Wasp',r:13,hp:58,speed:145,dmg:12,color:'#d9b64b',ai:'orbit'},
 spider:{name:'Jumping Spider',r:16,hp:76,speed:120,dmg:18,color:'#7b665f',ai:'jump'},
 beetle:{name:'Ground Beetle',r:18,hp:110,speed:82,dmg:18,color:'#3b5b5a',ai:'tank'},
 flea:{name:'Flea',r:9,hp:26,speed:210,dmg:7,color:'#7f5f55',ai:'jump'},
 assassin:{name:'Assassin Bug',r:15,hp:74,speed:125,dmg:20,color:'#9f453e',ai:'orbit'},
 lace:{name:'Lacewing',r:12,hp:46,speed:165,dmg:9,color:'#7fba76',ai:'zig'},
 mite:{name:'Mite Cluster',r:11,hp:35,speed:132,dmg:8,color:'#d97e64',ai:'rush'}
};

const BOSSES = [
 {id:'orbweaver',name:'ORB WEAVER',color:'#8f71b7',hp:760,r:38,speed:96,dmg:22},
 {id:'centipede',name:'HOUSE CENTIPEDE',color:'#c99561',hp:980,r:42,speed:132,dmg:18},
 {id:'hornet',name:'BALD-FACED HORNET',color:'#e8ddd0',hp:1180,r:40,speed:148,dmg:25}
];

const objectiveDefs = [
 {id:'purge',label:'HUNTER PURGE'},
 {id:'rescue',label:'BROOD RESCUE'},
 {id:'vault',label:'CHITIN VAULT'},
 {id:'hunt',label:'MARKED HUNT'},
 {id:'dash',label:'RUPTURE RUN'}
];

let save = loadSave();
let settings = save.settings;
let selectedBug = save.selectedBug || 'mantis';
let currentScreen = 'menu';
let settingsReturn = 'menu';
let raf = 0, last = performance.now();
let keys = new Set();
let touchKeys = new Set();
let actQueue = [];
let toastTimer = 0;
let run = null;
let audio = null;
let musicTimer = 0;
let musicStep = 0;
let roomClock = 0;

function defaultSave(){
  return {bestRoom:0,bosses:[],mutations:[],selectedBug:'mantis',settings:{master:100,music:100,sfx:100,shake:true,reduced:false},suspended:null};
}
function loadSave(){
  try{
    const raw = localStorage.getItem(SAVE_KEY);
    if(!raw) return defaultSave();
    const s = JSON.parse(raw);
    return {...defaultSave(),...s,settings:{...defaultSave().settings,...(s.settings||{})}};
  }catch(e){return defaultSave();}
}
function persist(){
  save.selectedBug = selectedBug;
  save.settings = settings;
  localStorage.setItem(SAVE_KEY,JSON.stringify(save));
  updateMenuStats();
}

function showScreen(id){
  screens.forEach(s=>$('#'+s).classList.toggle('active',s===id));
  currentScreen = id;
}
function openOverlay(id){ screens.forEach(s=>$('#'+s).classList.remove('active')); $('#'+id).classList.add('active'); currentScreen=id; }
function toast(msg){
  const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),1500);
}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}
function rand(a=0,b=1){return a+Math.random()*(b-a);}
function pick(arr){return arr[(Math.random()*arr.length)|0];}
function shuffle(arr){return [...arr].sort(()=>Math.random()-.5);}

function updateMenuStats(){
  $('#bestRoom').textContent=save.bestRoom||0;
  $('#mutationsFound').textContent=`${save.mutations.length} / ${MUTATIONS.length}`;
  $('#bossesDefeated').textContent=`${save.bosses.length} / ${BOSSES.length}`;
  $('#continueBtn').disabled=!save.suspended;
  updateBugDescription();
}
function updateBugDescription(){
  const b=BUGS[selectedBug]; $('#bugDescription').textContent=b.desc;
  $$('.bug-tab').forEach(x=>x.classList.toggle('selected',x.dataset.bug===selectedBug));
}

function newRun(fromResume=false){
  const b=BUGS[selectedBug];
  run={
    bug:selectedBug,room:1,score:0,chitin:0,kills:0,mutations:[],god:false,
    player:{x:W/2,y:H/2,r:16,hp:b.hp,maxHp:b.hp,baseHp:b.hp,speed:b.speed,attack:b.attack,attackMul:1,speedMul:1,dashMul:1,attackRate:1,crit:.05,venom:0,thorns:0,regen:0,dashDamage:0,dashIFrames:.16,dashDist:1,knock:1,chargeMul:1,lifesteal:0,execute:0,damageTaken:1,specialMul:1,magnet:110,splitShot:false,pollen:false,shellBurst:false,doubleHit:false,acid:false,fury:false,orbs:0,broodSignal:false,chain:false,zeroMolt:false,body:{},vx:0,vy:0,facing:0,dashCd:0,attackCd:0,specialCd:0,iframes:0,charge:0,combo:0,lastHeavy:0,regenT:0},
    enemies:[],particles:[],projectiles:[],drops:[],hazards:[],objects:[],allies:[],shockwaves:[],objective:null,objectiveState:{},roomComplete:false,roomTimer:0,screenShake:0,flash:0,
    suspended:false
  };
  if(fromResume && save.suspended){ restoreRun(save.suspended); save.suspended=null; persist(); }
  else generateRoom();
  updateHud();
  showScreen('game');
  startAudio();
}

function serializeRun(){
  if(!run) return null;
  return {bug:run.bug,room:run.room,score:run.score,chitin:run.chitin,mutations:run.mutations,god:run.god,player:{hp:run.player.hp,maxHp:run.player.maxHp,charge:run.player.charge}};
}
function restoreRun(s){
  selectedBug=s.bug||'mantis';
  const b=BUGS[selectedBug];
  run.bug=selectedBug;run.room=s.room||1;run.score=s.score||0;run.chitin=s.chitin||0;run.god=!!s.god;
  run.player.hp=b.hp;run.player.maxHp=b.hp;
  (s.mutations||[]).forEach(id=>{const m=MUTATIONS.find(x=>x.id===id);if(m)grantMutation(m,false);});
  run.player.hp=clamp(s.player?.hp??run.player.maxHp,1,run.player.maxHp);run.player.charge=clamp(s.player?.charge||0,0,100);
  generateRoom();
}

function generateRoom(){
  if(!run)return;
  roomClock=0;run.roomComplete=false;run.enemies=[];run.projectiles=[];run.drops=[];run.hazards=[];run.objects=[];run.allies=[];run.shockwaves=[];run.particles=[];run.player.x=W/2;run.player.y=H-80;
  const bossRoom = run.room%4===0;
  if(bossRoom){
    const boss=BOSSES[((run.room/4-1)|0)%BOSSES.length];
    run.objective={id:'boss',label:'PREDATOR BREAK'}; run.objectiveState={boss:boss.id};
    spawnBoss(boss);
    for(let i=0;i<4;i++)spawnHazard();
  }else{
    let o=pick(objectiveDefs);
    if(run.room===1)o=objectiveDefs[0];
    run.objective=o; run.objectiveState={};
    if(o.id==='purge'){
      const count=4+Math.min(7,Math.floor(run.room*.6));run.objectiveState.need=count;run.objectiveState.done=0;
      for(let i=0;i<count;i++)spawnEnemy();
    }else if(o.id==='rescue'){
      run.objectiveState.need=3;run.objectiveState.done=0;
      for(let i=0;i<3;i++)run.objects.push({type:'captive',x:rand(100,W-100),y:rand(100,H-160),r:20,freed:false});
      for(let i=0;i<5+run.room;i++)spawnEnemy();
    }else if(o.id==='vault'){
      run.objectiveState.need=3;run.objectiveState.done=0;
      for(let i=0;i<3;i++)run.objects.push({type:'vault',x:rand(100,W-100),y:rand(100,H-160),r:25,hp:75+run.room*8,maxHp:75+run.room*8});
      for(let i=0;i<4+Math.floor(run.room*.8);i++)spawnEnemy();
    }else if(o.id==='hunt'){
      run.objectiveState.need=1;run.objectiveState.done=0;
      const e=spawnEnemy(true);e.hp*=3.4;e.maxHp=e.hp;e.r*=1.35;e.elite=true;e.color='#ff6b62';
      for(let i=0;i<3+Math.floor(run.room*.6);i++)spawnEnemy();
    }else if(o.id==='dash'){
      run.objectiveState.time=18;run.objectiveState.goal={x:rand(100,W-100),y:80,r:34};
      for(let i=0;i<8+run.room;i++)spawnHazard(true);
      for(let i=0;i<3;i++)spawnEnemy();
    }
  }
  for(let i=0;i<Math.min(8,2+Math.floor(run.room/2));i++)spawnHazard();
  updateHud();
  toast(run.objective.label);
}

function spawnEnemy(marked=false){
  const ids=Object.keys(ENEMY_TYPES);let id=pick(ids.slice(0,Math.min(ids.length,4+Math.floor(run.room/2))));
  const t=ENEMY_TYPES[id];let x,y;do{x=rand(70,W-70);y=rand(70,H-160);}while(Math.hypot(x-run.player.x,y-run.player.y)<150);
  const scale=1+run.room*.055;
  const e={id:Math.random(),type:id,name:t.name,x,y,r:t.r,hp:t.hp*scale,maxHp:t.hp*scale,speed:t.speed*(1+run.room*.012),dmg:t.dmg*(1+run.room*.04),color:t.color,ai:t.ai,vx:0,vy:0,hit:0,attackCd:rand(0,.7),phase:rand(0,10),poison:0,poisonT:0,elite:marked,jumpCd:rand(.5,1.4)};
  run.enemies.push(e);return e;
}
function spawnBoss(b){
  run.enemies.push({id:Math.random(),type:'boss',bossId:b.id,name:b.name,x:W/2,y:120,r:b.r,hp:b.hp*(1+run.room*.03),maxHp:b.hp*(1+run.room*.03),speed:b.speed,dmg:b.dmg,color:b.color,ai:'boss',vx:0,vy:0,hit:0,attackCd:0,phase:0,poison:0,poisonT:0,elite:true,jumpCd:1.2,bossPhase:0});
}
function spawnHazard(force=false){
  const types=['spore','sap','thorn','beam'];const type=pick(types);run.hazards.push({type,x:rand(60,W-60),y:rand(70,H-100),r:type==='beam'?rand(26,38):rand(18,28),phase:rand(0,6.28),active:true});
}

function update(dt){
  if(currentScreen!=='game'||!run)return;
  dt=Math.min(dt,.033);roomClock+=dt;run.roomTimer+=dt;
  const p=run.player;
  p.attackCd=Math.max(0,p.attackCd-dt);p.dashCd=Math.max(0,p.dashCd-dt);p.specialCd=Math.max(0,p.specialCd-dt);p.iframes=Math.max(0,p.iframes-dt);
  if(p.lastHeavy>0)p.lastHeavy-=dt;

  let dx=0,dy=0;
  if(keys.has('ArrowLeft')||keys.has('KeyA')||touchKeys.has('ArrowLeft'))dx--;
  if(keys.has('ArrowRight')||keys.has('KeyD')||touchKeys.has('ArrowRight'))dx++;
  if(keys.has('ArrowUp')||keys.has('KeyW')||touchKeys.has('ArrowUp'))dy--;
  if(keys.has('ArrowDown')||keys.has('KeyS')||touchKeys.has('ArrowDown'))dy++;
  const mag=Math.hypot(dx,dy)||1;dx/=mag;dy/=mag;
  let speed=p.speed*p.speedMul*((p.fury&&p.hp/p.maxHp<.35)?1.14:1);
  p.x=clamp(p.x+dx*speed*dt,32,W-32);p.y=clamp(p.y+dy*speed*dt,32,H-32);
  if(dx||dy)p.facing=Math.atan2(dy,dx);

  if(p.regen>0 && (dx||dy)){
    p.regenT+=dt;if(p.regenT>=3){p.regenT=0;p.hp=clamp(p.hp+p.regen,0,p.maxHp);}
  }

  processActions();
  updateEnemies(dt);updateProjectiles(dt);updateHazards(dt);updateDrops(dt);updateObjects(dt);updateAllies(dt);updateParticles(dt);updateShockwaves(dt);updateOrbitals(dt);checkObjective(dt);
  run.screenShake=Math.max(0,run.screenShake-dt*24);run.flash=Math.max(0,run.flash-dt*4);
  if(p.hp<=0&&!run.god) endRun(false);
  updateHud();
}

function processActions(){
  while(actQueue.length){const a=actQueue.shift();if(a==='attack')attack();else if(a==='dash')dash();else if(a==='special')special();else if(a==='interact')interact();}
}

function attack(){
  const p=run.player;if(p.attackCd>0)return;
  const fury=(p.fury&&p.hp/p.maxHp<.35)?1.6:1;p.attackCd=.42/(p.attackRate*fury);p.combo++;
  playSfx('slash');
  if(run.bug==='moth'){
    const count=p.body.scales?2:1;for(let i=0;i<count;i++){const a=p.facing+(i-(count-1)/2)*.13;run.projectiles.push({x:p.x+Math.cos(a)*18,y:p.y+Math.sin(a)*18,vx:Math.cos(a)*420,vy:Math.sin(a)*420,r:6,dmg:p.attack*p.attackMul,life:1.2,friendly:true,color:BUGS[run.bug].accent,split:false});}
  }else{
    meleeHit(64,1,p.attack*p.attackMul,1.0);
    if(p.doubleHit&&p.combo%4===0)setTimeout(()=>{if(run&&currentScreen==='game')meleeHit(70,1,p.attack*p.attackMul*.65,.8);},80);
  }
  burst(p.x+Math.cos(p.facing)*24,p.y+Math.sin(p.facing)*24,BUGS[run.bug].accent,6,80);
}
function meleeHit(range,arc,damage,knockMul){
  const p=run.player;
  run.enemies.forEach(e=>{const d=dist(p,e);if(d<range+e.r){const ang=Math.atan2(e.y-p.y,e.x-p.x);let diff=Math.atan2(Math.sin(ang-p.facing),Math.cos(ang-p.facing));if(Math.abs(diff)<arc){dealEnemyDamage(e,damage,ang,p.knock*knockMul);}}});
  run.objects.forEach(o=>{if(o.type==='vault'&&o.hp>0&&dist(p,o)<range+o.r){o.hp-=damage;burst(o.x,o.y,'#d8ffc6',5,70);if(o.hp<=0){run.objectiveState.done++;run.chitin+=18;playSfx('break');}}});
}
function dash(){
  const p=run.player;if(p.dashCd>0)return; p.dashCd=BUGS[run.bug].dashCd*p.dashMul;p.iframes=Math.max(p.iframes,p.dashIFrames);
  const d=118*p.dashDist;let a=p.facing;let dx=0,dy=0;
  if(keys.has('ArrowLeft')||keys.has('KeyA')||touchKeys.has('ArrowLeft'))dx--;
  if(keys.has('ArrowRight')||keys.has('KeyD')||touchKeys.has('ArrowRight'))dx++;
  if(keys.has('ArrowUp')||keys.has('KeyW')||touchKeys.has('ArrowUp'))dy--;
  if(keys.has('ArrowDown')||keys.has('KeyS')||touchKeys.has('ArrowDown'))dy++;
  if(dx||dy)a=Math.atan2(dy,dx);p.facing=a;
  const ox=p.x,oy=p.y;p.x=clamp(p.x+Math.cos(a)*d,32,W-32);p.y=clamp(p.y+Math.sin(a)*d,32,H-32);
  if(p.dashDamage>0){run.enemies.forEach(e=>{if(pointSegDist(e.x,e.y,ox,oy,p.x,p.y)<e.r+16)dealEnemyDamage(e,p.dashDamage,a,1.4);});}
  burst(ox,oy,BUGS[run.bug].color,12,150);playSfx('dash');run.screenShake=3;
}
function special(){
  const p=run.player;if(p.specialCd>0||p.charge<100)return;p.charge=0;p.specialCd=5.5*p.specialMul;playSfx('molt');run.flash=settings.reduced?0:.5;run.screenShake=8;
  if(run.bug==='mantis'){
    const ox=p.x,oy=p.y;p.x=clamp(p.x+Math.cos(p.facing)*150,30,W-30);p.y=clamp(p.y+Math.sin(p.facing)*150,30,H-30);run.enemies.forEach(e=>{if(pointSegDist(e.x,e.y,ox,oy,p.x,p.y)<e.r+28)dealEnemyDamage(e,80*p.attackMul,p.facing,2.4);});
  }else if(run.bug==='moth'){
    p.iframes=Math.max(p.iframes,1.15);for(let i=0;i<14;i++){const a=i/14*Math.PI*2;run.projectiles.push({x:p.x,y:p.y,vx:Math.cos(a)*260,vy:Math.sin(a)*260,r:6,dmg:34*p.attackMul,life:1.2,friendly:true,color:'#e8d4ff',split:false});}
    if(p.pollen)run.hazards.push({type:'pollen',x:p.x,y:p.y,r:80,phase:0,active:true,life:5});
  }else{
    run.shockwaves.push({x:p.x,y:p.y,r:15,max:150,life:.55,dmg:70*p.attackMul,color:'#f2ce75'});p.iframes=Math.max(p.iframes,.75);
  }
  if(p.acid)run.hazards.push({type:'acid',x:p.x,y:p.y,r:70,phase:0,active:true,life:4});
  if(p.zeroMolt)setTimeout(()=>{if(run&&currentScreen==='game')run.shockwaves.push({x:run.player.x,y:run.player.y,r:15,max:125,life:.5,dmg:44*run.player.attackMul,color:'#9df56f'});},600);
  burst(p.x,p.y,'#ffffff',24,220);
}
function interact(){
  const p=run.player;
  if(run.objective?.id==='rescue')run.objects.forEach(o=>{if(o.type==='captive'&&!o.freed&&dist(p,o)<58){o.freed=true;run.objectiveState.done++;run.chitin+=12;playSfx('rescue');if(p.broodSignal)run.allies.push({x:o.x,y:o.y,r:10,life:18,attackCd:0});}});
}

function dealEnemyDamage(e,raw,ang=0,knock=1){
  if(e.hp<=0)return;let dmg=raw;if(run.player.execute&&e.hp/e.maxHp<.3)dmg*=1+run.player.execute;let crit=Math.random()<run.player.crit;if(crit)dmg*=1.8;e.hp-=dmg;e.hit=.12;e.vx+=Math.cos(ang)*120*knock;e.vy+=Math.sin(ang)*120*knock;
  if(run.player.venom){e.poison=Math.max(e.poison,run.player.venom);e.poisonT=3;}
  run.player.hp=clamp(run.player.hp+dmg*run.player.lifesteal,0,run.player.maxHp);
  run.player.charge=clamp(run.player.charge+(6+(crit?5:0))*run.player.chargeMul,0,100);
  if(crit&&run.player.chain){const other=run.enemies.find(x=>x!==e&&x.hp>0&&dist(x,e)<125);if(other)dealEnemyDamage(other,14,Math.atan2(other.y-e.y,other.x-e.x),.3);}
  burst(e.x,e.y,crit?'#ffffff':e.color,crit?10:5,crit?160:90);
  if(e.hp<=0)killEnemy(e);
}
function killEnemy(e){
  if(e.dead)return;e.dead=true;run.kills++;run.score+=Math.round(e.maxHp*(e.type==='boss'?3:1));const drops=e.type==='boss'?14:e.elite?5:Math.random()<.72?1:0;for(let i=0;i<drops;i++)run.drops.push({x:e.x+rand(-12,12),y:e.y+rand(-12,12),vx:rand(-80,80),vy:rand(-80,80),v: e.type==='boss'?6:e.elite?4:2});
  if(run.objective?.id==='purge')run.objectiveState.done++;
  if(run.objective?.id==='hunt'&&e.elite)run.objectiveState.done=1;
  if(e.type==='boss'){
    if(!save.bosses.includes(e.bossId))save.bosses.push(e.bossId);persist();
    run.objectiveState.done=1;
  }
  playSfx(e.type==='boss'?'bossdown':'hit');run.screenShake=e.type==='boss'?12:3;burst(e.x,e.y,e.color,e.type==='boss'?36:14,e.type==='boss'?300:140);
}
function damagePlayer(amount,source){
  const p=run.player;if(p.iframes>0||run.god)return;const dmg=Math.max(1,amount*p.damageTaken);p.hp-=dmg;p.iframes=.45;run.screenShake=7;playSfx('hurt');burst(p.x,p.y,'#ff7c72',12,170);
  if(p.thorns&&source)dealEnemyDamage(source,p.thorns,Math.atan2(source.y-p.y,source.x-p.x),.7);
  if(p.shellBurst&&dmg>=15&&p.lastHeavy<=0){p.lastHeavy=2;run.shockwaves.push({x:p.x,y:p.y,r:10,max:100,life:.4,dmg:34,color:'#ff9b7d'});}
}

function updateEnemies(dt){
  const p=run.player;
  for(const e of run.enemies){if(e.dead)continue;e.hit=Math.max(0,e.hit-dt);e.attackCd-=dt;e.phase+=dt;e.jumpCd-=dt;if(e.poisonT>0){e.poisonT-=dt;e.poisonT=Math.max(0,e.poisonT);e.hp-=e.poison*dt;if(e.hp<=0)killEnemy(e);}
    let dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy)||1,ux=dx/d,uy=dy/d;let sp=e.speed;
    if(e.ai==='zig'){const side=Math.sin(e.phase*5);e.vx+=(-uy*side+ux)*sp*dt*2.2;e.vy+=(ux*side+uy)*sp*dt*2.2;}
    else if(e.ai==='orbit'){const side=Math.sin(e.phase*1.6)>0?1:-1;e.vx+=(ux*.55-uy*.8*side)*sp*dt*2;e.vy+=(uy*.55+ux*.8*side)*sp*dt*2;if(d<170&&e.attackCd<=0){e.attackCd=1.4;enemyShot(e,Math.atan2(dy,dx));}}
    else if(e.ai==='jump'){if(e.jumpCd<=0){e.jumpCd=1.6;e.vx+=ux*sp*2.8;e.vy+=uy*sp*2.8;}else{e.vx+=ux*sp*dt;e.vy+=uy*sp*dt;}}
    else if(e.ai==='rush'){e.vx+=ux*sp*dt*2.7;e.vy+=uy*sp*dt*2.7;}
    else if(e.ai==='tank'){e.vx+=ux*sp*dt*1.5;e.vy+=uy*sp*dt*1.5;}
    else if(e.ai==='boss')updateBoss(e,dt,d,ux,uy);
    else{e.vx+=ux*sp*dt*2;e.vy+=uy*sp*dt*2;}
    e.vx*=Math.pow(.04,dt);e.vy*=Math.pow(.04,dt);e.x=clamp(e.x+e.vx*dt,22,W-22);e.y=clamp(e.y+e.vy*dt,22,H-22);
    if(dist(e,p)<e.r+p.r+3&&e.attackCd<=0){e.attackCd=e.type==='boss'?.75:1.05;damagePlayer(e.dmg,e);const a=Math.atan2(p.y-e.y,p.x-e.x);p.x=clamp(p.x+Math.cos(a)*20,30,W-30);p.y=clamp(p.y+Math.sin(a)*20,30,H-30);}
  }
  run.enemies=run.enemies.filter(e=>!e.dead);
}
function updateBoss(e,dt,d,ux,uy){
  e.bossPhase+=dt;
  if(e.bossId==='orbweaver'){
    const side=Math.sin(e.bossPhase*.9);e.vx+=(ux*.45-uy*side*.85)*e.speed*dt*2;e.vy+=(uy*.45+ux*side*.85)*e.speed*dt*2;
    if(e.attackCd<=0){e.attackCd=1.2;for(let i=-2;i<=2;i++)enemyShot(e,Math.atan2(run.player.y-e.y,run.player.x-e.x)+i*.18,175);}
  }else if(e.bossId==='centipede'){
    const rush=(Math.sin(e.bossPhase*1.3)>-.3)?2.3:.6;e.vx+=ux*e.speed*dt*2*rush;e.vy+=uy*e.speed*dt*2*rush;
    if(e.attackCd<=0){e.attackCd=1.7;run.hazards.push({type:'thorn',x:run.player.x+rand(-80,80),y:run.player.y+rand(-80,80),r:34,phase:0,active:true,life:2.4});}
  }else{
    const side=Math.sin(e.bossPhase*2);e.vx+=(ux*.35-uy*side)*e.speed*dt*2;e.vy+=(uy*.35+ux*side)*e.speed*dt*2;
    if(e.attackCd<=0){e.attackCd=.85;for(let i=-1;i<=1;i++)enemyShot(e,Math.atan2(run.player.y-e.y,run.player.x-e.x)+i*.13,240);}
  }
}
function enemyShot(e,a,speed=190){run.projectiles.push({x:e.x,y:e.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:6,dmg:e.dmg*.72,life:2.6,friendly:false,color:e.color});playSfx('enemy');}

function updateProjectiles(dt){
  for(const q of run.projectiles){q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt;
    if(q.friendly){for(const e of run.enemies){if(!e.dead&&Math.hypot(q.x-e.x,q.y-e.y)<q.r+e.r){dealEnemyDamage(e,q.dmg,Math.atan2(q.vy,q.vx),.4);q.life=0;if(run.player.splitShot&&!q.split){q.split=true;for(let s of [-.45,.45]){const a=Math.atan2(q.vy,q.vx)+s;run.projectiles.push({...q,x:q.x,y:q.y,vx:Math.cos(a)*300,vy:Math.sin(a)*300,dmg:q.dmg*.55,life:.8,split:true});}}break;}}}
    else if(Math.hypot(q.x-run.player.x,q.y-run.player.y)<q.r+run.player.r){damagePlayer(q.dmg,null);q.life=0;}
  }
  run.projectiles=run.projectiles.filter(q=>q.life>0&&q.x>-50&&q.x<W+50&&q.y>-50&&q.y<H+50);
}
function updateHazards(dt){
  for(const h of run.hazards){h.phase+=dt;if(h.life!=null){h.life-=dt;if(h.life<=0)h.active=false;}
    if(!h.active)continue;const p=run.player;const d=Math.hypot(h.x-p.x,h.y-p.y);
    if(h.type==='sap'&&d<h.r+p.r){p.x-=Math.cos(p.facing)*35*dt;p.y-=Math.sin(p.facing)*35*dt;}
    if(h.type==='thorn'&&d<h.r+p.r&&Math.sin(h.phase*5)>.25)damagePlayer(9,null);
    if(h.type==='spore'&&d<h.r+p.r)p.charge=clamp(p.charge-12*dt,0,100);
    if(h.type==='beam'){const on=Math.sin(h.phase*2.3)>.05;if(on&&d<h.r+p.r)damagePlayer(12,null);}
    if((h.type==='pollen'||h.type==='acid')){for(const e of run.enemies){if(!e.dead&&Math.hypot(h.x-e.x,h.y-e.y)<h.r+e.r){e.hp-=((h.type==='acid'?22:14)*dt);if(e.hp<=0)killEnemy(e);}}}
  }
  run.hazards=run.hazards.filter(h=>h.active);
}
function updateDrops(dt){
  const p=run.player;for(const d of run.drops){d.vx*=Math.pow(.08,dt);d.vy*=Math.pow(.08,dt);let dx=p.x-d.x,dy=p.y-d.y,dd=Math.hypot(dx,dy)||1;if(dd<p.magnet){d.vx+=dx/dd*680*dt;d.vy+=dy/dd*680*dt;}d.x+=d.vx*dt;d.y+=d.vy*dt;if(dd<22){d.dead=true;run.chitin+=d.v;run.score+=d.v*3;playSfx('pickup');}}
  run.drops=run.drops.filter(d=>!d.dead);
}
function updateObjects(dt){ /* object state handled by interactions/attacks */ }
function updateAllies(dt){
  for(const a of run.allies){a.life-=dt;a.attackCd-=dt;let t=run.enemies.reduce((best,e)=>!e.dead&&(!best||dist(a,e)<dist(a,best))?e:best,null);if(t){const dx=t.x-a.x,dy=t.y-a.y,d=Math.hypot(dx,dy)||1;a.x+=dx/d*140*dt;a.y+=dy/d*140*dt;if(d<55&&a.attackCd<=0){a.attackCd=.65;dealEnemyDamage(t,12,Math.atan2(dy,dx),.25);}}}
  run.allies=run.allies.filter(a=>a.life>0);
}
function updateParticles(dt){for(const p of run.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.pow(.08,dt);p.vy*=Math.pow(.08,dt);p.life-=dt;p.r*=Math.pow(.35,dt);}run.particles=run.particles.filter(p=>p.life>0);}
function updateShockwaves(dt){for(const s of run.shockwaves){const prev=s.r;s.life-=dt;s.r+=(s.max-s.r)*dt*8;if(!s.hit)s.hit=new Set();for(const e of run.enemies){if(e.dead||s.hit.has(e.id))continue;const d=dist(s,e);if(d<e.r+s.r&&d>prev-e.r){s.hit.add(e.id);dealEnemyDamage(e,s.dmg,Math.atan2(e.y-s.y,e.x-s.x),1.5);}}}run.shockwaves=run.shockwaves.filter(s=>s.life>0);}
function updateOrbitals(dt){const p=run.player;if(!p.orbs)return;for(let i=0;i<p.orbs;i++){const a=roomClock*2.4+i/p.orbs*Math.PI*2;const ox=p.x+Math.cos(a)*48,oy=p.y+Math.sin(a)*48;for(const e of run.enemies){if(!e.dead&&Math.hypot(ox-e.x,oy-e.y)<e.r+9&&(!e.orbHit||roomClock-e.orbHit>.55)){e.orbHit=roomClock;dealEnemyDamage(e,14,a,.25);}}}}

function checkObjective(dt){
  if(run.roomComplete)return;
  const o=run.objective,s=run.objectiveState;
  if(o.id==='purge'&&s.done>=s.need)completeRoom();
  if(o.id==='rescue'&&s.done>=s.need)completeRoom();
  if(o.id==='vault'&&s.done>=s.need)completeRoom();
  if(o.id==='hunt'&&s.done>=1)completeRoom();
  if(o.id==='boss'&&run.enemies.every(e=>e.type!=='boss'))completeRoom();
  if(o.id==='dash'){
    s.time-=dt;if(s.time<=0){damagePlayer(999,null);}
    const g=s.goal;if(g&&Math.hypot(g.x-run.player.x,g.y-run.player.y)<g.r+run.player.r)completeRoom();
  }
}
function completeRoom(){
  if(run.roomComplete)return;run.roomComplete=true;run.score+=250+run.room*35;run.chitin+=10;save.bestRoom=Math.max(save.bestRoom,run.room);persist();playSfx('complete');toast('CHAMBER CLEARED');
  setTimeout(()=>{if(!run)return;if(run.room>=12){endRun(true);return;}run.room++;showMutation();},650);
}

function showMutation(){
  const choices=shuffle(MUTATIONS.filter(m=>!run.mutations.includes(m.id))).slice(0,3);
  if(!choices.length){generateRoom();showScreen('game');return;}
  const box=$('#mutationChoices');box.innerHTML='';choices.forEach(m=>{const b=document.createElement('button');b.className='mutation-option';b.innerHTML=`<span class="tier">${m.tier}</span><h3>${m.name}</h3><p>${m.desc}</p><span class="tag">${m.tag}</span>`;b.addEventListener('click',()=>{grantMutation(m,true);generateRoom();showScreen('game');});box.appendChild(b);});
  $('#rerollCost').textContent=20+run.mutations.length*2;openOverlay('mutation');
}
function grantMutation(m,announce=true){
  if(run.mutations.includes(m.id))return;run.mutations.push(m.id);m.apply(run.player);if(!save.mutations.includes(m.id)){save.mutations.push(m.id);persist();}if(announce)playSfx('mutation');
}

function updateHud(){if(!run)return;const p=run.player;$('#hudRoom').textContent=run.room;$('#hudChitin').textContent=run.chitin;$('#hudObjectiveType').textContent=run.objective?.label||'OBJECTIVE';
  let txt='';const o=run.objective,s=run.objectiveState;if(!o)txt='';else if(o.id==='purge')txt=`Defeat hunters ${s.done||0} / ${s.need||0}`;else if(o.id==='rescue')txt=`Free captives ${s.done||0} / ${s.need||0}`;else if(o.id==='vault')txt=`Break vault nodes ${s.done||0} / ${s.need||0}`;else if(o.id==='hunt')txt='Eliminate the marked hunter';else if(o.id==='dash')txt=`Reach rupture point ${Math.max(0,s.time||0).toFixed(1)}s`;else if(o.id==='boss')txt='Break the apex predator';$('#hudObjective').textContent=txt;
  $('#hpText').textContent=`${Math.max(0,Math.ceil(p.hp))} / ${Math.ceil(p.maxHp)}`;$('#hpBar').style.width=`${clamp(p.hp/p.maxHp*100,0,100)}%`;$('#energyText').textContent=`${Math.floor(p.charge)}%`;$('#energyBar').style.width=`${p.charge}%`;
}

function draw(){
  ctx.save();ctx.clearRect(0,0,W,H);let sx=0,sy=0;if(run&&settings.shake&&run.screenShake>0){sx=rand(-run.screenShake,run.screenShake);sy=rand(-run.screenShake,run.screenShake);}ctx.translate(sx,sy);
  drawArena();if(run){drawHazards();drawObjects();drawDrops();drawAllies();drawEnemies();drawProjectiles();drawPlayer();drawParticles();drawShockwaves();drawObjectiveMarker();}
  ctx.restore();if(run&&run.flash>0){ctx.fillStyle=`rgba(255,255,255,${Math.min(.35,run.flash)})`;ctx.fillRect(0,0,W,H);}
}
function drawArena(){
  const grad=ctx.createRadialGradient(W*.5,H*.35,30,W*.5,H*.35,620);grad.addColorStop(0,'#132018');grad.addColorStop(.52,'#0a100c');grad.addColorStop(1,'#050806');ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(141,181,151,.055)';ctx.lineWidth=1;for(let x=20;x<W;x+=46){ctx.beginPath();ctx.moveTo(x,0);ctx.quadraticCurveTo(x+18,H/2,x-8,H);ctx.stroke();}for(let y=24;y<H;y+=46){ctx.beginPath();ctx.moveTo(0,y);ctx.quadraticCurveTo(W/2,y+15,W,y-10);ctx.stroke();}
  ctx.strokeStyle='rgba(157,245,111,.08)';ctx.lineWidth=2;ctx.strokeRect(18,18,W-36,H-36);
}
function drawHazards(){for(const h of run.hazards){ctx.save();ctx.translate(h.x,h.y);if(h.type==='sap'){ctx.fillStyle='rgba(211,170,79,.16)';blob(h.r,7);ctx.fill();ctx.strokeStyle='rgba(231,183,91,.35)';ctx.stroke();}else if(h.type==='spore'){ctx.fillStyle='rgba(131,104,171,.12)';ctx.beginPath();ctx.arc(0,0,h.r,0,Math.PI*2);ctx.fill();for(let i=0;i<7;i++){const a=i*1.9+h.phase;ctx.fillStyle='rgba(192,139,255,.28)';ctx.beginPath();ctx.arc(Math.cos(a)*h.r*.6,Math.sin(a)*h.r*.6,3,0,Math.PI*2);ctx.fill();}}else if(h.type==='thorn'){const pulse=.75+.25*Math.sin(h.phase*5);ctx.strokeStyle=`rgba(255,107,98,${.35*pulse})`;ctx.lineWidth=4;for(let i=0;i<6;i++){const a=i/6*Math.PI*2;ctx.beginPath();ctx.moveTo(Math.cos(a)*6,Math.sin(a)*6);ctx.lineTo(Math.cos(a)*h.r,Math.sin(a)*h.r);ctx.stroke();}}else if(h.type==='beam'){const on=Math.sin(h.phase*2.3)>.05;ctx.fillStyle=on?'rgba(255,226,160,.16)':'rgba(255,226,160,.05)';ctx.beginPath();ctx.arc(0,0,h.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle=on?'rgba(255,226,160,.65)':'rgba(255,226,160,.2)';ctx.stroke();}else{ctx.fillStyle=h.type==='acid'?'rgba(157,245,111,.16)':'rgba(192,139,255,.13)';ctx.beginPath();ctx.arc(0,0,h.r,0,Math.PI*2);ctx.fill();}ctx.restore();}}
function drawObjects(){for(const o of run.objects){ctx.save();ctx.translate(o.x,o.y);if(o.type==='captive'){ctx.strokeStyle=o.freed?'rgba(157,245,111,.25)':'#8da596';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,0,14,22,0,0,Math.PI*2);ctx.stroke();if(!o.freed){ctx.strokeStyle='rgba(255,255,255,.18)';for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(-16,i*9);ctx.lineTo(16,i*9);ctx.stroke();}}}else if(o.type==='vault'&&o.hp>0){ctx.fillStyle='#233328';ctx.strokeStyle='#99c47b';ctx.lineWidth=3;hex(0,0,o.r);ctx.fill();ctx.stroke();ctx.fillStyle='#9df56f';ctx.fillRect(-20,o.r+8,40*clamp(o.hp/o.maxHp,0,1),3);}ctx.restore();}}
function drawDrops(){for(const d of run.drops){ctx.save();ctx.translate(d.x,d.y);ctx.rotate(roomClock*2+d.x);ctx.fillStyle='#d8ffc6';hex(0,0,6);ctx.fill();ctx.restore();}}
function drawAllies(){for(const a of run.allies){ctx.fillStyle='#8fd1b2';ctx.beginPath();ctx.arc(a.x,a.y,a.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#d5ffee';ctx.beginPath();ctx.moveTo(a.x-a.r,a.y);ctx.lineTo(a.x+a.r,a.y);ctx.stroke();}}
function drawEnemies(){for(const e of run.enemies){ctx.save();ctx.translate(e.x,e.y);if(e.hit>0)ctx.globalCompositeOperation='screen';if(e.type==='boss')drawBoss(e);else drawEnemyBug(e);ctx.restore();drawHealth(e);}}
function drawEnemyBug(e){
  ctx.rotate(Math.atan2(run.player.y-e.y,run.player.x-e.x));ctx.fillStyle=e.hit>0?'#ffffff':e.color;ctx.strokeStyle='rgba(240,255,245,.35)';ctx.lineWidth=2;
  ctx.beginPath();ctx.ellipse(0,0,e.r*1.05,e.r*.7,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(e.r*.9,0,e.r*.45,0,Math.PI*2);ctx.fill();
  for(let s of [-1,1])for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(i*3,s*e.r*.45);ctx.lineTo((i-1)*12,s*e.r*1.25);ctx.stroke();}
  if(e.elite){ctx.strokeStyle='#ff8d84';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,e.r+7,0,Math.PI*2);ctx.stroke();}
}
function drawBoss(e){
  ctx.rotate(roomClock*.12);ctx.fillStyle=e.color;ctx.strokeStyle='#eef6ef';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,0,e.r*1.2,e.r*.72,0,0,Math.PI*2);ctx.fill();ctx.stroke();
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2;ctx.beginPath();ctx.moveTo(Math.cos(a)*e.r*.8,Math.sin(a)*e.r*.5);ctx.lineTo(Math.cos(a)*e.r*1.75,Math.sin(a)*e.r*1.35);ctx.stroke();}
  ctx.fillStyle='#111';ctx.beginPath();ctx.arc(e.r*.55,-8,5,0,Math.PI*2);ctx.arc(e.r*.55,8,5,0,Math.PI*2);ctx.fill();
}
function drawHealth(e){const w=e.type==='boss'?150:36;if(e.hp>=e.maxHp&&!e.elite&&e.type!=='boss')return;ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(e.x-w/2,e.y-e.r-18,w,5);ctx.fillStyle=e.type==='boss'?'#e7b75b':'#ff766e';ctx.fillRect(e.x-w/2,e.y-e.r-18,w*clamp(e.hp/e.maxHp,0,1),5);if(e.type==='boss'){ctx.fillStyle='#eef6ef';ctx.font='700 12px system-ui';ctx.textAlign='center';ctx.fillText(e.name,e.x,e.y-e.r-25);}}
function drawProjectiles(){for(const q of run.projectiles){ctx.fillStyle=q.color;ctx.beginPath();ctx.arc(q.x,q.y,q.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.32)';ctx.stroke();}}
function drawPlayer(){const p=run.player;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.facing);if(p.iframes>0&&Math.floor(roomClock*18)%2===0)ctx.globalAlpha=.45;const c=BUGS[run.bug].color;
  if(p.body.wings||run.bug==='moth'){ctx.fillStyle='rgba(210,225,255,.16)';ctx.strokeStyle='rgba(220,240,255,.55)';ctx.lineWidth=2;for(let s of [-1,1]){ctx.beginPath();ctx.ellipse(-5,s*18,28,12,s*.35,0,Math.PI*2);ctx.fill();ctx.stroke();}}
  if(p.body.spines){ctx.strokeStyle='#eaf4e8';for(let i=0;i<8;i++){const a=i/8*Math.PI*2;ctx.beginPath();ctx.moveTo(Math.cos(a)*14,Math.sin(a)*14);ctx.lineTo(Math.cos(a)*26,Math.sin(a)*26);ctx.stroke();}}
  ctx.fillStyle='#17241b';ctx.strokeStyle=c;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,0,19,13,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(18,0,10,0,Math.PI*2);ctx.fill();ctx.stroke();
  if(p.body.plates||p.body.fortress){ctx.strokeStyle='#d8ffc6';ctx.lineWidth=4;ctx.beginPath();ctx.arc(-4,0,18,-1.2,1.2);ctx.stroke();}
  if(p.body.razor||run.bug==='mantis'){ctx.strokeStyle=p.body.razor?'#ffffff':c;ctx.lineWidth=p.body.razor?5:3;for(let s of [-1,1]){ctx.beginPath();ctx.moveTo(10,s*9);ctx.lineTo(33,s*20);ctx.lineTo(48,s*8);ctx.stroke();}}
  if(p.body.horn||run.bug==='stag'){ctx.strokeStyle='#ffe4a8';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(23,0);ctx.lineTo(46,-10);ctx.moveTo(23,0);ctx.lineTo(46,10);ctx.stroke();}
  if(p.body.antenna){ctx.strokeStyle='#d5ead9';ctx.lineWidth=2;for(let s of [-1,1]){ctx.beginPath();ctx.moveTo(22,s*4);ctx.quadraticCurveTo(36,s*20,50,s*26);ctx.stroke();}}
  if(p.body.venom){ctx.fillStyle='#9df56f';ctx.beginPath();ctx.arc(-18,0,5,0,Math.PI*2);ctx.fill();}
  if(p.body.eye){ctx.fillStyle='#e7b75b';ctx.beginPath();ctx.arc(22,-4,3,0,Math.PI*2);ctx.arc(22,4,3,0,Math.PI*2);ctx.fill();}
  ctx.restore();
  if(p.orbs){for(let i=0;i<p.orbs;i++){const a=roomClock*2.4+i/p.orbs*Math.PI*2;ctx.fillStyle='#c6fff0';ctx.beginPath();ctx.arc(p.x+Math.cos(a)*48,p.y+Math.sin(a)*48,8,0,Math.PI*2);ctx.fill();}}
}
function drawParticles(){for(const p of run.particles){ctx.globalAlpha=clamp(p.life*2,0,1);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,Math.max(1,p.r),0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}}
function drawShockwaves(){for(const s of run.shockwaves){ctx.strokeStyle=s.color;ctx.globalAlpha=clamp(s.life*2,0,1);ctx.lineWidth=4;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}}
function drawObjectiveMarker(){if(run.objective?.id==='dash'){const g=run.objectiveState.goal;if(g){ctx.strokeStyle='#9df56f';ctx.lineWidth=4;ctx.beginPath();ctx.arc(g.x,g.y,g.r+Math.sin(roomClock*5)*5,0,Math.PI*2);ctx.stroke();ctx.fillStyle='rgba(157,245,111,.08)';ctx.fill();}}}
function blob(r,n){ctx.beginPath();for(let i=0;i<=n;i++){const a=i/n*Math.PI*2,rr=r*(.82+.18*Math.sin(i*2.4+roomClock));const x=Math.cos(a)*rr,y=Math.sin(a)*rr;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.closePath();}
function hex(x,y,r){ctx.beginPath();for(let i=0;i<6;i++){const a=i/6*Math.PI*2;const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.closePath();}
function burst(x,y,color,count=8,speed=100){if(!run)return;for(let i=0;i<count;i++){const a=rand(0,Math.PI*2),s=rand(speed*.35,speed);run.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:rand(2,5),life:rand(.25,.65),color});}}
function pointSegDist(px,py,x1,y1,x2,y2){const l2=(x2-x1)**2+(y2-y1)**2;if(!l2)return Math.hypot(px-x1,py-y1);let t=((px-x1)*(x2-x1)+(py-y1)*(y2-y1))/l2;t=clamp(t,0,1);return Math.hypot(px-(x1+t*(x2-x1)),py-(y1+t*(y2-y1)));}

function endRun(win){
  if(!run)return;save.bestRoom=Math.max(save.bestRoom,run.room);save.suspended=null;persist();$('#resultEyebrow').textContent=win?'MOLT SEQUENCE COMPLETE':'RUN TERMINATED';$('#resultTitle').textContent=win?'ZERO FORM STABILIZED':'SHELL FAILURE';$('#resultRoom').textContent=run.room;$('#resultMutations').textContent=run.mutations.length;$('#resultScore').textContent=run.score.toLocaleString();stopMusic();openOverlay('gameover');
}

function renderCodex(){const box=$('#codexGrid');box.innerHTML='';for(const m of MUTATIONS){const found=save.mutations.includes(m.id);const d=document.createElement('div');d.className='codex-entry'+(found?'':' locked');d.innerHTML=`<h3>${found?m.name:'UNKNOWN GENOME'}</h3><p>${found?m.desc:'Discover this mutation during a run.'}</p>`;box.appendChild(d);}}

function startAudio(){
  if(!audio){const A=window.AudioContext||window.webkitAudioContext;if(!A)return;audio=new A();}
  if(audio.state==='suspended')audio.resume();startMusic();
}
function gainFor(type){const master=Math.min(settings.master/100,8);const sub=Math.min(settings[type]/100,8);return master*sub;}
function playSfx(kind){if(!audio||settings.sfx<=0||settings.master<=0)return;const now=audio.currentTime;const osc=audio.createOscillator(),g=audio.createGain();let f=220,d=.07,type='square';if(kind==='slash'){f=370;d=.05;type='sawtooth'}if(kind==='dash'){f=120;d=.11;type='triangle'}if(kind==='hurt'){f=95;d=.16;type='sawtooth'}if(kind==='pickup'){f=720;d=.045;type='sine'}if(kind==='mutation'){f=260;d=.35;type='triangle'}if(kind==='complete'){f=460;d=.28;type='sine'}if(kind==='molt'){f=80;d=.45;type='sawtooth'}if(kind==='bossdown'){f=60;d=.6;type='square'}if(kind==='enemy'){f=190;d=.04;type='square'}if(kind==='rescue'){f=620;d=.14;type='sine'}if(kind==='break'){f=130;d=.12;type='square'}osc.type=type;osc.frequency.setValueAtTime(f,now);osc.frequency.exponentialRampToValueAtTime(Math.max(30,f*(kind==='pickup'?1.6:.55)),now+d);g.gain.setValueAtTime(.025*gainFor('sfx'),now);g.gain.exponentialRampToValueAtTime(.0001,now+d);osc.connect(g).connect(audio.destination);osc.start(now);osc.stop(now+d);}
function startMusic(){stopMusic();if(!audio||settings.music<=0||settings.master<=0)return;musicStep=0;const tick=()=>{if(!audio||currentScreen!=='game'||settings.music<=0)return;const scale=[55,65.4,73.4,82.4,98];const roomBand=((run?.room||1)-1)%4;const pattern=[[0,2,1,3,0,4,2,1],[0,1,3,2,4,2,3,1],[0,3,2,4,1,2,4,3],[0,4,3,2,1,3,4,2]][roomBand];const base=scale[pattern[musicStep%pattern.length]];musicNote(base,musicStep%4===0?.18:.08,.18);if(musicStep%8===4)musicNote(base*2,.04,.09,'triangle');musicStep++;musicTimer=setTimeout(tick,230-roomBand*12);};tick();}
function musicNote(freq,vol,dur,type='sine'){if(!audio)return;const o=audio.createOscillator(),g=audio.createGain(),now=audio.currentTime;o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(vol*.04*gainFor('music'),now);g.gain.exponentialRampToValueAtTime(.0001,now+dur);o.connect(g).connect(audio.destination);o.start();o.stop(now+dur);}
function stopMusic(){clearTimeout(musicTimer);musicTimer=0;}

function loop(now){const dt=(now-last)/1000;last=now;update(dt);draw();raf=requestAnimationFrame(loop);}

// UI wiring
$('#newRunBtn').addEventListener('click',()=>{save.suspended=null;persist();newRun(false);});
$('#continueBtn').addEventListener('click',()=>newRun(true));
$$('.bug-tab').forEach(b=>b.addEventListener('click',()=>{selectedBug=b.dataset.bug;persist();updateBugDescription();}));
$('#pauseBtn').addEventListener('click',()=>{if(run){openOverlay('pause');stopMusic();}});
$('#resumeBtn').addEventListener('click',()=>{showScreen('game');startMusic();});
$('#abandonBtn').addEventListener('click',()=>{if(run){save.suspended=null;persist();run=null;stopMusic();showScreen('menu');}});
$('#retryBtn').addEventListener('click',()=>newRun(false));
$('#menuBtn').addEventListener('click',()=>{run=null;showScreen('menu');updateMenuStats();});

function openSettings(from){settingsReturn=from;$('#masterVol').value=settings.master;$('#musicVol').value=settings.music;$('#sfxVol').value=settings.sfx;$('#screenShake').checked=settings.shake;$('#reducedFlash').checked=settings.reduced;refreshSettingsLabels();openOverlay('settings');}
$('#settingsBtn').addEventListener('click',()=>openSettings('menu'));$('#gameSettingsBtn').addEventListener('click',()=>{save.suspended=serializeRun();persist();stopMusic();openSettings('game');});$('#pauseSettingsBtn').addEventListener('click',()=>openSettings('pause'));
$('#closeSettingsBtn').addEventListener('click',()=>{persist();showScreen(settingsReturn);if(settingsReturn==='game')startMusic();});
function refreshSettingsLabels(){$('#masterVal').textContent=settings.master+'%';$('#musicVal').textContent=settings.music+'%';$('#sfxVal').textContent=settings.sfx+'%';}
['master','music','sfx'].forEach(k=>{const el=$('#'+k+'Vol');el.addEventListener('input',()=>{settings[k]=Number(el.value);refreshSettingsLabels();if(k!=='sfx'&&currentScreen==='settings'){stopMusic();}});});
$('#screenShake').addEventListener('change',e=>settings.shake=e.target.checked);$('#reducedFlash').addEventListener('change',e=>settings.reduced=e.target.checked);
$('#exportBtn').addEventListener('click',()=>{$('#saveBox').value=btoa(unescape(encodeURIComponent(JSON.stringify(save))));});
$('#importBtn').addEventListener('click',()=>{try{const s=JSON.parse(decodeURIComponent(escape(atob($('#saveBox').value.trim()))));save={...defaultSave(),...s,settings:{...defaultSave().settings,...(s.settings||{})}};settings=save.settings;selectedBug=save.selectedBug||'mantis';persist();$('#saveBox').value='Save imported.';}catch(e){$('#saveBox').value='Invalid save data.';}});
$('#resetBtn').addEventListener('click',()=>{if(confirm('Reset all MOLT: ZERO progress?')){save=defaultSave();settings=save.settings;selectedBug='mantis';persist();$('#saveBox').value='Data reset.';}});

$('#codexBtn').addEventListener('click',()=>{renderCodex();openOverlay('codex');});$('#closeCodexBtn').addEventListener('click',()=>showScreen('menu'));
function openOwner(from){settingsReturn=from;if(from==='game')stopMusic();$('#ownerError').textContent='';$('#ownerCode').value='';$('#ownerTools').hidden=true;$('#ownerLock').hidden=false;openOverlay('owner');}
$('#ownerBtn').addEventListener('click',()=>openOwner('menu'));
$('#gameOwnerBtn').addEventListener('click',()=>openOwner('game'));
$('#closeOwnerBtn').addEventListener('click',()=>{showScreen(settingsReturn);if(settingsReturn==='game')startMusic();});
$('#unlockOwnerBtn').addEventListener('click',()=>{if($('#ownerCode').value===OWNER_CODE){$('#ownerLock').hidden=true;$('#ownerTools').hidden=false;$('#ownerError').textContent='';}else $('#ownerError').textContent='ACCESS DENIED';});
$$('[data-owner]').forEach(b=>b.addEventListener('click',()=>ownerAction(b.dataset.owner)));
function ownerAction(a){
  let msg='';if(a==='unlock'){save.mutations=MUTATIONS.map(m=>m.id);save.bosses=BOSSES.map(b=>b.id);persist();msg='Codex unlocked.';}
  else if(!run){msg='Start a run to use this control.';}
  else if(a==='god'){run.god=!run.god;msg='God mode '+(run.god?'enabled.':'disabled.');}
  else if(a==='chitin'){run.chitin+=500;msg='500 run chitin added.';}
  else if(a==='complete'){msg='Chamber completed.';$('#owner').classList.remove('active');showScreen('game');completeRoom();return;}
  else if(a==='mutation'){const pool=MUTATIONS.filter(m=>!run.mutations.includes(m.id));if(pool.length)grantMutation(pick(pool),true);msg='Mutation granted.';}
  else if(a==='boss'){spawnBoss(pick(BOSSES));msg='Predator spawned.';}
  else if(a==='heal'){run.player.hp=run.player.maxHp;msg='Shell repaired.';}
  else if(a==='charge'){run.player.charge=100;msg='Molt charge maxed.';}
  $('#ownerStatus').textContent=msg;updateHud();
}

$('#rerollBtn').addEventListener('click',()=>{const c=20+run.mutations.length*2;if(run.chitin<c){return;}run.chitin-=c;showMutation();});
$('#repairBtn').addEventListener('click',()=>{if(run.chitin<30)return;run.chitin-=30;run.player.hp=clamp(run.player.hp+45,0,run.player.maxHp);updateHud();});

window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();keys.add(e.code);if(currentScreen==='game'){if(e.code==='Space'||e.code==='KeyK')actQueue.push('dash');if(e.code==='KeyJ'||e.code==='KeyX')actQueue.push('attack');if(e.code==='KeyL'||e.code==='KeyC')actQueue.push('special');if(e.code==='KeyE')actQueue.push('interact');if(e.code==='Escape'){$('#pauseBtn').click();}}});
window.addEventListener('keyup',e=>keys.delete(e.code));
$$('[data-key]').forEach(b=>{const k=b.dataset.key;const down=e=>{e.preventDefault();touchKeys.add(k);};const up=e=>{e.preventDefault();touchKeys.delete(k);};b.addEventListener('pointerdown',down);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('pointerleave',up);});
$$('[data-act]').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();actQueue.push(b.dataset.act);}));
canvas.addEventListener('pointerdown',e=>{if(currentScreen!=='game'||!run)return;const r=canvas.getBoundingClientRect();const x=(e.clientX-r.left)/r.width*W,y=(e.clientY-r.top)/r.height*H;run.player.facing=Math.atan2(y-run.player.y,x-run.player.x);actQueue.push('attack');});

window.addEventListener('beforeunload',()=>{if(run&&currentScreen==='game'){save.suspended=serializeRun();persist();}});
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));

updateMenuStats();updateBugDescription();refreshSettingsLabels();showScreen('menu');raf=requestAnimationFrame(loop);
})();
