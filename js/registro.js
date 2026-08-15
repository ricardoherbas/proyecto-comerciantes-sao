document.addEventListener("DOMContentLoaded", () => {
  const registroForm = document.getElementById("registroForm");

  function escaparHTML(texto) {
    if (texto === null || texto === undefined) return "";
    return String(texto)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function mostrarMensaje(mensaje, tipo = "exito") {
    let contenedor = document.getElementById("contenedorMensajes");

    if (!contenedor) {
      contenedor = document.createElement("div");
      contenedor.id = "contenedorMensajes";
      document.body.appendChild(contenedor);
    }

    const mensajeElement = document.createElement("div");
    mensajeElement.className = `mensaje-alerta ${tipo}`;

    const iconos = {
      exito: "✓",
      error: "!",
      advertencia: "⚠",
      info: "i"
    };

    mensajeElement.innerHTML = `
      <span class="mensaje-alerta-icono">${iconos[tipo] || "i"}</span>
      <span class="mensaje-alerta-texto">${escaparHTML(mensaje)}</span>
      <button type="button" class="mensaje-alerta-cerrar" aria-label="Cerrar">&times;</button>
    `;

    contenedor.appendChild(mensajeElement);

    requestAnimationFrame(() => {
      mensajeElement.classList.add("mostrar");
    });

    const cerrar = () => {
      mensajeElement.classList.remove("mostrar");

      setTimeout(() => {
        mensajeElement.remove();

        if (contenedor.children.length === 0) {
          contenedor.remove();
        }
      }, 250);
    };

    mensajeElement
      .querySelector(".mensaje-alerta-cerrar")
      .addEventListener("click", cerrar);

    setTimeout(cerrar, 4000);
  }

  if (!registroForm) return;

  registroForm.addEventListener("submit", async e => {
    e.preventDefault();

    const nombre = e.target.nombre.value.trim();
    const apellido = e.target.apellido.value.trim();
    const sexo = e.target.sexo.value;
    const email = e.target.email.value.trim();
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (password !== confirmPassword) {
      mostrarMensaje("Las contraseñas no coinciden.", "error");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/usuario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nombre,
          apellido,
          sexo,
          email,
          password
        })
      });

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (response.ok) {
        mostrarMensaje(
          "Usuario registrado correctamente.",
          "exito"
        );

        setTimeout(() => {
          window.location.href = "../index.html";
        }, 1500);

      } else {
        mostrarMensaje(
          data.error || "Error al registrar usuario.",
          "error"
        );
      }

    } catch (error) {
      console.error("Error en registro:", error);

      mostrarMensaje(
        "Error de conexión con el servidor.",
        "error"
      );
    }
  });
});
