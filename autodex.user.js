// ==UserScript==
// @name         PIO AutoDex — Dudu
// @namespace    https://github.com/panicguy/Scripts-PIO
// @version      0.1.1
// @description  AutoDex: fila de capturas, navegação por Onde encontrar e retorno ao Centro Pokémon.
// @author       Eduardo (Dudu)
// @match        https://pokeidle.io/*
// @run-at       document-idle
// @grant        none
// @updateURL    https://raw.githubusercontent.com/panicguy/Scripts-PIO/main/autodex.user.js
// @downloadURL  https://raw.githubusercontent.com/panicguy/Scripts-PIO/main/autodex.user.js
// ==/UserScript==
(function () {
  'use strict';
  if (window.__PIO_AUTODEX__) return;
  window.__PIO_AUTODEX__ = true;
  const KEY = 'pio-autodex-state-v1';
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const one = (q, el = document) => el.querySelector(q);
  const all = (q, el = document) => Array.from(el.querySelectorAll(q));
  const val = el => (el?.textContent || '').trim();
  const clean = s => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  let stored = {};
  try { stored = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch {}
  const state = Object.assign({ queue: [], pos: 0, done: [], skipped: [], running: false, paused: false, current: null, returnPending: null }, stored, { running: false, paused: false, current: null });
  let dex = [], busy = false, lastRefresh = 0, message = 'Abra a Pokédex e sincronize as espécies.';
  function save() { localStorage.setItem(KEY, JSON.stringify(state)); }
  function status(s) { message = s; render(); }
  function buttonText(regexp) {
    return all('button').find(b => regexp.test(clean(val(b) + ' ' + (b.title || '') + ' ' + (b.getAttribute('aria-label') || ''))));
  }
  function dexButton() { return one('nav.menu-topo button[data-modal="pokedex"]'); }
  function parseCell(el) {
    const idRaw = el.dataset.especie || el.dataset.species || el.dataset.id || el.dataset.dex || val(one('.dex-num, .dex-numero', el));
    const id = Number(String(idRaw || '').replace(/[^0-9]/g, ''));
    const name = val(one('.dex-nome, .dex-name, .nome, .pk-nome, strong, b', el)) || el.title || '';
    if (!id || !name) return null;
    return { id, name, caught: el.classList.contains('caught') };
  }
  function readDex() {
    const cells = all('.dex-cell');
    const rows = cells.map(parseCell).filter(Boolean);
    if (!rows.length) return false;
    dex = Array.from(new Map(rows.map(s => [s.id, s])).values()).sort((a,b) => a.id-b.id);
    lastRefresh = Date.now();
    status('Pokédex lida: ' + dex.length + ' espécies; ' + dex.filter(e => !e.caught).length + ' não capturadas.');
    return true;
  }
  async function sync() {
    if (readDex()) return true;
    const btn = dexButton();
    if (!btn) { status('Menu Pokédex não encontrado.'); return false; }
    btn.click();
    await sleep(700);
    if (!readDex()) { status('Não foi possível ler as células da Pokédex. Abra a Pokédex e confira o layout.'); return false; }
    return true;
  }
  function matchCell(species) {
    return all('.dex-cell').find(el => {
      const entry = parseCell(el);
      return entry?.id === species.id || (entry && clean(entry.name) === clean(species.name));
    });
  }
  function caught(species) {
    const cell = matchCell(species);
    return cell ? cell.classList.contains('caught') : null;
  }
  async function speciesSheet(species) {
    let cell = matchCell(species);
    if (!cell) {
      if (!await sync()) return false;
      cell = matchCell(species);
    }
    if (!cell) return false;
    cell.click();
    for (let t=0;t<12;t++) {
      await sleep(250);
      const body = one('#ficha-corpo');
      const id = Number(val(one('.fi-dex-num', body || document)).replace(/[^0-9]/g, ''));
      const name = val(one('.fi-nome', body || document));
      if (body && (id === species.id || clean(name) === clean(species.name))) return true;
    }
    return false;
  }
  function huntingDestination() {
    return one('#ficha-corpo .fi-hunts button.fi-hunt[data-hunt]:not(.fi-safari-cta)');
  }
  async function startHunt(species) {
    if (!await speciesSheet(species)) { status('Ficha indisponível: ' + species.name); return false; }
    const go = huntingDestination();
    if (!go || go.disabled) { status('Sem hunt direta acessível: ' + species.name); return false; }
    go.click(); // Reutiliza o caminho oficial Onde encontrar.
    await sleep(1200);
    state.current = { id: species.id, name: species.name, since: Date.now() };
    save();
    status('Caçando ' + species.name + '. Painel pode ser fechado; a rotina continua nesta aba.');
    return true;
  }
  function centerButton() {
    // Aciona o comando NATIVO; o próprio jogo agenda a volta ao fim do combate
    // e aplica a regra de 3 segundos sem batalha.
    return buttonText(/ir para o centro pokemon|centro pokemon/);
  }
  function centerConfirmed() {
    // Só aceitar a localização atual no HUD (nunca o texto do botão
    // "Ir para o Centro Pokémon", que aparece mesmo durante a hunt).
    // Seletores conservadores: caso o jogo mude o DOM, manter a espera
    // em vez de viajar prematuramente.
    const selectors = [
      '#local-atual', '#hud-local', '#hud-localizacao', '#local-nome',
      '#campo-local', '#campo-nome', '#hunt-nome', '#localizacao-atual',
      '.local-atual', '.hud-local', '.campo-local', '.localizacao-atual',
      '[data-current-location]', '[data-current-map]', '[data-location-name]'
    ];
    return selectors.some(selector => all(selector).some(el => {
      if (el.closest('button, nav, #pio-ad-panel, [role="dialog"]')) return false;
      const source = [
        val(el), el.getAttribute('data-current-location'),
        el.getAttribute('data-current-map'), el.getAttribute('data-location-name')
      ].filter(Boolean).join(' ');
      return /centro pokemon|pokemon center|cerulean/i.test(clean(source));
    }));
  }
  function returnCenter() {
    if (state.returnPending) return true; // Nunca clicar duas vezes.
    if (centerConfirmed()) {
      status('Já está no Centro Pokémon. Próxima hunt liberada.');
      return true;
    }
    const center = centerButton();
    if (!center || center.disabled) {
      state.paused = true; save();
      status('Botão de retorno ao Centro Pokémon indisponível. Automação pausada.');
      return false;
    }
    state.returnPending = { requestedAt: Date.now() };
    save(); // Gravar ANTES de clicar para não criar dois agendamentos.
    center.click();
    status('Volta solicitada ao Centro Pokémon. O jogo aguarda o fim da batalha e os 3 segundos necessários. Aguardando chegada...');
    return true;
  }
  async function advance() {
    if (busy || !state.running || state.paused) return;
    busy = true;
    try {
      // Sem iniciar outra hunt enquanto o retorno nativo estiver agendado.
      if (state.returnPending) return;
      while (state.running && !state.paused && state.pos < state.queue.length) {
        const s = state.queue[state.pos];
        if (caught(s) === true) {
          state.done.push(s.id); state.pos++; save();
          if (!returnCenter()) return;
          // Aguarda o jogo confirmar que realmente chegou ao Centro.
          if (state.returnPending) return;
          continue;
        }
        if (state.current?.id === s.id) return;
        if (await startHunt(s)) return;
        state.skipped.push(s.id); state.pos++; save();
      }
      if (state.pos >= state.queue.length && state.running) {
        state.running = false; state.current = null; save();
        status('Fila finalizada. Espécies sem hunt direta estão na lista de puladas.');
      }
    } finally { busy = false; }
  }
  async function poll() {
    if (!state.running || state.paused || busy) return;
    if (state.returnPending) {
      // NÃO há sleep fixo: é o jogo que decide quando completou a volta.
      if (centerConfirmed()) {
        state.returnPending = null;
        save();
        status('Chegou ao Centro Pokémon. Indo para a próxima hunt...');
        await advance();
      } else if (Date.now() - state.returnPending.requestedAt > 120000) {
        // Sem sinal seguro de chegada, não viajar de forma antecipada.
        state.paused = true; save();
        status('Retorno solicitado, mas não consegui confirmar a chegada ao Centro em 2 minutos. Pausado por segurança.');
      }
      return;
    }
    const current = state.current;
    if (!current) { await advance(); return; }
    // A Pokédex, não o histórico limitado a 100 capturas, confirma a espécie capturada.
    if (caught(current) === true) {
      state.done.push(current.id); state.pos++; state.current = null; save();
      status('Capturou ' + current.name + '! Solicitando retorno ao Centro Pokémon...');
      if (returnCenter() && !state.returnPending) await advance();
    } else if (Date.now() - current.since > 20 * 60 * 1000) {
      state.paused = true; save();
      status('20 minutos sem confirmação de captura. Pausado para conferir bolas, batalha e hunt.');
    }
  }
  const style = document.createElement('style');
  style.textContent = `
    #pio-ad-menu{display:inline-flex;align-items:center;gap:5px}
    #pio-ad-menu img{width:20px;height:20px;object-fit:contain}
    #pio-ad-panel{z-index:2147483000;position:fixed;top:75px;right:16px;width:min(390px,calc(100vw - 32px));background:#132134;color:#e8f0fc;border:1px solid #59728e;border-radius:12px;box-shadow:0 12px 35px #0009;font:13px system-ui,sans-serif}
    #pio-ad-panel[hidden]{display:none!important}
    #pio-ad-panel header{padding:12px;background:#223752;display:flex;justify-content:space-between;font-weight:bold;border-radius:12px 12px 0 0}
    #pio-ad-panel main{padding:12px;max-height:68vh;overflow:auto}
    #pio-ad-panel button,#pio-ad-panel select{border:1px solid #738cac;background:#2d4969;color:white;border-radius:6px;padding:7px;cursor:pointer}
    #pio-ad-panel .row{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}
    #pio-ad-panel .species{padding:5px;border-bottom:1px solid #ffffff22}
    #pio-ad-panel small{color:#bbcce1}
  `;
  document.head.appendChild(style);
  function mount() {
    const dexBtn = dexButton();
    if (dexBtn && !one('#pio-ad-menu')) {
      const b=document.createElement('button');
      b.id='pio-ad-menu'; b.type='button';
      b.innerHTML='<img src="/assets/site/assets/ui/menu-pokedex.png" alt=""><span>AutoDex</span>';
      b.addEventListener('click', () => { one('#pio-ad-panel').hidden = !one('#pio-ad-panel').hidden; render(); });
      dexBtn.insertAdjacentElement('afterend',b);
    }
    if (one('#pio-ad-panel') || !document.body) return;
    const p=document.createElement('section');
    p.id='pio-ad-panel';p.hidden=true;
    p.innerHTML='<header><span>📘 AutoDex • Dudu</span><button type="button" data-ad="close">✕</button></header><main><div id="pio-ad-status"></div><div class="row"><button data-ad="sync">Sincronizar</button><button data-ad="queue">Criar fila</button><button data-ad="run">Iniciar</button><button data-ad="pause">Pausar</button><button data-ad="stop">Parar</button></div><div><small id="pio-ad-progress"></small></div><div class="row"><select id="pio-ad-filter"><option value="pending">Pendentes</option><option value="caught">Capturados</option><option value="all">Todos</option></select></div><div id="pio-ad-list"></div><small>O painel pode ficar fechado, mas a aba do jogo precisa permanecer aberta. A captura usa as automações normais do jogo.</small></main>';
    document.body.append(p);
    p.addEventListener('click',async e=>{
      const action=e.target.closest('[data-ad]')?.dataset.ad;
      if (!action) return;
      if (action==='close') { p.hidden=true; return; }
      if (action==='sync') await sync();
      if (action==='queue') {
        if (!dex.length && !await sync()) return;
        state.queue=dex.filter(s=>!s.caught).map(({id,name})=>({id,name}));
        state.pos=0;state.done=[];state.skipped=[];state.current=null;state.returnPending=null;state.running=false;save();
        status('Fila criada: '+state.queue.length+' espécies pendentes.');
      }
      if (action==='run') {
        if (!state.queue.length) { status('Crie a fila antes de iniciar.');return; }
        state.running=true;state.paused=false;save();await advance();
      }
      if (action==='pause') { state.paused=!state.paused;save();status(state.paused?'Pausado.':'Retomando...');if(!state.paused)await advance(); }
      if (action==='stop') { state.running=false;state.paused=false;state.current=null;state.returnPending=null;save();status('Parado. A fila foi preservada.'); }
      render();
    });
    one('#pio-ad-filter',p).addEventListener('change',render);
    render();
  }
  function render() {
    const p=one('#pio-ad-panel');
    if (!p) return;
    one('#pio-ad-status',p).textContent=message;
    one('#pio-ad-progress',p).textContent='Progresso '+state.pos+'/'+state.queue.length+' · Confirmados '+state.done.length+' · Pulados '+state.skipped.length+(state.returnPending?' · Retorno ao Centro agendado':(state.current?' · Hunt: '+state.current.name:''));
    const f=one('#pio-ad-filter',p).value;
    const rows=dex.filter(s=>f==='all'||(f==='caught'?s.caught:!s.caught)).slice(0,180);
    one('#pio-ad-list',p).replaceChildren(...rows.map(s=>{
      const d=document.createElement('div');
      d.className='species';
      d.textContent='#'+s.id+' '+s.name+(s.caught?' ✓':' ○');
      return d;
    }));
  }
  const observer=new MutationObserver(() => {
    if (!one('#pio-ad-menu') || !one('#pio-ad-panel')) mount();
    // Observe caught state even with the AutoDex panel hidden.
    if (state.current) {
      const c=caught(state.current);
      if(c===true && !busy) poll().catch(console.warn);
    }
  });
  observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  setInterval(()=>{mount();poll().catch(console.warn);},1600);
  mount();
})();