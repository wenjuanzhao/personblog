var nodemailer = require('nodemailer');
//创建一个传送器
function Mail(email){
    var transporter = nodemailer.createTransport({
        //https://github.com/andris9/nodemailer-wellknown 可以查看的支持列表
        //这里使用的qq服务器
        service: 'qq',
        //smtp服务器的端口
        port: 465,   // SMTP 端口
        secureConnection: true,   // 使用 SSL
        auth: {
            user: '1051743154@qq.com',
            //这里密码不是qq密码，是你设置的smtp密码
            pass: 'prqlweqjubmxbaii'
        }
    })
//配置邮箱发件箱和收件箱的信息
    var mailOptions = {
        from: '1051743154@qq.com', // 发件地址
        to: email, // 收件列表
        subject: '欢迎注册赵文娟的网站', // 标题
        //text和html两者只支持一种
        text: '欢迎注册XXXX网站欢迎注册XXXX网站欢迎注册XXXX网站欢迎注册XXXX网站欢迎注册XXXX网站', // 标题
        html: '<b>欢迎注册XXXX网站欢迎注册XXXX网站欢迎注册XXXX网站?</b>' // html 内容
    };
    this.transporter=transporter;
    this.mailOptions=mailOptions;
}
module.exports=Mail;
