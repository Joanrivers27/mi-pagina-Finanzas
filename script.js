document.addEventListener("DOMContentLoaded", async () => {
  // ============================================================
  // 1. CONFIGURACIÓN SUPABASE
  // Reemplaza estos dos valores con los de tu proyecto Supabase.
  // Usa la Publishable key (o anon key legacy), NUNCA service_role.
  // ============================================================
  const SUPABASE_URL = "https://kxrieopyitsbhykbplkt.supabase.co";
  const SUPABASE_KEY = "sb_publishable_mkVLpbgyZvhQubSATwytag_ofnHwT7E";
  const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  // DOM
  const loginSection = document.getElementById("loginSection");
  const registerSection = document.getElementById("registerSection");
  const dashboardSection = document.getElementById("dashboardSection");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const welcomeModal = document.getElementById("welcomeModal");
  const closeWelcomeBtn = document.getElementById("closeWelcomeBtn");
  const showRegisterBtn = document.getElementById("showRegisterBtn");
  const showLoginBtn = document.getElementById("showLoginBtn");
  const loginMessage = document.getElementById("loginMessage");
  const registerMessage = document.getElementById("registerMessage");
  const userNameLabel = document.getElementById("userNameLabel");

  const navSepararBtn = document.getElementById("navSepararBtn");
  const navEquilibrioBtn = document.getElementById("navEquilibrioBtn");
  const navRegistrosBtn = document.getElementById("navRegistrosBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  const viewSeparar = document.getElementById("viewSeparar");
  const viewEquilibrio = document.getElementById("viewEquilibrio");

  // Separar Dinero
  const totalIncomeInput = document.getElementById("totalIncome");
  const sliderSueldo = document.getElementById("sliderSueldo");
  const sliderReinversion = document.getElementById("sliderReinversion");
  const sliderImpuestos = document.getElementById("sliderImpuestos");
  const sliderCajaChica = document.getElementById("sliderCajaChica");
  const pSueldoVal = document.getElementById("pSueldoVal");
  const pReinversionVal = document.getElementById("pReinversionVal");
  const pImpuestosVal = document.getElementById("pImpuestosVal");
  const pCajaChicaVal = document.getElementById("pCajaChicaVal");
  const amountSueldo = document.getElementById("amountSueldo");
  const amountReinversion = document.getElementById("amountReinversion");
  const amountImpuestos = document.getElementById("amountImpuestos");
  const amountCajaChica = document.getElementById("amountCajaChica");
  const saveSepararBtn = document.getElementById("saveSepararBtn");
  const saveSepararMessage = document.getElementById("saveSepararMessage");

  // Punto de equilibrio (varios productos)
  const costosFijosInput = document.getElementById("costosFijos");
  const productsList = document.getElementById("productsList");
  const addProductBtn = document.getElementById("addProductBtn");
  const mixHint = document.getElementById("mixHint");
  const breakdownBody = document.getElementById("breakdownBody");
  const breakdownFoot = document.getElementById("breakdownFoot");
  const metricUnidades = document.getElementById("metricUnidades");
  const metricVentas = document.getElementById("metricVentas");
  const statusAlertBox = document.getElementById("statusAlertBox");
  const statusIcon = document.getElementById("statusIcon");
  const statusTitle = document.getElementById("statusTitle");
  const statusDesc = document.getElementById("statusDesc");
  const saveEquilibrioBtn = document.getElementById("saveEquilibrioBtn");
  const saveEquilibrioMessage = document.getElementById("saveEquilibrioMessage");

  // Sorteo (solo admin)
  const navSorteoBtn = document.getElementById("navSorteoBtn");
  const viewSorteo = document.getElementById("viewSorteo");
  const raffleCanvas = document.getElementById("raffleCanvas");
  const raffleSpinBtn = document.getElementById("raffleSpinBtn");
  const raffleMessage = document.getElementById("raffleMessage");
  const raffleCount = document.getElementById("raffleCount");
  const raffleExcludeMe = document.getElementById("raffleExcludeMe");
  const raffleNoRepeat = document.getElementById("raffleNoRepeat");
  const raffleReloadBtn = document.getElementById("raffleReloadBtn");
  const raffleParticipants = document.getElementById("raffleParticipants");
  const raffleHistory = document.getElementById("raffleHistory");
  const winnerModal = document.getElementById("winnerModal");
  const winnerName = document.getElementById("winnerName");
  const winnerEmail = document.getElementById("winnerEmail");
  const winnerMsg = document.getElementById("winnerMsg");
  const closeWinnerBtn = document.getElementById("closeWinnerBtn");
  const confettiCanvas = document.getElementById("confettiCanvas");

  let donutChart = null;
  let equilibrioChart = null;
  let currentUser = null;

  function showMessage(el, text, isError = false) {
    el.textContent = text;
    el.style.color = isError ? "#c62828" : "#00695c";
  }

  function showSection(section) {
    [loginSection, registerSection, dashboardSection].forEach(s => s.classList.add("hidden"));
    section.classList.remove("hidden");
  }

  function switchTab(targetView, targetBtn) {
    document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
    document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
    targetView.classList.add("active");
    targetBtn.classList.add("active");
  }

  // ============================================================
  // AUTH
  // ============================================================
  showRegisterBtn.addEventListener("click", () => {
    registerForm.reset();
    registerMessage.textContent = "";
    showSection(registerSection);
  });

  showLoginBtn.addEventListener("click", () => {
    loginForm.reset();
    loginMessage.textContent = "";
    showSection(loginSection);
  });

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;
    const password2 = document.getElementById("registerPassword2").value;

    if (password !== password2) {
      showMessage(registerMessage, "Las contraseñas no coinciden.", true);
      return;
    }

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });

    if (error) {
      showMessage(registerMessage, error.message, true);
      return;
    }

    if (data.session) {
      showMessage(registerMessage, "Cuenta creada correctamente. Ya puedes entrar.");
      setTimeout(() => showSection(loginSection), 1200);
    } else {
      showMessage(registerMessage, "Cuenta creada. Revisa tu correo para confirmar la cuenta y luego inicia sesión.");
    }
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    showMessage(loginMessage, "Iniciando sesión...");

    const email = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      showMessage(loginMessage, "No se pudo iniciar sesión: " + error.message, true);
      return;
    }

    currentUser = data.user;
    await enterDashboard(true);
  });

  closeWelcomeBtn.addEventListener("click", async () => {
    welcomeModal.classList.add("hidden");
    await enterDashboard(false);
  });

  logoutBtn.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    currentUser = null;
    showSection(loginSection);
  });

  navSepararBtn.addEventListener("click", () => switchTab(viewSeparar, navSepararBtn));
  navEquilibrioBtn.addEventListener("click", () => switchTab(viewEquilibrio, navEquilibrioBtn));
  navSorteoBtn.addEventListener("click", () => {
    switchTab(viewSorteo, navSorteoBtn);
    if (!raffleSpinning) loadRaffleParticipants();
  });

  navRegistrosBtn.addEventListener("click", () => {
    window.location.href = "registros.html";
  });

  async function enterDashboard(showWelcome) {
    if (!currentUser) {
      const { data } = await supabaseClient.auth.getUser();
      currentUser = data.user;
    }
    if (!currentUser) return;

    showSection(dashboardSection);

    const fullName = currentUser.user_metadata?.full_name || currentUser.email || "Usuario";
    userNameLabel.textContent = fullName;

    if (showWelcome) {
      welcomeModal.classList.remove("hidden");
    }

    await loadSavedResults();
    await checkAdmin();

    // Se ejecutan después de mostrar el dashboard.
    if (!donutChart) initDonutChart();
    if (!equilibrioChart) initEquilibrioChart();
    updateIncomeSeparation();
    renderProducts();
    updateBreakeven();
  }

  async function checkAdmin() {
    const { data, error } = await supabaseClient.rpc("is_admin");
    const esAdmin = !error && data === true;
    navRegistrosBtn.classList.toggle("hidden", !esAdmin);
    navSorteoBtn.classList.toggle("hidden", !esAdmin);
  }

  // ============================================================
  // SEPARAR DINERO
  // ============================================================
  function updateIncomeSeparation() {
    const totalIncome = parseFloat(totalIncomeInput.value) || 0;
    let pSueldo = parseInt(sliderSueldo.value);
    let pReinversion = parseInt(sliderReinversion.value);
    let pImpuestos = parseInt(sliderImpuestos.value);

    let currentSum = pSueldo + pReinversion + pImpuestos;

    if (currentSum > 100) {
      pImpuestos = Math.max(0, 100 - pSueldo - pReinversion);
      sliderImpuestos.value = pImpuestos;
      currentSum = pSueldo + pReinversion + pImpuestos;
    }

    const pCajaChica = Math.max(0, 100 - currentSum);
    sliderCajaChica.value = pCajaChica;

    pSueldoVal.textContent = `${pSueldo}%`;
    pReinversionVal.textContent = `${pReinversion}%`;
    pImpuestosVal.textContent = `${pImpuestos}%`;
    pCajaChicaVal.textContent = `${pCajaChica}%`;

    const valSueldo = totalIncome * pSueldo / 100;
    const valReinversion = totalIncome * pReinversion / 100;
    const valImpuestos = totalIncome * pImpuestos / 100;
    const valCajaChica = totalIncome * pCajaChica / 100;

    amountSueldo.textContent = `$${valSueldo.toLocaleString("en-US", {minimumFractionDigits:2})}`;
    amountReinversion.textContent = `$${valReinversion.toLocaleString("en-US", {minimumFractionDigits:2})}`;
    amountImpuestos.textContent = `$${valImpuestos.toLocaleString("en-US", {minimumFractionDigits:2})}`;
    amountCajaChica.textContent = `$${valCajaChica.toLocaleString("en-US", {minimumFractionDigits:2})}`;

    if (donutChart) {
      donutChart.data.datasets[0].data = [valSueldo, valReinversion, valImpuestos, valCajaChica];
      donutChart.update();
    }
  }

  function initDonutChart() {
    if (typeof Chart === "undefined") return;
    const canvas = document.getElementById("incomeDonutChart");
    if (!canvas) return;

    donutChart = new Chart(canvas.getContext("2d"), {
      type: "doughnut",
      data: {
        labels: ["Sueldo", "Reinversión", "Impuestos", "Caja Chica"],
        datasets: [{
          data: [1200, 900, 600, 300],
          backgroundColor: ["#3d5afe", "#00c853", "#ff9100", "#37474f"],
          borderWidth: 2
        }]
      },
      options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}} }
    });
  }

  [totalIncomeInput, sliderSueldo, sliderReinversion, sliderImpuestos].forEach(el => {
    el.addEventListener("input", updateIncomeSeparation);
  });

  saveSepararBtn.addEventListener("click", async () => {
    if (!currentUser) return;
    const totalIncome = parseFloat(totalIncomeInput.value) || 0;
    const sueldo = parseInt(sliderSueldo.value);
    const reinversion = parseInt(sliderReinversion.value);
    const impuestos = parseInt(sliderImpuestos.value);
    const caja = 100 - sueldo - reinversion - impuestos;

    const resultado = {
      ingresos: totalIncome,
      sueldo_porcentaje: sueldo,
      reinversion_porcentaje: reinversion,
      impuestos_porcentaje: impuestos,
      caja_chica_porcentaje: caja,
      sueldo_monto: totalIncome * sueldo / 100,
      reinversion_monto: totalIncome * reinversion / 100,
      impuestos_monto: totalIncome * impuestos / 100,
      caja_chica_monto: totalIncome * caja / 100
    };

    const { error } = await supabaseClient.from("resultados").upsert({
      user_id: currentUser.id,
      tipo: "separar_dinero",
      resultado
    }, { onConflict: "user_id,tipo" });

    showMessage(saveSepararMessage, error ? "Error: " + error.message : "✅ Resultado guardado correctamente.", !!error);
  });

  // ============================================================
  // PUNTO DE EQUILIBRIO (VARIOS PRODUCTOS)
  // Método de mezcla de ventas: se calcula un margen de contribución
  // ponderado según la participación (%) de cada producto en las ventas.
  // ============================================================
  const fmt = n => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  }

  let products = [{ nombre: "Producto 1", precio: 25, costo: 10, mezcla: 100 }];

  function renderProducts() {
    productsList.innerHTML = products.map((p, i) => `
      <div class="product-row" data-index="${i}">
        <div class="product-row-top">
          <input type="text" class="p-nombre" value="${escapeHtml(p.nombre)}" placeholder="Nombre del producto">
          <button type="button" class="btn-remove-product" title="Quitar producto" ${products.length === 1 ? "disabled" : ""}>🗑️</button>
        </div>
        <div class="product-row-fields">
          <label>Precio venta ($)<input type="number" class="p-precio" min="0" step="0.01" value="${p.precio}"></label>
          <label>Costo variable ($)<input type="number" class="p-costo" min="0" step="0.01" value="${p.costo}"></label>
          <label>Mezcla de ventas (%)<input type="number" class="p-mezcla" min="0" max="100" step="0.1" value="${p.mezcla}"></label>
        </div>
      </div>`).join("");
  }

  function readProducts() {
    products = [...productsList.querySelectorAll(".product-row")].map((row, i) => ({
      nombre: row.querySelector(".p-nombre").value.trim() || `Producto ${i + 1}`,
      precio: parseFloat(row.querySelector(".p-precio").value) || 0,
      costo: parseFloat(row.querySelector(".p-costo").value) || 0,
      mezcla: Math.max(0, parseFloat(row.querySelector(".p-mezcla").value) || 0)
    }));
    return products;
  }

  // Reparte la mezcla para que siga sumando 100% conservando las proporciones
  function normalizeMix(list) {
    const total = list.reduce((s, p) => s + p.mezcla, 0);
    if (total <= 0) {
      list.forEach(p => p.mezcla = Math.round((100 / list.length) * 100) / 100);
    } else {
      list.forEach(p => p.mezcla = Math.round((p.mezcla / total) * 10000) / 100);
    }
  }

  function computeBreakeven(costosFijos, prods) {
    const totalMix = prods.reduce((s, p) => s + p.mezcla, 0);
    const items = prods.map(p => ({
      ...p,
      peso: totalMix > 0 ? p.mezcla / totalMix : 0,
      margen: p.precio - p.costo
    }));

    const precioProm = items.reduce((s, it) => s + it.peso * it.precio, 0);
    const costoProm = items.reduce((s, it) => s + it.peso * it.costo, 0);
    const margenProm = precioProm - costoProm;

    if (margenProm > 0 && costosFijos > 0) {
      const base = costosFijos / margenProm; // unidades totales (promedio ponderado)
      items.forEach(it => {
        it.unidades = Math.ceil(base * it.peso - 1e-9);
        it.ventas = it.unidades * it.precio;
      });
    } else {
      items.forEach(it => { it.unidades = 0; it.ventas = 0; });
    }

    return {
      items, totalMix, precioProm, costoProm, margenProm,
      unidades: items.reduce((s, it) => s + it.unidades, 0),
      ventas: items.reduce((s, it) => s + it.ventas, 0),
      hayMargenNegativo: items.some(it => it.peso > 0 && it.margen <= 0)
    };
  }

  function updateBreakeven() {
    const costosFijos = parseFloat(costosFijosInput.value) || 0;
    const r = computeBreakeven(costosFijos, readProducts());

    metricUnidades.innerHTML = `${r.unidades.toLocaleString("en-US")} <small>uds</small>`;
    metricVentas.textContent = fmt(r.ventas);

    if (Math.abs(r.totalMix - 100) > 0.01) {
      mixHint.textContent = `⚠️ La mezcla suma ${r.totalMix.toFixed(1)}%. Se ajusta proporcionalmente a 100% para el cálculo.`;
      mixHint.style.color = "#ef6c00";
    } else {
      mixHint.textContent = "✔ La mezcla suma 100%.";
      mixHint.style.color = "#2e7d32";
    }

    breakdownBody.innerHTML = r.items.map(it => `
      <tr>
        <td><strong>${escapeHtml(it.nombre)}</strong></td>
        <td>${(it.peso * 100).toFixed(1)}%</td>
        <td class="${it.margen <= 0 ? "neg" : ""}">${fmt(it.margen)}</td>
        <td>${it.unidades.toLocaleString("en-US")}</td>
        <td>${fmt(it.ventas)}</td>
      </tr>`).join("");
    breakdownFoot.innerHTML = `
      <tr>
        <td><strong>TOTAL</strong></td><td>100%</td>
        <td>${fmt(r.margenProm)} <small>(prom.)</small></td>
        <td>${r.unidades.toLocaleString("en-US")}</td><td>${fmt(r.ventas)}</td>
      </tr>`;

    applyTrafficLightStatus(r);
    updateEquilibrioChart(costosFijos, r);
  }

  function applyTrafficLightStatus(r) {
    statusAlertBox.classList.remove("status-red", "status-orange", "status-green");
    const porcentajeMargen = r.precioProm > 0 ? (r.margenProm / r.precioProm) * 100 : 0;

    if (r.margenProm <= 0 || r.unidades > 500) {
      statusAlertBox.classList.add("status-red");
      statusIcon.textContent = "🚨";
      statusTitle.textContent = "CRÍTICO: Punto de equilibrio muy alto o inviable";
      statusDesc.textContent = "Revisa tus costos, tus precios o la mezcla de ventas.";
    } else if (porcentajeMargen < 35 || r.unidades > 120 || r.hayMargenNegativo) {
      statusAlertBox.classList.add("status-orange");
      statusIcon.textContent = "⚠️";
      statusTitle.textContent = "CUIDADO: Equilibrio ajustado";
      statusDesc.textContent = r.hayMargenNegativo
        ? "Algún producto se vende por debajo de su costo variable. Revísalo."
        : "Estás cubriendo costos, pero el margen es reducido.";
    } else {
      statusAlertBox.classList.add("status-green");
      statusIcon.textContent = "🎉";
      statusTitle.textContent = "¡EXCELENTE! Tu negocio está bien equilibrado";
      statusDesc.textContent = "Tus productos en conjunto tienen un buen margen de contribución.";
    }
  }

  function initEquilibrioChart() {
    if (typeof Chart === "undefined") return;
    const canvas = document.getElementById("equilibrioChart");
    if (!canvas) return;

    equilibrioChart = new Chart(canvas.getContext("2d"), {
      type: "line",
      data: {
        labels: [0, 20, 40, 60, 80, 100, 120],
        datasets: [
          { label: "Ingresos Totales ($)", data: [0, 500, 1000, 1500, 2000, 2500, 3000], borderColor: "#3d5afe", backgroundColor: "rgba(61,90,254,.1)", fill: true, tension: .1 },
          { label: "Costos Totales ($)", data: [1200, 1400, 1600, 1800, 2000, 2200, 2400], borderColor: "#d32f2f", borderDash: [5, 5], fill: false, tension: .1 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: { x: { title: { display: true, text: "Unidades Vendidas (total)" } }, y: { title: { display: true, text: "Monto ($)" } } }
      }
    });
  }

  function updateEquilibrioChart(costosFijos, r) {
    if (!equilibrioChart) return;

    const maxUnits = Math.max(r.unidades * 2, 50);
    const step = Math.ceil(maxUnits / 6);
    const labels = [], ingresos = [], costos = [];

    for (let i = 0; i <= 6; i++) {
      const u = i * step;
      labels.push(u);
      ingresos.push(u * r.precioProm);
      costos.push(costosFijos + u * r.costoProm);
    }

    equilibrioChart.data.labels = labels;
    equilibrioChart.data.datasets[0].data = ingresos;
    equilibrioChart.data.datasets[1].data = costos;
    equilibrioChart.update();
  }

  costosFijosInput.addEventListener("input", updateBreakeven);
  productsList.addEventListener("input", updateBreakeven);

  productsList.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-remove-product");
    if (!btn || products.length <= 1) return;
    readProducts();
    products.splice(Number(btn.closest(".product-row").dataset.index), 1);
    normalizeMix(products);
    renderProducts();
    updateBreakeven();
  });

  addProductBtn.addEventListener("click", () => {
    readProducts();
    const n = products.length;
    // El producto nuevo toma una parte justa y los demás se reducen proporcionalmente
    const nuevaParte = Math.round((100 / (n + 1)) * 100) / 100;
    products.forEach(p => p.mezcla = Math.round(p.mezcla * (n / (n + 1)) * 100) / 100);
    products.push({ nombre: `Producto ${n + 1}`, precio: 20, costo: 8, mezcla: nuevaParte });
    renderProducts();
    updateBreakeven();
  });

  saveEquilibrioBtn.addEventListener("click", async () => {
    if (!currentUser) return;

    const costosFijos = parseFloat(costosFijosInput.value) || 0;
    const r = computeBreakeven(costosFijos, readProducts());

    const resultado = {
      costos_fijos: costosFijos,
      productos: r.items.map(it => ({
        nombre: it.nombre,
        precio_venta: it.precio,
        costo_variable: it.costo,
        mezcla_porcentaje: it.mezcla,
        margen_contribucion: it.margen,
        unidades_equilibrio: it.unidades,
        ventas_equilibrio: it.ventas
      })),
      margen_contribucion_ponderado: r.margenProm,
      unidades_equilibrio: r.unidades,
      ventas_equilibrio: r.ventas
    };

    const { error } = await supabaseClient.from("resultados").upsert({
      user_id: currentUser.id,
      tipo: "punto_equilibrio",
      resultado
    }, { onConflict: "user_id,tipo" });

    showMessage(saveEquilibrioMessage, error ? "Error: " + error.message : "✅ Resultado guardado correctamente.", !!error);
  });

  // ============================================================
  // SORTEO TIPO RULETA (SOLO ADMIN)
  // ============================================================
  const WHEEL_COLORS = ["#3d5afe", "#00c853", "#ff9100", "#e91e63", "#00bcd4", "#9c27b0", "#fbc02d", "#37474f"];
  const WINNER_MESSAGES = [
    "¡La suerte estaba de tu lado hoy! 🍀",
    "Gracias por ser parte de Kiosko Pyme. ¡Disfruta tu premio!",
    "¡Tu negocio y tu suerte crecen juntos! 📈",
    "Hoy tu balance quedó en números verdes. 💚",
    "Encontraste el punto de equilibrio de la suerte. 😄",
    "¡Los emprendedores como tú merecen celebrar! 🥳"
  ];

  let raffleUsers = [];
  let rafflePool = [];
  let raffleWinners = [];
  let raffleRotation = 0;
  let raffleSpinning = false;
  let confettiRAF = null;
  const wheelLogo = new Image();
  wheelLogo.onload = () => drawWheel(raffleRotation);
  wheelLogo.src = "tienda.png";

  function randomFloat() {
    const a = new Uint32Array(1);
    crypto.getRandomValues(a);
    return a[0] / 4294967296;
  }

  async function loadRaffleParticipants() {
    showMessage(raffleMessage, "Cargando participantes...");
    const { data, error } = await supabaseClient
      .from("admin_registros")
      .select("user_id, full_name, email");

    if (error) {
      showMessage(raffleMessage, "No se pudieron cargar los participantes: " + error.message, true);
      return;
    }

    raffleUsers = (data || []).filter(u => u.email);
    raffleMessage.textContent = "";
    refreshRafflePool();
  }

  function refreshRafflePool() {
    const ganadores = new Set(raffleWinners.map(w => w.user_id));
    rafflePool = raffleUsers.filter(u => {
      if (raffleExcludeMe.checked && currentUser && u.user_id === currentUser.id) return false;
      if (raffleNoRepeat.checked && ganadores.has(u.user_id)) return false;
      return true;
    });

    raffleCount.textContent = rafflePool.length;
    raffleParticipants.innerHTML = rafflePool.length
      ? rafflePool.map(u => `<div class="participant-chip">${escapeHtml(u.email)}</div>`).join("")
      : '<p class="empty-li">No hay participantes disponibles.</p>';

    raffleSpinBtn.disabled = raffleSpinning || rafflePool.length < 2;
    if (!raffleSpinning && rafflePool.length < 2 && raffleUsers.length) {
      showMessage(raffleMessage, "Se necesitan al menos 2 participantes para sortear.", true);
    } else if (!raffleSpinning) {
      raffleMessage.textContent = "";
    }
    drawWheel(raffleRotation);
  }

  function fitText(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;
    while (text.length > 1 && ctx.measureText(text + "…").width > maxWidth) text = text.slice(0, -1);
    return text + "…";
  }

  function drawWheel(rotation) {
    const ctx = raffleCanvas.getContext("2d");
    const W = raffleCanvas.width, c = W / 2, R = c - 12;
    ctx.clearRect(0, 0, W, W);

    const n = rafflePool.length;
    if (n === 0) {
      ctx.beginPath(); ctx.arc(c, c, R, 0, Math.PI * 2);
      ctx.fillStyle = "#eceff1"; ctx.fill();
      ctx.lineWidth = 8; ctx.strokeStyle = "#cfd8dc"; ctx.stroke();
      ctx.fillStyle = "#78909c"; ctx.font = "bold 34px Segoe UI, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("Sin participantes", c, c + 10);
      return;
    }

    const a = (Math.PI * 2) / n;
    const fontSize = n <= 12 ? 34 : n <= 30 ? 24 : 16;

    for (let i = 0; i < n; i++) {
      const start = rotation + i * a;
      let colorIdx = i % WHEEL_COLORS.length;
      if (i === n - 1 && n > 1 && colorIdx === 0) colorIdx = 3; // evita repetir el color del primero
      ctx.beginPath();
      ctx.moveTo(c, c);
      ctx.arc(c, c, R, start, start + a);
      ctx.closePath();
      ctx.fillStyle = WHEEL_COLORS[colorIdx];
      ctx.fill();
      ctx.lineWidth = n > 80 ? 0 : 3;
      ctx.strokeStyle = "#fff";
      if (n <= 80) ctx.stroke();

      if (n <= 60) {
        ctx.save();
        ctx.translate(c, c);
        ctx.rotate(start + a / 2);
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#fff";
        ctx.font = `600 ${fontSize}px Segoe UI, sans-serif`;
        ctx.fillText(fitText(ctx, rafflePool[i].email, R - 110), R - 28, 0);
        ctx.restore();
      }
    }

    // Borde y centro
    ctx.beginPath(); ctx.arc(c, c, R, 0, Math.PI * 2);
    ctx.lineWidth = 10; ctx.strokeStyle = "#1a237e"; ctx.stroke();
    ctx.beginPath(); ctx.arc(c, c, 54, 0, Math.PI * 2);
    ctx.fillStyle = "#fff"; ctx.fill();
    ctx.lineWidth = 8; ctx.strokeStyle = "#1a237e"; ctx.stroke();
    if (wheelLogo.complete && wheelLogo.naturalWidth) {
      ctx.drawImage(wheelLogo, c - 32, c - 32, 64, 64);
    } else {
      ctx.font = "44px Segoe UI Emoji, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#000"; ctx.fillText("🏪", c, c + 2);
    }
  }

  function spinRaffle() {
    if (raffleSpinning || rafflePool.length < 2) return;
    raffleSpinning = true;
    raffleSpinBtn.disabled = true;
    raffleSpinBtn.textContent = "🎰 Girando...";
    [raffleExcludeMe, raffleNoRepeat, raffleReloadBtn].forEach(el => el.disabled = true);
    raffleMessage.textContent = "";

    const n = rafflePool.length;
    const a = (Math.PI * 2) / n;
    const winnerIdx = Math.floor(randomFloat() * n);
    const winner = rafflePool[winnerIdx];

    // El puntero está arriba (-90°). Se calcula el ángulo para que el centro de la
    // porción ganadora quede bajo el puntero, con un pequeño desvío aleatorio.
    const offset = (randomFloat() - 0.5) * 0.7;
    const target = -Math.PI / 2 - (winnerIdx + 0.5 + offset) * a;
    const full = Math.PI * 2;
    const current = raffleRotation % full;
    const delta = (((target - current) % full) + full) % full + full * (5 + Math.floor(randomFloat() * 3));

    const startRot = raffleRotation;
    const duration = 6000;
    const t0 = performance.now();

    function frame(now) {
      const t = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - t, 4); // frena suavemente
      raffleRotation = startRot + delta * eased;
      drawWheel(raffleRotation);
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        raffleRotation = raffleRotation % full;
        drawWheel(raffleRotation);
        showWinner(winner);
      }
    }
    requestAnimationFrame(frame);
  }

  function showWinner(user) {
    raffleWinners.push(user);
    renderWinnersHistory();

    winnerName.textContent = user.full_name || "Participante";
    winnerEmail.textContent = user.email;
    winnerMsg.textContent = WINNER_MESSAGES[Math.floor(randomFloat() * WINNER_MESSAGES.length)];
    winnerModal.classList.remove("hidden");
    launchConfetti();
  }

  function renderWinnersHistory() {
    raffleHistory.innerHTML = raffleWinners.length
      ? raffleWinners.map(w => `<li>🏆 <strong>${escapeHtml(w.full_name || "Sin nombre")}</strong> — ${escapeHtml(w.email)}</li>`).join("")
      : '<li class="empty-li">Aún no hay ganadores.</li>';
  }

  function closeWinner() {
    winnerModal.classList.add("hidden");
    stopConfetti();
    raffleSpinning = false;
    raffleSpinBtn.textContent = "🎲 ¡Iniciar sorteo!";
    [raffleExcludeMe, raffleNoRepeat, raffleReloadBtn].forEach(el => el.disabled = false);
    refreshRafflePool();
  }

  function launchConfetti() {
    stopConfetti();
    const cv = confettiCanvas;
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
    const ctx = cv.getContext("2d");
    const colors = ["#3d5afe", "#00c853", "#ff9100", "#e91e63", "#00bcd4", "#fbc02d", "#9c27b0"];
    const parts = Array.from({ length: 200 }, () => ({
      x: Math.random() * cv.width,
      y: -20 - Math.random() * cv.height * 0.7,
      w: 6 + Math.random() * 8,
      h: 8 + Math.random() * 10,
      vx: -2 + Math.random() * 4,
      vy: 2 + Math.random() * 4,
      rot: Math.random() * Math.PI * 2,
      vr: -0.2 + Math.random() * 0.4,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    const t0 = performance.now();

    function frame(now) {
      ctx.clearRect(0, 0, cv.width, cv.height);
      let alive = false;
      parts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.03; p.rot += p.vr;
        if (p.y < cv.height + 20) alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (alive && now - t0 < 9000) confettiRAF = requestAnimationFrame(frame);
    }
    confettiRAF = requestAnimationFrame(frame);
  }

  function stopConfetti() {
    if (confettiRAF) cancelAnimationFrame(confettiRAF);
    confettiRAF = null;
    confettiCanvas.getContext("2d").clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }

  raffleSpinBtn.addEventListener("click", spinRaffle);
  closeWinnerBtn.addEventListener("click", closeWinner);
  raffleReloadBtn.addEventListener("click", loadRaffleParticipants);
  [raffleExcludeMe, raffleNoRepeat].forEach(el => el.addEventListener("change", refreshRafflePool));

  // ============================================================
  // CARGAR RESULTADOS GUARDADOS
  // ============================================================
  async function loadSavedResults() {
    if (!currentUser) return;

    const { data, error } = await supabaseClient
      .from("resultados")
      .select("tipo, resultado")
      .eq("user_id", currentUser.id);

    if (error) {
      console.error("No se pudieron cargar los resultados:", error);
      return;
    }

    const separar = data?.find(r => r.tipo === "separar_dinero")?.resultado;
    if (separar) {
      totalIncomeInput.value = separar.ingresos ?? 3000;
      sliderSueldo.value = separar.sueldo_porcentaje ?? 40;
      sliderReinversion.value = separar.reinversion_porcentaje ?? 30;
      sliderImpuestos.value = separar.impuestos_porcentaje ?? 20;
    }

    const equilibrio = data?.find(r => r.tipo === "punto_equilibrio")?.resultado;
    if (equilibrio) {
      costosFijosInput.value = equilibrio.costos_fijos ?? 1200;
      if (Array.isArray(equilibrio.productos) && equilibrio.productos.length) {
        products = equilibrio.productos.map((p, i) => ({
          nombre: p.nombre || `Producto ${i + 1}`,
          precio: p.precio_venta ?? 0,
          costo: p.costo_variable ?? 0,
          mezcla: p.mezcla_porcentaje ?? 0
        }));
      } else {
        // Formato anterior (un solo producto)
        products = [{ nombre: "Producto 1", precio: equilibrio.precio_venta ?? 25, costo: equilibrio.costo_variable ?? 10, mezcla: 100 }];
      }
    }
  }

  // ============================================================
  // SESIÓN EXISTENTE
  // ============================================================
  const { data: sessionData } = await supabaseClient.auth.getSession();
  if (sessionData.session?.user) {
    currentUser = sessionData.session.user;
    await enterDashboard(false);
  } else {
    showSection(loginSection);
  }
});
