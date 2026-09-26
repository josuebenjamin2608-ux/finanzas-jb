(function(){
"use strict";
/* ---------- Iconos ---------- */
const P = {
  mic:'<path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z"/><path d="M19 11a7 7 0 0 1-14 0M12 18v3"/>',
  kbd:'<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10"/>',
  menu:'<path d="M4 7h16M4 12h16M4 17h10"/>',
  back:'<path d="m15 5-7 7 7 7"/>',
  left:'<path d="m15 5-7 7 7 7"/>',
  right:'<path d="m9 5 7 7-7 7"/>',
  chev:'<path d="m9 6 6 6-6 6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  home:'<path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1Z"/>',
  list:'<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  wallet:'<path d="M4 7a2 2 0 0 1 2-2h11v4"/><rect x="4" y="7" width="16" height="12" rx="2"/><path d="M16 13h.01"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>',
  alert:'<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/>',
  check:'<path d="m5 12 5 5L20 7"/>',
  undo:'<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
  edit:'<path d="M4 20h4L19 9l-4-4L4 16Z"/>',
  trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  tag:'<path d="M3 12V4h8l10 10-8 8Z"/><path d="M7.5 8h.01"/>',
  link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  out:'<path d="M12 5v14M6 13l6 6 6-6"/>',
  in:'<path d="M12 19V5M6 11l6-6 6 6"/>',
  swap:'<path d="M7 7h12l-3-3M17 17H5l3 3"/>',
  scale:'<path d="M12 4v16M6 20h12M4 9l3-5 3 5a3 3 0 0 1-6 0ZM14 9l3-5 3 5a3 3 0 0 1-6 0Z"/>',
  archive:'<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v10h14V9M10 13h4"/>',
  target:'<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
  clock:'<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
  cal:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>'
};
const I = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg>`;

/* ---------- Datos ----------
   Por ahora vienen de js/datos-ejemplo.js (ficticios). Cuando exista la
   persistencia real (js/store.js), aquí se cargarán desde el almacenamiento. */
const {TODAY, INSTALL, CATS, INCATS, CLS, A, M} = window.FJB_DATOS;

/* ---------- Estado de la interfaz ---------- */
const S = {
  stack:[{s:'inicio'}],
  month:'2026-09',
  filter:{acc:'', cat:''},
  askLater:false,
  pendiente:{phrase:'gasolina 50 mil', open:true},
  deleted:new Set(),
  classified:{},
  habitual:'bancolombia',
  ui:{},           // estado temporal por pantalla
  sheet:null,
  pu:{step:1, sel:{efectivo:true, bancolombia:true, nequi:true, visa:true}, amt:{efectivo:'150.000', bancolombia:'1.328.000', visa:'864.000'}, unk:{nequi:true}, hab:'bancolombia'},
  form:null
};

/* ---------- Utilidades ---------- */
const fmt = n => '$' + String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
const esc = s => String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const acc = id => A.find(a=>a.id===id);
const mov = id => M.find(m=>m.id===id);
const live = () => M.filter(m=>!S.deleted.has(m.id));
const catOf = m => S.classified[m.id] || m.cat;
const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const DIAS = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const dparts = s => { const [y,m,d]=s.split('-').map(Number); return {y,m,d,wd:new Date(Date.UTC(y,m-1,d)).getUTCDay()}; };
const monthName = ym => { const [y,m]=ym.split('-').map(Number); return MESES[m-1][0].toUpperCase()+MESES[m-1].slice(1)+' '+y; };
const dayLabel = s => { if(s===TODAY) return 'Hoy'; if(s==='2026-09-25') return 'Ayer'; const p=dparts(s); return DIAS[p.wd][0].toUpperCase()+DIAS[p.wd].slice(1)+' '+p.d+' de '+MESES[p.m-1]; };
const shortDate = s => { const p=dparts(s); return p.d+' '+MESES[p.m-1].slice(0,3); };
const longDate = s => { const p=dparts(s); return DIAS[p.wd]+' '+p.d+' de '+MESES[p.m-1]+' de '+p.y; };
const initials = n => n.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();

// Efecto de un movimiento sobre una cuenta (solo para mostrar datos ficticios coherentes)
function delta(m, id){
  if(m.type==='AJUSTE') return 0;
  if(m.type==='GASTO') return m.acc===id ? -m.amt : 0;
  if(m.type==='INGRESO'||m.type==='REEMBOLSO') return m.acc===id ? m.amt : 0;
  if(m.type==='TRANSFERENCIA') return (m.to===id?m.amt:0) - (m.from===id?m.amt:0);
  return 0;
}
function flows(id){ let inn=0,out=0; live().forEach(m=>{const d=delta(m,id); if(d>0) inn+=d; else out-=d;}); return {inn,out}; }
function bal(a){ const f=flows(a.id); return (a.ap||0)+f.inn-f.out; }
const active = () => A.filter(a=>!a.archived);
const pendingAccs = () => active().filter(a=>a.pending);
function totals(){
  const act=active();
  const disp=act.filter(a=>a.cls==='disp').reduce((s,a)=>s+bal(a),0);
  const tarj=act.filter(a=>a.cls==='deuda'&&a.sub==='tarjeta').reduce((s,a)=>s+bal(a),0);
  const patr=act.reduce((s,a)=>s+bal(a),0);
  return {disp,tarj,patr};
}
function words(a, b){
  if(b===undefined) b=bal(a);
  if(a.cls==='persona'){ if(b>0) return {w:'Te debe', v:fmt(b)}; if(b<0) return {w:'Le debes', v:fmt(b)}; return {w:'A paz y salvo', v:''}; }
  if(a.cls==='deuda'){ if(b<0) return {w:'Debes', v:fmt(b)}; if(b>0) return {w:'A tu favor', v:fmt(b)}; return {w:'A paz y salvo', v:''}; }
  if(a.cls==='ahorro') return {w:'Apartado', v:fmt(b)};
  if(b<0) return {w:'En negativo', v:fmt(b)};
  return {w:'Tienes', v:fmt(b)};
}
function subtypeLabel(a){ return a.cls==='deuda' ? (a.sub==='tarjeta'?'Tarjeta de crédito':'Crédito') : CLS[a.cls]; }

function monthResult(ym){
  const ms = live().filter(m=>m.d.startsWith(ym));
  const ing = ms.filter(m=>m.type==='INGRESO').reduce((s,m)=>s+m.amt,0);
  const cats = {};
  ms.forEach(m=>{
    if(m.type!=='GASTO' && m.type!=='REEMBOLSO') return;
    const c = catOf(m) || '__unc';
    const sign = m.type==='GASTO'?1:-1;
    cats[c] = cats[c] || {total:0, subs:{}, ref:0, n:0};
    cats[c].total += sign*m.amt; cats[c].n++;
    if(m.type==='REEMBOLSO') cats[c].ref += m.amt;
    if(m.sub && c!=='__unc') cats[c].subs[m.sub]=(cats[c].subs[m.sub]||0)+sign*m.amt;
  });
  const gasto = Object.values(cats).reduce((s,c)=>s+c.total,0);
  const tr = ms.filter(m=>m.type==='TRANSFERENCIA');
  const sumT = f => tr.filter(f).reduce((s,m)=>s+m.amt,0);
  const not = {
    tarjeta: sumT(m=>acc(m.to)&&acc(m.to).cls==='deuda'),
    apartado: sumT(m=>acc(m.to)&&acc(m.to).cls==='ahorro'),
    cuentas: sumT(m=>acc(m.from).cls==='disp'&&acc(m.to).cls==='disp'),
    personas: sumT(m=>acc(m.from).cls==='persona'||acc(m.to).cls==='persona'),
    ajustes: ms.filter(m=>m.type==='AJUSTE').length
  };
  return {ing, gasto, res:ing-gasto, cats, not, count:ms.length};
}

/* Descripción de filas */
function rowTitle(m){
  if(m.type==='TRANSFERENCIA') return m.desc || (acc(m.from).name+' → '+acc(m.to).name);
  return m.desc;
}
function rowSub(m){
  if(m.type==='TRANSFERENCIA') return acc(m.from).name+' → '+acc(m.to).name;
  if(m.type==='AJUSTE') return 'Ajuste de apertura';
  const c=catOf(m);
  if(!c) return 'Sin categoría';
  return c + (m.sub && !S.classified[m.id] ? ' · '+m.sub : '');
}
function rowAmount(m, ctxAcc){
  if(ctxAcc){ const d=m.type==='AJUSTE'? m.amt : delta(m,ctxAcc); return `<span class="${d>0?'pos':''}">${d>0?'+':d<0?'−':''}${fmt(d)}</span>`; }
  if(m.type==='GASTO') return '−'+fmt(m.amt);
  if(m.type==='INGRESO'||m.type==='REEMBOLSO') return `<span class="pos">+${fmt(m.amt)}</span>`;
  return `<span class="muted">${fmt(m.amt)}</span>`;
}
function rowAcc(m){
  if(m.type==='TRANSFERENCIA') return 'Transferencia';
  return acc(m.acc).name;
}
function rowIcon(m){
  if(m.type==='INGRESO'||m.type==='REEMBOLSO') return `<span class="ic in">${I('in')}</span>`;
  if(m.type==='TRANSFERENCIA') return `<span class="ic tr">${I('swap')}</span>`;
  if(m.type==='AJUSTE') return `<span class="ic tr">${I('scale')}</span>`;
  return `<span class="ic">${I('out')}</span>`;
}
function rowBadges(m){
  const b=[];
  if(m.type==='GASTO' && !catOf(m)) b.push('<span class="badge unc">Sin clasificar</span>');
  if(m.refundedBy && !S.deleted.has(m.refundedBy)) b.push('<span class="badge ref">Reembolsado</span>');
  if(m.type==='REEMBOLSO') b.push('<span class="badge ref">Reembolso</span>');
  if(m.type==='AJUSTE') b.push('<span class="badge adj">'+(m.motivo==='apertura'?'Ajuste de apertura':'Saldo real')+'</span>');
  return b.length?`<div class="badges">${b.join('')}</div>`:'';
}
function mvRow(m, ctxAcc){
  return `<button class="mv" type="button" data-a="go" data-s="movdetalle" data-id="${m.id}">
    ${rowIcon(m)}
    <span class="t"><div class="d">${esc(rowTitle(m))}</div><div class="s">${esc(rowSub(m))}</div>${rowBadges(m)}</span>
    <span class="a"><div class="m">${rowAmount(m,ctxAcc)}</div><div class="acc">${ctxAcc?shortDate(m.d):esc(rowAcc(m))}</div></span>
  </button>`;
}
const sortDesc = (a,b) => (b.d+b.t).localeCompare(a.d+a.t);

/* ---------- Pantallas ---------- */
const TABS = ['inicio','movimientos','cuentas'];
const screens = {};

screens.widget = () => `
  <div class="home">
    <div class="clock">9:41</div>
    <div class="date">sábado, 26 de septiembre</div>
    <div class="wdg" role="group" aria-label="Widget Finanzas JB">
      <div class="wdg-row">
        <button class="wdg-rec" type="button" data-a="sheet" data-m="mic">${I('mic')} Registrar</button>
        <button class="wdg-kbd" type="button" data-a="sheet" data-m="kbd" aria-label="Escribir">${I('kbd')}</button>
      </div>
      ${S.pendiente.open?`<button class="wdg-pend" type="button" data-a="sheet" data-m="pend">${I('clock')} 1 pendiente</button>`:''}
      <div class="wdg-name">Finanzas JB</div>
    </div>
    <div class="apps">
      <div class="app"><i></i>Cámara</div>
      <div class="app"><i></i>Mensajes</div>
      <div class="app"><i></i>Galería</div>
      <button class="app fjb" type="button" data-a="tab" data-s="inicio"><i>JB</i>Finanzas JB</button>
    </div>
    <div class="dock-note">Pantalla de tu teléfono con el widget. Toca el ícono JB para entrar a la app.</div>
  </div>`;

screens.primeruso = () => {
  const pu=S.pu, step=pu.step;
  const opts=[['efectivo','Efectivo','Disponible'],['bancolombia','Bancolombia','Disponible'],['nequi','Nequi','Disponible'],['visa','Visa Bancolombia','Tarjeta de crédito'],['ahorro','Ahorro programado','Ahorro e inversión']];
  const bar = `<div class="steps">${[1,2,3,4].map(i=>`<i class="${i<=step?'on':''}"></i>`).join('')}</div>`;
  let body='', foot='';
  if(step===1){
    body=`<h2>¿Cuánto tienes hoy?</h2><p class="lead">Elige dónde tienes tu plata y tus deudas. Puedes saltar esto y hacerlo después.</p>
      ${opts.map(([id,n,c])=>`<button class="pick ${pu.sel[id]?'on':''}" type="button" data-a="pu-sel" data-id="${id}"><span class="check">${pu.sel[id]?I('check'):''}</span><span class="n"><div>${n}</div><div>${c}</div></span></button>`).join('')}
      <button class="pick" type="button" data-a="toast" data-t="Aquí se crearía otra cuenta (prototipo)"><span class="check">${I('plus')}</span><span class="n"><div>Otra</div><div>Escribe su nombre</div></span></button>`;
    foot=`<button class="btn primary block" type="button" data-a="pu-next">Continuar</button><button class="btn quiet block" type="button" data-a="pu-skip">Saltar todo</button>`;
  } else if(step===2){
    const ids=Object.keys(pu.sel).filter(k=>pu.sel[k]);
    body=`<h2>Escribe cuánto hay en cada una</h2><p class="lead">En tarjetas escribe cuánto debes, en positivo. Si no lo sabes, marca “No sé”.</p>
      ${ids.map(id=>{const a=acc(id); const debt=a.cls==='deuda'; return `<div class="pu-amt">
        <div class="top"><b>${a.name}</b><span class="small muted">${debt?'¿Cuánto debes?':'¿Cuánto tienes?'}</span></div>
        <div class="amount-input"><span>$</span><input id="pu-${id}" inputmode="numeric" placeholder="0" value="${pu.unk[id]?'':esc(pu.amt[id]||'')}" ${pu.unk[id]?'disabled':''} aria-label="Monto de ${a.name}"></div>
        <label class="nosabe"><input type="checkbox" data-c="pu-unk" data-id="${id}" ${pu.unk[id]?'checked':''}> No sé</label>
      </div>`;}).join('')}`;
    foot=`<button class="btn primary block" type="button" data-a="pu-next">Continuar</button><button class="btn quiet block" type="button" data-a="pu-back">Atrás</button>`;
  } else if(step===3){
    const ids=Object.keys(pu.sel).filter(k=>pu.sel[k]&&(acc(k).cls==='disp'||acc(k).sub==='tarjeta'));
    body=`<h2>¿Con cuál pagas casi siempre?</h2><p class="lead">La usaremos como cuenta sugerida mientras aprendemos cómo registras.</p>
      <div class="list">${ids.map(id=>`<button class="radio ${pu.hab===id?'on':''}" type="button" data-a="pu-hab" data-id="${id}"><span class="dotr"></span><span class="n">${acc(id).name}</span></button>`).join('')}</div>`;
    foot=`<button class="btn primary block" type="button" data-a="pu-next">Continuar</button><button class="btn quiet block" type="button" data-a="pu-back">Atrás</button>`;
  } else {
    const t=totals(); const unk=Object.keys(pu.unk).filter(k=>pu.unk[k]&&pu.sel[k]);
    body=`<h2>Listo, así empiezas</h2><p class="lead">Cada monto entra como saldo inicial de su cuenta, con la fecha y hora de hoy.</p>
      <div class="card"><div class="label">Disponible</div><div class="big num">${fmt(t.disp)}</div>
      <div class="patri" style="padding-top:6px"><span>Tarjetas por pagar</span><b class="num">${fmt(t.tarj)}</b></div></div>
      ${unk.length?`<div class="warn">${I('alert')}<div><b>Cifras provisionales.</b> ${unk.map(k=>acc(k).name).join(', ')} queda con saldo por confirmar. Te lo preguntaremos cuando abras la app.</div></div>`:''}`;
    foot=`<button class="btn primary block" type="button" data-a="pu-done">Empezar</button><button class="btn quiet block" type="button" data-a="pu-back">Atrás</button>`;
  }
  return `<div class="pu">${bar}${body}<div class="pu-foot">${foot}</div></div>`;
};

screens.inicio = () => {
  const t=totals(), pend=pendingAccs(), r=monthResult('2026-09');
  const nq=acc('nequi');
  const firstNequi = live().filter(m=>delta(m,'nequi')!==0).sort((a,b)=>(a.d+a.t).localeCompare(b.d+b.t))[0];
  const last = live().slice().sort(sortDesc).slice(0,5);
  return `
  <div class="topbar plain"><div class="wordmark">Finanzas <span>JB</span></div><button class="iconbtn" type="button" data-a="go" data-s="menu" aria-label="Abrir menú">${I('menu')}</button></div>
  <div class="hero">
    <button class="hero-tap" type="button" data-a="tab" data-s="cuentas">
      <div style="display:flex;gap:8px;align-items:center"><span class="label">Disponible</span>${pend.length?'<span class="chip-prov">Provisional</span>':''}</div>
      <div class="big num">${fmt(t.disp)}</div>
    </button>
    <button class="debt-row" type="button" data-a="tab" data-s="cuentas" style="width:100%"><span class="muted">Tarjetas por pagar</span><span class="v num">${fmt(t.tarj)}</span></button>
    ${pend.length?`<div class="warn">${I('alert')}<div><b>Cifras provisionales.</b> ${pend.length===1?'1 cuenta tiene':pend.length+' cuentas tienen'} el saldo por confirmar (${pend.map(a=>a.name).join(', ')}). Estas cifras todavía no son un saldo validado.</div></div>`:''}
  </div>

  ${nq.pending && !S.askLater && firstNequi ? `<div class="section card ask">
    <h3>¿Cuánto tenías en Nequi antes de este movimiento?</h3>
    <div class="ctx">${esc(rowTitle(firstNequi))} · ${fmt(firstNequi.amt)} · ${shortDate(firstNequi.d)}</div>
    <div class="amount-input"><span>$</span><input id="askAmt" inputmode="numeric" placeholder="0" aria-label="Saldo anterior de Nequi"></div>
    <div class="row-btns"><button class="btn primary" type="button" data-a="ask-save">Guardar</button><button class="btn quiet" type="button" data-a="ask-later">Ahora no</button></div>
  </div>`:''}

  ${S.pendiente.open?`<div class="section card pend">
    <span class="q"><div>1 captura sin terminar</div><div class="small muted">“${esc(S.pendiente.phrase)}” · no ha tocado ningún saldo</div></span>
    <button class="btn quiet" type="button" data-a="pend-discard" aria-label="Descartar pendiente">${I('x')}</button>
    <button class="btn primary" type="button" data-a="sheet" data-m="pend">Abrir</button>
  </div>`:''}

  <div class="section card">
    <button class="result-tap" type="button" data-a="go" data-s="resumen">
      <span><div class="label">Resultado de septiembre</div><div class="v num ${r.res>=0?'pos':'neg'}">${r.res>=0?'Te sobraron':'Te faltaron'} ${fmt(r.res)}</div><div class="small muted">Ver resumen del mes</div></span>
      <span class="iconbtn">${I('chev')}</span>
    </button>
  </div>

  <div class="section">
    <div class="section-head"><span class="label">Últimos movimientos</span><button class="link" type="button" data-a="tab" data-s="movimientos">Ver todos</button></div>
    <div class="list">${last.map(m=>mvRow(m)).join('')}</div>
  </div>`;
};

function monthSel(){
  const prevOk = S.month>'2026-08', nextOk = S.month<'2026-09';
  return `<div class="monthsel"><button class="iconbtn" type="button" data-a="month" data-d="-1" ${prevOk?'':'disabled'} aria-label="Mes anterior">${I('left')}</button><b>${monthName(S.month)}</b><button class="iconbtn" type="button" data-a="month" data-d="1" ${nextOk?'':'disabled'} aria-label="Mes siguiente">${I('right')}</button></div>`;
}

screens.movimientos = () => {
  const f=S.filter;
  let ms = live().filter(m=>m.d.startsWith(S.month));
  if(f.acc) ms = ms.filter(m=>m.acc===f.acc||m.from===f.acc||m.to===f.acc);
  if(f.cat==='__unc') ms = ms.filter(m=>m.type==='GASTO'&&!catOf(m));
  else if(f.cat) ms = ms.filter(m=>catOf(m)===f.cat);
  ms.sort(sortDesc);
  const days=[...new Set(ms.map(m=>m.d))];
  const accOpts = active().map(a=>`<option value="${a.id}" ${f.acc===a.id?'selected':''}>${esc(a.name)}</option>`).join('');
  const catOpts = [...CATS,...INCATS.filter(c=>c.n!=='Otros')].map(c=>`<option value="${c.n}" ${f.cat===c.n?'selected':''}>${c.n}</option>`).join('');
  let list;
  if(!ms.length){
    list = S.month<INSTALL.slice(0,7) ? `<div class="empty"><b>Sin movimientos en ${MESES[Number(S.month.slice(5))-1]}</b>Empezaste a usar Finanzas JB el 1 de septiembre.</div>`
      : `<div class="empty"><b>Nada con este filtro</b>Quita el filtro para ver todo el mes.</div>`;
  } else {
    list = days.map(d=>{const dm=ms.filter(m=>m.d===d); return `<div class="day"><span>${dayLabel(d)}</span></div><div class="list">${dm.map(m=>mvRow(m)).join('')}</div>`;}).join('');
  }
  return `
  <div class="topbar plain"><h1>Movimientos</h1></div>
  ${monthSel()}
  <div class="filters">
    <select class="fsel ${f.acc?'on':''}" id="fAcc" data-c="f-acc" aria-label="Filtrar por cuenta"><option value="">Todas las cuentas</option>${accOpts}</select>
    ${f.cat==='__unc'?`<button class="fchip" type="button" data-a="f-clear-cat">Sin clasificar ${I('x')}</button>`:`<select class="fsel ${f.cat?'on':''}" id="fCat" data-c="f-cat" aria-label="Filtrar por categoría"><option value="">Todas las categorías</option>${catOpts}</select>`}
  </div>
  <div style="margin-top:6px">${list}</div>`;
};

function effectText(m){
  const c=catOf(m);
  if(m.type==='GASTO'){
    const a=acc(m.acc);
    const lead = c?`Cuenta como gasto de ${c} en ${MESES[dparts(m.d).m-1]}.`:'Cuenta como gasto del mes, todavía sin categoría.';
    if(a.cls==='deuda') return `${lead} Tu deuda con ${a.name} sube ${fmt(m.amt)}.`;
    return `${lead} ${a.name} baja ${fmt(m.amt)}.`;
  }
  if(m.type==='INGRESO') return `Cuenta como ingreso de ${c}. ${acc(m.acc).name} sube ${fmt(m.amt)}.`;
  if(m.type==='REEMBOLSO') return `Se resta del gasto de ${c} de ${MESES[dparts(m.d).m-1]}, el mes en que llegó. ${acc(m.acc).name} sube ${fmt(m.amt)}.`;
  if(m.type==='AJUSTE') return `No cuenta como gasto ni ingreso. Es el saldo con el que empezó ${acc(m.acc).name}.`;
  const f=acc(m.from), t=acc(m.to);
  if(t.cls==='persona'){ const w=words(t); return `No cuenta como gasto. ${t.name} ${w.w.toLowerCase()} ${w.v}.`; }
  if(f.cls==='persona'){ const w=words(f); return `No cuenta como ingreso. ${w.w==='Le debes'?'Le debes '+w.v+' a '+f.name:f.name+': '+w.w.toLowerCase()}.`; }
  if(t.cls==='deuda') return `No cuenta como gasto. Es un pago de deuda: ahora debes ${fmt(bal(t))} en ${t.name}.`;
  if(t.cls==='ahorro') return `No cuenta como gasto. Es plata apartada: sale de Disponible y queda en ${t.name}.`;
  return `No cuenta como gasto. Solo cambia de cuenta: ${f.name} baja y ${t.name} sube ${fmt(m.amt)}.`;
}

screens.movdetalle = p => {
  const m=mov(p.id); if(!m) return '';
  const u=S.ui;
  const c=catOf(m);
  const kindCls = {GASTO:'g',INGRESO:'i',TRANSFERENCIA:'t',REEMBOLSO:'i',AJUSTE:'a'}[m.type];
  const rows=[];
  if(m.type==='TRANSFERENCIA'){ rows.push(['Sale de',acc(m.from).name,m.from],['Entra a',acc(m.to).name,m.to]); }
  else rows.push(['Cuenta',acc(m.acc).name,m.acc]);
  if(m.type==='GASTO'||m.type==='INGRESO'||m.type==='REEMBOLSO') rows.push(['Categoría', c ? c+(m.sub&&!S.classified[m.id]?' · '+m.sub:'') : '<span class="badge unc">Sin clasificar</span>']);
  if(m.type==='AJUSTE') rows.push(['Motivo','Apertura (saldo inicial)'],['Saldo escrito',fmt(m.amt)]);
  rows.push(['Fecha', longDate(m.d)],['Hora', m.t]);
  if(m.desc && m.type!=='AJUSTE') rows.push(['Descripción', esc(m.desc)]);
  if(m.phrase) rows.push(['Frase registrada','“'+esc(m.phrase)+'”']);
  const linked = m.refundedBy&&!S.deleted.has(m.refundedBy) ? mov(m.refundedBy) : (m.link&&!S.deleted.has(m.link)?mov(m.link):null);
  let delMsg='';
  if(m.type==='AJUSTE') delMsg=`${acc(m.acc).name} volverá a quedar con saldo por confirmar.`;
  else if(m.type==='TRANSFERENCIA') delMsg=`${acc(m.from).name} y ${acc(m.to).name} vuelven a como estaban antes de este movimiento.`;
  else { const a=acc(m.acc), nb=bal(a)-delta(m,a.id); delMsg = a.pending ? `${a.name} · saldo por confirmar.` : `${a.name} volverá a ${a.cls==='deuda'?'deber ':''}${fmt(nb)}.`; if(m.refundedBy) delMsg+=' El reembolso quedará sin compra enlazada.'; }
  return `
  <div class="topbar"><button class="iconbtn" type="button" data-a="back" aria-label="Volver">${I('back')}</button><h1>Movimiento</h1></div>
  <div class="detail-hero">
    <span class="kind ${kindCls}">${m.type==='AJUSTE'?'AJUSTE DE APERTURA':m.type}</span>
    <div class="big num">${m.type==='GASTO'?'−':m.type==='INGRESO'||m.type==='REEMBOLSO'?'+':''}${fmt(m.amt)}</div>
    <div class="muted">${esc(rowTitle(m))}</div>
  </div>
  <div class="effect">${I('info')}<div>${effectText(m)}</div></div>
  <div class="section kv">${rows.map(r=>r[2]?`<div class="r"><span class="k">${r[0]}</span><button class="v" type="button" data-a="go" data-s="cuentadetalle" data-id="${r[2]}" style="color:var(--accent)">${r[1]} ›</button></div>`:`<div class="r"><span class="k">${r[0]}</span><span class="v">${r[1]}</span></div>`).join('')}</div>
  ${linked?`<button class="linkrow" type="button" data-a="go" data-s="movdetalle" data-id="${linked.id}">${I('link')}<span class="t"><div>${m.refundedBy?'Reembolsado el '+shortDate(linked.d):'Compra enlazada: '+esc(linked.desc)}</div><div>${m.refundedBy?esc(linked.desc)+' · +'+fmt(linked.amt):shortDate(linked.d)+' · '+fmt(linked.amt)}</div></span>${I('chev')}</button>`:''}
  <div class="actions">
    ${m.type==='GASTO'&&!c?`<button class="actbtn" type="button" data-a="ui" data-k="classify">${I('tag')}<span>Clasificar<span class="sub">Elige su categoría</span></span></button>
      ${u.classify?`<div class="picker"><span class="label">Categoría</span><div class="opts">${CATS.map(x=>`<button class="opt" type="button" data-a="classify" data-id="${m.id}" data-v="${x.n}">${x.n}</button>`).join('')}</div></div>`:''}`:''}
    ${m.type==='AJUSTE'
      ?`<button class="actbtn" type="button" data-a="ui" data-k="editadj">${I('edit')}<span>Editar saldo escrito<span class="sub">Nunca se convierte en gasto ni ingreso</span></span></button>
        ${u.editadj?`<div class="card"><div class="amount-input"><span>$</span><input id="adjAmt" inputmode="numeric" value="${fmt(m.amt).slice(1)}" aria-label="Saldo escrito"></div><div class="row-btns"><button class="btn primary" type="button" data-a="toast-ui" data-t="Saldo actualizado (prototipo)" data-k="editadj">Guardar</button></div></div>`:''}`
      :`<button class="actbtn" type="button" data-a="sheet" data-m="edit" data-id="${m.id}">${I('edit')}<span>Editar<span class="sub">Se abre la misma tarjeta de registro</span></span></button>`}
    <button class="actbtn danger" type="button" data-a="ui" data-k="del">${I('trash')}<span>Eliminar</span></button>
    ${u.del?`<div class="confirm"><p>¿Eliminar este movimiento?</p><div class="small muted">${delMsg}</div><div class="row-btns"><button class="btn danger" type="button" data-a="del" data-id="${m.id}">Eliminar</button><button class="btn quiet" type="button" data-a="ui" data-k="del">Cancelar</button></div></div>`:''}
  </div>`;
};

screens.resumen = () => {
  const r=monthResult(S.month);
  const entries=Object.entries(r.cats).filter(([k])=>k!=='__unc').sort((a,b)=>b[1].total-a[1].total);
  const max=Math.max(1,...entries.map(e=>e[1].total));
  const unc=r.cats.__unc;
  const empty = !r.count;
  return `
  <div class="topbar"><button class="iconbtn" type="button" data-a="back" aria-label="Volver">${I('back')}</button><h1>Resumen del mes</h1></div>
  ${monthSel()}
  ${empty?`<div class="empty"><b>Sin datos en ${MESES[Number(S.month.slice(5))-1]}</b>Empezaste a usar Finanzas JB el 1 de septiembre.</div>`:`
  <div class="res-hero">
    <div class="label">Resultado del mes</div>
    <div class="big num ${r.res>=0?'pos':'neg'}">${fmt(r.res)}</div>
    <div style="font-weight:700">${r.res>=0?'Te sobraron':'Te faltaron'} ${fmt(r.res)} este mes</div>
    <div class="two">
      <div><div class="small muted">Ingresos</div><div class="v">${fmt(r.ing)}</div></div>
      <div><div class="small muted">Gasto neto</div><div class="v">${fmt(r.gasto)}</div></div>
    </div>
  </div>
  <div class="section">
    <div class="section-head"><span class="label">Gasto por categoría</span></div>
    <div class="list">
      ${entries.map(([k,c])=>`<button class="cat" type="button" data-a="cat-filter" data-v="${k}">
        <div class="top"><span>${k}</span><span class="m">${fmt(c.total)}</span></div>
        <div class="bar"><i style="width:${Math.max(2,c.total/max*100)}%"></i></div>
        ${Object.keys(c.subs).length>1?`<div class="subs">${Object.entries(c.subs).map(([s,v])=>`<div><span>${s}</span><span class="num">${fmt(v)}</span></div>`).join('')}</div>`:''}
        ${c.ref?`<div class="note">Ya descuenta un reembolso de ${fmt(c.ref)}</div>`:''}
      </button>`).join('')}
      ${unc?`<button class="cat" type="button" data-a="cat-filter" data-v="__unc"><div class="top"><span>${unc.n} sin clasificar <span class="badge unc">Por revisar</span></span><span class="m">${fmt(unc.total)}</span></div><div class="note">Cuentan en el gasto neto. Tócalos para clasificarlos.</div></button>`:''}
    </div>
  </div>
  <div class="notcount">
    <h3>Lo que no cuenta como gasto</h3>
    <p>No cuentan aquí: transferencias entre tus cuentas, pagos de tarjeta, plata apartada, préstamos con personas y ajustes. Solo mueven plata que ya era tuya o deudas que ya contaste.</p>
    ${r.not.tarjeta?`<div class="r"><span>Pagos de tarjeta</span><b class="num">${fmt(r.not.tarjeta)}</b></div>`:''}
    ${r.not.apartado?`<div class="r"><span>Plata apartada</span><b class="num">${fmt(r.not.apartado)}</b></div>`:''}
    ${r.not.cuentas?`<div class="r"><span>Entre tus cuentas</span><b class="num">${fmt(r.not.cuentas)}</b></div>`:''}
    ${r.not.personas?`<div class="r"><span>Préstamos con personas</span><b class="num">${fmt(r.not.personas)}</b></div>`:''}
    ${r.not.ajustes?`<div class="r"><span>Ajustes de saldo</span><b>${r.not.ajustes}</b></div>`:''}
  </div>`}`;
};

screens.cuentas = () => {
  const t=totals(), pend=pendingAccs();
  const groups=[
    ['Disponible', a=>a.cls==='disp', 'Total'],
    ['Tarjetas de crédito', a=>a.cls==='deuda'&&a.sub==='tarjeta', 'Tarjetas por pagar'],
    ['Créditos', a=>a.cls==='deuda'&&a.sub==='credito', 'Debes en total'],
    ['Ahorro e inversión', a=>a.cls==='ahorro', 'Tienes apartado'],
    ['Personas', a=>a.cls==='persona', null]
  ];
  return `
  <div class="topbar plain"><h1>Cuentas</h1></div>
  <div class="patri"><span>Patrimonio ${pend.length?'<span class="chip-prov">Provisional</span>':''}</span><b class="num">${t.patr<0?'−':''}${fmt(t.patr)}</b></div>
  ${groups.map(([title,fn,subLabel])=>{
    const list=active().filter(fn); if(!list.length) return '';
    const sum=list.reduce((s,a)=>s+bal(a),0);
    const gp=list.some(a=>a.pending);
    let sub;
    if(title==='Personas'){ const te=list.filter(a=>bal(a)>0).reduce((s,a)=>s+bal(a),0), de=list.filter(a=>bal(a)<0).reduce((s,a)=>s+bal(a),0); sub=`Te deben ${fmt(te)} · Debes ${fmt(de)}`; }
    else sub=`${subLabel} ${fmt(sum)}`;
    return `<div class="grp"><div class="grp-head"><span class="label">${title}</span><span class="sub num">${sub}${gp?' <span class="chip-prov">Provisional</span>':''}</span></div>
      <div class="list">${list.map(a=>{const w=words(a); return `<button class="acc" type="button" data-a="go" data-s="cuentadetalle" data-id="${a.id}">
        <span class="av">${initials(a.name)}</span>
        <span class="n"><div>${esc(a.name)}</div>${a.pending?'<span class="chip-prov">Saldo por confirmar</span>':`<div class="w">${w.w}</div>`}</span>
        <span class="m ${a.cls==='persona'&&bal(a)>0?'pos':''}">${w.v||'$0'}</span>
      </button>`;}).join('')}</div></div>`;
  }).join('')}
  <button class="newacc" type="button" data-a="newacc">${I('plus')} Nueva cuenta</button>`;
};

screens.cuentadetalle = p => {
  const a=acc(p.id); if(!a) return '';
  const u=S.ui, b=bal(a), w=words(a), f=flows(a.id);
  const ms=live().filter(m=>delta(m,a.id)!==0||(m.type==='AJUSTE'&&m.acc===a.id)).sort(sortDesc);
  const debt=a.cls==='deuda'||(a.cls==='persona');
  const signed = v => (v<0?'−':'')+fmt(v);
  return `
  <div class="topbar"><button class="iconbtn" type="button" data-a="back" aria-label="Volver">${I('back')}</button><h1>${esc(a.name)}</h1></div>
  <div class="detail-hero">
    <div class="small muted">${subtypeLabel(a)}${a.archived?' · <b>Archivada</b>':''}</div>
    ${a.pending?`<div style="margin-top:8px"><span class="chip-prov">Saldo por confirmar</span></div>`:''}
    <div class="big num ${a.cls==='persona'&&b>0?'pos':''}">${w.v||'$0'}</div>
    <div style="font-weight:700">${a.cls==='persona'&&b!==0?(b>0?a.name+' te debe '+w.v:'Le debes '+w.v+' a '+a.name):w.w+(w.v&&a.cls!=='persona'?' '+w.v:'')}</div>
  </div>
  ${a.pending?`<div class="warn">${I('alert')}<div>Falta su saldo inicial. Este número solo suma lo que registraste desde que la creaste, así que es provisional.</div></div>`:''}

  <div class="section">
    <div class="section-head"><span class="label">Por qué este saldo</span></div>
    <div class="kv">
      <div class="r"><span class="k">Saldo inicial</span><span class="v num">${a.pending?'<span class="chip-prov">Por confirmar</span>':signed(a.ap||0)}</span></div>
      <div class="r"><span class="k">+ Entradas</span><span class="v num">${fmt(f.inn)}</span></div>
      <div class="r"><span class="k">− Salidas</span><span class="v num">${fmt(f.out)}</span></div>
      <div class="r tot"><span class="k">= Saldo</span><span class="v num">${signed(b)}</span></div>
    </div>
  </div>

  <div class="actions">
    ${a.archived?`<button class="actbtn" type="button" data-a="reactivate" data-id="${a.id}">${I('undo')}<span>Reactivar<span class="sub">Vuelve a Cuentas con su saldo intacto</span></span></button>`:`
    ${a.pending?`<button class="actbtn" type="button" data-a="ui" data-k="confirm">${I('check')}<span>Confirmar saldo inicial<span class="sub">${a.cls==='deuda'?'¿Cuánto debías':'¿Cuánto tenías'} antes de su primer movimiento?</span></span></button>
      ${u.confirm?`<div class="card"><div class="amount-input"><span>$</span><input id="confAmt" inputmode="numeric" placeholder="0" aria-label="Saldo inicial"></div><div class="row-btns"><button class="btn primary" type="button" data-a="confirm-save" data-id="${a.id}">Guardar</button></div></div>`:''}`:''}
    <button class="actbtn" type="button" data-a="ui" data-k="real">${I('scale')}<span>Poner el saldo real<span class="sub">Crea un ajuste por la diferencia. Nunca es gasto ni ingreso.</span></span></button>
    ${u.real?`<div class="card"><div class="small muted" style="margin-bottom:8px">¿Cuánto ${a.cls==='deuda'?'debes':'hay'} realmente en ${esc(a.name)}?</div><div class="amount-input"><span>$</span><input id="realAmt" inputmode="numeric" placeholder="${fmt(b).slice(1)}" aria-label="Saldo real"></div><div class="row-btns"><button class="btn primary" type="button" data-a="toast-ui" data-k="real" data-t="Ajuste de conciliación creado (prototipo)">Guardar saldo real</button></div></div>`:''}
    <button class="actbtn" type="button" data-a="acc-edit" data-id="${a.id}">${I('edit')}<span>Editar cuenta</span></button>
    <button class="actbtn" type="button" data-a="ui" data-k="arch">${I('archive')}<span>Archivar${b!==0?'<span class="sub">Primero debe quedar en $0</span>':''}</span></button>
    ${u.arch?(b===0
      ?`<div class="confirm" style="border-color:var(--line)"><p>¿Archivar ${esc(a.name)}?</p><div class="small muted">Deja de aparecer en Cuentas. Sus movimientos siguen igual y puedes reactivarla desde el Menú.</div><div class="row-btns"><button class="btn primary" type="button" data-a="archive" data-id="${a.id}">Archivar</button><button class="btn quiet" type="button" data-a="ui" data-k="arch">Cancelar</button></div></div>`
      :`<div class="confirm" style="border-color:var(--line)"><p>${esc(a.name)} todavía tiene saldo</p><div class="small muted">Para archivarla, déjala en $0 de una de estas formas:</div><div class="row-btns"><button class="btn quiet" type="button" data-a="sheet" data-m="move" data-id="${a.id}">Pasar el saldo a otra cuenta</button><button class="btn quiet" type="button" data-a="ui" data-k="real">Poner el saldo real</button></div></div>`):''}
    `}
  </div>

  <div class="section">
    <div class="section-head"><span class="label">Movimientos</span></div>
    ${ms.length?`<div class="list">${ms.map(m=>mvRow(m,a.id)).join('')}</div>`:`<div class="empty"><b>Sin movimientos</b>Todavía no has registrado nada en esta cuenta.</div>`}
  </div>`;
};

function deduce(name){
  const n=name.toLowerCase();
  if(/visa|master|tarjeta|amex|diners/.test(n)) return {cls:'deuda', sub:'tarjeta'};
  if(/cr[eé]dito|pr[eé]stamo|hipoteca|libranza/.test(n)) return {cls:'deuda', sub:'credito'};
  if(/cdt|inversi[oó]n|fondo|acciones/.test(n)) return {cls:'ahorro'};
  if(/ahorro|bolsillo|colch[oó]n|alcanc/.test(n)) return {cls:'disp', askAhorro:true};
  return {cls:'disp'};
}
screens.cuentaform = () => {
  const f=S.form; const edit=!!f.id;
  const d=deduce(f.name);
  const showAh = !edit && d.askAhorro;
  const unknownOk = f.cls!=='persona';
  return `
  <div class="topbar"><button class="iconbtn" type="button" data-a="back" aria-label="Cancelar">${I('x')}</button><h1>${edit?'Editar cuenta':'Nueva cuenta'}</h1></div>
  <div class="fgroup"><label class="label" for="fName">Nombre</label><input class="tinput" id="fName" data-c="f-name" value="${esc(f.name)}" placeholder="Ej: Nequi, Visa, Ahorro casa, Daniel" autocomplete="off"></div>
  ${edit?`<div class="hint">Por ahora solo se puede cambiar el nombre. No cambia movimientos ni saldos.</div>`:`
  <div class="fgroup"><span class="label">Clase ${f.name&&!f.clsTouched?'<span class="muted" style="text-transform:none;letter-spacing:0">· deducida del nombre</span>':''}</span>
    <div class="seg">${[['disp','Disponible','Plata para el día a día'],['deuda','Tarjeta/préstamo','Lo que debes a un banco'],['ahorro','Ahorro e inversión','Plata apartada'],['persona','Persona','Te debe o le debes']].map(([k,n,s])=>`<button class="opt ${f.cls===k?'on':''}" type="button" data-a="f-cls" data-v="${k}">${n}<small>${s}</small></button>`).join('')}</div>
  </div>
  ${f.cls==='deuda'?`<div class="fgroup"><span class="label">¿Tarjeta de crédito o crédito?</span><div class="opts"><button class="opt ${f.sub==='tarjeta'?'on':''}" type="button" data-a="f-sub" data-v="tarjeta">Tarjeta de crédito</button><button class="opt ${f.sub==='credito'?'on':''}" type="button" data-a="f-sub" data-v="credito">Crédito</button></div></div>`:''}
  ${showAh?`<div class="fgroup question"><p>¿La usas a diario o es plata apartada?</p><div class="opts"><button class="opt ${f.ah==='diario'?'on':''}" type="button" data-a="f-ah" data-v="diario">La uso a diario</button><button class="opt ${f.ah==='apartada'?'on':''}" type="button" data-a="f-ah" data-v="apartada">Es plata apartada</button></div></div>`:''}
  ${f.cls==='persona'?`<div class="fgroup"><span class="label">¿Hay algo pendiente con esta persona?</span><div class="opts">${[['nada','Nada pendiente'],['medebe','Me debe'],['ledebo','Le debo']].map(([k,n])=>`<button class="opt ${f.per===k?'on':''}" type="button" data-a="f-per" data-v="${k}">${n}</button>`).join('')}</div>
    ${f.per&&f.per!=='nada'?`<div class="amount-input" style="margin-top:10px"><span>$</span><input id="fAmt" inputmode="numeric" placeholder="0" aria-label="Monto"></div><div class="hint">Entra como saldo inicial de la persona. No cuenta como gasto ni ingreso.</div>`:''}</div>`:''}
  ${unknownOk?`<div class="fgroup"><label class="label" for="fAmt">${f.cls==='deuda'?'¿Cuánto debes hoy?':'Saldo de hoy'}</label>
    <div class="amount-input"><span>$</span><input id="fAmt" inputmode="numeric" placeholder="0" ${f.unk?'disabled':''}></div>
    ${f.cls==='deuda'?'<div class="hint">Escríbelo en positivo.</div>':''}
    <label class="nosabe"><input type="checkbox" data-c="f-unk" ${f.unk?'checked':''}> No sé</label>
    ${f.unk?'<div class="hint">La cuenta quedará con saldo por confirmar y las cifras se mostrarán como provisionales.</div>':''}
  </div>`:''}`}
  <div class="row-btns" style="margin-top:24px"><button class="btn primary" type="button" data-a="f-save" style="flex:1">Guardar</button><button class="btn quiet" type="button" data-a="back">Cancelar</button></div>`;
};

screens.menu = () => {
  const arch=A.filter(a=>a.archived);
  const habOpts=active().filter(a=>a.cls==='disp'||a.sub==='tarjeta');
  return `
  <div class="topbar"><button class="iconbtn" type="button" data-a="back" aria-label="Volver">${I('back')}</button><h1>Menú</h1></div>
  <div class="menu-sec"><h2>Cuentas archivadas</h2><p>Siguen con todos sus movimientos. Puedes reactivarlas.</p>
    ${arch.length?`<div class="list">${arch.map(a=>`<button class="acc" type="button" data-a="go" data-s="cuentadetalle" data-id="${a.id}"><span class="av">${initials(a.name)}</span><span class="n"><div>${esc(a.name)}</div><div class="w">${subtypeLabel(a)}</div></span><span class="m">${fmt(bal(a))}</span></button>`).join('')}</div>`:`<div class="empty" style="padding:16px">No tienes cuentas archivadas.</div>`}
  </div>
  <div class="menu-sec"><h2>Cuenta habitual</h2><p>La que se sugiere al registrar cuando todavía no hay historial.</p>
    <div class="list">${habOpts.map(a=>`<button class="radio ${S.habitual===a.id?'on':''}" type="button" data-a="habitual" data-id="${a.id}"><span class="dotr"></span><span class="n">${esc(a.name)}</span></button>`).join('')}</div>
  </div>
  <div class="menu-sec"><h2>Categorías</h2><p>Solo consulta por ahora.</p>
    <div class="label" style="margin:10px 2px 8px">Gasto</div>
    <div class="list catlist">${CATS.map(c=>`<div class="c"><div>${c.n}</div>${c.subs?`<div>${c.subs.join(' · ')}</div>`:''}</div>`).join('')}</div>
    <div class="label" style="margin:18px 2px 8px">Ingreso</div>
    <div class="list catlist">${INCATS.map(c=>`<div class="c"><div>${c.n}</div>${c.subs?`<div>${c.subs.join(' · ')}</div>`:''}</div>`).join('')}</div>
  </div>`;
};

/* ---------- Hoja de captura ---------- */
const EX = [
  {phrase:'almuerzo 18 mil con nequi', d:{type:'GASTO', amt:18000, cat:'Comida', sub:'Restaurantes', acc:'nequi', date:TODAY}, prov:{cat:1}},
  {phrase:'pagué la tarjeta 450 mil desde bancolombia', d:{type:'TRANSFERENCIA', amt:450000, from:'bancolombia', to:'visa', date:TODAY}, prov:{}},
  {phrase:'el 31 de agosto taxi 20', d:{type:'GASTO', amt:20000, cat:'Transporte', sub:'Taxi y apps', acc:'efectivo', date:'2026-08-31'}, prov:{amt:1, acc:1}},
  {phrase:'daniel me debe 50 mil', d:{type:'?', amt:50000, to:'daniel', date:TODAY}, prov:{}, ask:'persona'}
];
function openSheet(m, id){
  if(!S.sheet) navPush('sheet');
  if(m==='mic') S.sheet={state:'listening', phrase:''};
  else if(m==='kbd') S.sheet={state:'typing', phrase:''};
  else if(m==='pend') S.sheet={state:'card', phrase:S.pendiente.phrase, d:{type:'GASTO', amt:50000, cat:'Transporte', sub:'Gasolina', acc:S.habitual, date:TODAY}, prov:{acc:1}, fromPend:true};
  else if(m==='edit'){ const x=mov(id); S.sheet={state:'card', edit:id, phrase:x.phrase||'', d:{type:x.type, amt:x.amt, cat:catOf(x), sub:x.sub, acc:x.acc, from:x.from, to:x.to, date:x.d}, prov:{}}; }
  else if(m==='move'){ const a=acc(id); S.sheet={state:'card', phrase:'pasar el saldo de '+a.name.toLowerCase(), d:{type:'TRANSFERENCIA', amt:Math.abs(bal(a)), from:a.id, to:a.id==='bancolombia'?'nequi':'bancolombia', date:TODAY}, prov:{acc:1}}; }
  renderSheet();
}
function useExample(i){ const e=EX[i]; S.sheet={state:e.ask?'question':'card', phrase:e.phrase, d:Object.assign({},e.d), prov:Object.assign({},e.prov), ask:e.ask}; renderSheet(); }

function conseq(d){
  const L=[];
  const line=(ic,t)=>L.push(`<div class="l">${I(ic)}<span>${t}</span></div>`);
  const after=(id,dl)=>{ const a=acc(id); if(a.pending) return `<b>${a.name}</b> · saldo por confirmar`; const nb=bal(a)+dl; return a.cls==='deuda'?`<b>${a.name}</b>: quedarás debiendo ${fmt(nb)}`:a.cls==='persona'?`<b>${a.name}</b> ${words(a,nb).w.toLowerCase()} ${words(a,nb).v}`:`<b>${a.name}</b> queda en ${fmt(nb)}`; };
  if(d.type==='GASTO'){ line('info', d.cat?`Cuenta como gasto de ${d.cat}.`:'Cuenta como gasto, sin categoría por ahora.'); line('wallet', after(d.acc,-d.amt)); }
  else if(d.type==='INGRESO'){ line('info',`Cuenta como ingreso de ${d.cat}.`); line('wallet', after(d.acc,d.amt)); }
  else if(d.type==='REEMBOLSO'){ line('info',`Se resta del gasto de ${d.cat} del mes en que llega.`); line('wallet', after(d.acc,d.amt)); }
  else if(d.type==='TRANSFERENCIA'){ const t=acc(d.to); line('info', t.cls==='deuda'?'No cuenta como gasto. Es un pago de tu tarjeta.':t.cls==='persona'?'No cuenta como gasto. Es un préstamo.':t.cls==='ahorro'?'No cuenta como gasto. Es plata apartada.':'No cuenta como gasto. Solo cambia de cuenta.'); line('wallet', after(d.from,-d.amt)); line('wallet', after(d.to,d.amt)); }
  else if(d.type==='AJUSTE'){ line('info','No cuenta como gasto ni ingreso. Es una deuda que existía antes de usar la app.'); line('wallet', `<b>${acc(d.to).name}</b> te debe ${fmt(d.amt)} desde antes`); }
  if(!d.date.startsWith(TODAY.slice(0,7))) line('cal', `<b>Se registra en ${MESES[dparts(d.date).m-1]}</b>, el mes en que ocurrió.`);
  return `<div class="conseq">${L.join('')}</div>`;
}
function fieldBtn(k,label,value,prov,wide){ return `<button class="field ${wide?'wide':''}" type="button" data-a="pick" data-k="${k}"><div class="k">${label}${prov?'<span class="dot" title="Deducido"></span>':''}</div><div class="v">${value}</div></button>`; }
function dateText(s){ if(s===TODAY) return 'Hoy'; if(s==='2026-09-25') return 'Ayer'; return shortDate(s); }

function sheetBody(){
  const sh=S.sheet;
  const head = t => `<div class="grab"></div><div class="sheet-head"><span class="label">${t}</span><button class="iconbtn" type="button" data-a="close" aria-label="Cancelar">${I('x')}</button></div>`;
  const examples = `<div class="note" style="margin-top:14px">Frases de ejemplo (el intérprete todavía no está conectado):</div><div class="opts" style="margin-top:8px">${EX.map((e,i)=>`<button class="opt" type="button" data-a="ex" data-i="${i}">“${e.phrase}”</button>`).join('')}</div>`;
  if(sh.state==='listening') return head('Registrar')+`<div class="wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><div style="text-align:center;font-weight:700;font-size:18px">Escuchando…</div><div class="note" style="text-align:center">La voz no está activa en este prototipo.</div><div class="row-btns" style="justify-content:center"><button class="btn quiet" type="button" data-a="to-typing">${I('kbd')} Escribir en su lugar</button></div>${examples}`;
  if(sh.state==='typing') return head('Registrar')+`<textarea class="ta" id="phraseIn" placeholder="Ej: almuerzo 18 mil con nequi" aria-label="Frase">${esc(sh.phrase)}</textarea><div class="row-btns"><button class="btn primary" type="button" data-a="interpret" style="flex:1">Continuar</button></div>${examples}`;
  if(sh.state==='registered') return `<div class="grab"></div><div class="done"><div class="ok">${I('check')}</div><h3>Registrado</h3><div class="muted">${esc(sh.phrase)}</div><div class="timer"><i></i></div><div class="note">Prototipo: no se guarda nada.</div><div class="row-btns" style="justify-content:center"><button class="btn quiet" type="button" data-a="undo">${I('undo')} Deshacer</button></div></div>`;
  const d=sh.d, p=sh.prov||{};
  const kinds={GASTO:['g','GASTO'],INGRESO:['i','INGRESO'],REEMBOLSO:['i','REEMBOLSO'],TRANSFERENCIA:['t','TRANSFERENCIA'],AJUSTE:['a','AJUSTE DE APERTURA'],'?':['t','¿QUÉ PASÓ?']}[d.type];
  let fields='';
  if(d.type==='TRANSFERENCIA') fields = fieldBtn('from','Sale de',acc(d.from).name,p.acc)+fieldBtn('to','Entra a',acc(d.to).name,0)+fieldBtn('date','Fecha',dateText(d.date),0,1);
  else if(d.type==='AJUSTE') fields = fieldBtn('to','Persona',acc(d.to).name,0)+fieldBtn('date','Fecha','Antes de su primer movimiento',0);
  else if(d.type==='?') fields = fieldBtn('to','Persona',acc(d.to).name,0)+fieldBtn('date','Fecha',dateText(d.date),0);
  else fields = fieldBtn('cat','Categoría',d.cat?(d.cat+(d.sub?' · '+d.sub:'')):'<span class="badge unc">Sin clasificar</span>',p.cat,1)+fieldBtn('acc','Cuenta',acc(d.acc).name,p.acc)+fieldBtn('date','Fecha',dateText(d.date),0);
  let picker='';
  if(sh.picker){
    const k=sh.picker; let items=[];
    if(k==='cat') items=CATS.map(c=>[c.n,c.n]);
    if(k==='acc'||k==='from') items=active().filter(a=>a.cls==='disp'||a.sub==='tarjeta').map(a=>[a.id,a.name]);
    if(k==='to') items=active().filter(a=>a.id!==d.from).map(a=>[a.id,a.name]);
    if(k==='date') items=[[TODAY,'Hoy'],['2026-09-25','Ayer'],['2026-08-31','31 ago']];
    if(k==='amt') picker=`<div class="picker"><span class="label">Monto</span><div class="amount-input"><span>$</span><input id="amtIn" inputmode="numeric" value="${fmt(d.amt).slice(1)}" aria-label="Monto"></div><div class="row-btns"><button class="btn primary" type="button" data-a="amt-ok">Listo</button></div></div>`;
    else picker=`<div class="picker"><span class="label">${{cat:'Categoría',acc:'Cuenta',from:'Sale de',to:'Entra a',date:'Fecha'}[k]}</span><div class="opts">${items.map(([v,n])=>`<button class="opt ${(d[k==='from'?'from':k==='to'?'to':k==='date'?'date':k]===v)?'on':''}" type="button" data-a="choose" data-k="${k}" data-v="${v}">${n}</button>`).join('')}</div></div>`;
  }
  const q = sh.state==='question' ? `<div class="question"><p>¿Le prestaste ahora o ya te debía de antes?</p><div class="opts"><button class="opt" type="button" data-a="answer" data-v="ahora">Le presté ahora</button><button class="opt" type="button" data-a="answer" data-v="antes">Era de antes</button></div></div>` : '';
  const canReg = sh.state==='card';
  return head(sh.edit?'Editar movimiento':sh.fromPend?'Captura pendiente':'Revisa y registra')+`
    <button class="phrase" type="button" data-a="to-typing" style="width:100%;text-align:left">${I('mic')}<q>${esc(sh.phrase)}</q></button>
    <span class="kind ${kinds[0]}">${kinds[1]}</span>
    <button class="amt num" type="button" data-a="pick" data-k="amt">${fmt(d.amt)}${p.amt?' <span class="dot" title="“20” leído como 20.000"></span>':''}</button>
    <div class="fields">${fields}</div>
    ${p.amt?'<div class="note"><span class="dot"></span> Deducido: “20” se leyó como $20.000. Tócalo si no es así.</div>':(p.cat||p.acc)?'<div class="note"><span class="dot"></span> Deducido por la app. Tócalo para cambiarlo.</div>':''}
    ${picker}
    ${q}
    ${d.type!=='?'?conseq(d):''}
    <div class="sheet-actions"><button class="btn quiet" type="button" data-a="close">Cancelar</button><button class="btn primary" type="button" data-a="register" ${canReg?'':'disabled style="opacity:.45"'}>${sh.edit?'Guardar cambios':'Registrar'}</button></div>`;
}
let regTimer=null;
function renderSheet(){
  const layer=document.getElementById('layer');
  if(!S.sheet){ layer.innerHTML=''; return; }
  const existing = layer.querySelector('.sheet');
  if(existing){ existing.innerHTML=sheetBody(); return; }
  layer.innerHTML=`<div class="layer" role="dialog" aria-modal="true" aria-label="Hoja de captura"><div class="scrim" data-a="close"></div><div class="sheet" id="sheet">${sheetBody()}</div></div>`;
  bindSwipe();
}
function closeSheetNow(){ clearTimeout(regTimer); S.sheet=null; renderSheet(); }
// Si la hoja se abrió con una entrada en el historial, se cierra retrocediendo para que el botón Atrás del celular quede coherente.
function closeSheet(){ if(history.state&&history.state.fjb==='sheet'){ clearTimeout(regTimer); history.back(); } else closeSheetNow(); }
function bindSwipe(){
  const sh=document.getElementById('sheet'); if(!sh) return;
  let y0=null;
  sh.addEventListener('touchstart',e=>{ if(sh.scrollTop<=0) y0=e.touches[0].clientY; },{passive:true});
  sh.addEventListener('touchmove',e=>{ if(y0==null) return; const dy=e.touches[0].clientY-y0; if(dy>0) sh.style.transform=`translateY(${dy}px)`; },{passive:true});
  sh.addEventListener('touchend',e=>{ if(y0==null) return; const dy=e.changedTouches[0].clientY-y0; y0=null; if(dy>110) closeSheet(); else sh.style.transform=''; });
}

/* ---------- Render principal ---------- */
function cur(){ return S.stack[S.stack.length-1]; }
function render(keepScroll){
  const c=cur();
  const host=document.getElementById('host');
  const prev=host.querySelector('.screen');
  const top = keepScroll&&prev?prev.scrollTop:0;
  const isTab=TABS.includes(c.s);
  const full = c.s==='widget';
  host.innerHTML = full ? screens.widget() : `<div class="screen ${isTab?'':'no-tabs'}">${screens[c.s](c)}</div>`;
  const sc=host.querySelector('.screen'); if(sc) sc.scrollTop=top;
  const tb=document.getElementById('tabbar'), fab=document.getElementById('fab');
  tb.hidden=!isTab; fab.hidden=!isTab;
  if(isTab){
    tb.innerHTML=[['inicio','Inicio','home'],['movimientos','Movimientos','list'],['cuentas','Cuentas','wallet']].map(([s,n,ic])=>`<button class="tab ${c.s===s?'on':''}" type="button" data-a="tab" data-s="${s}" ${c.s===s?'aria-current="page"':''}>${I(ic)}${n}</button>`).join('');
    fab.innerHTML=I('plus')+'Registrar';
  }
}
/* Navegación con historial: el botón Atrás del celular vuelve a la pantalla anterior o cierra la hoja. */
function navPush(kind){ try{ history.pushState({fjb:kind}, ''); }catch(e){} }
function popScreen(){ S.ui={}; if(S.stack.length>1) S.stack.pop(); else S.stack=[{s:'inicio'}]; render(); }
function go(s,params){ S.ui={}; S.stack.push(Object.assign({s},params||{})); navPush('screen'); render(); }
function back(){ if(history.state&&history.state.fjb==='screen'&&S.stack.length>1) history.back(); else popScreen(); }
window.addEventListener('popstate', ()=>{
  const layer=document.getElementById('layer');
  if(S.sheet){ closeSheetNow(); return; }
  if(layer.querySelector('.mapbox')){ layer.innerHTML=''; return; }
  if(S.stack.length>1) popScreen();
});
function tab(s){ S.ui={}; S.stack=[{s}]; render(); }
function toast(t){ const h=document.getElementById('toastHost'); h.innerHTML=`<div class="toast" role="status">${esc(t)}</div>`; clearTimeout(toast._t); toast._t=setTimeout(()=>h.innerHTML='',2200); }
const num = v => Number(String(v||'').replace(/[^\d]/g,''))||0;

/* ---------- Mapa de pantallas (solo prototipo) ---------- */
const MAP=[['widget','Widget / entrada de registro'],['__sheet','Hoja de captura'],['primeruso','Primer uso “¿Cuánto tienes hoy?”'],['inicio','Inicio'],['movimientos','Movimientos'],['movdetalle','Detalle de movimiento'],['resumen','Resumen del mes'],['cuentas','Cuentas'],['cuentadetalle','Detalle de cuenta'],['cuentaform','Nueva / editar cuenta'],['menu','Menú']];
function openMap(){
  const layer=document.getElementById('layer');
  layer.innerHTML=`<div class="mapbox" data-a="map-close"><div class="sheet"><div class="grab"></div><div class="sheet-head"><span class="label">Las 11 pantallas del Bloque 1</span><button class="iconbtn" type="button" data-a="map-close" aria-label="Cerrar">${I('x')}</button></div><ol>${MAP.map(([s,n],i)=>`<li><button type="button" data-a="map-go" data-s="${s}"><span>${i+1}</span>${n}</button></li>`).join('')}</ol><div class="note">Atajo solo del prototipo para revisar cada pantalla. En la app se llega por la navegación normal.</div></div></div>`;
}
function mapGo(s){
  document.getElementById('layer').innerHTML=''; S.sheet=null; S.ui={};
  if(s==='__sheet'){ S.stack=[{s:'inicio'}]; render(); useExample(0); return; }
  if(s==='widget'||s==='primeruso'){ S.stack=[{s}]; if(s==='primeruso') S.pu.step=1; render(); return; }
  if(TABS.includes(s)){ tab(s); return; }
  const base = {movdetalle:['movimientos',{id:'m13'}], resumen:['inicio',{}], cuentadetalle:['cuentas',{id:'nequi'}], cuentaform:['cuentas',{}], menu:['inicio',{}]}[s];
  S.stack=[{s:base[0]}];
  if(s==='cuentaform') S.form={name:'', cls:'disp', sub:'', unk:false};
  go(s, base[1]);
}

/* ---------- Eventos ---------- */
document.addEventListener('click', e=>{
  const el=e.target.closest('[data-a]'); if(!el) return;
  const a=el.dataset.a, id=el.dataset.id, s=el.dataset.s, v=el.dataset.v, k=el.dataset.k;
  switch(a){
    case 'go': go(s,{id}); break;
    case 'back': back(); break;
    case 'tab': if(s==='movimientos') S.filter={acc:'', cat:''}; tab(s); break;
    case 'map': openMap(); break;
    case 'map-close': if(e.target===el||el.tagName==='BUTTON') document.getElementById('layer').innerHTML=''; break;
    case 'map-go': mapGo(s); break;
    case 'toast': toast(el.dataset.t); break;
    case 'ui': S.ui[k]=!S.ui[k]; render(true); break;
    case 'toast-ui': S.ui[k]=false; render(true); toast(el.dataset.t); break;
    case 'month': { const [y,m]=S.month.split('-').map(Number); const nm=m+Number(el.dataset.d); S.month=`${y}-${String(nm).padStart(2,'0')}`; render(); break; }
    case 'f-clear-cat': S.filter.cat=''; render(true); break;
    case 'cat-filter': tab('movimientos'); S.filter={acc:'', cat:v}; render(); break;
    case 'ask-save': { const n=num(document.getElementById('askAmt').value); const q=acc('nequi'); q.ap=n; q.pending=false; render(true); toast('Nequi confirmada. Las cifras ya no son provisionales.'); break; }
    case 'ask-later': S.askLater=true; render(true); break;
    case 'pend-discard': S.pendiente.open=false; render(true); toast('Captura descartada'); break;
    case 'classify': S.classified[id]=v; S.ui={}; render(true); toast('Clasificado en '+v); break;
    case 'del': S.deleted.add(id); { const m=mov(id); if(m.type==='AJUSTE'){ const ac=acc(m.acc); ac.pending=true; ac.ap=null; } } back(); toast('Movimiento eliminado'); break;
    case 'confirm-save': { const ac=acc(id); ac.ap=(ac.cls==='deuda'?-1:1)*num(document.getElementById('confAmt').value); ac.pending=false; S.ui={}; render(true); toast('Saldo inicial confirmado'); break; }
    case 'archive': acc(id).archived=true; S.stack=[{s:'cuentas'}]; S.ui={}; render(); toast('Cuenta archivada. Está en el Menú.'); break;
    case 'reactivate': acc(id).archived=false; S.ui={}; render(true); toast('Cuenta reactivada'); break;
    case 'habitual': S.habitual=id; render(true); break;
    case 'newacc': S.form={name:'', cls:'disp', sub:'', unk:false}; go('cuentaform'); break;
    case 'acc-edit': { const ac=acc(id); S.form={id, name:ac.name, cls:ac.cls, sub:ac.sub}; go('cuentaform'); break; }
    case 'f-cls': S.form.cls=v; S.form.clsTouched=true; if(v==='deuda'&&!S.form.sub) S.form.sub='tarjeta'; render(true); break;
    case 'f-sub': S.form.sub=v; render(true); break;
    case 'f-ah': S.form.ah=v; S.form.cls = v==='apartada'?'ahorro':'disp'; render(true); break;
    case 'f-per': S.form.per=v; render(true); break;
    case 'f-save': { const f=S.form; const nm=(document.getElementById('fName').value||'').trim(); if(!nm){ toast('Escribe un nombre'); break; }
      if(f.id){ acc(f.id).name=nm; back(); toast('Nombre actualizado'); break; }
      const nid='n'+Date.now(); const amt=document.getElementById('fAmt'); let ap=amt?num(amt.value):0;
      if(f.cls==='deuda') ap=-ap; if(f.cls==='persona'&&f.per==='ledebo') ap=-ap;
      A.push({id:nid, name:nm, cls:f.cls, sub:f.cls==='deuda'?(f.sub||'tarjeta'):undefined, ap:f.unk?null:ap, pending:!!f.unk});
      S.stack.pop(); go('cuentadetalle',{id:nid}); toast('Cuenta creada (prototipo)'); break; }
    case 'pu-sel': S.pu.sel[id]=!S.pu.sel[id]; render(true); break;
    case 'pu-hab': S.pu.hab=id; render(true); break;
    case 'pu-next': if(S.pu.step===2){ Object.keys(S.pu.sel).forEach(i=>{const inp=document.getElementById('pu-'+i); if(inp&&!inp.disabled) S.pu.amt[i]=inp.value;}); } S.pu.step=Math.min(4,S.pu.step+1); render(); break;
    case 'pu-back': S.pu.step=Math.max(1,S.pu.step-1); render(); break;
    case 'pu-skip': case 'pu-done': tab('inicio'); if(a==='pu-skip') toast('Empiezas solo con Efectivo'); break;
    case 'sheet': openSheet(el.dataset.m, id); break;
    case 'close': closeSheet(); break;
    case 'ex': useExample(Number(el.dataset.i)); break;
    case 'to-typing': if(S.sheet.state==='registered') break; S.sheet.state='typing'; renderSheet(); setTimeout(()=>{const t=document.getElementById('phraseIn'); if(t) t.focus();},50); break;
    case 'interpret': { const t=document.getElementById('phraseIn').value.trim(); const i=EX.findIndex(x=>x.phrase===t.toLowerCase()); if(i>=0) useExample(i); else { S.sheet.phrase=t; renderSheet(); toast('El intérprete llega en otra iteración. Elige una frase de ejemplo.'); } break; }
    case 'pick': if(S.sheet.state==='registered') break; S.sheet.picker = S.sheet.picker===k?null:k; renderSheet(); if(k==='amt') setTimeout(()=>{const i=document.getElementById('amtIn'); if(i) i.focus();},50); break;
    case 'choose': { const d=S.sheet.d; if(k==='cat'){ d.cat=v; d.sub=(CATS.find(c=>c.n===v).subs||[])[0]; } else d[k]=v; if(S.sheet.prov) S.sheet.prov[k==='from'?'acc':k]=0; S.sheet.picker=null; renderSheet(); break; }
    case 'amt-ok': S.sheet.d.amt=num(document.getElementById('amtIn').value); S.sheet.prov.amt=0; S.sheet.picker=null; renderSheet(); break;
    case 'answer': { const d=S.sheet.d; if(v==='ahora'){ d.type='TRANSFERENCIA'; d.from=S.habitual; S.sheet.prov={acc:1}; } else { d.type='AJUSTE'; } S.sheet.state='card'; S.sheet.ask=null; renderSheet(); break; }
    case 'register': if(S.sheet.state!=='card') break;
      if(S.sheet.edit){ closeSheet(); toast('Cambios guardados (prototipo)'); break; }
      if(S.sheet.fromPend) S.pendiente.open=false;
      S.sheet.prev=JSON.parse(JSON.stringify({d:S.sheet.d,prov:S.sheet.prov,phrase:S.sheet.phrase}));
      S.sheet.state='registered'; S.sheet.picker=null; renderSheet(); clearTimeout(regTimer); regTimer=setTimeout(()=>{ closeSheet(); render(true); },3000); break;
    case 'undo': clearTimeout(regTimer); Object.assign(S.sheet,S.sheet.prev,{state:'card'}); if(S.sheet.fromPend) S.pendiente.open=true; renderSheet(); break;
  }
});
document.addEventListener('change', e=>{
  const el=e.target.closest('[data-c]'); if(!el) return;
  const c=el.dataset.c;
  if(c==='f-acc'){ S.filter.acc=el.value; render(true); }
  if(c==='f-cat'){ S.filter.cat=el.value; render(true); }
  if(c==='pu-unk'){ const i=el.dataset.id; const inp=document.getElementById('pu-'+i); if(inp&&!el.checked===false) S.pu.amt[i]=inp.value; S.pu.unk[i]=el.checked; render(true); }
  if(c==='f-unk'){ S.form.unk=el.checked; S.form.name=document.getElementById('fName').value; render(true); }
});
document.addEventListener('input', e=>{
  const el=e.target;
  if(el.dataset && el.dataset.c==='f-name' && S.form && !S.form.id){
    S.form.name=el.value;
    if(!S.form.clsTouched){ const d=deduce(el.value); const changed = d.cls!==S.form.cls || (d.sub||'')!==(S.form.sub||'') || !!d.askAhorro!==!!S.form.askAh; if(changed){ S.form.cls = S.form.ah==='apartada'&&d.askAhorro?'ahorro':d.cls; S.form.sub=d.sub||''; S.form.askAh=!!d.askAhorro; const pos=el.selectionStart; render(true); const n=document.getElementById('fName'); n.focus(); n.setSelectionRange(pos,pos); } }
  }
});
document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ if(S.sheet) closeSheet(); else document.getElementById('layer').innerHTML=''; } });

/* Arranque: #inicio, #widget, #primeruso, #movimientos, #cuentas, #resumen, #menu */
const h=(location.hash||'').slice(1);
if(h==='widget'||h==='primeruso') S.stack=[{s:h}];
else if(TABS.includes(h)) S.stack=[{s:h}];
else if(h==='resumen'||h==='menu') S.stack=[{s:'inicio'},{s:h}];
render();
})();
