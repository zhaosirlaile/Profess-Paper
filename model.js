/**
 * model 模块：
 *      主要负责处理逻辑业务
 *      code = 1 表示成功 
 *      code = 0 表示失败
 */

const db = require('./db');
const nodemail = require('nodemailer');
const sendEmail = require('./sendmail');

let hama = 0;

// 登录模块
exports.login = (req,res)=>{
    db(`select * from user where uEmail=? `,[req.body.email],function(results,fields){
        if (results.length > 0) {
            if(results[0].uPassword === req.body.password){
                res.send(JSON.stringify({
                    code: 1,
                    msg: '登录成功',
                    data:{
                        username: results[0].uUsername,
                        email: results[0].uEmail,
                    }
                }));
            } else {
                res.send(JSON.stringify({
                    code: 0,
                    msg: '密码错误',
                }));
            }
        } else {
            res.send(JSON.stringify({
                code: 0,
                msg: '改用户未注册',
            }));
        }
    })
}

// 注册模块
exports.register = (req,res)=>{
    let data = req.body;
    db('select * from user where uEmail = ?',[data.email],function(results,fields){
        if (results.length === 1) {
            res.send(JSON.stringify({
                code: 0,
                msg: '该用户已注册',
            }));
        } else {
            let username = `川农${hama++}`;
            db(`insert into user(uUsername,uPassword,uEmail,uTime) values (?,?,?,?)`,[username,data.password,data.email,exports.getDateTime()],function(results,fields){
                res.send(JSON.stringify({
                    code: 1,
                    msg: '注册成功',
                    data: {
                        username: username,
                        email: data.email,
                    },
                }))
            })
        }
    })
}

// 发送邮件模块
exports.sendmail = (req,res)=> {
    let emailAddress = req.body.email;
    let myNumber = (function captchaNumber(){
        let num = [];
        for (let i = 0; i < 6; i++) {
            num[i] = parseInt(Math.random()*10);
        }
        return num.join('');
    })();
    let email = {
        title: '川农表白墙---邮箱验证码',
        htmlBody: `
                <h1>您好：</h1>
                <p style="font-size: 18px;color:#000;">
                    您的验证码为：
                    <span style="font-size: 16px;color:#1890ff;"> ${myNumber}， </span>
                    您当前正在川农表白墙网站注册账号，验证码告知他人将会导致数据信息被盗，请勿泄露
                </p>
                <p style="font-size: 14px;color:#666;">60秒内有效</p>
                `
    };
    let mailOptions = {
        from: 'zhaosirlaile@qq.com', // 发件人地址
        to: emailAddress, // 收件人地址，多个收件人可以使用逗号分隔
        subject: email.title, // 邮件标题
        html: email.htmlBody // 邮件内容
    };
    sendEmail.send(mailOptions);
    res.send(JSON.stringify({
        code: 1,
        msg: '成功',
        data: {
            verify: myNumber,
        }
    }))
}

// 获取当前时间
exports.getDateTime = ()=> {
    let data = new Date();
    let year = data.getFullYear();
    let month = data.getMonth() + 1;
    let day = data.getDate();
    let hours = data.getHours();
    let minute = data.getMinutes();
    let seconds = data.getSeconds();
    return `${year}-${month}-${day} ${hours}:${minute}:${seconds}`
}

// 发帖模块
exports.sendbook = (req,res) => {
    let data = req.body;
    console.log(data);
    db('insert into discuss(dTime,dContent,uEmail) values(?,?,?)',[exports.getDateTime(),data.sendContent,data.email],function(results,fields){
        res.send(JSON.stringify({
            code: 1,
            msg: '发表成功',
        }));
    })
}

// 获取表白信息模块
exports.getPartItemList = (req,res) => {
    let page = Number(req.query.page)*10;
    db('select dContent,dId,dTime,dImg,dUp,uTime,uUsername,dBrowse from discuss,user where user.uEmail = discuss.uEmail order by dTime desc  limit ?,?',[page,page+10],function(results,fields){
        res.send(JSON.stringify({
            code: 1,
            msg: '获取成功',
            data: results,
        }));
    })
}

