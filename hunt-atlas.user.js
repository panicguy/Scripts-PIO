// ==UserScript==
// @name         Atlas de Hunts — completo (KimJongDudu)
// @namespace    local.pio.hunt-atlas
// @version      1.8.0
// @description  Coletor, galeria, troca segura de hunts e minimapa móvel com marcadores normais e shiny. Arquivo único.
// @match        https://pokeidle.io/*
// @updateURL    https://raw.githubusercontent.com/panicguy/Scripts-PIO/main/hunt-atlas.user.js
// @downloadURL  https://raw.githubusercontent.com/panicguy/Scripts-PIO/main/hunt-atlas.user.js
// @grant        none
// ==/UserScript==

(function(root){
function launch(){
 const p=root.__poke;
 if(!document.body||!document.getElementById('tr-rank-box')||!p?.sock||!String(p.nick||p.estado?.nick||''))return false;
 if(String(p.nick||p.estado?.nick||'')!=='KimJongDudu')return true;
 start();return true;
}
function start(){
(function(root){
'use strict';
const REGIONS=new Set(['outland','johto','hoenn','sinnoh']);
function region(h,markers){
 if(h.regiao)return String(h.regiao).toLowerCase();
 const marker=(markers||[]).find(m=>m.slug===h.slug);
 if(marker?.area==='outland'||h.area==='outland')return 'outland';
 const weights=new Map();
 for(const e of h.especies||[]){const id=Number(e.pokeId);const r=id>=10000?'outland':id>=152&&id<=251?'johto':id>=252&&id<=386?'hoenn':id>=387&&id<=493?'sinnoh':'other';weights.set(r,(weights.get(r)||0)+(Number(e.pontos)||1));}
 return [...weights].sort((a,b)=>b[1]-a[1])[0]?.[0]||'unknown';
}
function catalog(hunts,markers,level){return (hunts||[]).filter(h=>h.slug&&Number.isFinite(Number(h.nivel))&&Number(h.nivel)>0&&Number(h.nivel)<=Math.min(2000,level)&&REGIONS.has(region(h,markers))).map(h=>({...h,region:region(h,markers)})).sort((a,b)=>['outland','johto','hoenn','sinnoh'].indexOf(a.region)-['outland','johto','hoenn','sinnoh'].indexOf(b.region)||String(a.nome||a.name||a.slug).localeCompare(String(b.nome||b.name||b.slug),'pt-BR',{sensitivity:'base',numeric:true})||a.slug.localeCompare(b.slug));}
function geometry(data,collision,box,groundZ){
 if(!Array.isArray(box)||box.length<4||!box.every(Number.isFinite)||!Number.isInteger(box[2])||!Number.isInteger(box[3])||box[2]<1||box[3]<1||box[2]*box[3]>100000)throw Error('Limites do mapa inválidos');
 if(!Array.isArray(data.tiles)||!Array.isArray(collision.blocking))throw Error('Geometria/colisão não disponível');
 const [x0,y0,w,h]=box,z=groundZ??data._meta?.groundZ??7,grid=new Uint8Array(w*h),blocked=new Set(collision.blocking.map(Number));
 for(const t of data.tiles){if(t[2]!==z)continue;const x=t[0]-x0,y=t[1]-y0;if(x<0||x>=w||y<0||y>=h)continue;const ids=[t[3],...(t[4]||[]).map(it=>Array.isArray(it)?it[0]:it)];grid[y*w+x]=ids.some(id=>blocked.has(Number(id)))?2:t[3]?1:0;}
 return {w,h,z,box,grid:Array.from(grid),unknown:grid.filter(v=>v===0).length,blocked:grid.filter(v=>v===2).length,source:'assets/world/maps + collision.json; leitura do cliente'};
}
function paths(g,spawns,estimated=false){
 const points=uniquePositions(spawns).filter(p=>(estimated||p.confirmed)&&Number.isInteger(p.c)&&Number.isInteger(p.r)&&p.c>=0&&p.r>=0&&p.c<g.w&&p.r<g.h&&g.grid[p.r*g.w+p.c]===1);let max=0,total=0,pairs=0,unreachable=0;
 for(let k=0;k<points.length;k++){const d=new Int32Array(g.w*g.h).fill(-1),queue=[points[k].r*g.w+points[k].c];d[queue[0]]=0;
 for(let head=0;head<queue.length;head++){const n=queue[head],x=n%g.w,y=Math.floor(n/g.w);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=g.w||yy>=g.h)continue;const j=yy*g.w+xx;if(g.grid[j]===1&&d[j]===-1){d[j]=d[n]+1;queue.push(j);}}}
 for(let j=k+1;j<points.length;j++){const v=d[points[j].r*g.w+points[j].c];if(v<0)unreachable++;else{max=Math.max(max,v);total+=v;pairs++;}}
 }
 return {maxSteps:pairs?max:null,meanSteps:pairs?Math.round(total/pairs*10)/10:null,pairs,unreachable,model:'estimativa em 4 direções; não é o pathfinding do servidor'};
}

function uniquePositions(points){const by=new Map();for(const p of points||[]){if(!Number.isInteger(p.c)||!Number.isInteger(p.r))continue;const k=p.c+':'+p.r;if(!by.has(k)||p.confirmed)by.set(k,p);}return [...by.values()];}
function liveShiny(mobs){return [...mobs].some(m=>!m.bn&&m.ti===undefined&&!m.cura&&!m.tm&&!m.depot&&!m.tr&&m.x!==true&&m.x!==1&&(m.sh===true||m.sh===1||m.shiny===true||m.shiny===1));}


function trackSteps(w,hero){if(!hero||!Number.isInteger(hero.c)||!Number.isInteger(hero.r))return;const prev=w.last;if(prev){const dx=Math.abs(hero.c-prev.c),dy=Math.abs(hero.r-prev.r);if(Math.max(dx,dy)===1)w.steps++;else if(dx||dy)w.gaps++;}w.last={c:hero.c,r:hero.r};}
function birthCycles(rec){const points=uniquePositions(rec.spawns).filter(p=>p.confirmed),keys=new Set(points.map(p=>p.c+':'+p.r));let completed=0,seen=new Set(),stepsTwoCycles=null,gapsTwoCycles=null;for(const e of rec.births||[]){if(!keys.has(e.key))continue;seen.add(e.key);if(keys.size&&seen.size===keys.size){completed++;seen.clear();if(completed===2){stepsTwoCycles=e.steps;gapsTwoCycles=e.gaps;break;}}}return {completed,points:keys.size,stepsTwoCycles,gapsTwoCycles,remaining:Math.max(0,keys.size-seen.size)};}
function respawnCount(rec){const count=uniquePositions(rec.spawns).filter(p=>p.confirmed).length;return count>0?String(count):'não confirmado';}
function collectionReady(s,now){const confirmed=s.record.spawns.filter(p=>p.confirmed).length,elapsed=now-s.started;return !!s.record.geometry&&confirmed>=2&&elapsed>=15000&&(confirmed===s.record.expected||now-(s.lastNewPoint||s.started)>=30000);}

function metrics(rec){
 const g=rec.geometry;if(!g)return null;
 const positions=uniquePositions(rec.spawns).filter(p=>rec.captureMode==='respawn-v2'?p.confirmed:true),walkable=g.grid.filter(v=>v===1).length;
 const valid=positions.filter(p=>p.c>=0&&p.r>=0&&p.c<g.w&&p.r<g.h&&g.grid[p.r*g.w+p.c]===1);
 const routes=paths(g,positions,rec.captureMode!=='respawn-v2');
 return {version:2,cycles:birthCycles(rec),walkable,unknown:g.grid.filter(v=>v===0).length,positions:positions.length,validPositions:valid.length,excludedPositions:positions.length-valid.length,density:walkable?Math.round(valid.length/walkable*10000)/100:null,routes,basis:rec.captureMode==='respawn-v2'?'nascimentos observados — cobertura pode ser parcial':rec.captureMode==='entry-v1'?'entrada — estimativa, requer nova leitura':'histórico antigo — requer nova leitura',provisional:g.grid.includes(0),distanceRankable:rec.captureMode==='respawn-v2'&&valid.length>=2&&routes.unreachable===0&&valid.length===positions.length&&routes.meanSteps!==null};
}
function rankMaps(records,mode='distance',selectedRegion='all'){
 const latest=new Map();for(const r of records)if(r.geometry&&(!latest.has(r.slug)||r.savedAt>latest.get(r.slug).savedAt))latest.set(r.slug,r);
 return [...latest.values()].filter(r=>selectedRegion==='all'||(selectedRegion==='others'?['johto','hoenn','sinnoh'].includes(r.region):r.region===selectedRegion)).map(viewRecord).sort((a,b)=>{
 const am=a.metrics,bm=b.metrics;
 const eligible=m=>mode==='area'?!m.provisional&&m.walkable>0:mode==='cycles'?m.cycles.completed>=2&&m.cycles.points>=2&&m.cycles.gapsTwoCycles===0:m.distanceRankable;
 const diff=Number(eligible(bm))-Number(eligible(am));if(diff)return diff;
 const value=m=>mode==='area'?m.walkable:mode==='cycles'?m.cycles.stepsTwoCycles??Infinity:m.distanceRankable?m.routes.meanSteps:Infinity;
 return value(am)-value(bm)||(am.routes.maxSteps??Infinity)-(bm.routes.maxSteps??Infinity)||String(a.name||a.slug).localeCompare(String(b.name||b.slug));
 });
}
function viewRecord(r){const spawns=uniquePositions(r.spawns);return {...r,spawns,metrics:metrics({...r,spawns}),complete:r.captureMode==='respawn-v2'&&r.complete};}
if(typeof module==='object'&&module.exports){module.exports={region,catalog,geometry,paths,uniquePositions,liveShiny,viewRecord,metrics,rankMaps,observeMob,trackSteps,birthCycles,respawnCount,collectionReady};return;}
if(String(root.__poke?.nick||root.__poke?.estado?.nick||'')!=='KimJongDudu')return;
if(root.__pioHuntAtlas?.version==='1.8.0'){root.__pioHuntAtlas.show?.();return;}
if(root.__pioHuntAtlas){const old=root.__pioHuntAtlas;old.stop?.();Object.defineProperty(old,'running',{configurable:true,get:()=>false,set:()=>{}});document.getElementById('pio-atlas')?.remove();document.getElementById('pio-atlas-gallery')?.remove();delete root.__pioAtlasRoute;}

const P=root.__poke;
const nick=()=>String(P?.nick||P?.estado?.nick||'');
// No socket hook, navigation, writes or interface is installed on another character.
if(nick()!=='KimJongDudu')return;
const active=()=>{const id=P?.activeId??P?.estado?.activeId;return P?.pokemonsMap?.[id]||(P?.estado?.pokemons||[]).find(p=>String(p.id)===String(id));};
const isTyranitar=()=>/tyranitar/i.test(active()?.nome||active()?.name||document.querySelector('#ativo-card')?.textContent||'');
const level=()=>Number(P?.level||P?.estado?.level||0);
const guard=()=>nick()==='KimJongDudu'&&level()>=2000&&isTyranitar();
const A=root.__pioHuntAtlas={version:'1.8.0',phase:'Desligado — clique em Iniciar',started:false,running:false,current:null,frames:0,records:[],pending:[],show(){panel.hidden=false;},stop(){this.running=false;this.phase='Pausado por você';render();}};
let viewScene=null,clearing=false,dataEpoch=0;
let db,queue=[],index=-1,target=null,scene=null,socket=P?.sock,collisionPromise,markers=[],waitingSince=0,lastSend=0,entryConfirmed=false,writing=false,failures=0,rows=new Map(),errors=[];
const json=async path=>{const r=await fetch(path,{cache:'no-cache'});if(!r.ok)throw Error(path+' HTTP '+r.status);return r.json();};
const openDB=()=>new Promise((resolve,reject)=>{const q=indexedDB.open('PIO-HuntAtlas-v1',1);q.onupgradeneeded=()=>{q.result.createObjectStore('maps',{keyPath:'key'});q.result.createObjectStore('run',{keyPath:'key'});};q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});
const readAll=()=>new Promise((resolve,reject)=>{const t=db.transaction('maps'),q=t.objectStore('maps').getAll();q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);});
const put=(store,value)=>clearing?Promise.resolve():new Promise((resolve,reject)=>{const t=db.transaction(store,'readwrite');t.objectStore(store).put(value);t.oncomplete=resolve;t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error);});
const recordRun=()=>put('run',{key:'KimJongDudu',savedAt:Date.now(),regions:[...REGIONS],maxLevel:2000,index,target:target?.slug||null,queue:queue.map(h=>h.slug),phase:A.phase,pending:A.pending,errors:errors.slice(-100)});
const style=document.createElement('style');style.textContent=`
#pio-atlas{position:fixed;right:18px;top:160px;z-index:10020;width:260px;color:#e5f0f4;background:#11232ef5;border:1px solid #8de4cc;border-radius:14px;padding:12px;box-shadow:0 12px 40px #0008;font:12px/1.45 Segoe UI,sans-serif;box-sizing:border-box}#pio-atlas *{box-sizing:border-box}#pio-atlas h3{font-size:14px;margin:0 0 5px}#pio-atlas p{margin:6px 0;color:#b6cbd5}#pio-atlas canvas{display:block;width:100%;height:150px;background:#0b1720;border-radius:7px;margin:8px 0;image-rendering:pixelated}#pio-atlas button,#pio-atlas-gallery button{padding:6px 9px;color:#dceef3;background:#233d4e;border:1px solid #62818d;border-radius:6px;cursor:pointer;font:inherit;margin:3px 3px 0 0}#pio-atlas .atlas-status{color:#9be6ce;overflow-wrap:anywhere}#pio-atlas-gallery{position:fixed;inset:5%;z-index:10030;background:#11232efc;border:1px solid #8de4cc;border-radius:16px;color:#e5f0f4;padding:20px;overflow:auto;font:13px/1.5 Segoe UI,sans-serif}#pio-atlas-gallery .atlas-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px}#pio-atlas-gallery article{border:1px solid #415a67;border-radius:12px;padding:14px;background:#172e3a}#pio-atlas-gallery canvas{width:100%;height:180px;image-rendering:pixelated;background:#091720}#pio-atlas [hidden],#pio-atlas-gallery[hidden]{display:none!important}`;document.head.append(style);
const panel=document.createElement('section');panel.id='pio-atlas';
const title=document.createElement('h3');title.textContent='Atlas · KimJongDudu';
const sub=document.createElement('p');sub.textContent='Outland → Johto → Hoenn → Sinnoh · A–Z / até Nv 2000';
const status=document.createElement('p');status.className='atlas-status';
const canvas=document.createElement('canvas');canvas.width=480;canvas.height=300;
const details=document.createElement('p');
function button(label,fn){const b=document.createElement('button');b.textContent=label;b.onclick=fn;return b;}
function resumeCollection(){if(!A.started)return;if(!guard()){A.phase='Bloqueado: confirme KimJongDudu Nv 2000 e Tyranitar';render();return;}A.running=true;A.phase='Retomando';scene=null;entryConfirmed=false;waitingSince=Date.now();lastSend=0;if(!target)void next();else safeSend({t:'hunt.select',slug:target.slug});render();}
function stopCollection(){dataEpoch++;A.stop();A.started=false;scene=null;target=null;queue=[];index=-1;entryConfirmed=false;A.phase='Desligado — clique em Iniciar';render();}
const startStop=button('Iniciar',()=>{if(A.started)stopCollection();else void restartOrdered();});
const pause=button('Pausar',()=>{if(A.running){dataEpoch++;A.stop();}else resumeCollection();});
const skip=button('Pular',()=>{if(target){A.pending.push({slug:target.slug,reason:'pulado pelo usuário'});void next();}});
const minimize=button('−',()=>{canvas.hidden=!canvas.hidden;details.hidden=canvas.hidden;});
const exportBtn=button('Exportar',()=>void exportAll());
const clearBtn=button('Limpar todos os mapeamentos',()=>void clearAllMaps());

panel.append(title,sub,status,canvas,details,startStop,pause,skip,button('Mapas',()=>void gallery()),exportBtn,minimize,clearBtn);document.body.append(panel);
function draw(cv,rec,hero){const ctx=cv.getContext('2d');ctx.clearRect(0,0,cv.width,cv.height);if(!rec?.geometry){ctx.fillStyle='#9eb4c2';ctx.fillText('Aguardando leitura do mapa',15,30);return;}const g=rec.geometry,s=Math.min(cv.width/g.w,cv.height/g.h),ox=(cv.width-g.w*s)/2,oy=(cv.height-g.h*s)/2;for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++){ctx.fillStyle=['#26303c','#496572','#090e13'][g.grid[y*g.w+x]];ctx.fillRect(ox+x*s,oy+y*s,Math.max(1,s),Math.max(1,s));}for(const p of rec.spawns||[]){ctx.fillStyle=p.confirmed?'#8ff2d0':'#a697ce';ctx.beginPath();ctx.arc(ox+(p.c+.5)*s,oy+(p.r+.5)*s,Math.max(2,s*.65),0,Math.PI*2);ctx.fill();}if(hero?.c!=null){ctx.fillStyle='#ffd46b';const x=ox+(hero.c+.5)*s,y=oy+(hero.r+.5)*s;ctx.beginPath();ctx.moveTo(x+5,y);ctx.lineTo(x-4,y-5);ctx.lineTo(x-4,y+5);ctx.closePath();ctx.fill();}}
function render(){status.textContent=A.phase;title.textContent=(A.running&&target?(target.nome||target.name||target.slug):viewScene?.record?.name)||'Atlas · KimJongDudu';const r=viewScene?.record;details.textContent=r?.geometry?`${r.geometry.w}×${r.geometry.h} tiles · ${r.spawns.filter(p=>p.confirmed).length} pontos de nascimento confirmados · ${r.geometry.unknown} sem leitura\n${Math.max(0,index+1)}/${queue.length} hunts · ${A.records.length} leituras salvas · ${A.frames?'posição ao vivo':'aguardando posição'}`:`${Math.max(0,index+1)}/${queue.length} hunts · ${A.records.length} leituras salvas · ${A.frames?'posição ao vivo':'aguardando posição'}`;draw(canvas,r,viewScene?.hero);startStop.textContent=A.started?'Parar':'Iniciar';pause.textContent=A.running?'Pausar':'Retomar';pause.disabled=!A.started;skip.disabled=!A.running;}
let galleryMode='distance';const galleryRegions={area:'all',distance:'all'};
async function gallery(){const all=await readAll();const previous=document.getElementById('pio-atlas-gallery'),scroll=previous?.scrollTop||0;previous?.remove();const el=document.createElement('section');el.id='pio-atlas-gallery';const h=document.createElement('h2');h.textContent=galleryMode==='area'?'Ranking · menor área caminhável':'Ranking · menores trajetos estimados';el.append(h,button('Fechar ×',()=>el.remove()),button('Exportar JSON',()=>void exportAll()),button('Limpar todos os mapeamentos',()=>void clearAllMaps()),button('Menor área',()=>{galleryMode='area';void gallery();}),button('Menores trajetos',()=>{galleryMode='distance';void gallery();}));const note=document.createElement('p');note.textContent=galleryMode==='area'?'Menor área: compara a quantidade de tiles caminháveis do mapa. Mapas com menos espaço livre ficam primeiro; não considera a distância entre os respawns.':'Menores trajetos: compara a média de passos estimados entre os pontos de respawn confirmados, contornando obstáculos. Pontos mais próximos ficam primeiro; não mede o percurso real do Tyranitar.';el.append(note);const filterLabel=document.createElement('label');filterLabel.textContent='Região: ';const filter=document.createElement('select');filter.setAttribute('aria-label','Filtrar ranking por região');filter.style.cssText='padding:7px;margin:10px 0;background:#233d4e;color:#e5f0f4;border:1px solid #62818d;border-radius:6px';for(const [value,label] of [['all','Todas'],['outland','Outland'],['johto','Johto'],['hoenn','Hoenn'],['sinnoh','Sinnoh']]){const option=document.createElement('option');option.value=value;option.textContent=label;filter.append(option);}filter.value=galleryRegions[galleryMode];filter.onchange=()=>{galleryRegions[galleryMode]=filter.value;el.scrollTop=0;void gallery();};filterLabel.append(filter);el.append(filterLabel);const list=document.createElement('div');list.className='atlas-cards';el.append(list);let rank=0;for(const r of rankMaps(all,galleryMode,galleryRegions[galleryMode])){const m=r.metrics,g=r.geometry,eligible=galleryMode==='area'?!m.provisional&&m.walkable>0:m.distanceRankable;const card=document.createElement('article'),heading=document.createElement('h3'),cv=document.createElement('canvas'),text=document.createElement('p');cv.width=480;cv.height=300;heading.textContent=(eligible?'#'+(++rank)+' · ':'')+(r.name||r.slug)+' · Nv '+r.level;text.style.whiteSpace='pre-line';text.textContent=`Mapa: ${r.region}
Tamanho: ${g.w} × ${g.h} tiles
Pokémon no respawn: ${respawnCount(r,P.hunts||P.ws?.welcome?.hunts||[])}
Passos médios estimados: ${m.routes.meanSteps??'aguardando'}
Mapeado em ${new Date(r.savedAt).toLocaleString('pt-BR')}`;card.append(heading,cv,text,button('Refazer este mapa',()=>void remapOne(r)));list.append(card);draw(cv,r);}if(!list.children.length){const empty=document.createElement('p');empty.textContent='Nenhum mapa salvo nesta região.';list.append(empty);}document.body.append(el);el.scrollTop=scroll;}

