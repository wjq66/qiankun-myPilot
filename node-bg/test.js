var mysql = require('mysql2');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '960629wo',
    port: 3306,      // 端口应该是数字，不是字符串
    database: 'dev'  // 数据库名是 dev，不是 nodeTest
})

connection.connect();

// var sql = 'SELECT * FROM userInfo';


// 方案1：不指定 id，让 MySQL 自动生成（如果 id 是自增的）
var addSql = 'INSERT INTO userInfo(name,age,password) VALUES(?,?,?)';
var addSqlParams = ['n1', 12, 'qwer1234'];

connection.query(addSql, addSqlParams, function(err, result, fields) {
    if(err){
        console.log('[INSERT ERROR] - ', err.message);
        connection.end(); // 出错也要关闭连接
        return;
    }

    console.log('--------------------------INSERT SUCCESS----------------------------');
    console.log('插入成功！受影响行数:', result.affectedRows);
    console.log('插入的ID:', result.insertId);
    console.log('------------------------------------------------------------\n\n');
    

    connection.query('UPDATE userInfo SET name = ? WHERE id = 12', ['node修改的名称1', 12, (err, results, fields) => {
        if(err){
            console.log('[UPDATE ERROR] - ', err.message);
            connection.end(); // 出错也要关闭连接
            return;
        } else {
            console.log('更新成功！受影响行数:', results.affectedRows);
            console.log('------------------------------------------------------------\n\n');
        }
    }])
    // 查询验证插入的数据
    connection.query('SELECT * FROM userInfo', function(err, rows, fields) {
        if(err){
            console.log('[SELECT ERROR] - ', err.message);
        } else {
            console.log('插入的数据:');
            console.table(rows);
        }
        connection.end(); // 关闭连接，确保数据提交
    });


})