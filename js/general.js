export function initPublicaciones(categoriaId) {
  iniciarPublicaciones(categoriaId);
}
async function iniciarPublicaciones(categoriaId) {
  const token=localStorage.getItem("token");
  const logoutBtn=document.getElementById("logoutBtn");
  const btnAgregar=document.getElementById("btnAgregarPublicacion");
  const sectionForm=document.getElementById("publicacionSection");
  const formPublicacion=document.getElementById("formPublicacion");
  const btnGuardar=formPublicacion?.querySelector('button[type="submit"]');
  let usuarioEmail=null;
  let usuarioId=null;
  let enviandoPublicacion=false;
  if(token){
    try{
      const payload=JSON.parse(atob(token.split(".")[1]));
      usuarioEmail=payload.email;
      usuarioId=payload.id;
    }catch(err){console.error("Error al decodificar token:",err);}
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
        if(contenedor.children.length===0) contenedor.remove();
      },250);
    };
    mensajeElement.querySelector(".mensaje-alerta-cerrar").addEventListener("click",cerrar);
    setTimeout(cerrar,4000);
  }
  if(logoutBtn){
    logoutBtn.addEventListener("click",()=>{
      localStorage.removeItem("token");
      window.location.href="../index.html";
    });
  }
  function escaparHTML(texto){
    if(texto===null||texto===undefined)return "";
    return String(texto).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
  }
  function prepararUrl(url){
    if(!url)return "";
    url=String(url).trim();
    if(!url)return "";
    if(url.startsWith("http://")||url.startsWith("https://"))return url;
    return `https://${url}`;
  }
  async function cargarEstadisticas(){
    const contadorUsuarios=document.getElementById("contadorUsuarios");
    const contadorVisitas=document.getElementById("contadorVisitas");
    if(!contadorUsuarios&&!contadorVisitas)return;
    try{
      const esCategoria=categoriaId!==undefined&&categoriaId!==null;
      const body=esCategoria?{categoria_id:Number(categoriaId)}:{pagina:"index"};
      const parametro=esCategoria?`categoria_id=${encodeURIComponent(categoriaId)}`:"pagina=index";
      const respuestaVisita=await fetch("http://localhost:3000/api/estadisticas/visita",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      if(!respuestaVisita.ok){
        console.error("No se pudo registrar la visita:",await respuestaVisita.text());
        return;
      }
      const datosVisita=await respuestaVisita.json();
      if(contadorVisitas&&datosVisita.visitas!==undefined)contadorVisitas.textContent=Number(datosVisita.visitas).toLocaleString("es-AR");
      const headers={};
      if(token)headers.Authorization=`Bearer ${token}`;
      const respuestaEstadisticas=await fetch(`http://localhost:3000/api/estadisticas?${parametro}`,{method:"GET",headers});
      const data=await respuestaEstadisticas.json();
      if(!respuestaEstadisticas.ok){
        console.error("No se pudieron obtener las estadísticas:",data);
        return;
      }
      if(contadorUsuarios)contadorUsuarios.textContent=Number(data.usuarios||0).toLocaleString("es-AR");
      if(contadorVisitas)contadorVisitas.textContent=Number(data.visitas||0).toLocaleString("es-AR");
    }catch(error){console.error("Error al cargar estadísticas:",error);}
  }
  let nombreCategoria="";
  async function cargarCategoria(){
    if(categoriaId===undefined||categoriaId===null)return;
    try{
      const headers={};
      if(token)headers.Authorization=`Bearer ${token}`;
      const res=await fetch(`http://localhost:3000/api/categoria/${categoriaId}`,{headers});
      const data=await res.json();
      if(!res.ok){
        mostrarMensaje(data.error||"No se pudo obtener la categoría.","error");
        return;
      }
      nombreCategoria=data.nombre||data.nombre_categoria||"";
    }catch(error){
      console.error("Error al cargar categoría:",error);
      mostrarMensaje("No se pudo cargar la categoría.","error");
    }
  }
  function redimensionarImagen(file,maxSize=800){
    return new Promise((resolve,reject)=>{
      if(!file||!file.type.startsWith("image/")){resolve(file);return;}
      const imagen=new Image();
      const reader=new FileReader();
      reader.onload=e=>{
        imagen.onload=()=>{
          let ancho=imagen.width;
          let alto=imagen.height;
          if(ancho<=maxSize&&alto<=maxSize){resolve(file);return;}
          const escala=Math.min(maxSize/ancho,maxSize/alto);
          ancho=Math.round(ancho*escala);
          alto=Math.round(alto*escala);
          const canvas=document.createElement("canvas");
          canvas.width=ancho;
          canvas.height=alto;
          const ctx=canvas.getContext("2d");
          ctx.drawImage(imagen,0,0,ancho,alto);
          const tipo=file.type==="image/png"?"image/png":"image/jpeg";
          const calidad=tipo==="image/jpeg"?0.85:undefined;
          canvas.toBlob(blob=>{
            if(!blob){reject(new Error("No se pudo procesar la imagen."));return;}
            const extension=tipo==="image/png"?"png":"jpg";
            const nombreOriginal=file.name.replace(/\.[^/.]+$/,"");
            resolve(new File([blob],`${nombreOriginal}.${extension}`,{type:tipo,lastModified:Date.now()}));
          },tipo,calidad);
        };
        imagen.onerror=()=>reject(new Error("No se pudo leer la imagen."));
        imagen.src=e.target.result;
      };
      reader.onerror=()=>reject(new Error("No se pudo leer el archivo."));
      reader.readAsDataURL(file);
    });
  }
  function crearVisorFoto(){
    if(document.getElementById("visorFoto"))return;
    const visor=document.createElement("div");
    visor.id="visorFoto";
    visor.className="visor-foto";
    visor.innerHTML=`<button type="button" class="visor-foto-cerrar" aria-label="Cerrar">&times;</button><img id="visorFotoImagen" src="" alt="Imagen ampliada">`;
    document.body.appendChild(visor);
    const cerrar=()=>{
      visor.classList.remove("activo");
      document.body.classList.remove("visor-abierto");
      const imagen=document.getElementById("visorFotoImagen");
      if(imagen)imagen.src="";
    };
    visor.addEventListener("click",e=>{if(e.target===visor)cerrar();});
    visor.querySelector(".visor-foto-cerrar").addEventListener("click",cerrar);
    document.getElementById("visorFotoImagen").addEventListener("click",e=>e.stopPropagation());
    document.addEventListener("keydown",e=>{if(e.key==="Escape"&&visor.classList.contains("activo"))cerrar();});
  }
  function abrirVisorFoto(url,alt="Imagen ampliada"){
    crearVisorFoto();
    const visor=document.getElementById("visorFoto");
    const imagen=document.getElementById("visorFotoImagen");
    if(!visor||!imagen)return;
    imagen.src=url;
    imagen.alt=alt;
    visor.classList.add("activo");
    document.body.classList.add("visor-abierto");
  }
  function activarVisoresFotos(){
    document.querySelectorAll(".publicacion-foto").forEach(foto=>{
      foto.addEventListener("click",()=>abrirVisorFoto(foto.src,foto.alt||"Imagen ampliada"));
    });
  }
  async function eliminarPublicacion(id,boton){
    const confirmar=confirm("¿Seguro que querés eliminar esta publicación?\nTambién se eliminarán sus fotos.");
    if(!confirmar)return;
    boton.disabled=true;
    boton.textContent="Eliminando...";
    try{
      const res=await fetch(`http://localhost:3000/api/publicacion/${id}`,{method:"DELETE",headers:{Authorization:`Bearer ${token}`}});
      const data=await res.json();
      if(!res.ok){
        mostrarMensaje(data.error||data.msg||"No se pudo eliminar la publicación.","error");
        boton.disabled=false;
        boton.textContent="Eliminar publicación";
        return;
      }
      mostrarMensaje(data.msg||"Publicación eliminada correctamente.","exito");
      await cargarPublicaciones();
    }catch(error){
      console.error("Error al eliminar publicación:",error);
      mostrarMensaje("No se pudo eliminar la publicación.","error");
      boton.disabled=false;
      boton.textContent="Eliminar publicación";
    }
  }
  async function cargarPublicaciones(){
    if(categoriaId===undefined||categoriaId===null)return;
    try{
      const headers={};
      if(token)headers.Authorization=`Bearer ${token}`;
      const res=await fetch(`http://localhost:3000/api/publicacion?categoria_id=${categoriaId}`,{headers});
      const data=await res.json();
      const container=document.getElementById("publicacionesContainer");
      if(!container)return;
      container.innerHTML="";
      if(!res.ok){container.innerHTML="<p>Error al cargar publicaciones.</p>";return;}
      if(!Array.isArray(data)||data.length===0){container.innerHTML="<p>No hay publicaciones aún.</p>";return;}
      data.forEach(pub=>{
        const card=document.createElement("div");
        card.classList.add("publicacion-card");
        const descripcion=escaparHTML(pub.descripcion||"");
        const categoria=escaparHTML(pub.categoria_nombre||nombreCategoria||"");
        const nombre=escaparHTML(pub.usuario_nombre||"");
        const apellido=escaparHTML(pub.usuario_apellido||"");
        const email=escaparHTML(pub.usuario_email||"");
        const celular=escaparHTML(pub.celular||"");
        const facebookUrl=prepararUrl(pub.facebook);
        const instagramUrl=prepararUrl(pub.instagram);
        const localidad=escaparHTML(pub.localidad||"");
        const tiktokUrl=prepararUrl(pub.tiktok);
        const fecha=pub.fecha?new Date(pub.fecha).toLocaleString("es-AR"):"";
        let fotosHTML="";
        if(pub.url_foto1)fotosHTML+=`<img src="${escaparHTML(pub.url_foto1)}" alt="Foto 1" class="publicacion-foto foto1">`;
        if(pub.url_foto2)fotosHTML+=`<img src="${escaparHTML(pub.url_foto2)}" alt="Foto 2" class="publicacion-foto foto2">`;
        const puedeEliminar=usuarioId!==null&&Number(pub.usuario_id)===Number(usuarioId);
        card.innerHTML=`${descripcion?`<div class="publicacion-descripcion"><strong>Descripción: </strong>${descripcion}</div>`:""}<div class="publicacion-info"><div class="publicacion-dato"><strong>Categoría:</strong>${categoria||"No informada"}</div><div class="publicacion-dato"><strong>Nombre y Apellido:</strong>${nombre} ${apellido}</div><div class="publicacion-dato"><strong>Email:</strong>${email||"No informado"}</div><div class="publicacion-dato"><strong>Celular:</strong>${celular||"No informado"}</div><div class="publicacion-dato"><strong>Localidad:</strong>${localidad||"No informada"}</div><div class="publicacion-dato"><strong>Facebook:</strong>${facebookUrl?`<a href="${escaparHTML(facebookUrl)}" target="_blank" rel="noopener noreferrer">${escaparHTML(facebookUrl)}</a>`:"No informado"}</div><div class="publicacion-dato"><strong>Instagram:</strong>${instagramUrl?`<a href="${escaparHTML(instagramUrl)}" target="_blank" rel="noopener noreferrer">${escaparHTML(instagramUrl)}</a>`:"No informado"}</div><div class="publicacion-dato"><strong>TikTok:</strong>${tiktokUrl?`<a href="${escaparHTML(tiktokUrl)}" target="_blank" rel="noopener noreferrer">${escaparHTML(tiktokUrl)}</a>`:"No informado"}</div>${fecha?`<div class="publicacion-fecha">Fecha: ${fecha}</div>`:""}</div>${fotosHTML?`<div class="publicacion-fotos">${fotosHTML}</div>`:""}${puedeEliminar?`<div class="publicacion-acciones"><button type="button" class="btn-eliminar-publicacion" data-id="${pub.id}">Eliminar publicación</button></div>`:""}`;
        container.appendChild(card);
        const btnEliminar=card.querySelector(".btn-eliminar-publicacion");
        if(btnEliminar)btnEliminar.addEventListener("click",()=>eliminarPublicacion(btnEliminar.dataset.id,btnEliminar));
      });
      activarVisoresFotos();
    }catch(error){
      console.error("Error al cargar publicaciones:",error);
      const container=document.getElementById("publicacionesContainer");
      if(container)container.innerHTML="<p>No se pudieron cargar las publicaciones.</p>";
      mostrarMensaje("No se pudieron cargar las publicaciones.","error");
    }
  }
  if(btnAgregar){
    btnAgregar.addEventListener("click",()=>{
      if(sectionForm)sectionForm.style.display="block";
      const usuarioInput=document.getElementById("usuarioEmail");
      if(usuarioInput){
        usuarioInput.value=usuarioEmail||"";
        usuarioInput.readOnly=true;
      }
      const select=document.getElementById("categoria");
      if(select){
        select.innerHTML="";
        const option=document.createElement("option");
        option.value=categoriaId;
        option.textContent=nombreCategoria||"Cargando categoría...";
        option.selected=true;
        option.disabled=true;
        select.appendChild(option);
      }
      const selectLocalidad=document.getElementById("localidad");
      if(selectLocalidad){
        selectLocalidad.innerHTML="";
        const localidades=[{valor:"San Antonio Oeste",texto:"San Antonio Oeste"},{valor:"Las Grutas",texto:"Las Grutas"},{valor:"San Antonio Este",texto:"San Antonio Este"}];
        const opcionInicial=document.createElement("option");
        opcionInicial.value="";
        opcionInicial.textContent="Seleccionar localidad";
        opcionInicial.disabled=true;
        opcionInicial.selected=true;
        selectLocalidad.appendChild(opcionInicial);
        localidades.forEach(localidad=>{
          const option=document.createElement("option");
          option.value=localidad.valor;
          option.textContent=localidad.texto;
          selectLocalidad.appendChild(option);
        });
      }
    });
  }
  if(formPublicacion){
    formPublicacion.addEventListener("submit",async e=>{
      e.preventDefault();
      if(enviandoPublicacion){
        mostrarMensaje("La publicación ya se está guardando. Esperá un momento.","advertencia");
        return;
      }
      enviandoPublicacion=true;
      if(btnGuardar){
        btnGuardar.disabled=true;
        btnGuardar.dataset.textoOriginal=btnGuardar.textContent;
        btnGuardar.textContent="Procesando imágenes...";
        btnGuardar.style.opacity=".7";
        btnGuardar.style.cursor="wait";
      }
      try{
        const localidad=document.getElementById("localidad")?.value||"";
        if(!localidad){
          mostrarMensaje("Debés seleccionar una localidad.","advertencia");
          return;
        }
        const formData=new FormData();
        formData.append("categoria_id",categoriaId);
        formData.append("celular",document.getElementById("celular")?.value||"");
        formData.append("facebook",prepararUrl(document.getElementById("facebook")?.value||""));
        formData.append("instagram",prepararUrl(document.getElementById("instagram")?.value||""));
        formData.append("localidad",localidad);
        formData.append("tiktok",prepararUrl(document.getElementById("tiktok")?.value||""));
        formData.append("descripcion",document.getElementById("descripcion")?.value||"");
        const foto1=document.getElementById("foto1")?.files[0];
        const foto2=document.getElementById("foto2")?.files[0];
        if(foto1)formData.append("foto1",await redimensionarImagen(foto1,800));
        if(foto2)formData.append("foto2",await redimensionarImagen(foto2,800));
        if(btnGuardar)btnGuardar.textContent="Guardando...";
        const res=await fetch("http://localhost:3000/api/publicacion",{method:"POST",headers:{Authorization:`Bearer ${token}`},body:formData});
        const data=await res.json();
        if(!res.ok){
          mostrarMensaje(Array.isArray(data.error)?data.error.join(" "):data.error||"Error al crear la publicación.","error");
          return;
        }
        mostrarMensaje(data.msg||"Publicación creada correctamente.","exito");
        formPublicacion.reset();
        if(sectionForm)sectionForm.style.display="none";
        await cargarPublicaciones();
      }catch(error){
        console.error(error);
        mostrarMensaje(error.message||"No se pudo crear la publicación.","error");
      }finally{
        if(btnGuardar){
          btnGuardar.disabled=false;
          btnGuardar.textContent=btnGuardar.dataset.textoOriginal||"Guardar publicación";
          btnGuardar.style.opacity="";
          btnGuardar.style.cursor="";
        }
        enviandoPublicacion=false;
      }
    });
  }
  await cargarEstadisticas();
  await cargarCategoria();
  await cargarPublicaciones();
}