async function remapOne(rec){
 if(writing){root.alert('Aguarde o mapa atual terminar de salvar e tente novamente.');return;}
 if(clearing||!db||!guard()){A.phase='Não iniciou: confirme KimJongDudu Nv 2000 com Tyranitar';render();return;}
 const hunt=(P.hunts||P.ws?.welcome?.hunts||[]).find(h=>h.slug===rec.slug);
 if(!hunt||Number(hunt.nivel)>Math.min(2000,level())){root.alert('Esta hunt não está disponível no catálogo atual.');return;}
 stopCollection();queue=[{...hunt,region:region(hunt,markers)}];index=-1;target=null;A.started=true;A.running=true;lastSend=0;document.getElementById('pio-atlas-gallery')?.remove();await next();
}
async function restartOrdered(){
 if(clearing||!db||!guard()){A.phase='Não iniciou: aguarde os dados e confirme KimJongDudu Nv 2000 com Tyranitar';render();return;}
 A.stop();dataEpoch++;const epoch=dataEpoch;A.started=true;scene=null;entryConfirmed=false;A.phase='Preparando fila A–Z';render();
 try{const loaded=await json('/assets/world/map-markers.json');markers=Array.isArray(loaded)?loaded:loaded.hunts||loaded.markers||loaded.list||[];
 if(epoch!==dataEpoch||!A.started)return;queue=catalog(P.hunts||P.ws?.welcome?.hunts||[],markers,level());
 if(!queue.length||queue[0].region!=='outland')throw Error('Catálogo Outland indisponível; não vou começar em outra região');
 index=-1;target=null;A.pending=[];A.running=true;lastSend=0;await next();
 }catch(e){if(epoch!==dataEpoch)return;A.started=false;A.running=false;A.phase='Não iniciou: '+e.message;render();}
}
async function clearAllMaps(){
 if(clearing)return;
 if(!db){root.alert('O banco de mapas ainda não está pronto. Aguarde e tente novamente.');return;}
 if(!root.confirm('Apagar TODOS os mapeamentos salvos desta conta neste launcher, incluindo histórico, rankings e progresso? A coleta será pausada. Esta ação não pode ser desfeita. Exporte um backup antes se quiser guardar os dados.'))return;
 clearing=true;dataEpoch++;A.stop();A.started=false;clearBtn.disabled=true;
 try{await new Promise((resolve,reject)=>{const t=db.transaction(['maps','run'],'readwrite');t.objectStore('maps').clear();t.objectStore('run').clear();t.oncomplete=resolve;t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error);});
 A.records=[];A.pending=[];errors=[];queue=catalog(P.hunts||P.ws?.welcome?.hunts||[],markers,level());index=-1;target=null;scene=null;entryConfirmed=false;A.phase='Mapeamentos apagados. Coleta pausada; clique em Iniciar para começar do zero.';render();if(document.getElementById('pio-atlas-gallery'))await gallery();
 }catch(e){A.phase='Falha ao limpar os mapas: '+e.message;render();root.alert(A.phase);}finally{clearing=false;clearBtn.disabled=false;}
}
async function exportAll(){const all=await readAll();const out={schema:'pio-hunt-atlas-v1',collectedBy:'KimJongDudu',exportedAt:new Date().toISOString(),maps:all,pending:A.pending,errors};const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(out)],{type:'application/json'}));a.href=url;a.download='KimJongDudu-mapas-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);}
function safeSend(command){if(!guard()){A.stop();A.phase='Pausado: personagem/nível/Tyranitar mudou';return false;}if(!socket||socket.readyState!==1){A.stop();A.phase='Pausado: desconectado';return false;}if(Date.now()-lastSend<4000)return false;socket.send(JSON.stringify(command));lastSend=Date.now();return true;}
async function next(){if(writing||!A.running)return;scene=null;entryConfirmed=false;index++;target=queue[index]||null;waitingSince=Date.now();failures=0;
 if(!target){A.running=false;A.started=false;A.phase='Varredura concluída · '+A.pending.length+' pendências';await recordRun();render();return;}
 A.phase=(Number(target.attempt||1)>1?'Revisão · ':'')+target.region+' · Entrando em '+(target.nome||target.slug);await recordRun();if(!A.running)return;safeSend({t:'hunt.select',slug:target.slug});render();}
