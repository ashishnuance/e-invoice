const mysql = require("mysql");
const dbConfig = require("../config/db.config.js");

var connection = mysql.createConnection({
  host: dbConfig.invoice.HOST,
  user: dbConfig.invoice.USER,
  password: dbConfig.invoice.PASSWORD,
  database: dbConfig.invoice.DB,
  port:dbConfig.invoice.PORT
});

// connection.connect(function(err) {
//   if (err) {
//     console.log('error connect',err);
//   }else{
//   console.log("Connected!");
//   }
// });

module.exports = connection;