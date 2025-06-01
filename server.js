import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import 'dotenv/config'

// Para ES6 modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares
app.use(express.json())
app.use(express.static('.')) // Servir archivos estáticos desde la raíz

// Función lee repertorio.json
const leerRepertorio = () => {
  try {
    const data = fs.readFileSync('repertorio.json', 'utf8')
    return JSON.parse(data)
  } catch (error) {
    // Si el archivo no existe, devolver un array vacío
    return []
  }
}

// Función escribe repertorio.json
const escribirRepertorio = (canciones) => {
  fs.writeFileSync('repertorio.json', JSON.stringify(canciones, null, 2))
}

// Ruta GET / - Servir la página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

// Ruta GET /canciones - Obtener las canciones
app.get('/canciones', (req, res) => {
  try {
    const canciones = leerRepertorio()
    res.json(canciones)
  } catch (error) {
    res.status(500).json({ error: 'Error al leer el repertorio' })
  }
})

// Ruta POST /canciones - Agregar una nueva canción
app.post('/canciones', (req, res) => {
  try {
    const { id, titulo, artista, tono } = req.body

    // Validar que todos los campos
    if (!id || !titulo || !artista || !tono) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' })
    }

    const canciones = leerRepertorio()

    // Verificar ID no exista
    const existeCancion = canciones.find(cancion => cancion.id === id)
    if (existeCancion) {
      return res.status(400).json({ error: 'Ya existe una canción con ese ID' })
    }

    // Crear canción
    const nuevaCancion = {
      id,
      titulo,
      artista,
      tono
    }

    canciones.push(nuevaCancion)
    escribirRepertorio(canciones)

    res.status(201).json(nuevaCancion)
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar la canción' })
  }
})

// Ruta PUT /canciones/:id - Editar canción
app.put('/canciones/:id', (req, res) => {
  try {
    const { id } = req.params
    const { titulo, artista, tono } = req.body

    // Validar todos los campos
    if (!titulo || !artista || !tono) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' })
    }

    let canciones = leerRepertorio()

    // Buscar canción por ID
    const indiceCancion = canciones.findIndex(cancion => cancion.id == id)

    if (indiceCancion === -1) {
      return res.status(404).json({ error: 'Canción no encontrada' })
    }

    // Actualizar canción
    canciones[indiceCancion] = {
      id,
      titulo,
      artista,
      tono
    }

    escribirRepertorio(canciones)
    res.json(canciones[indiceCancion])
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la canción' })
  }
})

// Ruta DELETE /canciones/:id - Eliminar canción
app.delete('/canciones/:id', (req, res) => {
  try {
    const { id } = req.params
    let canciones = leerRepertorio()

    // Buscar canción por ID
    const indiceCancion = canciones.findIndex(cancion => cancion.id == id)

    if (indiceCancion === -1) {
      return res.status(404).json({ error: 'Canción no encontrada' })
    }

    // Eliminar canción
    const cancionEliminada = canciones.splice(indiceCancion, 1)[0]
    escribirRepertorio(canciones)

    res.json({ mensaje: 'Canción eliminada con éxito', cancion: cancionEliminada })
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la canción' })
  }
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`¡Servidor encendido en http://localhost:${PORT}!`)
})