async function startScene(m){if(m.centro||m.pvp||m.casa!=null){viewScene=null;scene=null;A.current=null;render();return;}
const collecting=A.running&&m.slug===target?.slug;const hunt=(P.hunts||P.ws?.welcome?.hunts||[]).find(h=>h.slug===m.slug)||{};if(collecting)entryConfirmed=true;
const own={slug:m.slug,tag:m.sl??null,started:Date.now(),hero:m.heroi||null,slots:new Map(),collecting,record:{slug:m.slug,name:hunt.nome||m.slug,region:region(hunt,markers),level:Number(hunt.nivel||0),mapSlug:m.mapa||m.slug,geometry:null,spawns:[],expected:(hunt.especies||[]).reduce((n,e)=>n+(Number(e.pontos)||0),0),savedAt:0,complete:false,walk:{steps:0,gaps:Number.isInteger(m.heroi?.c)&&Number.isInteger(m.heroi?.r)?0:1,last:null},births:[]}};trackSteps(own.record.walk,m.heroi);viewScene=own;scene=collecting?own:null;A.current=m.slug;

 for(const mob of m.mobs||[])observeMob(own,mob,false);own.record.spawns=uniquePositions(own.record.spawns);own.record.captureMode='respawn-v2';
 if(collecting)A.phase='Lendo geometria e aguardando nascimentos';render();
 try{collisionPromise??=json('/assets/world/collision.json');const [map,col]=await Promise.all([json('/assets/world/maps/'+encodeURIComponent(own.record.mapSlug)+'.json'),collisionPromise]);
  if(viewScene!==own)return;
  // Preserve visual map holes as unknown: decorative client patches do not prove server collision.
  own.record.geometry=geometry(map,col,m.box,m.groundZ);if(collecting)A.phase='Geometria lida — observando pontos de nascimento';render();
 }catch(e){errors.push({slug:m.slug,error:String(e.message),at:Date.now()});A.phase='Falha no mapa: '+e.message;own.failed=true;render();}
}
function observeMob(s,m,canConfirm){
 if(m.bn||m.ti!==undefined||m.cura||m.tm||m.depot||m.tr||m.s==null)return;
 const prev=s.slots.get(m.s),reborn=prev&&(prev.x===true||prev.x===1)&&(m.x===false||m.x===0),merged={...prev,...m};
 if(reborn&&m.sh===undefined&&m.shiny===undefined){merged.sh=false;merged.shiny=false;}s.slots.set(m.s,merged);
 if(!Number.isInteger(m.c)||!Number.isInteger(m.r)||merged.x===true||merged.x===1)return;
 const stationary=(!Number.isFinite(m.dc)||m.dc===m.c)&&(!Number.isFinite(m.dr)||m.dr===m.r);
 const born=canConfirm&&stationary&&(reborn||(!prev&&(m.x===false||m.x===0)));
 if(!canConfirm)s.record.spawns.push({slot:m.s,c:m.c,r:m.r,confirmed:false,source:'entry'});
 if(born){if(!s.record.spawns.some(p=>p.confirmed&&p.c===m.c&&p.r===m.r))s.lastNewPoint=Date.now();s.record.births??=[];s.record.births.push({key:m.c+':'+m.r,steps:s.record.walk?.steps??0,gaps:s.record.walk?.gaps??0});s.record.spawns=s.record.spawns.filter(p=>p.confirmed||p.slot!==m.s);s.record.spawns.push({slot:m.s,c:m.c,r:m.r,confirmed:true,source:'observed-birth'});s.record.spawns=uniquePositions(s.record.spawns);}
}

