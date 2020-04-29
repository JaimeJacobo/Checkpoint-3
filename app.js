const express = require('express');
const chalk = require('chalk')
const PORT = process.env.PORT || 5555
const database = require('./conf')
const bodyParser = require('body-parser')
const app = express();

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/', (req, res)=>{
  database.query('DESCRIBE track', (error, results)=>{
    error
    ? res.status(400).send(error)
    : res.status(200).send(results)
  })
})

app.listen(PORT, ()=>{
  console.log(chalk.green.inverse.bold(`Conectado al puerto ${PORT}`))
})

//1. Ruta POST para crear un nuevo playlist
app.post('/crear-playlist', (req, res)=>{
  database.query('INSERT INTO playlist SET ?', req.body, (error, results)=>{
    error
    ? res.status(400).send(error)
    : database.query('SELECT * FROM playlist WHERE title=?', req.body.title, (error, results)=>{
      error
      ? res.status(404).send(error)
      : res.status(201).send(results)
    })
  })
})

//2. Ruta GET para ver una playlist por su ID
app.get('/playlist/:id', (req, res)=>{
  database.query('SELECT * FROM playlist WHERE id=?', req.params.id, (error, results)=>{
    error
    ? res.status(404).send(error)
    : res.status(200).send(results)
  })
})


//3. Ruta POST para crear una canción
app.post('/crear-cancion', (req, res)=>{
  database.query('INSERT INTO track SET ?', req.body, (error, results)=>{
    error
    ? res.status(400).send(error)
    : database.query('SELECT * FROM track WHERE title=?', req.body.title, (error, results)=>{
      error
      ? res.status(404).send(error)
      : res.status(201).send(results)
    })
  })
})

//4. Ruta GET para ver todas las canciones de una playlist
app.get('/ver-canciones-playlist/:id', (req, res)=>{
  database.query('SELECT * FROM track WHERE playlist_id=?', req.params.id, (error, results)=>{
    error
    ? res.status(404).send(error)
    : res.status(200).send(results)
  })
})

//5. Ruta DELETE para eliminar una playlist
app.delete('/borrar-playlist/:id', (req, res)=>{
  database.query('DELETE FROM playlist WHERE id=?', req.params.id, (error, results)=>{
    if(results.affectedRows === 0){
      res.status(404).send(error)
    } else {
      error
      ? res.status(400).send(error)
      : res.status(204).send()      
    }
  })
})

//6. Ruta PUT para editar una playlist
app.put('/editar-playlist/:id', (req, res)=>{
  database.query('UPDATE playlist SET ? WHERE id=?', [req.body, req.params.id], (error, results)=>{
    error
    ? res.status(400).send(error)
    : res.status(200).redirect(`/playlist/${req.params.id}`)
  })
})

//7. Ruta PUT para eliminar una cancion de una playlist
app.put('/eliminar-cancion-de-playlist/:id', (req, res)=>{
  database.query('UPDATE track SET playlist_id=0 WHERE id=?', req.params.id, (error, results)=>{
    error
    ? res.status(404).send(error)
    : database.query('SELECT * FROM track WHERE id=?', req.params.id, (error, results)=>{
      error
      ? res.status(404).send(error)
      : res.status(200).send(results)
    })
  })
})

//8. Ruta PUT para editar una cancion de una playlist
app.put('/editar-cancion/:id', (req, res)=>{
  database.query('SELECT playlist_id FROM track WHERE id=?', req.params.id, (error, results)=>{
    if(error){
      res.status(400).send(error)
    } else if(results[0].playlist_id === 0){
      res.status(400).send('No puedes editar una canción que no esté asociada a ninguna playlist')
    } else {
      database.query('UPDATE track SET ? WHERE id=?', [req.body, req.params.id], (error, results)=>{
        error
        ? res.status(400).send(error)
        : res.status(200).send(results)
      })
    }
  })
})


//Ruta GET para los enlaces que no existan
app.get('*', (req, res)=>{
  res.send('Esta página no existe')
})