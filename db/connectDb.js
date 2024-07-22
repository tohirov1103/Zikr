const mysql = require('mysql2');

let connection = null;
const connectDb = (host,port, user, password, database) => {
    connection = mysql.createConnection({
    host: host,
    port:port,
    user: user,
    password: password,
    database: database,
  });
  return new Promise((resolve, reject) => {
    connection.connect((err) => {
      if (err) {
        reject(err);
      } else {
        resolve(connection);
      }
    });
  });
};
const getConnection = () => {
    if (!connection) {
      throw new Error('Database connection not established');
    }
    return connection;
  };
module.exports = {connectDb,getConnection};