async function checkpoint(s,final){if(clearing||!s.record.geometry)return;const epoch=dataEpoch;const rec={...s.record,spawns:s.record.spawns.map(x=>({...x})),births:(s.record.births||[]).map(e=>({...e})),walk:s.record.walk?{...s.record.walk,last:s.record.walk.last?{...s.record.walk.last}:null}:null,savedAt:Date.now()};rec.metrics=metrics(rec);rec.routes=rec.metrics.routes;rec.complete=rec.captureMode==='respawn-v2'&&rec.expected>0&&rec.spawns.filter(p=>p.confirmed).length===rec.expected;const bytes=new TextEncoder().encode(JSON.stringify([rec.geometry.grid,rec.spawns.map(p=>[p.slot,p.c,p.r,p.confirmed])])),hash=await crypto.subtle.digest('SHA-256',bytes);rec.layout=Array.from(new Uint8Array(hash)).slice(0,6).map(x=>x.toString(16).padStart(2,'0')).join('').toUpperCase();rec.key=rec.slug+':'+rec.savedAt;if(clearing||epoch!==dataEpoch)return;await put('maps',rec);if(clearing||epoch!==dataEpoch)return;A.records.push({slug:rec.slug,savedAt:rec.savedAt,complete:rec.complete});if(final&&!rec.complete){
 A.pending=A.pending.filter(p=>p.slug!==rec.slug);A.pending.push({slug:rec.slug,reason:'mapa ou pontos de spawn incompletos'});
 // Partial readings stay pending for manual remapping; never repeat the queue automatically.
 }else if(rec.complete)A.pending=A.pending.filter(p=>p.slug!==rec.slug);if(document.getElementById('pio-atlas-gallery'))await gallery();}
