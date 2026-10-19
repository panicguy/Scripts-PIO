// ==UserScript==
// @name         PIO AutoDex — Dudu
// @namespace    https://github.com/panicguy/Scripts-PIO
// @version      0.2.0
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
  const state = Object.assign({ queue: [], pos: 0, done: [], skipped: [], running: false, paused: false, current: null, returnPending: null }, stored, { running: false, paused: false, current: null, returnPending: null });
  let dex = [], busy = false, lastRefresh = 0, message = 'Abra a Pokédex e sincronize as espécies.';
  function save() { localStorage.setItem(KEY, JSON.stringify(state)); }
  function status(s) { message = s; render(); }
  function buttonText(regexp) {
    return all('button').find(b => regexp.test(clean(val(b) + ' ' + (b.title || '') + ' ' + (b.getAttribute('aria-label') || ''))));
  }
  function dexButton() { return one('nav.menu-topo button[data-modal="pokedex"]'); }
  function parseCell(el) {
    // DOM confirmado em jogo: 1248 cards ".dex-card" com "pego", "visto" e "desconhecido".
    const m = val(el).replace(/\s+/g, ' ').match(/#\s*(\d+)\s+(.+)/);
    const id = Number(m?.[1] || el.dataset.especie || el.dataset.id);
    const name = (m?.[2] || val(one('.dex-nome, b, strong', el))).trim();
    if (!id || !name) return null;
    return { id, name, caught: el.classList.contains('pego'),
      seen: el.classList.contains('visto'), unknown: el.classList.contains('desconhecido') };
  }
  function readDex() {
    const cells = all('.dex-card');
    const rows = cells.map(parseCell).filter(Boolean);
    if (rows.length < 100) return false;
    dex = Array.from(new Map(rows.map(s => [s.id, s])).values()).sort((a,b) => a.id-b.id);
    lastRefresh = Date.now();
    status('Pokédex lida: ' + dex.length + ' espécies; ' + dex.filter(e => !e.caught).length + ' não capturadas.');
    return true;
  }
  async function sync() {
    if (readDex()) return true;
    const btn = dexButton();
    if (!btn) { status('Menu Pokédex não encontrado.'); return false; }
    btn.click(); // Carregamento inicial sob demanda; a Dex pode ficar fechada depois.
    for (let i = 0; i < 20; i++) {
      await sleep(300);
      if (readDex()) return true;
    }
    status('Não foi possível carregar os cards .dex-card; confira a Pokédex.');
    return false;
  }
  function matchCell(species) {
    return all('.dex-card').find(el => {
      const match = val(el).match(/#\s*(\d+)/);
      return Number(match?.[1] || el.dataset.especie || el.dataset.id) === species.id;
    });
  }
  function caught(species) {
    const cell = matchCell(species);
    return cell ? cell.classList.contains('pego') : null;
  }
  function bannerCount() {
    const label = clean(val(dexButton()));
    const m = label.match(/pokedex\s*\+\s*(\d+)/);
    return m ? Number(m[1]) : 0;
  }
  function hudText() { return clean(val(one('#hud-hunt'))); }
  function atCenter() { return /centro pokemon|pokemon center/.test(hudText()); }
  function atHunt(species) {
    const place = hudText(), name = clean(species?.name);
    return !!name && (place === name || place.startsWith(name + ' ') || place.startsWith(name + '·'));
  }
  async function speciesSheet(species) {
    let cell = matchCell(species);
    if (!cell) {
      if (!await sync()) return false;
      cell = matchCell(species);
    }
    if (!cell) return false;
    // Primeiro tenta abrir direto pelo card já montado, mesmo com a Dex fechada.
    for (let attempt = 0; attempt < 2; attempt++) {
      if (attempt) dexButton()?.click();
      cell.click();
      for (let t = 0; t < 14; t++) {
        await sleep(250);
        const body = one('#ficha-corpo');
        const id = Number(val(one('.fi-dex-num', body || document)).replace(/\D/g, ''));
        const name = val(one('.fi-nome', body || document));
        if (body && (id === species.id || clean(name) === clean(species.name))) return true;
      }
    }
    return false;
  }
  function huntingDestination() {
    return one('#ficha-corpo .fi-hunts button.fi-hunt[data-hunt]:not(.fi-safari-cta)');
  }
  async function startHunt(species) {
    if (!await speciesSheet(species)) {
      state.paused = true; save();
      status('Não consegui abrir a ficha de ' + species.name + '; pausado para evitar perder a fila.');
      return 'error';
    }
    const go = huntingDestination();
    if (!go || go.disabled) return 'unavailable';
    // A referência é o contador antes de clicar. +1 anterior não é uma captura nova.
    state.current = {
      id: species.id, name: species.name, since: Date.now(),
      hunt: go.dataset.hunt, arrivedAt: null, badgeBefore: bannerCount(),
      wasCaught: caught(species) === true
    };
    save();
    status('Entrando na hunt de ' + species.name + '. Aguardando confirmação pelo HUD...');
    go.click();
    return 'started';
  }
  function returnCenter() {
    if (state.returnPending) return true;
    if (atCenter()) return true;
    // Este é o AGENDADOR REAL; #ir-centro fica desabilitado durante a batalha.
    const btn = one('#rb-center-schedule');
    if (!btn || btn.disabled) {
      state.paused = true; save();
      status('Agendador do Centro Pokémon não encontrado. Automação pausada.');
      return false;
    }
    const already = btn.getAttribute('aria-pressed') === 'true';
    state.returnPending = { requestedAt: Date.now(), verified: already, warned: false };
    save();
    // Se já está "true", novo clique CANCELARIA o retorno.
    if (!already) btn.click();
    status(already
      ? 'Retorno ao Centro já estava agendado. Aguardando chegada...'
      : 'Retorno ao Centro solicitado. O jogo espera o fim do combate e 3 segundos sem batalha.');
    return true;
  }
  function finishCapture(species, evidence) {
    if (!state.current || state.current.id !== species.id) return;
    if (!state.done.includes(species.id)) state.done.push(species.id);
    const item = dex.find(x => x.id === species.id);
    if (item) item.caught = true; // Progressão local mesmo com a Pokédex fechada.
    state.current = null;
    state.pos++;
    save();
    status('Nova espécie: ' + species.name + ' (' + evidence + '). Agendando Centro Pokémon...');
    if (returnCenter() && !state.returnPending) void advance();
  }
  async function advance() {
    if (busy || !state.running || state.paused || state.current || state.returnPending) return;
    busy = true;
    try {
      let attempts = 0;
      while (state.running && !state.paused && !state.current && !state.returnPending &&
             state.pos < state.queue.length && attempts++ < 4) {
        const species = state.queue[state.pos];
        // Pode ter sido capturado manualmente desde que a fila foi criada.
        if (caught(species) === true) { state.pos++; save(); continue; }
        const result = await startHunt(species);
        if (result === 'started' || result === 'error') return;
        if (result === 'unavailable') {
          if (!state.skipped.includes(species.id)) state.skipped.push(species.id);
          state.pos++; save();
          status('Sem hunt normal para ' + species.name + '; deixado como pendente especial.');
        }
      }
      if (state.pos >= state.queue.length && state.running) {
        state.running = false; save();
        status('Fila percorrida; ' + state.skipped.length + ' espécies sem hunt normal.');
      }
    } finally { busy = false; }
  }
  async function poll() {
    if (!state.running || state.paused || busy) return;
    if (state.returnPending) {
      if (atCenter()) {
        state.returnPending = null; save();
        status('Chegada ao Centro confirmada por #hud-hunt. Próxima hunt...');
        await advance();
      } else {
        const sched = one('#rb-center-schedule');
        if (sched?.getAttribute('aria-pressed') === 'true') state.returnPending.verified = true;
        if (!state.returnPending.verified && Date.now() - state.returnPending.requestedAt > 6000) {
          state.paused = true; save();
          status('O jogo não confirmou o agendamento; pausado. Confira o botão do Centro.');
        } else if (!state.returnPending.warned &&
          Date.now() - state.returnPending.requestedAt > 120000) {
          state.returnPending.warned = true; save();
          status('Ainda esperando o Centro; não vou cancelar o agendamento nem viajar antes da chegada.');
        }
      }
      return;
    }
    const current = state.current;
    if (!current) { await advance(); return; }
    if (atHunt(current)) {
      if (!current.arrivedAt) {
        current.arrivedAt = Date.now(); save();
        status('Hunt confirmada: ' + current.name + '. Aguardando Pokédex +1.');
      }
      if (caught(current) === true && !current.wasCaught) {
        finishCapture(current, 'card pego');
        return;
      }
      const nowBadge = bannerCount();
      if (nowBadge > current.badgeBefore) {
        // Só considerar +1 NOVO, na hunt correspondente; +1 antigo é ignorado.
        finishCapture(current, 'menu Pokédex +' + nowBadge);
        return;
      }
      if (nowBadge < current.badgeBefore) {
        // O contador foi limpo ao abrir a Pokédex; redefine a referência.
        current.badgeBefore = nowBadge; save();
      }
    } else if (!current.arrivedAt && Date.now() - current.since > 20000) {
      state.paused = true; save();
      status('Não consegui confirmar a entrada em ' + current.name + ' pelo #hud-hunt.');
    } else if (current.arrivedAt) {
      current.lostAt ||= Date.now();
      if (Date.now() - current.lostAt > 5000) {
        state.paused = true; save();
        status('HUD não corresponde mais à hunt ' + current.name + '; pausado por segurança.');
      }
    }
    if (atHunt(current)) current.lostAt = null;
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
        state.queue=dex.filter(s=>!s.caught).sort((a,b)=>Number(b.seen)-Number(a.seen)||a.id-b.id).map(({id,name})=>({id,name}));
        state.pos=0;state.done=[];state.skipped=[];state.current=null;state.returnPending=null;state.running=false;save();
        status('Fila criada: '+state.queue.length+' pendentes (vistos primeiro).');
      }
      if (action==='run') {
        if (!state.queue.length) { status('Crie a fila antes de iniciar.');return; }
        state.running=true;state.paused=false;save();await advance();
      }
      if (action==='pause') { state.paused=!state.paused;save();status(state.paused?'Pausado.':'Retomando...');if(!state.paused){await poll();await advance();} }
      if (action==='stop') { state.running=false;state.paused=false;state.current=null;state.returnPending=null;save();status('Parado. Fila preservada; o agendamento nativo existente não é cancelado.'); }
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
      d.textContent='#'+s.id+' '+s.name+(s.caught?' ✓':(s.seen?' ◉':' ○'));
      return d;
    }));
  }
  window.PIOAutoDex = {
    diagnostico() {
      return {
        version: '0.2.0', cards: all('.dex-card').length,
        caught: all('.dex-card.pego').length, banner: bannerCount(),
        hud: val(one('#hud-hunt')),
        centerScheduled: one('#rb-center-schedule')?.getAttribute('aria-pressed'),
        state: { running: state.running, paused: state.paused, pos: state.pos,
          queue: state.queue.length, current: state.current, returnPending: state.returnPending },
        message
      };
    }
  };
  setInterval(() => {
    mount();
    if (state.running) poll().catch(error => {
      console.error('[AutoDex]', error);
      state.paused = true; save();
      status('Falha interna; confira o Console.');
    });
  }, 600);
  mount();

})();