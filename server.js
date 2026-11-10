import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Diccionario de respaldo para entradas de texto en español
const coloresDiccionario = {
  rojo: 'FF0000', azul: '0000FF', verde: '008000', amarillo: 'FFFF00',
  naranja: 'FFA500', morado: '800080', rosa: 'FFC0CB', negro: '000000',
  blanco: 'FFFFFF', gris: '808080', cafe: 'A52A2A', turquesa: '40E0D0'
};

app.get('/api/paleta', async (req, res) => {
  try {
    const { color } = req.query;

    if (!color || typeof color !== 'string') {
      return res.status(400).json({ error: 'El parámetro color es obligatorio.' });
    }

    const colorLimpio = color.trim().toLowerCase();
    const colorSinHash = colorLimpio.startsWith('#') ? colorLimpio.slice(1) : colorLimpio;
    const colorHex = coloresDiccionario[colorSinHash] || colorSinHash;
    const hexCodificado = encodeURIComponent(colorHex);

    // Fetch hacia la API externa
    const respuestaAPI = await fetch(
      `https://www.thecolorapi.com/scheme?hex=${hexCodificado}&mode=monochrome&count=5`
    );

    // Verificación de respuesta.ok (Requerimiento de clase)
    if (!respuestaAPI.ok) {
      return res.status(respuestaAPI.status).json({ error: 'Error al consultar The Color API.' });
    }

    const datos = await respuestaAPI.json();

    if (!datos || !Array.isArray(datos.colors) || datos.colors.length === 0) {
      return res.status(404).json({ error: 'No se encontraron colores para el valor ingresado.' });
    }

    // Retorna arreglo limpio de códigos HEX de 6 dígitos
    const listaColores = datos.colors.map(item => item.hex.value);
    res.status(200).json({ listaColores });

  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor de Paletas ejecutándose en http://localhost:${PORT}`);
});