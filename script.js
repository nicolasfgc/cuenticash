let personas = [];
let gastos = [];
let abonos = [];

function agregarPersona() {
  const nombre = personaInput.value.trim();
  if (!nombre) return;
  personas.push(nombre);
  personaInput.value = "";
  renderPersonas();
}

function renderPersonas() {
  listaPersonas.innerHTML = "";
  gastoParticipantes.innerHTML = "";
  gastoPago.innerHTML = "";
  abonoDe.innerHTML = "";
  abonoA.innerHTML = "";

  personas.forEach(p => {
    listaPersonas.innerHTML += `<li>${p}</li>`;

    gastoParticipantes.innerHTML += `
      <div class="participante">
        <input type="checkbox" value="${p}">
        <span>${p}</span>
      </div>`;

    gastoPago.innerHTML += `<option>${p}</option>`;
    abonoDe.innerHTML += `<option>${p}</option>`;
    abonoA.innerHTML += `<option>${p}</option>`;
  });
}

function agregarGasto() {
  const concepto = gastoConcepto.value;
  const monto = Number(gastoMonto.value);
  const pago = gastoPago.value;

  const participantes = [...gastoParticipantes.querySelectorAll("input:checked")]
    .map(c => c.value);

  if (!concepto || !monto || participantes.length === 0) return;

  gastos.push({ concepto, monto, pago, participantes });

  gastoConcepto.value = "";
  gastoMonto.value = "";

  calcular();
  renderHistorial();
}

function agregarAbono() {
  const de = abonoDe.value;
  const a = abonoA.value;
  const monto = Number(abonoMonto.value);
  if (!monto || de === a) return;

  abonos.push({ de, a, monto });
  abonoMonto.value = "";

  calcular();
  renderHistorial();
}

function eliminarGasto(index) {
  gastos.splice(index, 1);
  calcular();
  renderHistorial();
}

function eliminarAbono(index) {
  abonos.splice(index, 1);
  calcular();
  renderHistorial();
}

function eliminarTodo() {
  gastos = [];
  abonos = [];
  calcular();
  renderHistorial();
}

function calcular() {
  let balance = {};
  personas.forEach(p => balance[p] = 0);

  gastos.forEach(g => {
    const parte = g.monto / g.participantes.length;
    g.participantes.forEach(p => balance[p] -= parte);
    balance[g.pago] += g.monto;
  });

  abonos.forEach(a => {
    balance[a.de] += a.monto;
    balance[a.a] -= a.monto;
  });

  mostrarResultado(balance);
  calcularPagos(balance);
}

function mostrarResultado(balance) {
  resultado.innerHTML = "<h3>Balance</h3>";
  for (let p in balance) {
    resultado.innerHTML += `<p>${p}: $${balance[p].toLocaleString("es-CO")}</p>`;
  }
}

function calcularPagos(balance) {
  pagos.innerHTML = "<h3>Quién le paga a quién</h3>";

  let deudores = [];
  let acreedores = [];

  for (let p in balance) {
    if (balance[p] < 0) deudores.push({ p, v: -balance[p] });
    if (balance[p] > 0) acreedores.push({ p, v: balance[p] });
  }

  deudores.forEach(d => {
    acreedores.forEach(a => {
      if (d.v > 0 && a.v > 0) {
        const pago = Math.min(d.v, a.v);
        pagos.innerHTML += `<p>${d.p} → ${a.p}: $${pago.toLocaleString("es-CO")}</p>`;
        d.v -= pago;
        a.v -= pago;
      }
    });
  });
}

function renderHistorial() {
  historial.innerHTML = "";

  gastos.forEach((g, i) => {
    historial.innerHTML += `
      <div class="hist-item">
        <strong>Gasto:</strong> ${g.concepto}<br>
        Pagó: ${g.pago}<br>
        Participaron: ${g.participantes.join(", ")}<br>
        Monto: $${g.monto.toLocaleString("es-CO")}
        <button class="small danger" onclick="eliminarGasto(${i})">Eliminar</button>
      </div>
    `;
  });

  abonos.forEach((a, i) => {
    historial.innerHTML += `
      <div class="hist-item">
        <strong>Abono:</strong><br>
        ${a.de} → ${a.a}<br>
        Monto: $${a.monto.toLocaleString("es-CO")}
        <button class="small danger" onclick="eliminarAbono(${i})">Eliminar</button>
      </div>
    `;
  });
}