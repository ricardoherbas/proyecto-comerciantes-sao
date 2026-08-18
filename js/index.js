document.addEventListener("DOMContentLoaded",()=>{
  const loginForm=document.getElementById("loginForm");
  const loginSection=document.getElementById("login");
  const pasosPublicar=document.getElementById("pasosPublicar");
  const modoEdicion=document.getElementById("modoEdicion");
  const navSalir=document.getElementById("navSalir");
  const logoutBtn=document.getElementById("logoutBtn");
  const token=localStorage.getItem("token");
  function escaparHTML(texto){
    if(texto===null||texto===undefined)return "";
    return String(texto).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
  }
  function mostrarMensaje(mensaje,tipo="exito"){
    let contenedor=document.getElementById("contenedorMensajes");
    if(!contenedor){
      contenedor=document.createElement("div");
      contenedor.id="contenedorMensajes";
      document.body.appendChild(contenedor);
    }
    const mensajeElement=document.createElement("div");
    mensajeElement.className=`mensaje-alerta ${tipo}`;
    const iconos={exito:"✓",error:"!",advertencia:"⚠",info:"i"};
    mensajeElement.innerHTML=`<span class="mensaje-alerta-icono">${iconos[tipo]||"i"}</span><span class="mensaje-alerta-texto">${escaparHTML(mensaje)}</span><button type="button" class="mensaje-alerta-cerrar" aria-label="Cerrar">&times;</button>`;
    contenedor.appendChild(mensajeElement);
    requestAnimationFrame(()=>mensajeElement.classList.add("mostrar"));
    const cerrar=()=>{
      mensajeElement.classList.remove("mostrar");
      setTimeout(()=>{
        mensajeElement.remove();
        if(contenedor.children.length===0)contenedor.remove();
      },250);
    };
    mensajeElement.querySelector(".mensaje-alerta-cerrar").addEventListener("click",cerrar);
    setTimeout(cerrar,4000);
  }
  function mostrarModoEdicion(){
    if(loginSection)loginSection.style.display="none";
    if(pasosPublicar)pasosPublicar.style.display="none";
    if(modoEdicion)modoEdicion.style.display="flex";
  }
  function ocultarModoEdicion(){
    if(modoEdicion)modoEdicion.style.display="none";
    if(pasosPublicar)pasosPublicar.style.display="block";
  }
  if(token){
    if(navSalir)navSalir.style.display="block";
    mostrarModoEdicion();
  }else{
    if(navSalir)navSalir.style.display="none";
    ocultarModoEdicion();
    if(loginSection)loginSection.style.display="block";
  }
  if(loginForm){
    loginForm.addEventListener("submit",async e=>{
      e.preventDefault();
      const email=loginForm.email.value.trim();
      const password=loginForm.password.value;
      if(!email||!password){
        mostrarMensaje("Completá el email y la contraseña.","advertencia");
        return;
      }
      try{
        const response=await fetch("https://back-proyecto-comerciantes-sao.onrender.com/api/login",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({email,password})
        });
        let data={};
        try{
          data=await response.json();
        }catch{
          data={};
        }
        if(!response.ok){
          mostrarMensaje(data.error||"Credenciales inválidas.","error");
          return;
        }
        localStorage.setItem("token",data.token);
        if(navSalir)navSalir.style.display="block";
        mostrarModoEdicion();
        loginForm.reset();
        mostrarMensaje("Login exitoso. ¡Bienvenido!","exito");
      }catch(error){
        console.error("Error en login:",error);
        mostrarMensaje("Error de conexión con el servidor.","error");
      }
    });
  }
  if(logoutBtn){
    logoutBtn.addEventListener("click",()=>{
      localStorage.removeItem("token");
      if(navSalir)navSalir.style.display="none";
      ocultarModoEdicion();
      if(loginSection)loginSection.style.display="block";
      mostrarMensaje("Sesión cerrada.","info");
    });
  }
});