function message(raw){const m=raw?.data&&typeof raw.data==='object'?{...raw,...raw.data}:raw;if(!m)return;
 if(m.t==='welcome'){A.stop();A.phase='Reconexão: retome a coleta pelo botão';render();return;}
 if(m.t==='campo.init'){void startScene(m);return;}
 if(m.t==='campo'&&viewScene&&(m.sl??null)===viewScene.tag){A.frames++;if(m.heroi?.c!=null){trackSteps(viewScene.record.walk,m.heroi);viewScene.hero=m.heroi;}for(const mob of m.mobs||[])observeMob(viewScene,mob,true);for(const id of m.fora||[])viewScene.slots.delete(id);render();}
 if(m.t==='erro'&&A.running&&target){errors.push({slug:target.slug,reason:m.msg||m.chave||'recusada',at:Date.now()});A.phase='Hunt recusada; aguardando nova tentativa';render();}
}
let busy=false;
async function tick(){if(busy||!A.running)return;busy=true;try{if(!guard()){A.stop();A.phase='Pausado: Tyranitar/conta mudou';render();return;}if(!socket||socket.readyState!==1){A.stop();A.phase='Pausado: conexão fechada';render();return;}
 if(!entryConfirmed&&target){if(root.__pioAtlasRoute?.pending){waitingSince=Date.now();return;}const elapsed=Date.now()-waitingSince;if(elapsed>45000){A.stop();A.phase='Entrada não confirmada em '+(target.nome||target.name||target.slug)+' — pausado sem pular. Clique em Retomar para tentar novamente.';render();}else if(Date.now()-lastSend>8000){safeSend({t:'hunt.select',slug:target.slug});}return;}
 if(scene){if(liveShiny(scene.slots.values())){A.phase='Shiny vivo no mapa — permanecendo nesta hunt';render();return;}const elapsed=Date.now()-scene.started,ready=collectionReady(scene,Date.now());if((ready&&elapsed>=15000)||elapsed>=180000||scene.failed){writing=true;try{await checkpoint(scene,true);}catch(e){A.stop();A.phase='Falha ao salvar — coleta interrompida';render();return;}finally{writing=false;}await recordRun();if(A.running)await next();}}
 }finally{busy=false;}}
