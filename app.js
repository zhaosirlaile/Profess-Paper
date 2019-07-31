/**
 * 主文件：
 *      1. 负责网站的启动
 *      2. 开放文件夹（开放静态资源）
 *      3. post请求的配置
 */

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser')
const session = require('express-session');

const router = require('./router');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));



app.use('/public/',express.static(path.join(__dirname,'./public/')));
app.use('/node_modules/',express.static(path.join(__dirname,'./node_modules/')))

app.use(session({
    // 配置加密字符串，它会在原有加密基础之上和这个字符串拼起来去加密
    // 目的是为了增加安全性，防止客户端恶意伪造
    secret: 'chuannongbiaobaiqiang',
    resave: false,
    saveUninitialized: false // 无论你是否使用 Session ，我都默认直接给你分配一把钥匙
}))

app.use(router);

app.listen(5000,function(){
    console.log('running...');
})