// 获取热门的表白信息模块
exports.getPartItemListHot = (req,res) => {
    let page = Number(req.query.page)*10;
    db('select dContent,dId,dTime,dImg,dUp,uTime,uUsername,dBrowse from discuss,user where user.uEmail = discuss.uEmail order by (dUp*0.5 + dBrowse*0.5) desc  limit ?,?',[page,page+10],function(results,fields){
        res.send(JSON.stringify({
            code: 1,
            msg: '获取成功',
            data: results,
        }));
    })
}
// 获取用户是否点赞模块
exports.userIsUp = (req,res) => {
    db('select * from up where uEmail = ?',[req.query.email],function(results,fields){
        res.send(JSON.stringify({
            code: 1,
            msg: '获取成功',
            data: results,
        }));
    })
}

// 点赞模块
exports.up = (req,res) => {
    let data = req.query;
    db('select * from up where uEmail = ? and dId = ?',[data.uEmail,data.dId],function(results,fields){
        if (results.length === 0) {
            db('insert into up values(?,?,?)',[data.uEmail,data.dId,data.isUp],function(){
                res.send(JSON.stringify({
                    code: 1,
                    msg: '点赞成功',
                }));
                db('update discuss set dUp = dUp + 1 where dId = ?',[data.dId],function(results,fields){
                })
            })
        } else {
            db('update up set isUp = ? where uEmail = ? and dId = ? ',[data.isUp,data.uEmail,data.dId],function(){
                res.send(JSON.stringify({
                    code: 1,
                    msg: '点赞成功',
                }));
                db('update discuss set dUp = dUp + 1 where dId = ?',[data.dId],function(results,fields){
                })
            })
        }
    })
}

// 发布评论模块
exports.sendComment = (req,res) => {
    let data= req.query;
    db('insert into comment(uEmail,dId,cContent,uUsername) values(?,?,?,?)',[data.uEmail,data.dId,data.cComment,data.username],function(results,fields){
        res.send(JSON.stringify({
            code: 1,
            msg: '发布成功',
        }));
    })
}

// 获取所有的所有评论模块
exports.getAllComment= (req,res) => {
    db('select * from comment where dId in(?)',[req.query.dIdList],function(results,fields){
        res.send(JSON.stringify({
            code: 1,
            msg: '获取成功',
            data: results,
        }));
    })
}

// 更新浏览量模块
exports.updateDiscussdBrowse = (req,res) => {
    let data = req.query;
    db('update discuss set dBrowse=dBrowse+1 where dId = ?',[data.dId],function(results,fields){
        res.send(JSON.stringify({
            code: 1,
            msg: '更新浏览量成功',
        }));
    })
}

// 修改个人信息模块
exports.alterUser= (req,res) => {
    let data = req.query;
    console.log(data);
    db('update user set uUsername = ?,uSex = ? where uEmail = ?',[data.username,Number(data.sex),data.email],function(results,fields){
        db('update comment set uUsername = ? where uEmail = ?',[data.username,data.email],function(results,fields){
            res.send(JSON.stringify({
                code: 1,
                msg: '获取成功',
            }));
        })
    })
}

// 获取个人信息模块
exports.getUser = (req,res) => {
    let data = req.query;
    db('select uUsername,uSex from user where uEmail = ? ',[data.email],function(results,fields){
        res.send(JSON.stringify({
            code: 1,
            msg: '获取成功',
            data: results,
        }));
    })
}

// 获取表白页面的信息模块
exports.getUserConfessionManage = (req,res) => {
    let data = req.query;
    db('select * from discuss where uEmail = ? ',[data.email],function(results,fields){
        res.send(JSON.stringify({
            code: 1,
            msg: '获取成功',
            data: results,
        }));
    })
}

// 删除一条表白模块
exports.deleteConfession = (req,res) => {
    let data = req.query;
    console.log(data);
    db('delete from discuss where dId = ?',[data.dId],function(results,fields){
        db('delete from comment where dId = ?',[data.dId],function(results,fields){
            db('delete from up where dId = ?',[data.dId],function(results,fields){
                res.send(JSON.stringify({
                    code: 1,
                    msg: '获取成功',
                }));
            })
        })
    })
}