(function(){
'use strict';
const P=window.__poke,A=window.__pioHuntAtlas,socket=P?.sock;
if(String(P?.nick||P?.estado?.nick||'')!=='KimJongDudu'||!A||!socket||window.__pioAtlasRoute)return;
const original=socket.send;let pending=null,armed=false,center=!!P.ws?.['campo.init']?.centro;
const R=window.__pioAtlasRoute={pending:null,version:1};const wild=new Map((P.ws?.['campo.init']?.mobs||[]).map(m=>[m.s,m]));
function shinyHold(){if(center||!liveShiny(wild.values()))return false;const b=document.getElementById('rb-center-schedule');if(armed&&b?.getAttribute('aria-pressed')==='true')b.click();armed=false;paint('Shiny vivo no mapa — aguardando antes de sair');return true;}
const enabled=()=>A.running&&String(P.nick||P.estado?.nick||'')==='KimJongDudu';
function paint(text){A.phase=text;const el=document.querySelector('#pio-atlas .atlas-status');if(el)el.textContent=text;}
function requestCenter(){if(!enabled()||!pending||shinyHold())return;const schedule=document.getElementById('rb-center-schedule');if(schedule&&!schedule.disabled){if(schedule.getAttribute('aria-pressed')!=='true'){schedule.click();armed=true;}return;}const button=document.getElementById('ir-centro');if(button&&!button.disabled&&button.getClientRects().length)button.click();}
function flush(){if(!enabled()||!pending||!center||socket.readyState!==1||shinyHold())return;const command=pending;pending=null;R.pending=null;original.call(socket,JSON.stringify(command));paint('Entrando em '+command.slug);}
socket.send=function(data){let command;try{command=typeof data==='string'?JSON.parse(data):null;}catch{}if(command?.t==='hunt.select'&&enabled()){pending=command;R.pending=command.slug;if(center)flush();else{paint('Aguardando saída segura para o Centro · '+command.slug);requestCenter();}return;}return original.apply(this,arguments);};
socket.addEventListener('message',e=>{try{const raw=JSON.parse(e.data),m=raw.data&&typeof raw.data==='object'?{...raw,...raw.data}:raw;if(m.t==='campo.init'||m.t==='campo'){if(m.t==='campo.init'){center=!!m.centro;wild.clear();}for(const mob of m.mobs||[]){const old=wild.get(mob.s),reborn=old&&(old.x===true||old.x===1)&&(mob.x===false||mob.x===0);wild.set(mob.s,{...old,...(reborn?{sh:false,shiny:false}:{}),...mob});}for(const id of m.fora||[])wild.delete(id);if(pending)shinyHold();}if(m.t==='campo.init'){center=!!m.centro;if(center){armed=false;flush();}}}catch{}});
const oldStop=A.stop.bind(A);A.stop=function(){pending=null;R.pending=null;const b=document.getElementById('rb-center-schedule');if(armed&&b?.getAttribute('aria-pressed')==='true')b.click();armed=false;oldStop();};
setInterval(()=>{if(!enabled()){pending=null;R.pending=null;return;}if(pending){flush();if(pending)requestCenter();}},1000);
})();

setInterval(()=>void tick(),1000);
if(socket){socket.addEventListener('message',e=>{try{message(JSON.parse(e.data));}catch{}});socket.addEventListener('close',()=>{A.stop();A.phase='Pausado: desconectado';render();});const initial=P.ws?.['campo.init'];if(initial)void startScene({...initial,t:'campo.init'});}
(async()=>{const epoch=dataEpoch;try{db=await openDB();if(!guard())throw Error('É necessário KimJongDudu Nv 2000 com Tyranitar ativo');if(root.PIOAutoDex?.estado?.().rodando)throw Error('Pause o AutoDex nesta conta antes de mapear');const records=await readAll();A.records=records.map(r=>({slug:r.slug,savedAt:r.savedAt,complete:r.complete}));markers=await json('/assets/world/map-markers.json');if(!Array.isArray(markers))markers=markers.hunts||markers.markers||markers.list||[];const complete=new Set(records.filter(r=>r.complete&&r.captureMode==='respawn-v2').map(r=>r.slug));queue=catalog(P.hunts||P.ws?.welcome?.hunts||[],markers,level()).filter(h=>!complete.has(h.slug));
 if(!socket||socket.readyState!==1)throw Error('Conexão do jogo não encontrada');
 if(epoch!==dataEpoch||A.started)return;A.running=false;A.phase='Desligado — clique em Iniciar para mapear em ordem A–Z';render();
 }catch(e){A.running=false;A.phase='Não iniciou: '+e.message;render();}})();
})(typeof window==='object'?window:globalThis);

