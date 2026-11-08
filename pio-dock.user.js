// ==UserScript==
// @name         PIO Scripts — Dock e Chocadeira
// @namespace    panicguy.pio.scripts-dock
// @version      1.0.0
// @description  Dock minimizável e chocadeira automática por comandos, independente em cada conta.
// @match        https://pokeidle.io/*
// @match        https://poke.idleworld.online/*
// @updateURL    https://raw.githubusercontent.com/panicguy/Scripts-PIO/main/pio-dock.user.js
// @downloadURL  https://raw.githubusercontent.com/panicguy/Scripts-PIO/main/pio-dock.user.js
// @grant        none
// ==/UserScript==
(function(root){
'use strict';
const VERSION='1.0.0';
const EGGS=Object.freeze([{id:'p2',itemId:70091,label:'P2'},{id:'p3',itemId:70092,label:'P3'},{id:'p4',itemId:70093,label:'P4'},{id:'shiny',itemId:70094,label:'Shiny'}]);
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o||{},k);
function actorOf(p){return String(p?.nick||p?.estado?.nick||p?.estado?.eu?.nick||'').trim();}
function initialState(){return {items:null,chocadeira:null,revision:0,chocRevision:0};}
function applyState(state,patch){if(!patch||typeof patch!=='object')return state;const next=patch.cheio?initialState():{...state};next.revision=state.revision+1;if(own(patch,'items'))next.items=patch.items&&typeof patch.items==='object'&&!Array.isArray(patch.items)?{...patch.items}:null;if(own(patch,'chocadeira')){next.chocadeira=patch.chocadeira;next.chocRevision=next.revision;}return next;}
function inspect(state,priority='p2-first'){
 if(!state.items||!state.chocadeira||typeof state.chocadeira!=='object'||!Array.isArray(state.chocadeira.ovos))return {reason:'Aguardando dados da mochila e chocadeira'};
 const total=Number(state.chocadeira.total);if(!Number.isInteger(total)||total<1||total>6)return {reason:'Dados da chocadeira incompletos'};
 // Even an overdue egg occupies its slot until the server removes it.
 if(state.chocadeira.ovos.length)return {reason:'Ovo chocando',occupied:true,egg:state.chocadeira.ovos[0]};
 const order=priority==='best-first'?[...EGGS].reverse():EGGS;
 const egg=order.find(e=>Number.isFinite(Number(state.items[e.itemId]))&&Number(state.items[e.itemId])>=1);
 return egg?{command:{t:'chocadeira.colocar',slot:0,ovo:egg.id},egg,reason:'Ovo disponível: '+egg.label}:{reason:'Sem ovos na mochila'};
}
function createEngine({send,clock=Date.now,enabled=false,priority='p2-first'}){
 let state=initialState(),pending=null,connected=false,active=enabled,order=priority,status='Desligado',confirmed=0;
 return {
  update(patch){state=applyState(state,patch);if(pending&&state.chocRevision>pending.revision&&Array.isArray(state.chocadeira?.ovos)&&state.chocadeira.ovos.length){pending=null;confirmed++;}return this.view();},
  connection(value){connected=value===true;if(!connected){state=initialState();pending=null;}},
  reset(){state=initialState();pending=null;},
  enable(value){active=value===true;},priority(value){order=value==='best-first'?'best-first':'p2-first';},
  tick(){const candidate=inspect(state,order);if(!active)status='Desligado';else if(!connected)status='Aguardando conexão';else if(pending)status=pending.error?pending.error:clock()-pending.sentAt>=15000?'Sem confirmação — aguardando a chocadeira':'Enviado — aguardando confirmação';else if(candidate.command){pending={revision:state.revision,sentAt:clock(),command:candidate.command};status='Colocando ovo '+candidate.egg.label;try{send(candidate.command);}catch{pending.error='Falha de envio — aguardando confirmação';status=pending.error;}}else status=candidate.reason;return this.view();},
  error(message){if(pending){pending.error='Servidor recusou: '+String(message||'verifique o jogo');status=pending.error;}},
  view(){return {enabled:active,priority:order,status,pending:pending?{...pending}:null,confirmed,state};}
 };
}
if(typeof module==='object'&&module.exports){module.exports={EGGS,actorOf,initialState,applyState,inspect,createEngine};return;}
function dockFor(actor){
 if(root.__pioScriptsDockV1?.actor===actor)return root.__pioScriptsDockV1;
 const key='pio:scripts-dock:v1:'+actor;let prefs={folded:false,x:8,y:null};try{prefs={...prefs,...JSON.parse(localStorage.getItem(key)||'{}')};}catch{}
 const dock=document.createElement('nav');dock.id='pio-scripts-dock';dock.setAttribute('aria-label','PIO Scripts · '+actor);const fold=document.createElement('button');fold.type='button';fold.className='pio-dock-fold';dock.append(fold);const entries=new Map();
 const style=document.createElement('style');style.id='pio-scripts-dock-style';style.textContent=`#pio-scripts-dock{position:fixed;z-index:2147483500;left:8px;top:45%;display:flex;flex-direction:column;gap:6px;padding:6px;background:#101c2eef;border:1px solid #b39b61;border-radius:11px;box-shadow:0 6px 22px #0009;max-height:calc(100vh - 16px);overflow:auto}#pio-scripts-dock button{display:grid;place-items:center;position:relative;width:35px;height:35px;padding:3px;background:#1e2c43;border:1px solid #42526c;border-radius:7px;color:#ffdf96;font:22px system-ui;cursor:pointer}#pio-scripts-dock img{width:27px;height:27px;object-fit:contain;image-rendering:pixelated;pointer-events:none}#pio-scripts-dock button[hidden]{display:none!important}#pio-scripts-dock button[data-enabled=true]{border-color:#6ee7a6;background:#214637}#pio-scripts-dock button[data-enabled=true]:after{content:'';position:absolute;right:2px;bottom:2px;width:5px;height:5px;background:#76f7ab;border-radius:50%}#pio-scripts-dock .pio-dock-fold{touch-action:none;cursor:grab;font-size:18px}.pio-dock-panel{position:fixed;left:58px;top:150px;width:285px;max-width:calc(100vw - 74px);max-height:calc(100vh - 24px);overflow:auto;z-index:2147483501;color:#e4eaf4;background:linear-gradient(145deg,#1b2940,#0d1728);border:1px solid #a58c52;border-radius:11px;box-shadow:0 10px 35px #0009;font:12px/1.45 system-ui,Segoe UI,sans-serif;box-sizing:border-box}.pio-dock-panel[hidden]{display:none!important}.pio-dock-panel header{display:flex;align-items:center;gap:8px;padding:9px 11px;background:#28334a;border-bottom:1px solid #605b49;cursor:grab;touch-action:none}.pio-dock-panel header strong{flex:1;color:#ffe1a1}.pio-dock-panel header img{width:24px;height:24px;image-rendering:pixelated}.pio-dock-panel button,.pio-dock-panel select{font:inherit;color:#e5edf8;border:1px solid #526680;background:#243650;border-radius:6px;padding:6px;cursor:pointer}.pio-dock-panel .pio-dock-body{padding:11px}.pio-dock-panel p{margin:7px 0;overflow-wrap:anywhere}.pio-dock-panel button.pio-egg-toggle{width:100%;padding:9px;font-weight:700;background:#246043}.pio-dock-panel button.pio-egg-toggle[data-on=true]{background:#713b42}.pio-dock-panel select{width:100%;margin:5px 0}.pio-dock-panel small{color:#a9bad0}.pio-dock-panel output{display:block;padding:8px;border:1px solid #3a536a;border-radius:7px;background:#111e30;margin:8px 0;color:#b6e9d1}`;
 document.head.append(style);document.body.append(dock);
 const save=()=>{try{localStorage.setItem(key,JSON.stringify(prefs));}catch{}};
 function place(){const rect=dock.getBoundingClientRect();prefs.x=Math.max(4,Math.min(Number(prefs.x)||8,Math.max(4,innerWidth-rect.width-4)));dock.style.left=prefs.x+'px';if(Number.isFinite(prefs.y)){prefs.y=Math.max(4,Math.min(prefs.y,Math.max(4,innerHeight-rect.height-4)));dock.style.top=prefs.y+'px';}}
 function folded(){fold.textContent=prefs.folded?'⌄':'⌃';fold.title=prefs.folded?'Expandir PIO Scripts':'Minimizar PIO Scripts';fold.setAttribute('aria-label',fold.title);fold.setAttribute('aria-expanded',String(!prefs.folded));for(const e of entries.values()){e.button.hidden=prefs.folded;if(prefs.folded)e.panel.hidden=true;}place();save();}
 let moved=false;
 fold.onclick=()=>{if(moved){moved=false;return;}prefs.folded=!prefs.folded;folded();};
 function drag(handle,element,persist){let start=null;handle.addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('select,input,a')||(element!==dock&&e.target.closest('button')))return;const r=element.getBoundingClientRect();start={id:e.pointerId,x:e.clientX,y:e.clientY,left:r.left,top:r.top};moved=false;handle.setPointerCapture(e.pointerId);e.preventDefault();e.stopPropagation();});handle.addEventListener('pointermove',e=>{if(!start||start.id!==e.pointerId)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;if(Math.hypot(dx,dy)<4&&!moved)return;moved=true;const r=element.getBoundingClientRect(),x=Math.max(4,Math.min(start.left+dx,Math.max(4,innerWidth-r.width-4))),y=Math.max(4,Math.min(start.top+dy,Math.max(4,innerHeight-r.height-4)));element.style.left=x+'px';element.style.top=y+'px';if(persist){prefs.x=x;prefs.y=y;}e.stopPropagation();});const end=()=>{if(start&&persist)save();start=null;};handle.addEventListener('pointerup',end);handle.addEventListener('pointercancel',end);}
 drag(fold,dock,true);window.addEventListener('resize',place);folded();
 const api={actor,register({id,label,icon,panel}){if(entries.has(id))return entries.get(id);panel.hidden=true;panel.classList.add('pio-dock-panel');const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',label);b.title=label;const image=document.createElement('img');image.src=icon;image.alt='';image.onerror=()=>{b.textContent='🥚';};b.append(image);b.onclick=()=>{const open=panel.hidden;for(const entry of entries.values())entry.panel.hidden=true;panel.hidden=!open;b.setAttribute('aria-expanded',String(open));};dock.append(b);const entry={button:b,panel};entries.set(id,entry);b.hidden=prefs.folded;const handle=panel.querySelector('header');if(handle)drag(handle,panel,false);place();return entry;},show(id){prefs.folded=false;folded();const e=entries.get(id);if(e)e.panel.hidden=false;},fold:()=>{prefs.folded=!prefs.folded;folded();}};
 root.__pioScriptsDockV1=api;return api;
}
function install(P,actor){
 if(root.__pioDockEggs){root.__pioDockEggs.open();return;}
 const key='pio:egg-auto:v1:'+actor;let prefs={enabled:false,priority:'p2-first'};try{prefs={...prefs,...JSON.parse(localStorage.getItem(key)||'{}')};}catch{}
 const panel=document.createElement('section');panel.id='pio-egg-panel';const header=document.createElement('header'),icon=document.createElement('img'),title=document.createElement('strong'),close=document.createElement('button');icon.src='/img/itens/ovo-p2.png';icon.alt='';title.textContent='Chocadeira automática';close.type='button';close.textContent='×';close.setAttribute('aria-label','Fechar configuração da chocadeira');close.onclick=()=>{panel.hidden=true;};header.append(icon,title,close);
 const body=document.createElement('div');body.className='pio-dock-body';const who=document.createElement('small');who.textContent=actor+' · configuração desta conta';const status=document.createElement('output'),toggle=document.createElement('button');toggle.type='button';toggle.className='pio-egg-toggle';const label=document.createElement('label');label.textContent='Prioridade dos ovos';const priority=document.createElement('select');priority.setAttribute('aria-label','Prioridade dos ovos');for(const [value,text] of [['p2-first','P2 → P3 → P4 → Shiny'],['best-first','Shiny → P4 → P3 → P2']]){const o=document.createElement('option');o.value=value;o.textContent=text;priority.append(o);}priority.value=prefs.priority;const counts=document.createElement('p'),note=document.createElement('small');note.textContent='Usa ovos da mochila, um por vez. Não compra ovos, vagas ou aceleração.';body.append(who,status,toggle,label,priority,counts,note);panel.append(header,body);document.body.append(panel);
 const dock=dockFor(actor),entry=dock.register({id:'eggs',label:'Chocadeira automática',icon:'/img/itens/ovo-p2.png',panel});
 let socket=null,lastMessage=0,connectedSince=0,destroyed=false;
 const engine=createEngine({enabled:prefs.enabled,priority:prefs.priority,send:command=>{if(actorOf(root.__poke)!==actor||!socket||socket.readyState!==1)throw Error('Conexão mudou');socket.send(JSON.stringify(command));}});
 const save=()=>{try{localStorage.setItem(key,JSON.stringify(prefs));}catch{}};
 function paint(){const v=engine.view();toggle.textContent=v.enabled?'Desligar':'Ligar';toggle.dataset.on=String(v.enabled);entry.button.dataset.enabled=String(v.enabled);entry.button.title='Chocadeira · '+actor+' · '+v.status;status.textContent=v.status;const items=v.state.items;counts.textContent=items?EGGS.map(e=>e.label+': '+Math.max(0,Math.floor(Number(items[e.itemId])||0))).join(' · '):'Carregando ovos…';}
 function readPatch(raw){const m=raw?.data&&typeof raw.data==='object'?{...raw,...raw.data}:raw;if(!m)return;lastMessage=Date.now();if(m.t==='estado'&&m.estado)engine.update(m.estado);if(m.t==='welcome'){engine.reset();if(m.estado)engine.update(m.estado);}if(m.t==='erro'&&/chocadeira|ovo/i.test(String(m.chave||m.msg||m.error||'')))engine.error(m.msg||m.chave||m.error);paint();}
 const onMessage=e=>{try{readPatch(JSON.parse(e.data));}catch{}};
 const onClose=()=>{engine.connection(false);paint();};
 function bind(){const next=root.__poke?.sock;if(socket===next)return;socket?.removeEventListener('message',onMessage);socket?.removeEventListener('close',onClose);socket=next;engine.connection(false);connectedSince=Date.now();lastMessage=connectedSince;if(socket){engine.connection(socket.readyState===1);socket.addEventListener('message',onMessage);socket.addEventListener('close',onClose);}}
 toggle.onclick=()=>{prefs.enabled=!engine.view().enabled;engine.enable(prefs.enabled);save();tick();};priority.onchange=()=>{prefs.priority=priority.value;engine.priority(prefs.priority);save();tick();};
 function tick(){if(destroyed)return;bind();if(actorOf(root.__poke)!==actor){engine.enable(false);engine.connection(false);}else if(!socket||socket.readyState!==1||Date.now()-lastMessage>60000)engine.connection(false);else engine.connection(true);engine.tick();paint();}
 bind();const seed=P.estado?.eu||P.estado;if(seed)engine.update(seed);engine.tick();paint();const timer=setInterval(tick,2000);
 root.__pioDockEggs={version:VERSION,actor,open:()=>dock.show('eggs'),status:()=>engine.view(),destroy(){destroyed=true;clearInterval(timer);socket?.removeEventListener('message',onMessage);socket?.removeEventListener('close',onClose);entry.button.remove();panel.remove();delete root.__pioDockEggs;}};
}
function boot(){const P=root.__poke,actor=actorOf(P);if(!P?.sock||!actor||!document.body||!document.head)return false;install(P,actor);return true;}
if(!boot()){const waiting=setInterval(()=>{if(boot())clearInterval(waiting);},500);}
})(typeof window==='object'?window:globalThis);
