const mysql = require('mysql')

const connection = mysql.createConnection({
  host: 'localhost',
  password: '1234',
  user: 'root',
  database: 'checkpoint'
})

module.exports = connection;