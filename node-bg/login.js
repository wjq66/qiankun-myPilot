const mysql = require('mysql2');
const express = require('express');
const router = express.Router();

// 创建数据库连接（使用 test.js 中的配置）
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '960629wo',
    port: 3306,
    database: 'dev'
});

// 连接数据库
connection.connect((err) => {
    if (err) {
        console.error('数据库连接失败:', err.message);
        return;
    }
    console.log('数据库连接成功！');
});

/**
 * 用户登录接口
 * POST /api/auth/login
 * 
 * 请求参数：
 * {
 *   "username": "用户名",
 *   "password": "密码"
 * }
 * 
 * 响应数据：
 * {
 *   "code": 200,
 *   "message": "登录成功",
 *   "data": {
 *     "token": "token字符串",
 *     "user": {
 *       "loginId": 1,
 *       "username": "admin",
 *       "phone": "13800138000"
 *     }
 *   }
 * }
 */

router.post('/login', (req, res) => {
    // 获取请求参数
    const { username, password } = req.body;
    
    // 参数验证
    if (!username || !password) {
        return res.status(400).json({
            code: 400,
            message: '用户名和密码不能为空',
            data: null
        });
    }
    
    // 查询数据库，验证用户名和密码
    const sql = 'SELECT * FROM login WHERE username = ? AND password = ?';
    const params = [username, password];
    
    connection.query(sql, params, (err, results) => {
        if (err) {
            console.error('[LOGIN ERROR] - ', err.message);
            return res.status(500).json({
                code: 500,
                message: '服务器错误：' + err.message,
                data: null
            });
        }
        
        // 检查是否找到匹配的用户
        if (results.length === 0) {
            return res.status(401).json({
                code: 401,
                message: '用户名或密码错误',
                data: null
            });
        }
        
        // 登录成功
        const user = results[0];
        
        // 生成简单的 token（实际项目中应该使用 JWT）
        const token = generateToken(user.loginId, user.username);
        
        // 返回成功响应
        res.json({
            code: 200,
            message: '登录成功',
            data: {
                token: token,
                user: {
                    loginId: user.loginId,
                    username: user.username,
                    phone: user.phone
                }
            }
        });
    });
});

/**
 * 生成简单的 token（实际项目中应该使用 JWT）
 * @param {number} loginId 用户ID
 * @param {string} username 用户名
 * @returns {string} token字符串
 */
function generateToken(loginId, username) {
    // 简单的 token 生成（实际项目中应该使用 JWT）
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    return Buffer.from(`${loginId}_${username}_${timestamp}_${randomStr}`).toString('base64');
}

/**
 * 用户注册接口（可选）
 * POST /api/auth/register
 */
router.post('/register', (req, res) => {
    const { username, password, phone } = req.body;
    
    // 参数验证
    if (!username || !password) {
        return res.status(400).json({
            code: 400,
            message: '用户名和密码不能为空',
            data: null
        });
    }
    
    // 检查用户名是否已存在
    const checkSql = 'SELECT * FROM login WHERE username = ?';
    connection.query(checkSql, [username], (err, results) => {
        if (err) {
            console.error('[REGISTER ERROR] - ', err.message);
            return res.status(500).json({
                code: 500,
                message: '服务器错误：' + err.message,
                data: null
            });
        }
        
        if (results.length > 0) {
            return res.status(409).json({
                code: 409,
                message: '用户名已存在',
                data: null
            });
        }
        
        // 插入新用户（loginId 是主键，如果是自增的可以不传）
        const insertSql = 'INSERT INTO login(username, password, phone) VALUES(?, ?, ?)';
        const insertParams = [username, password, phone || null];
        
        connection.query(insertSql, insertParams, (err, result) => {
            if (err) {
                console.error('[REGISTER INSERT ERROR] - ', err.message);
                return res.status(500).json({
                    code: 500,
                    message: '注册失败：' + err.message,
                    data: null
                });
            }
            
            res.json({
                code: 200,
                message: '注册成功',
                data: {
                    loginId: result.insertId,
                    username: username,
                    phone: phone || null
                }
            });
        });
    });
});

module.exports = router;

