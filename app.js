
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
//得到的是配置的信息
var setting=require('./setting.js');
var flash=require('connect-flash');
//得到session的中间件
var session=require('express-session');
var MongoStore=require('connect-mongo')(session);


var app = express();
//使用session的中间件  可以实现将会话信息存储到mongodb中
app.use(session({
  secret:setting.cookieSecret,
  key:setting.db,
  cookie:{Maxage:1000*60*60*24*30},
  store:new MongoStore({
      url:'mongodb://localhost/newblog'
  })
}))
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
//使用导入的flash中间件
app.use(flash());
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
routes(app);
