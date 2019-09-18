var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'dl94585854',
  database : 'fintech'
});
 
connection.connect();
 
connection.query('SELECT * from user', function (error, results, fields) {
  if (error) throw error;
  console.log(results);
});
 
connection.end();

// mysql> ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'dl94585854';