/**
 * sendmail 文件：
 *      1. 主要负责邮件的发送
 *      2. 配置邮件的设置
 */

const nodeemailer = require('nodemailer');
const transporter = nodeemailer.createTransport({
    host: "smtp.qq.com",                        // QQ邮箱的SMTP地址
    port: 465,                                    // 每个邮箱的端口号可能是一样的，一般都使用465，但有些公司使用的就不是465
    auth: {
        "user": 'xxxxxxxxxxxxxxxxxxxxxxx',         // 你自己的邮箱的邮箱地址
        "pass": 'xxxxxxxxxxxxxxx'         // 上面我们提到的授权码
    }
});
module.exports.send =  (mailOptions) => {
    transporter.sendMail(mailOptions, function(error, info){
        if(error) {
            return console.log(error);
        }
    });
}