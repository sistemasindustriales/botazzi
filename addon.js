const { addonBuilder } = require('stremio-addon-sdk');
const fs = require('fs');
const path = require('path');

const manifest = require('./manifest.json');

const builder = new addonBuilder(manifest);

// Función para cargar metadatos desde archivos JSON
function loadMetadata(type, id) {
  try {
    const filePath = path.join(__dirname, type, `${id}.json`);
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return null;
  }
}

// Función para listar todos los IDs disponibles
function listAllIds(type) {
  const dirPath = path.join(__dirname, type);
  try {
    const files = fs.readdirSync(dirPath);
    return files.map(file => file.replace('.json', ''));
  } catch (err) {
    return [];
  }
}

// Handler para el catálogo
builder.defineCatalogHandler(({ type, id, extra }) => {
  if (id !== 'movies' && id !== 'series') {
    return Promise.resolve({ metas: [] });
  }

  const ids = listAllIds(type);
  const metas = ids.map(id => {
    const data = loadMetadata(type, id);
    return data?.meta || { id: `tt${id}`, type };
  }).filter(Boolean);

  return Promise.resolve({ metas });
});

// Handler para los metadatos
builder.defineMetaHandler(({ type, id }) => {
  if (!id.startsWith('tt')) {
    return Promise.resolve({ meta: null });
  }

  const cleanId = id.replace('tt', '');
  const data = loadMetadata(type, cleanId);
  return Promise.resolve(data?.meta ? { meta: data.meta } : { meta: null });
});

// Handler para los streams
builder.defineStreamHandler(({ type, id }) => {
  if (!id.startsWith('tt')) {
    return Promise.resolve({ streams: [] });
  }

  const cleanId = id.replace('tt', '');
  const data = loadMetadata(type, cleanId);
  
  if (!data || !data.streams) {
    return Promise.resolve({ streams: [] });
  }

  // Mapear los streams para asegurar compatibilidad
  const streams = data.streams.map(stream => ({
    title: stream.title,
    url: stream.url,
    behaviorHints: {
      notWebReady: stream.type === 'hls' ? false : true
    }
  }));

  return Promise.resolve({ streams });
});

module.exports = builder.getInterface();