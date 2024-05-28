var mysql = require('mysql')
var con = mysql.createConnection({
    host: "127.0.0.2",
    user: "admin",
    password: "admin"
});

con.connect(function(err) {
    if(err) throw err
    console.log("connected")
    con.query("CREATE DATABASE plusbus",function (err, result) {
        if(err) throw err;
        console.log("database created") })
           })
