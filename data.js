/* ============================================================
   Profe Carli · Datos de la demo
   Todo vive en el navegador (localStorage). Los alumnos son de
   ejemplo; el plan A está copiado de la planilla real de Carli.
   ============================================================ */
(function () {
  const KEY = 'profecarli_demo_v1';

  /* ---------- Fechas ---------- */
  const DIA_MS = 86400000;
  function hoy() { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function iso(d) { const z = new Date(d); z.setMinutes(z.getMinutes() - z.getTimezoneOffset()); return z.toISOString().slice(0, 10); }
  function haceDias(n) { return iso(new Date(hoy().getTime() - n * DIA_MS)); }
  function diasDesde(fechaIso) { return Math.round((hoy() - new Date(fechaIso + 'T00:00:00')) / DIA_MS); }

  /* ---------- Plan A: la planilla de Carli (4 días x 4 semanas) ---------- */
  const r4 = x => [x, x, x, x];
  const PLAN_A = [
    { nombre: 'Primer día', ejercicios: [
      { grupo: 'Core', nombre: 'Plancha c/retracción', semanas: r4("3x1'"), rir: '-', descanso: "1'", nota: 'Retraé las escápulas y no dejes caer la cadera.' },
      { grupo: 'Core', nombre: 'Pallof polea', semanas: r4('3x10 P/L'), rir: '-', descanso: "1'" },
      { grupo: 'Cuádriceps', nombre: 'Sentadilla libre', semanas: ['3x6-8 70kg', '4x6-8 70kg', '3x6-8 70kg', '5x6-8 70kg'], rir: '1 o 2', descanso: "2'" },
      { grupo: 'Cuádriceps', nombre: 'Búlgaras con despegue', semanas: r4('3x8 6kg'), rir: '-', descanso: "2'" },
      { grupo: 'Pecho', nombre: 'Press plano H', semanas: ['3x6 22.5kg', '4x6 22kg', '5x6 22.5kg', '2x6 22.5kg'], rir: '0', descanso: "2'" },
      { grupo: 'Pecho', nombre: 'Peck deck', semanas: r4('3x12/15 30kg'), rir: '-', descanso: "2'" },
      { grupo: 'Bíceps', nombre: 'Bayesian doble', semanas: r4('4x10 20kg'), rir: '-', descanso: "2'" },
      { grupo: 'Bíceps', nombre: 'Martillo', semanas: r4('3x15 10kg'), rir: '-', descanso: "2'" },
    ] },
    { nombre: 'Segundo día', ejercicios: [
      { grupo: 'Femorales', nombre: 'Peso muerto c/hexagonal', semanas: ['4x8 50kg', '3x8 50kg', '4x8 50kg', '5x8 50kg'], rir: '1', descanso: "2'" },
      { grupo: 'Femorales', nombre: 'Camilla isquios unipodal', semanas: r4('3x10 20kg'), rir: '-', descanso: "2'" },
      { grupo: 'Espalda', nombre: 'Remo T', semanas: r4('4x8 30kg'), rir: '1 o 2', descanso: "2'" },
      { grupo: 'Espalda', nombre: 'Dorsalera a/pr.', semanas: ['3x6 55kg', '4x6 55kg', '3x6 55kg', '5x6 55kg'], rir: '0', descanso: "2'" },
      { grupo: 'Hombros', nombre: 'Militar unilateral c/mancuerna', semanas: r4('3x10 15kg'), rir: '-', descanso: "2'" },
      { grupo: 'Hombros', nombre: 'Vuelos laterales E/P', semanas: r4('4x15 10kg'), rir: '-', descanso: "2'" },
      { grupo: 'Tríceps', nombre: 'Fondos', semanas: r4('3x8-10'), rir: '-', descanso: "2'" },
    ] },
    { nombre: 'Tercer día', ejercicios: [
      { grupo: 'Core', nombre: 'Scrunch c/disco', semanas: r4('3x10 10kg'), rir: '-', descanso: "1'" },
      { grupo: 'Core', nombre: 'Plancha lateral con rotación', semanas: r4("3x1'"), rir: '-', descanso: "1'" },
      { grupo: 'Cuádriceps', nombre: 'Sentadilla libre', semanas: ['4x6 70kg', '5x6 70kg', '5x6 70kg', '6x6 70kg'], rir: '0', descanso: "3'" },
      { grupo: 'Cuádriceps', nombre: 'Prensa unipodal', semanas: ['3x10 50kg', '4x10 50kg', '3x10 50kg', '4x10 50kg'], rir: '0', descanso: "3'" },
      { grupo: 'Pecho', nombre: 'Press plano H', semanas: ['4x6 22.5kg', '5x6 22.5kg', '5x6 22.5kg', '6x6 22.5kg'], rir: '0', descanso: "3'" },
      { grupo: 'Pecho', nombre: 'Inclinado con mancuernas', semanas: r4('3x10-12 15kg'), rir: '-', descanso: "3'" },
      { grupo: 'Bíceps', nombre: 'Martillo en polea', semanas: r4('3x10 55kg'), rir: '-', descanso: "2'" },
      { grupo: 'Bíceps', nombre: 'Curl concentrado', semanas: r4('3x15 10kg'), rir: '-', descanso: "2'" },
    ] },
    { nombre: 'Cuarto día', ejercicios: [
      { grupo: 'Glúteos', nombre: 'Hip thrust', semanas: ['4x10 90kg', '3x10 90kg', '4x10 90kg', '5x10 90kg'], rir: '0', descanso: "1'" },
      { grupo: 'Aductores', nombre: 'Sumo belt squat', semanas: ['2x8 80kg + 2x6 90kg', '3x8 85kg', '2x8 80kg + 2x6 90kg', '4x8 90kg'], rir: '0', descanso: "1'" },
      { grupo: 'Espalda', nombre: 'Dorsalera a/pr.', semanas: ['4x6 55kg', '4x6 55kg', '5x6 55kg', '5x6 55kg'], rir: '-', descanso: "1'" },
      { grupo: 'Espalda', nombre: 'Remo con mancuerna', semanas: r4('3x10-12 17.5kg'), rir: '-', descanso: "1'" },
      { grupo: 'Hombros', nombre: 'Posterior unilateral en PD', semanas: r4('3x12 20kg'), rir: '-', descanso: "1'" },
      { grupo: 'Hombros', nombre: 'Vuelos laterales C/P', semanas: r4('4x15 10kg'), rir: '-', descanso: "1'" },
      { grupo: 'Tríceps', nombre: 'Extensión unilateral', semanas: r4('4x10-12 20kg'), rir: '-', descanso: "1'" },
    ] },
  ];

  /* ---------- Plan B: 3 días, para alumnos que arrancan ---------- */
  const prog = (sr, kg, paso) => [0, 1, 2, 3].map(i => `${sr} ${+(kg + paso * i).toFixed(1)}kg`);
  const PLAN_B = [
    { nombre: 'Primer día', ejercicios: [
      { grupo: 'Core', nombre: 'Plancha c/retracción', semanas: ['3x30"', '3x40"', '3x45"', "3x1'"], rir: '-', descanso: "1'" },
      { grupo: 'Cuádriceps', nombre: 'Sentadilla libre', semanas: prog('3x10', 30, 2.5), rir: '2', descanso: "2'" },
      { grupo: 'Glúteos', nombre: 'Hip thrust', semanas: prog('3x12', 50, 5), rir: '2', descanso: "2'" },
      { grupo: 'Cuádriceps', nombre: 'Búlgaras con despegue', semanas: prog('3x10', 4, 1), rir: '-', descanso: "1'" },
      { grupo: 'Core', nombre: 'Pallof polea', semanas: r4('3x10 P/L'), rir: '-', descanso: "1'" },
    ] },
    { nombre: 'Segundo día', ejercicios: [
      { grupo: 'Espalda', nombre: 'Dorsalera a/pr.', semanas: prog('3x10', 30, 2.5), rir: '2', descanso: "2'" },
      { grupo: 'Espalda', nombre: 'Remo con mancuerna', semanas: prog('3x12', 8, 1), rir: '-', descanso: "1'" },
      { grupo: 'Pecho', nombre: 'Press plano H', semanas: prog('3x10', 10, 1.25), rir: '2', descanso: "2'" },
      { grupo: 'Hombros', nombre: 'Vuelos laterales E/P', semanas: r4('3x15 4kg'), rir: '-', descanso: "1'" },
      { grupo: 'Core', nombre: 'Scrunch c/disco', semanas: r4('3x12 5kg'), rir: '-', descanso: "1'" },
    ] },
    { nombre: 'Tercer día', ejercicios: [
      { grupo: 'Femorales', nombre: 'Peso muerto c/hexagonal', semanas: prog('3x10', 30, 5), rir: '2', descanso: "2'" },
      { grupo: 'Femorales', nombre: 'Camilla isquios unipodal', semanas: prog('3x12', 10, 1.25), rir: '-', descanso: "1'" },
      { grupo: 'Aductores', nombre: 'Sumo belt squat', semanas: prog('3x12', 40, 5), rir: '2', descanso: "2'" },
      { grupo: 'Core', nombre: 'Plancha lateral con rotación', semanas: r4('3x30"'), rir: '-', descanso: "1'" },
      { grupo: 'Tríceps', nombre: 'Extensión unilateral', semanas: prog('3x12', 6, 1), rir: '-', descanso: "1'" },
    ] },
  ];

  const clonar = o => JSON.parse(JSON.stringify(o));

  /* ---------- Lectura de la prescripción "4x6-8 70kg" ---------- */
  function kgDe(txt) {
    const m = String(txt || '').match(/(\d+(?:[.,]\d+)?)\s*kg/i);
    return m ? parseFloat(m[1].replace(',', '.')) : null;
  }
  function seriesDe(txt) {
    const t = String(txt || '').trim();
    const m = t.match(/^(\d+)\s*[xX]\s*([^\s]+)/);
    return m ? { series: m[1], reps: m[2] } : null;
  }

  /* ---------- Registros sembrados ----------
     registros[alumnoId]["s-d"] = { fecha, ej: { idx: { hecho, kg } } } */
  function registroCompleto(plan, sem, dia, fecha, extra) {
    const ej = {};
    plan[dia].ejercicios.forEach((e, i) => {
      const kg = kgDe(e.semanas[sem]);
      ej[i] = { hecho: true, kg: kg != null ? kg + ((extra && extra[i]) || 0) : null };
    });
    return { fecha, ej };
  }

  function semilla() {
    const alumnos = [
      { id: 'a1', nombre: 'Lucas Fernández', modalidad: 'Virtual', objetivo: 'Hipertrofia', inicio: haceDias(15), plan: clonar(PLAN_A) },
      { id: 'a2', nombre: 'Sofía Ríos', modalidad: 'Presencial', objetivo: 'Fuerza general', inicio: haceDias(9), plan: clonar(PLAN_B) },
      { id: 'a3', nombre: 'Martina Paz', modalidad: 'Virtual', objetivo: 'Tonificar', inicio: haceDias(13), plan: clonar(PLAN_B) },
      { id: 'a4', nombre: 'Joaquín Díaz', modalidad: 'Presencial', objetivo: 'Hipertrofia', inicio: haceDias(23), plan: clonar(PLAN_A) },
      { id: 'a5', nombre: 'Valentina Suárez', modalidad: 'Virtual', objetivo: 'Volver a entrenar', inicio: haceDias(3), plan: clonar(PLAN_B) },
    ];
    const P = id => alumnos.find(a => a.id === id).plan;
    const reg = { a1: {}, a2: {}, a3: {}, a4: {}, a5: {} };
    // Lucas: semanas 1 y 2 completas, semana 3 días 1 y 2 (el 2 fue ayer)
    [[0, 0, 15], [0, 1, 14], [0, 2, 12], [0, 3, 11], [1, 0, 8], [1, 1, 7], [1, 2, 5], [1, 3, 4], [2, 0, 2]].forEach(([s, d, h]) => reg.a1[`${s}-${d}`] = registroCompleto(P('a1'), s, d, haceDias(h)));
    reg.a1['2-1'] = registroCompleto(P('a1'), 2, 1, haceDias(1), { 0: 2.5, 3: 2.5 });
    // Sofía: semana 1 completa, semana 2 día 1 hoy
    [[0, 0, 9], [0, 1, 7], [0, 2, 5]].forEach(([s, d, h]) => reg.a2[`${s}-${d}`] = registroCompleto(P('a2'), s, d, haceDias(h)));
    reg.a2['1-0'] = registroCompleto(P('a2'), 1, 0, haceDias(0), { 1: 2.5 });
    // Martina: arrancó bien y hace 6 días que no entrena
    [[0, 0, 13], [0, 1, 11], [0, 2, 9], [1, 0, 6]].forEach(([s, d, h]) => reg.a3[`${s}-${d}`] = registroCompleto(P('a3'), s, d, haceDias(h)));
    // Joaquín: al día, en la semana 4
    [[0, 0, 23], [0, 1, 22], [0, 2, 20], [0, 3, 19], [1, 0, 16], [1, 1, 15], [1, 2, 13], [1, 3, 12], [2, 0, 9], [2, 1, 8], [2, 2, 6], [2, 3, 5], [3, 0, 2]].forEach(([s, d, h]) => reg.a4[`${s}-${d}`] = registroCompleto(P('a4'), s, d, haceDias(h), s >= 2 ? { 2: 5 } : null));
    // Valentina: primer entrenamiento hace 2 días
    reg.a5['0-0'] = registroCompleto(P('a5'), 0, 0, haceDias(2));
    return { alumnos, registros: reg, _creado: iso(hoy()) };
  }

  /* ---------- Persistencia ---------- */
  let cache = null;
  function load() {
    if (cache) return cache;
    try { cache = JSON.parse(localStorage.getItem(KEY)); } catch (e) { cache = null; }
    if (!cache || !cache.alumnos) { cache = semilla(); save(); }
    return cache;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch (e) {} }
  function reiniciar() { cache = semilla(); save(); }

  /* ---------- Consultas ---------- */
  const getAlumnos = () => load().alumnos;
  const getAlumno = id => load().alumnos.find(a => a.id === id);
  const registrosDe = id => load().registros[id] || (load().registros[id] = {});
  const registro = (id, s, d) => registrosDe(id)[`${s}-${d}`] || null;

  function semanaActual(a) {
    const n = Math.floor(diasDesde(a.inicio) / 7);
    return Math.max(0, Math.min(3, n));
  }
  // Próximo día pendiente: primero sin hacer de la semana actual (o de la anterior si quedó algo)
  function proximo(a) {
    const s = semanaActual(a);
    for (let d = 0; d < a.plan.length; d++) if (!registro(a.id, s, d)) return { s, d };
    if (s < 3) return { s: s + 1, d: 0 };
    return null;
  }
  function ultimoEntreno(id) {
    const fechas = Object.values(registrosDe(id)).map(r => r.fecha).sort();
    return fechas.length ? fechas[fechas.length - 1] : null;
  }
  function cumplimiento(a) {
    const s = semanaActual(a);
    const total = a.plan.length * 4;
    const hechos = Object.keys(registrosDe(a.id)).length;
    return { hechos, total };
  }
  function entrenosSemana(a, s) {
    return a.plan.map((_, d) => !!registro(a.id, s, d));
  }
  // Evolución de kg de un ejercicio (por nombre) a lo largo de los registros
  function evolucion(a, nombre) {
    const pts = [];
    for (let s = 0; s < 4; s++) a.plan.forEach((dia, d) => dia.ejercicios.forEach((e, i) => {
      if (e.nombre !== nombre) return;
      const r = registro(a.id, s, d);
      if (r && r.ej[i] && r.ej[i].kg != null) pts.push({ fecha: r.fecha, kg: r.ej[i].kg, plan: kgDe(e.semanas[s]) });
    }));
    return pts.sort((x, y) => x.fecha < y.fecha ? -1 : 1);
  }
  function ejerciciosConKg(a) {
    const vistos = new Set(); const out = [];
    a.plan.forEach(dia => dia.ejercicios.forEach(e => {
      if (!vistos.has(e.nombre) && e.semanas.some(kgDe)) { vistos.add(e.nombre); out.push(e.nombre); }
    }));
    return out;
  }

  /* ---------- Escritura ---------- */
  function guardarRegistro(id, s, d, ej) {
    registrosDe(id)[`${s}-${d}`] = { fecha: iso(hoy()), ej };
    save();
  }
  function borrarRegistro(id, s, d) { delete registrosDe(id)[`${s}-${d}`]; save(); }
  function guardarEjercicio(id, d, i, datos) {
    const a = getAlumno(id); if (!a) return;
    if (i == null) a.plan[d].ejercicios.push(datos); else a.plan[d].ejercicios[i] = datos;
    save();
  }
  function quitarEjercicio(id, d, i) { const a = getAlumno(id); a.plan[d].ejercicios.splice(i, 1); save(); }
  function crearAlumno({ nombre, modalidad, objetivo, copiarDe }) {
    const base = copiarDe ? getAlumno(copiarDe) : null;
    const a = {
      id: 'a' + Date.now().toString(36), nombre, modalidad, objetivo: objetivo || '',
      inicio: iso(hoy()), plan: base ? clonar(base.plan) : clonar(PLAN_B),
    };
    load().alumnos.push(a); load().registros[a.id] = {}; save();
    return a;
  }

  window.DB = {
    getAlumnos, getAlumno, registro, registrosDe, semanaActual, proximo, ultimoEntreno, cumplimiento,
    entrenosSemana, evolucion, ejerciciosConKg, guardarRegistro, borrarRegistro, guardarEjercicio,
    quitarEjercicio, crearAlumno, reiniciar, kgDe, seriesDe, diasDesde, iso, hoy,
  };
})();
