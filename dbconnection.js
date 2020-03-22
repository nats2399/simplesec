const mysql = require('mysql');
//set mysql.createConnection({multipleStatements: true});

const connection = mysql.createConnection({
  host: 'ecomm.cyki9aftedjq.us-east-1.rds.amazonaws.com',
  user: 'admin',
  password: 'stmary123',
  database: 'ecomm'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('MySQL Connected!');  
});

module.exports = connection;