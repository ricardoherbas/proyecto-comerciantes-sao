document.addEventListener("DOMContentLoaded",async()=>{
  const token=localStorage.getItem("token");
  const navSalir=document.getElementById("navSalir");
  const navAgregar=document.getElementById("navAgregar");
  if(token){
    if(navSalir)navSalir.style.display="block";
    if(navAgregar)navAgregar.style.display="block";
  }else{
    if(navSalir)navSalir.style.display="none";
    if(navAgregar)navAgregar.style.display="none";
  }
  await registrarVisita();
  await cargarEstadisticasSitio();
});
async function registrarVisita(){
  const pagina=obtenerNombrePagina();
  if(pagina!=="index")return;
  const claveVisita=`visita_${pagina}`;
  if(sessionStorage.getItem(claveVisita))return;
  try{
    const res=await fetch("http://localhost:3000/api/estadisticas/visita",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({pagina:"index"})
    });
    if(!res.ok)throw new Error(`HTTP ${res.status}`);
    sessionStorage.setItem(claveVisita,"1");
  }catch(error){
    console.error("Error al registrar visita:",error);
  }
}
async function cargarEstadisticasSitio(){
  const contadorUsuarios=document.getElementById("contadorUsuarios");
  const contadorVisitas=document.getElementById("contadorVisitas");
  if(!contadorUsuarios&&!contadorVisitas)return;
  try{
    const res=await fetch("http://localhost:3000/api/estadisticas?pagina=index");
    const data=await res.json();
    if(!res.ok)throw new Error(data.error||`HTTP ${res.status}`);
    if(contadorUsuarios)contadorUsuarios.textContent=Number(data.usuarios||0).toLocaleString("es-AR");
    if(contadorVisitas)contadorVisitas.textContent=Number(data.visitas||0).toLocaleString("es-AR");
  }catch(error){
    console.error("Error al cargar estadísticas:",error);
  }
}
function obtenerNombrePagina(){
  const ruta=window.location.pathname.toLowerCase();
  if(ruta.endsWith("/")||ruta.endsWith("/index.html"))return "index";
  const archivo=ruta.split("/").pop();
  if(!archivo)return "index";
  return archivo.replace(".html","").replace(/[^a-z0-9_-]/g,"_");
}