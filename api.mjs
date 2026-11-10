export async function pedirPaletaAPI(colorIngresado) {
  const colorLimpio = colorIngresado.trim();
  const colorCodificado = encodeURIComponent(colorLimpio);

  // Consulta a nuestro propio backend Express
  const respuesta = await fetch(`https://paleta-colores.onrender.com/api/paleta?color=${colorCodificado}`);

  // Validar respuesta.ok explícitamente
  if (respuesta.ok === false) {
    throw new Error(`Error en la petición: status ${respuesta.status}`);
  }

  const datos = await respuesta.json();

  if (!datos || !Array.isArray(datos.listaColores)) {
    throw new Error('La respuesta de la API no contiene una estructura válida de colores.');
  }

  return datos.listaColores;
}