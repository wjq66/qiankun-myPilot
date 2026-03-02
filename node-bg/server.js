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
// 解析 JSON 请求体
app.use(express.json());
// 解析 URL 编码的请求体
app.use(express.urlencoded({ extended: true }));

// CORS 跨域配置（解决前端调用后端的跨域问题）
app.use((req, res, next) => {
  // 允许所有来源访问（生产环境应该指定具体域名）
  res.header('Access-Control-Allow-Origin', '*');
  // 允许的请求方法
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  // 允许的请求头
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  // 允许携带凭证（如果需要）
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // 处理预检请求（OPTIONS）
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// 引入登录路由
const loginRouter = require('./login');

// ========== 接口=========
// 登录相关接口
app.use('/api/auth', loginRouter);

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`登录接口: POST http://localhost:${PORT}/api/auth/login`);
    console.log(`注册接口: POST http://localhost:${PORT}/api/auth/register`);
})

 