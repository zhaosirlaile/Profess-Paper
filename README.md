# 表白墙

## 项目介绍

这次项目是参加学校 wing Stdio 工作室（第二轮）的网页作品，关于（表白）

## 技术栈

Node+Express+MySql+vue+iView（vue的UI插件）

这次我使用了单页面的技术

## 问题

- 在处理登录状态时，花了很多时间才做出来了，期间我看了很多的文档，了解到cookie和session可以实现该功能，但是他们好麻烦，最后我选用了sessionStorage 做的。
- 在连接我的discuss表和 up表时发生了不是预期的结果，又是花了很多时间在其上面，一直想通过select左连接实现该功能，但都不行，最后只有通过代码我手动的设置

## 源码介绍

**node_modules** **文件夹：**

- 用来存放一些第三方的插件

- 例如：vue、iview、axios

**Public** **文件夹：**

- 存放的都是一些要使用的静态资源

- 例如：css文件、js文件、图片、logo之类的

**Views** **文件夹：**

- 存放的都是一些要渲染的静态页面

- 都是些html文件

**App.js** **文件：**

- 负责网站的启动

- 开放文件夹（开放静态资源）

- post请求的配置

**db.js** **文件：**

- 封装了操作 MySQL 数据库的配置

- 还有一些操作数据库的方法

**Model.js** **文件：**

- 主要负责处理逻辑业务

- 所有关于操作数据库、逻辑处理

- 都是接口

**Package.json** **文件：**

- 项目的基本信息

- 例如：作者、开发日期、版本号等等

- 还有最重要的就是一些依赖

**Package-lock.json** **文件：**

- 功能和package.json类似

- 当可以准确的记录每个第三方文件的版本号、下载地址

**Router.js** **文件：**

- 主要负责路由的映射

- 并且调用相关路由的模块功能（model.js文件中的接口）

**Sendmail.js** **文件：**

- 主要负责邮件的发送

- 配置邮件的设置