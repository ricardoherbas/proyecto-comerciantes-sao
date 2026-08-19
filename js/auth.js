import { supabase } from "./supabase.js";
console.log("AUTH.JS CARGADO");
document.addEventListener("DOMContentLoaded",async()=>{
  console.log("DOMContentLoaded EJECUTADO EN AUTH");
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
  const pagina=obtenerNombrePagina();
  console.log("Página detectada:",pagina);
  if(pagina==="index"){
    console.log("Ejecutando estadísticas del INDEX");
    await registrarVisitaIndex();
    await cargarEstadisticasGenerales();
  }
});
async function registrarVisitaIndex(){
  console.log("Entró registrarVisitaIndex");
  const claveVisita="visita_index";
  if(sessionStorage.getItem(claveVisita)){
    console.log("La visita ya fue registrada en esta sesión");
    return;
  }
  try{
    const {data,error}=await supabase.rpc("registrar_visita_index");
    console.log("Respuesta registrar_visita_index:",data);
    console.log("Error registrar_visita_index:",error);
    if(error)throw error;
    const resultado=typeof data==="string"?JSON.parse(data):data;
    sessionStorage.setItem(claveVisita,"1");
    const contadorVisitas=document.getElementById("contadorVisitas");
    if(contadorVisitas&&resultado?.visitas!==undefined){
      contadorVisitas.textContent=Number(resultado.visitas).toLocaleString("es-AR");
      console.log("Visitas mostradas:",resultado.visitas);
    }
  }catch(error){
    console.error("ERROR registrarVisitaIndex:",error);
  }
}
async function cargarEstadisticasGenerales(){
  console.log("Entró cargarEstadisticasGenerales");
  const contadorUsuarios=document.getElementById("contadorUsuarios");
  const contadorVisitas=document.getElementById("contadorVisitas");
  try{
    const {data,error}=await supabase.rpc("obtener_estadisticas_generales");
    console.log("Respuesta obtener_estadisticas_generales:",data);
    console.log("Error obtener_estadisticas_generales:",error);
    if(error)throw error;
    const estadisticas=typeof data==="string"?JSON.parse(data):data;
    if(contadorUsuarios){
      contadorUsuarios.textContent=Number(estadisticas?.usuarios||0).toLocaleString("es-AR");
      console.log("Usuarios mostrados:",estadisticas?.usuarios);
    }
    if(contadorVisitas){
      contadorVisitas.textContent=Number(estadisticas?.visitas||0).toLocaleString("es-AR");
      console.log("Visitas generales mostradas:",estadisticas?.visitas);
    }
  }catch(error){
    console.error("ERROR cargarEstadisticasGenerales:",error);
  }
}
function obtenerNombrePagina(){
  const ruta=window.location.pathname.toLowerCase();
  if(ruta.endsWith("/")||ruta.endsWith("/index.html"))return "index";
  const archivo=ruta.split("/").pop();
  if(!archivo)return "index";
  return archivo.replace(".html","").replace(/[^a-z0-9_-]/g,"_");
}