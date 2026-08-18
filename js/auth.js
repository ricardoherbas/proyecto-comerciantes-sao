import { supabase } from "./supabase.js";
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
  if(obtenerNombrePagina()==="index"){
    await registrarVisitaIndex();
    await cargarEstadisticasGenerales();
  }
});
async function registrarVisitaIndex(){
  const claveVisita="visita_index";
  if(sessionStorage.getItem(claveVisita))return;
  try{
    const {data,error}=await supabase.rpc("registrar_visita_index");
    if(error)throw error;
    sessionStorage.setItem(claveVisita,"1");
    const contadorVisitas=document.getElementById("contadorVisitas");
    if(contadorVisitas&&data?.visitas!==undefined){
      contadorVisitas.textContent=Number(data.visitas).toLocaleString("es-AR");
    }
  }catch(error){
    console.error("Error al registrar visita del index:",error);
  }
}
async function cargarEstadisticasGenerales(){
  const contadorUsuarios=document.getElementById("contadorUsuarios");
  const contadorVisitas=document.getElementById("contadorVisitas");
  if(!contadorUsuarios&&!contadorVisitas)return;
  try{
    const {data,error}=await supabase.rpc("obtener_estadisticas_generales");
    if(error)throw error;
    const estadisticas=typeof data==="string"?JSON.parse(data):data;
    if(contadorUsuarios){
      contadorUsuarios.textContent=Number(estadisticas?.usuarios||0).toLocaleString("es-AR");
    }
    if(contadorVisitas){
      contadorVisitas.textContent=Number(estadisticas?.visitas||0).toLocaleString("es-AR");
    }
  }catch(error){
    console.error("Error al cargar estadísticas generales:",error);
  }
}
function obtenerNombrePagina(){
  const ruta=window.location.pathname.toLowerCase();
  if(ruta.endsWith("/")||ruta.endsWith("/index.html"))return "index";
  const archivo=ruta.split("/").pop();
  if(!archivo)return "index";
  return archivo.replace(".html","").replace(/[^a-z0-9_-]/g,"_");
}