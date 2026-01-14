const express = require("express")
const app = express()

// 创建一个路由对象
const user = express.Router();

// 渲染引擎
app.set('view engine', 'hbs');

app.set('views', './views');

// 将静态文件目录暴露为web可访问的
app.use(express.static('./public'));

// 全局中间件


// ========== 接口=========
app.get('/', (req,res) => {
    
})