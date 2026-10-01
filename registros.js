document.addEventListener("DOMContentLoaded", async () => {
  const SUPABASE_URL = "https://kxrieopyitsbhykbplkt.supabase.co";
  const SUPABASE_KEY = "sb_publishable_mkVLpbgyZvhQubSATwytag_ofnHwT7E";
  const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  const usersBody = document.getElementById("usersBody");
  const message = document.getElementById("message");

  document.getElementById("backBtn").addEventListener("click", () => {
    window.location.href = "index.html";
  });

  const { data: sessionData } = await supabaseClient.auth.getSession();
  if (!sessionData.session) {
    window.location.href = "index.html";
    return;
  }

  const { data: isAdmin, error: adminError } = await supabaseClient.rpc("is_admin");
  if (adminError || !isAdmin) {
    message.textContent = "Acceso denegado. Esta pantalla es solo para administradores.";
    message.className = "status-warn";
    return;
  }

  await loadUsers();

  async function loadUsers() {
    message.textContent = "Cargando usuarios...";
    const { data, error } = await supabaseClient
      .from("admin_registros")
      .select("*")
      .order("created_at", { ascending:false });

    if (error) {
      message.textContent = "Error al cargar los registros: " + error.message;
      message.className = "status-warn";
      return;
    }

    usersBody.innerHTML = "";

    if (!data?.length) {
      usersBody.innerHTML = '<tr><td colspan="6" class="empty">No hay usuarios registrados.</td></tr>';
      message.textContent = "0 usuarios";
      return;
    }

    data.forEach(user => {
      const tr = document.createElement("tr");
      const separar = user.separar_dinero || null;
      const equilibrio = user.punto_equilibrio || null;

      const separarText = separar
        ? `Ingresos: $${Number(separar.ingresos || 0).toFixed(2)}<br>Sueldo: ${separar.sueldo_porcentaje || 0}%<br>Reinversión: ${separar.reinversion_porcentaje || 0}%`
        : "Sin guardar";

      const equilibrioText = equilibrio
        ? `${Array.isArray(equilibrio.productos) ? "Productos: " + equilibrio.productos.length + "<br>" : ""}Equilibrio: ${equilibrio.unidades_equilibrio || 0} uds<br>Ventas: $${Number(equilibrio.ventas_equilibrio || 0).toFixed(2)}`
        : "Sin guardar";

      tr.innerHTML = `
        <td><strong>${escapeHtml(user.full_name || "Sin nombre")}</strong></td>
        <td>${escapeHtml(user.email || "")}</td>
        <td>${separarText}</td>
        <td>${equilibrioText}</td>
        <td>${user.updated_at ? new Date(user.updated_at).toLocaleString() : "-"}</td>
        <td><button class="danger" data-id="${user.user_id}" data-email="${escapeHtml(user.email || "")}">Eliminar</button></td>
      `;
      usersBody.appendChild(tr);
    });

    message.textContent = `${data.length} usuario(s)`;
    message.className = "status-ok";

    usersBody.querySelectorAll(".danger").forEach(btn => {
      btn.addEventListener("click", async () => {
        const userId = btn.dataset.id;
        const email = btn.dataset.email;

        if (!confirm(`¿Eliminar la cuenta ${email} y sus resultados? Esta acción no se puede deshacer.`)) return;

        btn.disabled = true;
        btn.textContent = "Eliminando...";

        const { data: result, error } = await supabaseClient.functions.invoke("delete-user", {
          body: { user_id: userId }
        });

        if (error || result?.error) {
          alert("No se pudo eliminar: " + (result?.error || error.message));
          btn.disabled = false;
          btn.textContent = "Eliminar";
          return;
        }

        await loadUsers();
      });
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }
});