(function(root){
'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function markerKind(m){if(!m||m.x===true||m.x===1||m.bn||m.ti!==undefined||m.cura||m.tm||m.depot||m.tr)return 'hidden';return m.sh===true||m.sh===1||m.shiny===true||m.shiny===1?'shiny':'normal';}
function mergeEntity(old,m,ts,now){const e={...(old||{}),...m};const reborn=!!old&&(old.x===true||old.x===1)&&(m.x===false||m.x===0);if(reborn&&m.sh===undefined&&m.shiny===undefined){e.sh=false;e.shiny=false;}if(Number.isFinite(m.c)&&Number.isFinite(m.r)){const dc=Number.isFinite(m.dc)?m.dc:m.c,dr=Number.isFinite(m.dr)?m.dr:m.r;e.step={c:m.c,r:m.r,dc,dr,em:Number.isFinite(m.em)?m.em:(Number.isFinite(ts)?ts:0),ts:Number.isFinite(ts)?ts:(Number.isFinite(m.em)?m.em:0),ms:Number.isFinite(m.ms)?m.ms:300,at:now};const trail=(reborn?[]:old?.trail||[]).filter(p=>now-p.at<3500);if(!trail.length||trail[trail.length-1].c!==dc||trail[trail.length-1].r!==dr)trail.push({c:dc,r:dr,at:now});e.trail=trail.slice(-6);}return e;}
function position(e,now){if(!e?.step)return Number.isFinite(e?.c)&&Number.isFinite(e?.r)?{c:e.c,r:e.r}:null;const s=e.step,t=s.ms>0?clamp((s.ts-s.em+Math.max(0,now-s.at))/s.ms,0,1):1;return {c:s.dc+(s.c-s.dc)*t,r:s.dr+(s.r-s.dr)*t};}
function displayState(prefs,economy){return {visible:prefs.visible!==false&&!economy,compact:prefs.compact===true};}

function newShinies(entities,seen){const live=new Set();let added=0;for(const [id,m] of entities){if(markerKind(m)==='shiny'){live.add(id);if(!seen.has(id))added++;}}seen.clear();for(const id of live)seen.add(id);return added;}
if(typeof module==='object'&&module.exports){module.exports={...module.exports,newShinies,markerKind,mergeEntity,position,displayState,clamp};return;}
const P=root.__poke;if(String(P?.nick||P?.estado?.nick||'')!=='KimJongDudu')return;
if(root.__pioAtlasUI?.version==='1.8.0'){root.__pioAtlasUI.open();return;}
root.__pioAtlasUI?.destroy?.();
const KEY='pio:atlas-ui:v1:KimJongDudu';let prefs={visible:true,compact:false,left:null,top:null,sound:true};try{prefs={...prefs,...JSON.parse(localStorage.getItem(KEY)||'{}')};}catch{}
let panel=null,base=null,stage=null,layer=null,handle=null,mini=null,hudButton=null,drag=null,socket=null,init=null,tag=null,entities=new Map(),latestHero=null,timer=null,raf=null,lastDraw=0,destroyed=false;
function save(){try{localStorage.setItem(KEY,JSON.stringify(prefs));}catch{}}
const now=()=>performance.now();const economy=()=>document.documentElement.classList.contains('modo-economia')||document.body.classList.contains('modo-economia');
const heard=new Set();let audio=null,audioButton=null,pendingSound=false;
function soundLabel(){if(audioButton)audioButton.textContent=prefs.sound===false?'Som: desligado':'Som: ligado';}
function beep(){if(prefs.sound===false)return;try{const C=root.AudioContext||root.webkitAudioContext;if(!C)return;audio??=new C();if(audio.state!=='running'){pendingSound=true;soundLabel();return;}pendingSound=false;const t=audio.currentTime;for(let i=0;i<3;i++){const o=audio.createOscillator(),g=audio.createGain();o.frequency.value=[880,1175,1568][i];g.gain.setValueAtTime(0,t+i*.19);g.gain.linearRampToValueAtTime(.12,t+i*.19+.015);g.gain.exponentialRampToValueAtTime(.001,t+i*.19+.17);o.connect(g);g.connect(audio.destination);o.start(t+i*.19);o.stop(t+i*.19+.18);}soundLabel();}catch{soundLabel();}}
async function unlock(){if(prefs.sound===false)return;try{const C=root.AudioContext||root.webkitAudioContext;if(!C)return;audio??=new C();await audio.resume();if(pendingSound)beep();soundLabel();}catch{}}
const gesture=()=>void unlock();document.addEventListener('pointerdown',gesture,{capture:true});
const style=document.createElement('style');style.id='pio-atlas-ui-style';style.textContent=`
#pio-atlas .atlas-map-stage{position:relative;margin:8px 0;isolation:isolate;touch-action:none;cursor:grab}#pio-atlas .atlas-map-stage>canvas{margin:0!important;width:100%!important;display:block!important}#pio-atlas .atlas-map-stage>canvas.atlas-live-layer{position:absolute!important;inset:0!important;height:100%!important;background:transparent!important;pointer-events:none!important;border-radius:7px}#pio-atlas h3{cursor:grab;touch-action:none;padding-right:8px}#pio-atlas[data-atlas-dragging=true] h3,#pio-atlas[data-atlas-dragging=true] .atlas-map-stage{cursor:grabbing}#pio-atlas[data-atlas-compact=true]{padding:5px!important;border-radius:10px!important;width:245px!important}#pio-atlas[data-atlas-compact=true]>:not(.atlas-map-stage){display:none!important}#pio-atlas[data-atlas-compact=true] .atlas-map-stage{margin:0!important}#pio-atlas-toggle{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;grid-column:1/-1;min-height:32px;padding:6px 8px;margin:8px 0 0;border:1px solid #e4a55c;border-radius:7px;background:linear-gradient(#83533d,#58322b);color:#fff3ce;font:700 12px/1.2 Tahoma,Segoe UI,sans-serif;cursor:pointer;box-shadow:inset 0 1px #ffffff20}#pio-atlas-toggle[aria-pressed=true]{border-color:#98e4c8;background:linear-gradient(#38695f,#23483e);color:#dffff2}#pio-atlas-toggle:focus-visible{outline:2px solid white;outline-offset:2px}#pio-atlas .atlas-live-legend{font:10px/1.4 Segoe UI,sans-serif;color:#b9ccd5;margin:4px 0 8px}.atlas-live-legend .atlas-normal{color:#ffae56}.atlas-live-legend .atlas-shiny{color:#ff78d9}.atlas-live-legend .atlas-spawn{color:#8ff2d0}`;document.head.append(style);
function apply(){if(!panel)return;const state=displayState(prefs,economy());panel.hidden=!state.visible;panel.style.display=state.visible?'':'none';panel.dataset.atlasCompact=String(state.compact);if(mini){mini.textContent=state.compact?'Expandir':'Só mapa';mini.title='Modo compacto: só o mapa. Duplo clique no mapa para expandir.';mini.setAttribute('aria-pressed',String(state.compact));}if(hudButton){hudButton.setAttribute('aria-pressed',String(prefs.visible!==false));hudButton.title=economy()?'Minimapa oculto durante o modo economia; volta ao sair.':prefs.visible?'Ocultar minimapa':'Mostrar minimapa';}}
function toggle(){prefs.visible=!prefs.visible;save();apply();}
function place(){if(!panel||!Number.isFinite(prefs.left)||!Number.isFinite(prefs.top))return;const rect=panel.getBoundingClientRect(),left=clamp(prefs.left,4,Math.max(4,innerWidth-rect.width-4)),top=clamp(prefs.top,4,Math.max(4,innerHeight-rect.height-4));panel.style.left=left+'px';panel.style.top=top+'px';panel.style.right='auto';prefs.left=left;prefs.top=top;}
function pointerDown(e){if(e.button!==0||e.target.closest('button,input,a'))return;const rect=panel.getBoundingClientRect();drag={pointer:e.pointerId,x:e.clientX,y:e.clientY,left:rect.left,top:rect.top};panel.dataset.atlasDragging='true';e.currentTarget.setPointerCapture?.(e.pointerId);e.preventDefault();e.stopPropagation();}
function pointerMove(e){if(!drag||e.pointerId!==drag.pointer)return;const rect=panel.getBoundingClientRect();prefs.left=clamp(drag.left+e.clientX-drag.x,4,Math.max(4,innerWidth-rect.width-4));prefs.top=clamp(drag.top+e.clientY-drag.y,4,Math.max(4,innerHeight-rect.height-4));place();e.preventDefault();e.stopPropagation();}
function pointerEnd(e){if(!drag||e.pointerId!==drag.pointer)return;drag=null;panel.dataset.atlasDragging='false';save();e.stopPropagation();}
function draggable(el){el.addEventListener('pointerdown',pointerDown);el.addEventListener('pointermove',pointerMove);el.addEventListener('pointerup',pointerEnd);el.addEventListener('pointercancel',pointerEnd);}
function mountButton(){if(hudButton?.isConnected)return;const anchor=document.getElementById('tr-rank-box');if(!anchor)return;hudButton=document.getElementById('pio-atlas-toggle')||document.createElement('button');hudButton.id='pio-atlas-toggle';hudButton.type='button';hudButton.textContent='🗺 Minimapa';hudButton.setAttribute('aria-label','Abrir ou fechar minimapa das hunts');hudButton.onclick=e=>{e.stopPropagation();toggle();};if(!hudButton.isConnected)anchor.insertAdjacentElement('afterend',hudButton);apply();}
function attach(){if(destroyed)return;const next=document.getElementById('pio-atlas');mountButton();if(!next)return;if(next!==panel){panel=next;base=panel.querySelector('canvas:not(.atlas-live-layer)');if(!base)return;handle=panel.querySelector('h3');if(handle)draggable(handle);stage=document.createElement('div');stage.className='atlas-map-stage';base.before(stage);stage.append(base);layer=document.createElement('canvas');layer.className='atlas-live-layer';layer.setAttribute('aria-hidden','true');stage.append(layer);stage.title='Arraste para mover. Duplo clique para alternar entre só mapa e painel completo.';draggable(stage);stage.addEventListener('dblclick',e=>{prefs.compact=!prefs.compact;save();apply();place();e.preventDefault();e.stopPropagation();});mini=[...panel.querySelectorAll('button')].find(b=>b.textContent==='−');if(!mini){mini=document.createElement('button');panel.append(mini);}mini.onclick=e=>{prefs.compact=!prefs.compact;save();apply();place();e.stopPropagation();};base.hidden=false;const details=panel.children[4];if(details)details.hidden=false;const legend=document.createElement('p');legend.className='atlas-live-legend';const add=(cls,text)=>{const s=document.createElement('span');s.className=cls;s.textContent=text;legend.append(s);};add('atlas-spawn','● Respawn  ');add('atlas-normal','● Normal  ');add('atlas-shiny','✦ Shiny');panel.append(legend);audioButton=document.createElement('button');audioButton.onclick=async e=>{e.stopPropagation();prefs.sound=prefs.sound===false;save();if(prefs.sound)await unlock();soundLabel();};panel.append(audioButton);const testSound=document.createElement('button');testSound.textContent='Testar som';testSound.onclick=async e=>{e.stopPropagation();prefs.sound=true;save();await unlock();beep();};panel.append(testSound);soundLabel();apply();place();}
 const current=P.sock;if(current&&current!==socket){if(socket)socket.removeEventListener('message',onMessage);socket=current;socket.addEventListener('message',onMessage);const initial=P.ws?.['campo.init'];if(initial)onPacket(initial);}apply();}
function onMessage(e){try{onPacket(JSON.parse(e.data));}catch{}}
function onPacket(raw){const m=raw?.data&&typeof raw.data==='object'?{...raw,...raw.data}:raw;if(!m)return;if(m.t==='campo.init'){init=m;tag=m.sl??null;entities.clear();heard.clear();pendingSound=false;latestHero=null;if(m.centro||m.pvp||m.casa!=null)return;for(const mob of m.mobs||[])if(mob.s!=null)entities.set(String(mob.s),mergeEntity(null,mob,m.ts,now()));if(m.heroi)latestHero=mergeEntity(null,m.heroi,m.ts,now());}
 else if(m.t==='campo'&&(m.sl??null)===tag){if(!init||init.centro||init.pvp||init.casa!=null){entities.clear();heard.clear();pendingSound=false;return;}for(const mob of m.mobs||[])if(mob.s!=null)entities.set(String(mob.s),mergeEntity(entities.get(String(mob.s)),mob,m.ts,now()));for(const id of m.fora||[])entities.delete(String(id));if(m.heroi)latestHero=mergeEntity(latestHero,m.heroi,m.ts,now());}if(newShinies(entities,heard)>0)beep();}
function star(ctx,x,y,r){ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.43:r;const xx=x+Math.cos(a)*rr,yy=y+Math.sin(a)*rr;if(i===0)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy);}ctx.closePath();ctx.fill();ctx.stroke();}
function draw(time){raf=requestAnimationFrame(draw);if(time-lastDraw<65)return;lastDraw=time;if(!panel||!layer||!base||!init)return;const state=displayState(prefs,economy());if(!state.visible||document.hidden)return;if(layer.width!==base.width)layer.width=base.width;if(layer.height!==base.height)layer.height=base.height;const ctx=layer.getContext('2d');ctx.clearRect(0,0,layer.width,layer.height);
 if(init.centro||init.pvp||init.casa!=null||init.slug!==root.__pioHuntAtlas?.current||!Array.isArray(init.box))return;const w=init.box[2],h=init.box[3];if(!(w>0&&h>0))return;const scale=Math.min(layer.width/w,layer.height/h),ox=(layer.width-w*scale)/2,oy=(layer.height-h*scale)/2;const pt=p=>({x:ox+(p.c+.5)*scale,y:oy+(p.r+.5)*scale});ctx.save();ctx.beginPath();ctx.rect(ox,oy,w*scale,h*scale);ctx.clip();
 for(const e of entities.values()){const kind=markerKind(e),pos=position(e,time);if(kind==='hidden'||!pos)continue;const p=pt(pos),color=kind==='shiny'?'#ff73dc':'#ffad4e';const trail=(e.trail||[]).filter(t=>time-t.at<3500);if(trail.length){ctx.globalAlpha=.38;ctx.strokeStyle=color;ctx.lineWidth=1.6;ctx.beginPath();for(let i=0;i<trail.length;i++){const a=pt(trail[i]);if(i)ctx.lineTo(a.x,a.y);else ctx.moveTo(a.x,a.y);}ctx.lineTo(p.x,p.y);ctx.stroke();ctx.globalAlpha=1;}
 ctx.fillStyle=color;ctx.strokeStyle='#101820';ctx.lineWidth=1.4;if(kind==='shiny'){ctx.shadowColor='#ff73dc';ctx.shadowBlur=5;star(ctx,p.x,p.y,5.5);ctx.shadowBlur=0;ctx.strokeStyle='#ffeaff';ctx.lineWidth=.65;star(ctx,p.x,p.y,5.5);}else{ctx.beginPath();ctx.arc(p.x,p.y,3,0,2*Math.PI);ctx.fill();ctx.stroke();}}
 ctx.restore();}
const modeObserver=new MutationObserver(()=>{apply();place();});modeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['class']});modeObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
const onResize=()=>{place();save();};window.addEventListener('resize',onResize);timer=setInterval(attach,400);attach();raf=requestAnimationFrame(draw);
root.__pioAtlasUI={version:'1.8.0',open(){prefs.visible=true;save();apply();},toggle,compact(){prefs.compact=!prefs.compact;save();apply();place();},destroy(){destroyed=true;clearInterval(timer);cancelAnimationFrame(raf);modeObserver.disconnect();window.removeEventListener('resize',onResize);socket?.removeEventListener('message',onMessage);document.removeEventListener('pointerdown',gesture,{capture:true});void audio?.close();layer?.remove();hudButton?.remove();style.remove();}};
})(typeof window==='object'?window:globalThis);

}
if(typeof module==='object'&&module.exports){start();return;}
if(!launch()){
 const key='__pioAtlasBoot';
 if(root[key])clearInterval(root[key]);
 root[key]=setInterval(()=>{if(launch()){clearInterval(root[key]);delete root[key];}},500);
}
})(typeof window==='object'?window:globalThis);
