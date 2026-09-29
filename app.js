/* ============================================================
   Profe Carli · App (vistas de la profe y del alumno)
   ============================================================ */
(function () {
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = n => (Math.round(n * 10) / 10).toString().replace('.', ',');
  const inicial = n => n.trim().charAt(0).toUpperCase();
  const DEMO_ALUMNO = 'a1';
  const SEM_TXT = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];

  const state = {
    rol: null,           // 'profe' | 'alumno'
    vista: 'inicio',     // alumno: inicio | plan | progreso · profe: alumnos | ficha
    alumnoId: DEMO_ALUMNO,
    fichaId: null,       // alumno abierto por la profe
    fichaTab: 'registro',
    semPlan: null,
    filtro: 'Todos',
    entreno: null,       // { s, d, ej: {i:{hecho,kg}} } mientras entrena
    abiertos: {},
    ejGraf: null,
  };

  function cuando(fecha) {
    if (!fecha) return 'Nunca';
    const d = DB.diasDesde(fecha);
    if (d <= 0) return 'Hoy';
    if (d === 1) return 'Ayer';
    return `Hace ${d} días`;
  }
  function estado(id) {
    const f = DB.ultimoEntreno(id);
    if (!f) return 'nuevo';
    const d = DB.diasDesde(f);
    return d <= 2 ? 'ok' : d <= 4 ? 'alerta' : 'mal';
  }
  const grupos = dia => [...new Set(dia.ejercicios.map(e => e.grupo))].join(' · ');

  function prescHTML(txt) {
    const sr = DB.seriesDe(txt), kg = DB.kgDe(txt);
    if (!sr) return `<div class="p"><b>${esc(txt)}</b></div>`;
    const combinada = /\+/.test(txt);
    if (combinada) return `<div class="p"><b>${esc(txt)}</b></div>`;
    let h = `<div class="p"><b>${esc(sr.series)}</b> series</div><div class="p"><b>${esc(sr.reps.replace("'", ' min'))}</b>${/'/.test(sr.reps) ? '' : ' reps'}</div>`;
    if (kg != null) h += `<div class="p"><b>${num(kg)}</b> kg</div>`;
    if (/P\/L/i.test(txt)) h += `<div class="p"><b>P/L</b></div>`;
    return h;
  }

  /* ============================================================ RENDER ============================================================ */
  function render() {
    const root = $('#root');
    const bar = `<div class="demo-bar">Demo con datos de ejemplo <button data-a="reiniciar">Reiniciar</button></div>`;
    if (!state.rol) { root.innerHTML = bar + vistaEntrada(); return; }
    if (state.entreno) { root.innerHTML = bar + vistaEntrenando(); return; }
    root.innerHTML = bar + (state.rol === 'alumno' ? vistaAlumno() : vistaProfe());
  }

  /* ---------- Entrada ---------- */
  function vistaEntrada() {
    return `<div class="wrap entrada">
      <img class="logo" src="img/logo.png" alt="Profe Carli" />
      <h1>Tu entrenamiento,<br>en tu celu</h1>
      <p class="bajada">Tu plan de cada semana, lo que hiciste y cómo venís mejorando.</p>
      <button class="rol profe" data-a="rol" data-v="profe"><span class="ico">📋</span><div><b>Soy la profe</b><span>Mis alumnos y sus planes</span></div><span class="flecha">›</span></button>
      <button class="rol alumno" data-a="rol" data-v="alumno"><span class="ico">💪</span><div><b>Soy alumno</b><span>Entrar como Lucas (ejemplo)</span></div><span class="flecha">›</span></button>
    </div>`;
  }

  function top(titulo, sub, volver) {
    return `<header class="top"><div class="wrap">
      ${volver ? `<button class="volver" data-a="${volver}" aria-label="Volver">‹</button>` : `<img src="img/logo.png" alt="Profe Carli" />`}
      <div class="quien"><b>${esc(titulo)}</b><span>${esc(sub)}</span></div>
      <button class="cambiar" data-a="salir">Cambiar</button>
    </div></header>`;
  }

  /* ============================================================ ALUMNO ============================================================ */
  function vistaAlumno() {
    const a = DB.getAlumno(state.alumnoId);
    const nav = `<nav class="nav"><div class="wrap">
      ${[['inicio', '🏠', 'Hoy'], ['plan', '📋', 'Mi plan'], ['progreso', '📈', 'Progreso']].map(([v, i, t]) =>
        `<button class="${state.vista === v ? 'on' : ''}" data-a="vista" data-v="${v}"><span class="i">${i}</span>${t}</button>`).join('')}
    </div></nav>`;
    let cuerpo = '';
    if (state.vista === 'inicio') cuerpo = alumnoInicio(a);
    if (state.vista === 'plan') cuerpo = bloquePlan(a, false);
    if (state.vista === 'progreso') cuerpo = `<h2 class="titulo">Tu progreso</h2><p class="sub">Todo lo que fuiste anotando.</p>` + bloqueProgreso(a);
    return top(a.nombre.split(' ')[0], `Alumno · ${a.modalidad}`) + `<main class="wrap con-nav">${cuerpo}</main>` + nav;
  }

  function alumnoInicio(a) {
    const s = DB.semanaActual(a);
    const prox = DB.proximo(a);
    const hechos = DB.entrenosSemana(a, s);
    const c = DB.cumplimiento(a);
    const nombre = a.nombre.split(' ')[0];
    let toca;
    if (prox) {
      const dia = a.plan[prox.d];
      toca = `<div class="toca">
        <div class="et">${SEM_TXT[prox.s]} · Te toca</div>
        <h3>${esc(dia.nombre)}</h3>
        <div class="grupos">${esc(grupos(dia))} · ${dia.ejercicios.length} ejercicios</div>
        <button class="btn celeste bloque" data-a="empezar" data-s="${prox.s}" data-d="${prox.d}">Empezar entrenamiento</button>
      </div>`;
    } else {
      toca = `<div class="toca"><div class="et">Plan terminado</div><h3>¡Completaste las 4 semanas!</h3><div class="grupos">La profe te va a cargar el plan nuevo.</div></div>`;
    }
    return `<h2 class="titulo">¡Hola, ${esc(nombre)}!</h2>
      <p class="sub">Arrancaste el plan el ${fechaLinda(a.inicio)}.</p>
      ${toca}
      <div class="card">
        <div class="fila-num"><h3 style="margin:0">Esta semana</h3><span class="muted">${SEM_TXT[s]} de 4</span></div>
        <div class="semana-dias">${a.plan.map((dia, d) => `<button class="d ${hechos[d] ? 'ok' : ''} ${prox && prox.s === s && prox.d === d ? 'next' : ''}" data-a="empezar" data-s="${s}" data-d="${d}"><b>${hechos[d] ? '✓' : d + 1}</b>Día ${d + 1}</button>`).join('')}</div>
      </div>
      <div class="card">
        <div class="fila-num"><h3 style="margin:0">Tu plan</h3><span><b>${c.hechos}</b> <span class="muted">de ${c.total} entrenamientos</span></span></div>
        <div class="barra"><i style="width:${Math.round(c.hechos / c.total * 100)}%"></i></div>
      </div>`;
  }

  function fechaLinda(f) {
    const d = new Date(f + 'T00:00:00');
    return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
  }

  /* ---------- Entrenando ---------- */
  function empezar(s, d) {
    const a = DB.getAlumno(state.alumnoId);
    const previo = DB.registro(a.id, s, d);
    const ej = {};
    a.plan[d].ejercicios.forEach((e, i) => {
      const p = previo && previo.ej[i];
      ej[i] = { hecho: p ? p.hecho : false, kg: p && p.kg != null ? p.kg : DB.kgDe(e.semanas[s]) };
    });
    state.entreno = { s, d, ej, previo: !!previo };
    render(); scrollTo(0, 0);
  }

  function vistaEntrenando() {
    const a = DB.getAlumno(state.alumnoId);
    const { s, d, ej } = state.entreno;
    const dia = a.plan[d];
    const hechos = Object.values(ej).filter(x => x.hecho).length;
    const lista = dia.ejercicios.map((e, i) => {
      const x = ej[i]; const kgPlan = DB.kgDe(e.semanas[s]);
      const delta = kgPlan != null && x.kg != null ? x.kg - kgPlan : 0;
      return `<div class="ej ${x.hecho ? 'hecho' : ''}">
        <div class="cab">
          <div class="num">${i + 1}</div>
          <div class="nom"><small>${esc(e.grupo)}</small><b>${esc(e.nombre)}</b></div>
          <button class="check" data-a="hecho" data-i="${i}" aria-label="Marcar hecho">✓</button>
        </div>
        <div class="presc">${prescHTML(e.semanas[s])}${e.rir && e.rir !== '-' ? `<div class="p">RIR <b>${esc(e.rir)}</b></div>` : ''}</div>
        <div class="acciones">
          ${kgPlan != null ? `<div class="kg"><button data-a="kg" data-i="${i}" data-v="-2.5">−</button><input inputmode="decimal" data-kg="${i}" value="${x.kg != null ? num(x.kg) : ''}" /><span>kg</span><button data-a="kg" data-i="${i}" data-v="2.5">+</button></div>${delta ? `<span class="delta ${delta > 0 ? 'up' : 'down'}">${delta > 0 ? '▲' : '▼'} ${num(Math.abs(delta))}</span>` : ''}` : ''}
          <button class="descanso" data-a="descanso" data-t="${esc(e.descanso)}">⏱ Descanso ${esc(e.descanso)}</button>
        </div>
        ${e.nota ? `<div class="nota-profe"><b>La profe:</b> ${esc(e.nota)}</div>` : ''}
      </div>`;
    }).join('');
    return top(dia.nombre, `${SEM_TXT[s]} · ${hechos} de ${dia.ejercicios.length} hechos`, 'cancelar') +
      `<main class="wrap" style="padding-top:14px;padding-bottom:120px">
        <p class="sub" style="margin-top:4px">Marcá cada ejercicio cuando lo termines y anotá con cuánto peso lo hiciste.</p>
        ${lista}
      </main>
      <div class="pie-fijo"><div class="wrap"><button class="btn marron bloque" data-a="terminar">${state.entreno.previo ? 'Guardar cambios' : 'Terminar entrenamiento'} (${hechos}/${dia.ejercicios.length})</button></div></div>`;
  }

  /* ---------- Timer de descanso ---------- */
  let timerInt = null;
  function iniciarTimer(txt) {
    let seg = 60;
    const m = String(txt).match(/(\d+)\s*'/); if (m) seg = parseInt(m[1], 10) * 60;
    const s2 = String(txt).match(/(\d+)\s*"/); if (s2) seg = parseInt(s2[1], 10);
    clearInterval(timerInt);
    const el = $('#timer'); el.classList.remove('hidden', 'fin');
    const fin = Date.now() + seg * 1000;
    const pintar = () => {
      const r = Math.max(0, Math.round((fin - Date.now()) / 1000));
      el.innerHTML = `<div class="t">${Math.floor(r / 60)}:${String(r % 60).padStart(2, '0')}</div><div class="l">${r ? 'Descansando…' : '¡A la próxima serie!'}</div><button data-a="cerrar-timer">${r ? 'Saltar' : 'Listo'}</button>`;
      if (!r) { el.classList.add('fin'); clearInterval(timerInt); if (navigator.vibrate) navigator.vibrate([200, 100, 200]); }
    };
    pintar(); timerInt = setInterval(pintar, 250);
  }
  function cerrarTimer() { clearInterval(timerInt); $('#timer').classList.add('hidden'); }

  function terminar() {
    const { s, d, ej } = state.entreno;
    const a = DB.getAlumno(state.alumnoId);
    const hechos = Object.values(ej).filter(x => x.hecho).length;
    if (!hechos) { toast('Marcá al menos un ejercicio'); return; }
    DB.guardarRegistro(a.id, s, d, ej);
    cerrarTimer();
    state.entreno = null; state.vista = 'inicio';
    abrirModal(`<div class="festejo"><div class="big">💪</div><h2>¡Bien ahí!</h2>
      <p class="muted">${esc(a.plan[d].nombre)} · ${SEM_TXT[s]}<br>${hechos} de ${a.plan[d].ejercicios.length} ejercicios. La profe ya lo puede ver.</p></div>
      <button class="btn marron bloque" data-close>Listo</button>`);
    render();
  }

  /* ---------- Plan (lo usan alumno y profe) ---------- */
  function bloquePlan(a, editable) {
    const actual = DB.semanaActual(a);
    const s = state.semPlan == null ? actual : state.semPlan;
    return `${editable ? '' : `<h2 class="titulo">Mi plan</h2><p class="sub">${a.plan.length} días por semana · ${esc(a.objetivo || '')}</p>`}
      <div class="chips">${SEM_TXT.map((t, i) => `<button class="chip ${i === s ? 'on' : ''}" data-a="sem-plan" data-v="${i}">${t}${i === actual ? ' · actual' : ''}</button>`).join('')}</div>
      ${a.plan.map((dia, d) => {
        const hecho = DB.registro(a.id, s, d);
        return `<div class="dia-plan">
          <div class="dh"><b>${esc(dia.nombre)}</b><span>${hecho ? '✓ Hecho ' + cuando(hecho.fecha).toLowerCase() : esc(grupos(dia))}</span></div>
          <div class="rows">
            ${dia.ejercicios.map((e, i) => `<${editable ? `button class="fila editable" data-a="editar-ej" data-d="${d}" data-i="${i}"` : 'div class="fila"'}>
              <span class="n">${i + 1}</span>
              <span class="x"><small>${esc(e.grupo)}</small><b>${esc(e.nombre)}</b><span class="meta">${e.rir && e.rir !== '-' ? `RIR ${esc(e.rir)} · ` : ''}Descanso ${esc(e.descanso)}</span></span>
              <span class="v">${esc(e.semanas[s])}${editable ? '<small>Editar ›</small>' : ''}</span>
            </${editable ? 'button' : 'div'}>`).join('')}
            ${editable ? `<button class="agregar" data-a="nuevo-ej" data-d="${d}">+ Agregar ejercicio</button>` : ''}
          </div>
        </div>`;
      }).join('')}`;
  }

  /* ---------- Progreso (lo usan alumno y profe) ---------- */
  function bloqueProgreso(a) {
    const c = DB.cumplimiento(a);
    const actual = DB.semanaActual(a);
    const opciones = DB.ejerciciosConKg(a);
    if (!state.ejGraf || !opciones.includes(state.ejGraf)) state.ejGraf = opciones.find(n => DB.evolucion(a, n).length > 1) || opciones[0];
    const pts = DB.evolucion(a, state.ejGraf);
    return `<div class="card">
        <div class="fila-num"><h3 style="margin:0">Entrenamientos</h3><span><b>${c.hechos}</b> <span class="muted">de ${c.total}</span></span></div>
        <div class="barra" style="margin-bottom:16px"><i style="width:${Math.round(c.hechos / c.total * 100)}%"></i></div>
        <div class="grilla-sem">
          <span></span>${SEM_TXT.map((_, i) => `<span class="h">S${i + 1}</span>`).join('')}
          ${a.plan.map((dia, d) => `<span class="lbl">Día ${d + 1}</span>${[0, 1, 2, 3].map(s => `<span class="c ${DB.registro(a.id, s, d) ? 'ok' : ''} ${s === actual ? 'hoy' : ''}"></span>`).join('')}`).join('')}
        </div>
      </div>
      <div class="card grafico">
        <h3>Peso por ejercicio</h3>
        <select class="sel" data-a="ej-graf">${opciones.map(n => `<option ${n === state.ejGraf ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>
        ${grafico(pts)}
      </div>`;
  }

  function grafico(pts) {
    if (pts.length < 1) return `<p class="muted" style="text-align:center;padding:20px 0">Todavía no hay registros de este ejercicio.</p>`;
    const W = 320, H = 170, pl = 34, pr = 12, pt = 16, pb = 26;
    const vals = pts.map(p => p.kg);
    let min = Math.min(...vals), max = Math.max(...vals);
    if (max - min < 5) { min -= 2.5; max += 2.5; }
    const x = i => pts.length === 1 ? (pl + W - pr) / 2 : pl + i * (W - pl - pr) / (pts.length - 1);
    const y = v => pt + (max - v) / (max - min) * (H - pt - pb);
    const linea = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.kg).toFixed(1)}`).join(' ');
    const area = `${linea} L${x(pts.length - 1).toFixed(1)},${H - pb} L${x(0).toFixed(1)},${H - pb} Z`;
    const ticks = [min, (min + max) / 2, max];
    const primero = pts[0].kg, ultimo = pts[pts.length - 1].kg, dif = ultimo - primero;
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolución del peso">
        ${ticks.map(t => `<line x1="${pl}" x2="${W - pr}" y1="${y(t)}" y2="${y(t)}" stroke="#ebe4da" /><text x="${pl - 6}" y="${y(t) + 4}" font-size="11" text-anchor="end" fill="#8f7569">${num(t)}</text>`).join('')}
        <path d="${area}" fill="#b3cefa" opacity=".35" />
        <path d="${linea}" fill="none" stroke="#5a3425" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
        ${pts.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.kg)}" r="4" fill="#fff" stroke="#5a3425" stroke-width="2" />`).join('')}
        ${pts.map((p, i) => (i === 0 || i === pts.length - 1) ? `<text x="${x(i)}" y="${H - 8}" font-size="11" text-anchor="${i === 0 ? 'start' : 'end'}" fill="#8f7569">${cuando(p.fecha)}</text>` : '').join('')}
      </svg>
      <p style="margin:8px 0 0;font-size:14.5px">${dif > 0 ? `<b style="color:var(--ok)">▲ ${num(dif)} kg</b> desde el primer registro` : dif < 0 ? `<b style="color:var(--mal)">▼ ${num(-dif)} kg</b> desde el primer registro` : `Mismo peso que el primer registro (${num(ultimo)} kg)`}</p>`;
  }

  /* ============================================================ PROFE ============================================================ */
  function vistaProfe() {
    if (state.vista === 'ficha' && state.fichaId) return profeFicha();
    return top('Profe Carli', 'Panel de la profe') + `<main class="wrap con-nav">${profeAlumnos()}</main>` +
      `<nav class="nav"><div class="wrap"><button class="on"><span class="i">👥</span>Alumnos</button><button data-a="nuevo-alumno"><span class="i">＋</span>Nuevo alumno</button></div></nav>`;
  }

  function profeAlumnos() {
    const todos = DB.getAlumnos();
    const lista = todos.filter(a => state.filtro === 'Todos' || a.modalidad === state.filtro)
      .sort((x, y) => (DB.ultimoEntreno(y.id) || '').localeCompare(DB.ultimoEntreno(x.id) || ''));
    const recientes = todos.filter(a => estado(a.id) === 'ok').length;
    const colgados = todos.filter(a => estado(a.id) === 'mal');
    return `<h2 class="titulo">Tus alumnos</h2><p class="sub">Quién entrenó y cómo viene cada uno.</p>
      <div class="resumen">
        <div class="r"><b>${todos.length}</b><span>alumnos</span></div>
        <div class="r"><b>${recientes}</b><span>entrenaron en 2 días</span></div>
        <div class="r"><b>${todos.filter(a => a.modalidad === 'Virtual').length}</b><span>virtuales</span></div>
      </div>
      ${colgados.map(a => `<button class="aviso" data-a="ficha" data-id="${a.id}" style="width:100%;text-align:left"><span>⚠️</span><span><b>${esc(a.nombre)}</b> no entrena hace ${DB.diasDesde(DB.ultimoEntreno(a.id))} días. ¿Le escribís?</span></button>`).join('')}
      <div class="chips">${['Todos', 'Virtual', 'Presencial'].map(f => `<button class="chip ${state.filtro === f ? 'on' : ''}" data-a="filtro" data-v="${f}">${f}</button>`).join('')}</div>
      ${lista.map(a => {
        const ult = DB.ultimoEntreno(a.id), e = estado(a.id), c = DB.cumplimiento(a);
        return `<button class="alumno" data-a="ficha" data-id="${a.id}">
          <span class="avatar">${inicial(a.nombre)}<i class="punto ${e}"></i></span>
          <span class="info"><b>${esc(a.nombre)}</b><span class="l2"><span class="tag ${a.modalidad.toLowerCase()}">${a.modalidad}</span>${SEM_TXT[DB.semanaActual(a)]} · ${c.hechos}/${c.total}</span></span>
          <span class="ult ${e === 'mal' ? 'mal' : e === 'ok' ? 'ok' : ''}"><b>${cuando(ult)}</b>último</span>
        </button>`;
      }).join('')}`;
  }

  function profeFicha() {
    const a = DB.getAlumno(state.fichaId);
    const tabs = [['registro', 'Qué hizo'], ['plan', 'Plan'], ['progreso', 'Progreso']];
    let cuerpo = '';
    if (state.fichaTab === 'registro') cuerpo = fichaRegistro(a);
    if (state.fichaTab === 'plan') cuerpo = `<p class="sub">Tocá un ejercicio para cambiarlo. El alumno lo ve al instante.</p>` + bloquePlan(a, true);
    if (state.fichaTab === 'progreso') cuerpo = bloqueProgreso(a);
    return top(a.nombre, `${a.modalidad} · ${SEM_TXT[DB.semanaActual(a)]}`, 'volver-lista') + `<main class="wrap" style="padding-bottom:40px">
      <div class="ficha"><span class="avatar">${inicial(a.nombre)}<i class="punto ${estado(a.id)}"></i></span>
        <div><h2>${esc(a.nombre)}</h2><div class="l2"><span class="tag ${a.modalidad.toLowerCase()}">${a.modalidad}</span>${esc(a.objetivo || '')} · ${a.plan.length} días</div></div></div>
      <div class="chips">${tabs.map(([v, t]) => `<button class="chip ${state.fichaTab === v ? 'on' : ''}" data-a="ficha-tab" data-v="${v}">${t}</button>`).join('')}</div>
      ${cuerpo}
    </main>`;
  }

  function fichaRegistro(a) {
    const regs = Object.entries(DB.registrosDe(a.id)).map(([k, r]) => { const [s, d] = k.split('-').map(Number); return { s, d, r }; })
      .sort((x, y) => y.r.fecha.localeCompare(x.r.fecha) || (y.s * 10 + y.d) - (x.s * 10 + x.d));
    if (!regs.length) return `<div class="card muted" style="text-align:center">Todavía no registró entrenamientos.</div>`;
    return regs.map(({ s, d, r }) => {
      const dia = a.plan[d]; const k = `${a.id}-${s}-${d}`;
      const hechos = Object.values(r.ej).filter(x => x.hecho).length;
      const abierto = state.abiertos[k];
      return `<div class="registro">
        <button data-a="abrir" data-k="${k}"><span class="ico">✓</span><span class="t"><b>${esc(dia.nombre)} · ${SEM_TXT[s]}</b><span>${cuando(r.fecha)} · ${hechos} de ${dia.ejercicios.length} ejercicios</span></span><span class="muted">${abierto ? '▲' : '▼'}</span></button>
        ${abierto ? `<div class="det">${dia.ejercicios.map((e, i) => {
          const x = r.ej[i] || {}; const kp = DB.kgDe(e.semanas[s]);
          const dif = x.kg != null && kp != null ? x.kg - kp : 0;
          return `<div class="l"><span>${x.hecho ? '✓' : '✗'} ${esc(e.nombre)}</span><b>${!x.hecho ? '<span class="muted">No lo hizo</span>' : x.kg != null ? num(x.kg) + ' kg' : 'Hecho'}${x.hecho && dif ? `<span class="delta ${dif > 0 ? 'up' : 'down'}">${dif > 0 ? '▲' : '▼'}${num(Math.abs(dif))}</span>` : ''}</b></div>`;
        }).join('')}</div>` : ''}
      </div>`;
    }).join('');
  }

  /* ---------- Editar ejercicio ---------- */
  function formEjercicio(d, i) {
    const a = DB.getAlumno(state.fichaId);
    const e = i != null ? a.plan[d].ejercicios[i] : { grupo: '', nombre: '', semanas: ['', '', '', ''], rir: '-', descanso: "1'", nota: '' };
    abrirModal(`<h3>${i != null ? 'Editar ejercicio' : 'Nuevo ejercicio'} <button data-close>×</button></h3>
      <p class="muted" style="margin:-8px 0 14px">${esc(a.plan[d].nombre)} · ${esc(a.nombre)}</p>
      <div class="dos">
        <label class="campo"><span>Grupo muscular</span><input id="f-grupo" value="${esc(e.grupo)}" placeholder="Ej: Espalda" /></label>
        <label class="campo"><span>Descanso</span><input id="f-desc" value="${esc(e.descanso)}" placeholder="2'" /></label>
      </div>
      <label class="campo"><span>Ejercicio</span><input id="f-nombre" value="${esc(e.nombre)}" placeholder="Ej: Remo T" /></label>
      <span class="campo" style="margin-bottom:5px"><span>Series, repeticiones y peso por semana</span></span>
      <div class="cuatro">${[0, 1, 2, 3].map(s => `<label class="campo"><span>${SEM_TXT[s]}</span><input id="f-s${s}" value="${esc(e.semanas[s])}" placeholder="4x8 30kg" /></label>`).join('')}</div>
      <label class="campo"><span>RIR / RPE</span><input id="f-rir" value="${esc(e.rir)}" /></label>
      <label class="campo"><span>Indicación para el alumno (opcional)</span><textarea id="f-nota" rows="2" placeholder="Ej: bajá lento, 3 segundos">${esc(e.nota || '')}</textarea></label>
      <div class="linea-btns">
        ${i != null ? `<button class="btn peligro" data-a="quitar-ej" data-d="${d}" data-i="${i}">Quitar</button>` : ''}
        <button class="btn marron" data-a="guardar-ej" data-d="${d}" data-i="${i != null ? i : ''}">Guardar</button>
      </div>`);
  }

  function formNuevoAlumno() {
    const opts = DB.getAlumnos().map(a => `<option value="${a.id}">Copiar el plan de ${esc(a.nombre)}</option>`).join('');
    abrirModal(`<h3>Nuevo alumno <button data-close>×</button></h3>
      <label class="campo"><span>Nombre y apellido</span><input id="n-nombre" placeholder="Ej: Camila López" /></label>
      <div class="dos">
        <label class="campo"><span>Modalidad</span><select id="n-mod"><option>Presencial</option><option>Virtual</option></select></label>
        <label class="campo"><span>Objetivo</span><input id="n-obj" placeholder="Ej: Fuerza" /></label>
      </div>
      <label class="campo"><span>Plan para arrancar</span><select id="n-copia"><option value="">Plan base de 3 días</option>${opts}</select></label>
      <button class="btn marron bloque" data-a="crear-alumno">Crear alumno</button>`);
    setTimeout(() => { const n = $('#n-nombre'); if (n) n.focus(); }, 60);
  }

  /* ============================================================ MODAL + TOAST ============================================================ */
  function abrirModal(html) { $('#modal-card').innerHTML = html; $('#modal').classList.remove('hidden'); }
  function cerrarModal() { $('#modal').classList.add('hidden'); }
  let toastT;
  function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 2200); }

  /* ============================================================ EVENTOS ============================================================ */
  document.addEventListener('click', ev => {
    if (ev.target.id === 'modal' || ev.target.closest('[data-close]')) { cerrarModal(); return; }
    const b = ev.target.closest('[data-a]'); if (!b) return;
    const A = b.dataset.a, v = b.dataset.v;
    const n = k => b.dataset[k] === '' || b.dataset[k] == null ? null : Number(b.dataset[k]);
    switch (A) {
      case 'reiniciar': DB.reiniciar(); Object.assign(state, { rol: null, entreno: null, vista: 'inicio', fichaId: null, semPlan: null, abiertos: {} }); cerrarTimer(); cerrarModal(); render(); toast('Demo reiniciada'); break;
      case 'rol': state.rol = v; state.vista = v === 'profe' ? 'alumnos' : 'inicio'; state.semPlan = null; render(); scrollTo(0, 0); break;
      case 'salir': state.rol = null; state.entreno = null; state.fichaId = null; cerrarTimer(); render(); break;
      case 'vista': state.vista = v; state.semPlan = null; render(); scrollTo(0, 0); break;
      case 'empezar': empezar(n('s'), n('d')); break;
      case 'cancelar': state.entreno = null; cerrarTimer(); render(); break;
      case 'hecho': { const x = state.entreno.ej[n('i')]; x.hecho = !x.hecho; render(); break; }
      case 'kg': { const x = state.entreno.ej[n('i')]; x.kg = Math.max(0, (x.kg || 0) + parseFloat(v)); render(); break; }
      case 'descanso': iniciarTimer(b.dataset.t); break;
      case 'cerrar-timer': cerrarTimer(); break;
      case 'terminar': terminar(); break;
      case 'sem-plan': state.semPlan = Number(v); render(); break;
      case 'filtro': state.filtro = v; render(); break;
      case 'ficha': state.fichaId = b.dataset.id; state.vista = 'ficha'; state.fichaTab = 'registro'; state.semPlan = null; state.ejGraf = null; render(); scrollTo(0, 0); break;
      case 'volver-lista': state.vista = 'alumnos'; state.fichaId = null; render(); break;
      case 'ficha-tab': state.fichaTab = v; state.semPlan = null; render(); break;
      case 'abrir': state.abiertos[b.dataset.k] = !state.abiertos[b.dataset.k]; render(); break;
      case 'editar-ej': formEjercicio(n('d'), n('i')); break;
      case 'nuevo-ej': formEjercicio(n('d'), null); break;
      case 'guardar-ej': {
        const nombre = $('#f-nombre').value.trim(); if (!nombre) { toast('Poné el nombre del ejercicio'); return; }
        DB.guardarEjercicio(state.fichaId, n('d'), n('i'), {
          grupo: $('#f-grupo').value.trim() || '—', nombre, descanso: $('#f-desc').value.trim() || "1'",
          semanas: [0, 1, 2, 3].map(s => $('#f-s' + s).value.trim() || '-'), rir: $('#f-rir').value.trim() || '-', nota: $('#f-nota').value.trim(),
        });
        cerrarModal(); render(); toast('Plan actualizado'); break;
      }
      case 'quitar-ej': DB.quitarEjercicio(state.fichaId, n('d'), n('i')); cerrarModal(); render(); toast('Ejercicio quitado'); break;
      case 'nuevo-alumno': formNuevoAlumno(); break;
      case 'crear-alumno': {
        const nombre = $('#n-nombre').value.trim(); if (!nombre) { toast('Poné el nombre'); return; }
        const a = DB.crearAlumno({ nombre, modalidad: $('#n-mod').value, objetivo: $('#n-obj').value.trim(), copiarDe: $('#n-copia').value });
        cerrarModal(); state.fichaId = a.id; state.vista = 'ficha'; state.fichaTab = 'plan'; render(); toast('Alumno creado'); break;
      }
    }
  });
  document.addEventListener('change', ev => {
    const t = ev.target;
    if (t.dataset.kg != null && state.entreno) {
      const val = parseFloat(t.value.replace(',', '.'));
      state.entreno.ej[t.dataset.kg].kg = isNaN(val) ? null : val; render();
    }
    if (t.dataset.a === 'ej-graf') { state.ejGraf = t.value; render(); }
  });

  render();
})();
