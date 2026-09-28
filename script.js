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

  // Punto de equilibrio
  const costosFijosInput = document.getElementById("costosFijos");
  const precioVentaInput = document.getElementById("precioVenta");
  const costoVariableInput = document.getElementById("costoVariable");
  const metricUnidades = document.getElementById("metricUnidades");
  const metricVentas = document.getElementById("metricVentas");
  const statusAlertBox = document.getElementById("statusAlertBox");
  const statusIcon = document.getElementById("statusIcon");
  const statusTitle = document.getElementById("statusTitle");
  const statusDesc = document.getElementById("statusDesc");
  const saveEquilibrioBtn = document.getElementById("saveEquilibrioBtn");
  const saveEquilibrioMessage = document.getElementById("saveEquilibrioMessage");

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
    updateBreakeven();
  }

  async function checkAdmin() {
    const { data, error } = await supabaseClient.rpc("is_admin");
    navRegistrosBtn.classList.toggle("hidden", !!error || data !== true);
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
  // PUNTO DE EQUILIBRIO
  // ============================================================
  function updateBreakeven() {
    const costosFijos = parseFloat(costosFijosInput.value) || 0;
    const precioVenta = parseFloat(precioVentaInput.value) || 0;
    const costoVariable = parseFloat(costoVariableInput.value) || 0;
    const margen = precioVenta - costoVariable;

    let unidades = 0;
    let ventas = 0;

    if (margen > 0) {
      unidades = Math.ceil(costosFijos / margen);
      ventas = unidades * precioVenta;
    }

    metricUnidades.innerHTML = `${unidades} <small>uds</small>`;
    metricVentas.textContent = `$${ventas.toLocaleString("en-US", {minimumFractionDigits:2})}`;

    applyTrafficLightStatus(margen, precioVenta, unidades);
    updateEquilibrioChart(costosFijos, precioVenta, costoVariable, unidades);
  }

  function applyTrafficLightStatus(margen, precio, unidades) {
    statusAlertBox.classList.remove("status-red","status-orange","status-green");
    const porcentajeMargen = precio > 0 ? (margen / precio) * 100 : 0;

    if (margen <= 0 || unidades > 500) {
      statusAlertBox.classList.add("status-red");
      statusIcon.textContent = "🚨";
      statusTitle.textContent = "CRÍTICO: Punto de equilibrio muy alto o inviable";
      statusDesc.textContent = "Revisa tus costos y tu precio de venta.";
    } else if (porcentajeMargen < 35 || unidades > 120) {
      statusAlertBox.classList.add("status-orange");
      statusIcon.textContent = "⚠️";
      statusTitle.textContent = "CUIDADO: Equilibrio ajustado";
      statusDesc.textContent = "Estás cubriendo costos, pero el margen es reducido.";
    } else {
      statusAlertBox.classList.add("status-green");
      statusIcon.textContent = "🎉";
      statusTitle.textContent = "¡EXCELENTE! Tu negocio está bien equilibrado";
      statusDesc.textContent = "Tienes un buen margen de contribución por unidad.";
    }
  }

  function initEquilibrioChart() {
    if (typeof Chart === "undefined") return;
    const canvas = document.getElementById("equilibrioChart");
    if (!canvas) return;

    equilibrioChart = new Chart(canvas.getContext("2d"), {
      type: "line",
      data: {
        labels: [0,20,40,60,80,100,120],
        datasets: [
          {label:"Ingresos Totales ($)",data:[0,500,1000,1500,2000,2500,3000],borderColor:"#3d5afe",backgroundColor:"rgba(61,90,254,.1)",fill:true,tension:.1},
          {label:"Costos Totales ($)",data:[1200,1400,1600,1800,2000,2200,2400],borderColor:"#d32f2f",borderDash:[5,5],fill:false,tension:.1}
        ]
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        scales:{x:{title:{display:true,text:"Unidades Vendidas"}},y:{title:{display:true,text:"Monto ($)"}}}
      }
    });
  }

  function updateEquilibrioChart(costosFijos, precioVenta, costoVariable, unidadesEquilibrio) {
    if (!equilibrioChart) return;

    const maxUnits = Math.max(unidadesEquilibrio * 2, 50);
    const step = Math.ceil(maxUnits / 6);
    const labels = [], ingresos = [], costos = [];

    for (let i=0;i<=6;i++) {
      const u = i * step;
      labels.push(u);
      ingresos.push(u * precioVenta);
      costos.push(costosFijos + u * costoVariable);
    }

    equilibrioChart.data.labels = labels;
    equilibrioChart.data.datasets[0].data = ingresos;
    equilibrioChart.data.datasets[1].data = costos;
    equilibrioChart.update();
  }

  [costosFijosInput, precioVentaInput, costoVariableInput].forEach(el => {
    el.addEventListener("input", updateBreakeven);
  });

  saveEquilibrioBtn.addEventListener("click", async () => {
    if (!currentUser) return;

    const costosFijos = parseFloat(costosFijosInput.value) || 0;
    const precioVenta = parseFloat(precioVentaInput.value) || 0;
    const costoVariable = parseFloat(costoVariableInput.value) || 0;
    const margen = precioVenta - costoVariable;
    const unidades = margen > 0 ? Math.ceil(costosFijos / margen) : 0;
    const ventas = unidades * precioVenta;

    const resultado = {
      costos_fijos: costosFijos,
      precio_venta: precioVenta,
      costo_variable: costoVariable,
      margen_contribucion: margen,
      unidades_equilibrio: unidades,
      ventas_equilibrio: ventas
    };

    const { error } = await supabaseClient.from("resultados").upsert({
      user_id: currentUser.id,
      tipo: "punto_equilibrio",
      resultado
    }, { onConflict: "user_id,tipo" });

    showMessage(saveEquilibrioMessage, error ? "Error: " + error.message : "✅ Resultado guardado correctamente.", !!error);
  });

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
      precioVentaInput.value = equilibrio.precio_venta ?? 25;
      costoVariableInput.value = equilibrio.costo_variable ?? 10;
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
