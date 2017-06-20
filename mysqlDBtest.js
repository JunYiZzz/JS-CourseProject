var mysql = require('mysql');
var connection= mysql.createConnection({
host:'localhost',
user:'root',
password:'manager',
port:3306,
database:'mydb1'
});

connection.connect(function(err){
if(err){
console.log("链接失败");
throw(err)
}else{
console.log("链接成功");
connection.query("CREATE TABLE user(id int,username varchar(255),password varchar(255))", function(err,result){
if(err){throw err}else{
console.log("创建表成功")
}
})
}
})