
// 验证邮箱的正则表达式
const reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;



// 书写路由规则
let myRouter = new VueRouter({
    routes:[
        // 转到最新发帖的的页面
        {
            path: '/',
            redirect: '/newest',
        },
        // 最新发帖的页面

        {
            path: '/newest',
            name: 'newest',
            component: {
                template: '#newest',
                data:function(){
                    return {
                        itemList: [],
                        page: 0,
                    }
                },
                methods: {
                    userIsUp(){
                        if (sessionStorage.email) {
                            axios.get('/userIsUp',{
                                params:{
                                    email: sessionStorage.email,
                                }
                            }).then (function(res){
                                return(res.data);
                            }).catch(function(err){
                                console.log(err);
                            })
                        }

                    },
                    getPartItemList(){
                        let that = this;
                        axios.get('/getPartItemList',{
                            params:{
                                page:this.page,
                            }
                        })
                        .then(function (res) {
                            let data = res.data;
                            if (data.code === 1) {
                                that.page ++;
                                let itemList = data.data;
                                axios.get('/userIsUp',{
                                    params:{
                                        email: sessionStorage.email,
                                    }
                                }).then (function(res){
                                    let userUp = res.data.data;
                                    for (let i of itemList){
                                        let flag = false;
                                        for (let j of userUp) {
                                            if (Number(i.dId) === j.dId) {
                                                flag = true;
                                                i.isUp = j.isUp;
                                                break;
                                            }            
                                        }
                                        if (flag === false) {
                                            i.isUp = 0;
                                        } 
                                        i.cComment = '';
                                    }
                                    let dIdList = [];
                                    for (let i in itemList) {
                                        dIdList.push(itemList[i].dId);
                                        itemList[i].cCommentList = [];
                                    }
                                    axios.get('/getAllComment',{
                                        params:{
                                            dIdList: dIdList
                                        }
                                    }).then(function(res){
                                        let data = res.data;
                                        if (data.code === 1) {
                                            for (let item of data.data){
                                                for (let i in itemList) {
                                                    if (item.dId === Number(itemList[i].dId)){
                                                        itemList[i].cCommentList.push(item);
                                                        break;
                                                    }
                                                }
                                            };
                                            for (let item of itemList) {
                                                that.itemList.push(item);
                                            }
                                            if (itemList.length < 10) {
                                                that.$refs['itemList'].removeChild(that.$refs['itemList'].lastChild);
                                                let daodile = document.createElement('p');
                                                daodile.innerHTML ='--- 到底了 ---';
                                                that.$refs['itemList'].appendChild(daodile)
                                            }
                                            that.$Message.destroy();
                                        }
                                    }).catch(function(error){
                                        console.log(error);
                                    })
                                }).catch(function(err){
                                    console.log(err);
                                })
                            } else {
                                that.$Message.error('获取数据失败，请刷新页面');
                            }
                        })
                        .catch(function (error) {
                            that.$Message.error('获取数据失败，请刷新页面');
                        });
                    },
                    up(item,index){
                        let that = this;
                        if (sessionStorage.email) {
                            if (item.isUp === 0) {
                                axios.get('/up',{
                                    params:{
                                        isUp:1,
                                        uEmail: sessionStorage.email,
                                        dId: item.dId,
                                    }
                                })
                                .then(function (res) {
                                    let data = res.data;
                                    if (data.code === 1) {
                                        that.$refs['itemUp'][index].$el.style.color='#2D8CF0';
                                        item.dUp ++;
                                        that.$Message.success('点赞成功');
                                    } else {
                                        that.$Message.error('点赞失败');
                                    }
                                })
                                .catch(function (error) {
                                    console.log(error);
                                    that.$Message.error('点赞失败');
                                });
                            }
                        } else {
                            this.$Message.info('请先登录');
                            location.href = '#/login';
                        }
                    },
                    reverseUp:function(data){
                        if (data === 1) {
                            return '#2d8cf0';
                        } else {
                            return '#515A6E';
                        }
                    },
                    sendComment(item){
                        let that = this;
                        if (sessionStorage.email) {
                            if (item.cComment) {
                                if (item.cComment.length <= 120) {
                                    axios.get('/sendComment',{
                                        params:{
                                            uEmail:  sessionStorage.email,
                                            dId: item.dId,
                                            cComment: item.cComment,
                                            username: sessionStorage.username
                                        }
                                    })
                                    .then(function(res){
                                        if(data.code === 1) {
                                            item.cCommentList.push({
                                                cContent: item.cComment,
                                                uUsername: item.uUsername,
                                                uEmail: sessionStorage.username,
                                                dId: Number(item.dId),
                                            })
                                            item.cComment = '';
                                            that.$Message.success('发布成功');
                                        } else {
                                            that.$Message.error('发布失败');
                                        }
                                    })
                                    .catch(function(error){
                                        console.log(error);
                                        that.$Message.error('发布失败');
                                    })
                                } else {
                                    this.$Message.info('发表字数不可超过120个字');
                                }
                            } else {
                                this.$Message.error('发布内容不可以为空');
                            }
                        } else {
                            location.href='#/login';
                            this.$Message.info('您还为登录');
                        }

                    },
                    getAllComment() {
                        let that = this;
                        let dIdList = [];
                        for (let i in that.itemList) {
                            dIdList.push(that.itemList[i].dId);
                            that.itemList[i].cCommentList = [];
                        }
                        axios.get('/getAllComment',{
                            params:{
                                dIdList: dIdList
                            }
                        }).then(function(res){
                            let data = res.data;
                            if (data.code === 1) {
                                let itemList = that.itemList;
                                for (let item of data.data){
                                    for (let i in itemList) {
                                        if (item.dId === Number(itemList[i].dId)){
                                            itemList[i].cCommentList.push(item);
                                            break;
                                        }
                                    }
                                };
                            }
                            that.itemList = that.itemList;                             
                        }).catch(function(error){
                            console.log(error);
                        })
                    },
                    updateDiscussdBrowse(item){
                        axios.get('/updateDiscussdBrowse',{
                            params:{
                                dId: item.dId
                            }
                        }).then(function(res){
                        }).catch(function(err){
                            console.log(err);
                        })
                        // console.log(item);
                    },
                    jiazai(){
                        const msg = this.$Message.loading({
                            content: 'Loading...',
                            duration: 0
                        });
                        setInterval(msg,10000);
                        this.getPartItemList();
                    }
                },
                created() {
                    this.getPartItemList();
                },
            },
        },
        // 热门的帖子页面
        {
            path: '/hot',
            name: 'hot',
            component: {
                template: '#hot',
                data:function(){
                    return {
                        itemList: [],
                        page: 0,
                    }
                },
                methods: {
                    userIsUp(){
                        if (sessionStorage.email) {
                            axios.get('/userIsUp',{
                                params:{
                                    email: sessionStorage.email,
                                }
                            }).then (function(res){
                                return(res.data);
                            }).catch(function(err){
                                console.log(err);
                            })
                        }

                    },
                    getPartItemList(){
                        let that = this;
                        axios.get('/getPartItemListHot',{
                            params:{
                                page:this.page,
                            }
                        })
                        .then(function (res) {
                            let data = res.data;
                            if (data.code === 1) {
                                that.page ++;
                                let itemList = data.data;
                                axios.get('/userIsUp',{
                                    params:{
                                        email: sessionStorage.email,
                                    }
                                }).then (function(res){
                                    let userUp = res.data.data;
                                    for (let i of itemList){
                                        let flag = false;
                                        for (let j of userUp) {
                                            if (Number(i.dId) === j.dId) {
                                                flag = true;
                                                i.isUp = j.isUp;
                                                break;
                                            }            
                                        }
                                        if (flag === false) {
                                            i.isUp = 0;
                                        } 
                                        i.cComment = '';
                                    }
                                    let dIdList = [];
                                    for (let i in itemList) {
                                        dIdList.push(itemList[i].dId);
                                        itemList[i].cCommentList = [];
                                    }
                                    axios.get('/getAllComment',{
                                        params:{
                                            dIdList: dIdList
                                        }
                                    }).then(function(res){
                                        let data = res.data;
                                        if (data.code === 1) {
                                            for (let item of data.data){
                                                for (let i in itemList) {
                                                    if (item.dId === Number(itemList[i].dId)){
                                                        itemList[i].cCommentList.push(item);
                                                        break;
                                                    }
                                                }
                                            };
                                            for (let item of itemList) {
                                                that.itemList.push(item);
                                            }
                                            that.$Message.destroy();
                                            if (itemList.length < 10) {
                                                that.$refs['itemList'].removeChild(that.$refs['itemList'].lastChild);
                                                let daodile = document.createElement('p');
                                                daodile.innerHTML ='--- 到底了 ---';
                                                that.$refs['itemList'].appendChild(daodile)
                                            }
                                        }
                                    }).catch(function(error){
                                        console.log(error);
                                    })
                                }).catch(function(err){
                                    console.log(err);
                                })
                            } else {
                                that.$Message.error('获取数据失败，请刷新页面');
                            }
                        })
                        .catch(function (error) {
                            that.$Message.error('获取数据失败，请刷新页面');
                        });
                    },
                    up(item,index){
                        let that = this;
                        if (sessionStorage.email) {
                            if (item.isUp === 0) {
                                console.log(item.dId);
                                axios.get('/up',{
                                    params:{
                                        isUp:1,
                                        uEmail: sessionStorage.email,
                                        dId: item.dId,
                                    }
                                })
                                .then(function (res) {
                                    let data = res.data;
                                    if (data.code === 1) {
                                        that.$refs['itemUp'][index].$el.style.color='#2D8CF0';
                                        item.dUp ++;
                                        that.$Message.success('点赞成功');
                                    } else {
                                        that.$Message.error('点赞失败');
                                    }
                                })
                                .catch(function (error) {
                                    console.log(error);
                                    that.$Message.error('点赞失败');
                                });
                            }
                        } else {
                            this.$Message.info('请先登录');
                            location.href = '#/login';
                        }
                    },
                    reverseUp:function(data){
                        if (data === 1) {
                            return '#2d8cf0';
                        } else {
                            return '#515A6E';
                        }
                    },
                    sendComment(item){
                        let that = this;
                        if (sessionStorage.email) {
                            if (item.cComment) {
                                if (item.cComment.length <= 120) {
                                    axios.get('/sendComment',{
                                        params:{
                                            uEmail:  sessionStorage.email,
                                            dId: item.dId,
                                            cComment: item.cComment,
                                            username: sessionStorage.username
                                        }
                                    })
                                    .then(function(res){
                                        if(data.code === 1) {
                                            item.cCommentList.push({
                                                cContent: item.cComment,
                                                uUsername: item.uUsername,
                                                uEmail: sessionStorage.username,
                                                dId: Number(item.dId),
                                            })
                                            item.cComment = '';
                                            that.$Message.success('发布成功');
                                        } else {
                                            that.$Message.error('发布失败');
                                        }
                                    })
                                    .catch(function(error){
                                        console.log(error);
                                        that.$Message.error('发布失败');
                                    })
                                } else {
                                    this.$Message.info('发表字数不可超过120个字');
                                }
                            } else {
                                this.$Message.error('发布内容不可以为空');
                            }
                        } else {
                            location.href='#/login';
                            this.$Message.info('您还为登录');
                        }

                    },
                    getAllComment() {
                        let that = this;
                        let dIdList = [];
                        for (let i in that.itemList) {
                            dIdList.push(that.itemList[i].dId);
                            that.itemList[i].cCommentList = [];
                        }
                        axios.get('/getAllComment',{
                            params:{
                                dIdList: dIdList
                            }
                        }).then(function(res){
                            let data = res.data;
                            if (data.code === 1) {
                                let itemList = that.itemList;
                                for (let item of data.data){
                                    for (let i in itemList) {
                                        if (item.dId === Number(itemList[i].dId)){
                                            itemList[i].cCommentList.push(item);
                                            break;
                                        }
                                    }
                                };
                            }
                            that.itemList = that.itemList;                             
                        }).catch(function(error){
                            console.log(error);
                        })
                    },
                    updateDiscussdBrowse(item){
                        axios.get('/updateDiscussdBrowse',{
                            params:{
                                dId: item.dId
                            }
                        }).then(function(res){
                        }).catch(function(err){
                            console.log(err);
                        })
                        // console.log(item);
                    },
                    jiazai(){
                        const msg = this.$Message.loading({
                            content: 'Loading...',
                            duration: 0
                        });
                        setInterval(msg,10000);
                        this.getPartItemList();
                    }
                },
                created() {
                    this.getPartItemList();
                },

            },
        },
        // 发送的页面
        {
            path: '/sendbook',
            component: {
                template: '#sendbook',
                data: function(){
                    return {
                        textareaContent: '',
                        email: '',
                    }
                },
                methods: {
                    sendbook(){
                        let that = this;
                        this.email = sessionStorage.email;
                        if (this.email) {
                            if (this.textareaContent !== '') {
                                this.$Modal.confirm({
                                    title: '请确认',
                                    content: '<p>是否确认发表？</p>',
                                    okText: '确认',
                                    cancelText: '取消',
                                    onOk: ()=>{
                                        if (that.textareaContent.length <= 120) {
                                            axios.post('/sendbook',{
                                                sendContent: that.textareaContent,
                                                email : that.email,
                                            }).then(function(req){
                                                let data = req.data;
                                                if (data.code === 1) {
                                                    that.$Message.success(data.msg);
                                                    location.href = '#/newest';
                                                } else {
                                                    that.$Message.error('发表失败');
                                                }
                                            }).catch(function(err){
                                                console.log(err);
                                            })
                                        } else {
                                            that.$Message.info('发表字数不可超过120个字');
                                        }
                                    },
                                });
                            } else {
                                this.$Message.error('发表内容为空！');
                            }
                        }else {
                            this.$Message.info('您还未登陆');
                            location.href = '#/login';
                        }


                    }
                }
            },
            name: 'sendbook',
        },
        // 登录的页面
        {
            path: '/login',
            name: 'login',
            component: {
                template: '#login',
                data: function() {
                    return {
                        switch: true,
                        display: 'block',
                        login_in_password: '',
                        login_in_email: '',
                        login_in_email_icon: '',
                        login_in_email_icon_color: '',
                        login_register_email: '',
                        login_register_password: '',
                        login_register_email_icon: '',
                        login_register_email_icon_color: '',
                        login_register_verify: '',
                        login_register_verify_icon: '',
                        login_register_verify_icon_color: '',
                        verifyNumber : '',
                        login_register_time_text: '获取验证码',
                        login_register_time: 0,
                    }
                },
                methods: {
                    switchturn(num){
                        if(num === 1) {
                            this.$refs['num1'].className = 'p-hover';
                            this.$refs['num2'].className = '';
                            this.$refs['login-content-in'].style.display = 'flex';
                            this.$refs['login-content-register'].style.display = 'none';
                        } else {
                            this.$refs['num1'].className = '';
                            this.$refs['num2'].className = 'p-hover';
                            this.$refs['login-content-in'].style.display = 'none';
                            this.$refs['login-content-register'].style.display = 'flex';
                        }
                    },
                    login(){
                        let that = this;
                        if(reg.test(this.login_in_email) && this.login_in_password !== ''){
                            axios.post('/loginIn',{
                                email:this.login_in_email,
                                password: this.login_in_password,
                            }).then(function(res){
                                let data = res.data;
                                if(Number(data.code) === 1) {
                                    that.$Message.success('登录成功');
                                    that.$router.push({
                                        name: 'newest',
                                        params:{
                                            email: data.data.email,
                                            username: data.data.username,
                                        }
                                    })
                                } else {
                                    that.$Message.error('密码错误');
                                    that.login_in_password = '';
                                }
                            }).catch(function (err){
                                console.log(err);
                            })

                        }else{
                            this.$Message.error('邮箱格式不正确或密码为空');
                            this.login_in_password = '';
                        }
                    },
                    register(){
                        let that = this;
                        if(reg.test(this.login_register_email) && this.login_register_password !== '' && this.login_register_verify !== ''){
                            if (this.verifyNumber === this.login_register_verify) {
                                axios.post('/loginRegister',{
                                    email:this.login_register_email,
                                    password: this.login_register_password,
                                }).then(function(res){
                                    let data = res.data;
                                    if(Number(data.code) === 1) {
                                        that.$Message.success('注册成功');
                                        sessionStorage.email = data.data.email;
                                        sessionStorage.username = data.data.username;
                                        location.href = '/#/newest';
                                    } else {
                                        that.$Message.error(data.msg);
                                    }
                                }).catch(function (err){
                                    console.log(err);
                                })
                            } else {
                                this.$Message.error('验证码错误');
                            }
                        }else{
                            this.$Message.error('邮箱格式不正确或密码为空或验证码为空');
                            this.login_in_password = '';
                        }                    
                    },
                    sendEmail(){
                        let that = this;
                        this.login_register_time = 60;
                        this.$refs['sendEmailBtn'].$el.disabled = true;
                        let time = setInterval(() => {
                            that.login_register_time --;
                            that.login_register_time_text = that.login_register_time + '秒后再尝试';
                            if (that.login_register_time === 0) {
                                that.$refs['sendEmailBtn'].$el.disabled = false;
                                that.login_register_verify = '';
                                clearInterval(time);
                                that.login_register_time_text = '获取验证码';
                            }
                        }, 1000);
                        axios.post('/loginRegisterSendEmail',{
                            email:this.login_register_email,
                        }).then(function(res){
                            let data = res.data;
                            if (data.code === 1) {
                                that.verifyNumber = data.data.verify;
                                that.$Message.success('验证码发送成功');
                            } else {
                                that.$Message.error('验证码发送失败');
                            }
                        }).catch(function (err){
                            console.log(err);
                        })
                    },
                    checkEmail(){
                        if (reg.test(this.login_register_email)) {
                            this.login_register_email_icon = 'md-checkmark-circle'
                            this.login_register_email_icon_color = '#19be6b';
                            this.$refs['sendEmailBtn'].$el.disabled = false;
                        } else {
                            this.login_register_email_icon = 'md-close-circle'
                            this.login_register_email_icon_color = '#ed4014';
                            this.$refs['sendEmailBtn'].$el.disabled = true;
                        }
                    },
                    throttle(method){           // 节流函数
                        clearTimeout(method.id);
                        method.id = setTimeout(() => {
                            method();
                        }, 1000);        
                    },
                    checkVerifyNumber(){
                        if ( this.login_register_verify + "" === this.verifyNumber + "" && this.login_register_verify !== '') {
                            this.login_register_verify_icon = 'md-checkmark-circle'
                            this.login_register_verify_icon_color = '#19be6b';
                        } else {
                            this.login_register_verify_icon = 'md-close-circle'
                            this.login_register_verify_icon_color = '#ed4014';
                        }
                    },
                    checkLoginEmail(){
                        if (reg.test(this.login_in_email)) {
                            this.login_in_email_icon = 'md-checkmark-circle'
                            this.login_in_email_icon_color = '#19be6b';
                        } else {
                            this.login_in_email_icon = 'md-close-circle'
                            this.login_in_email_icon_color = '#ed4014';
                        }
                    }
                },
            }
        },
        // 修改用户信息的页面
        {
            path: '/alterUser',
            name: 'alterUser',
            component: {
                template: '#alterUser',
                data: function () {
                    return {
                        sex: 0,
                        username: '',
                        user: [],
                    }
                },
                methods:{
                    alterUser(){
                        let that = this;
                        this.$Modal.confirm({
                            title: '确认框',
                            content: '<p>是否确认修改个人信息？</p>',
                            onOk: () => {
                                if (this.username !== ''){
                                    axios.get('/alterUser',{
                                        params:{
                                            username: this.username,
                                            email: sessionStorage.email,
                                            sex: this.sex === true ? 1 : 0,
                                        }
                                    }).then(function(res){
                                        let data = res.data;
                                        if (data.code === 1) {
                                            that.$Message.success('修改成功');
                                            location.href = '/#/newest';
                                        }
                                    }).catch(function(err){
                                        console.log(err);
                                    })
                                } else {
                                    this.$Message.error('用户名不可以为空');
                                }

                            },
                        });

                    },
                    getUser(){
                        let that = this;
                        axios.get('/getUser',{
                            params:{
                                email: sessionStorage.email,
                            }
                        }).then(function(res){
                            that.user = res.data.data[0];
                            that.sex = Number(res.data.data[0].uSex) === 1 ? true: false;
                            that.username = res.data.data[0].uUsername;
                        }).catch(function(err){
                            console.log(err);
                        })
                    },
                    cannelAlterUser(){
                        this.$Modal.confirm({
                            title: '确认框',
                            content: '<p>是否取消修改个人信息？</p>',
                            onOk: () => {
                                location.href = '/#/newest';
                            },
                        });
                    }
                },
                created(){
                    this.getUser();
                }
            },
        },
        // 用户表白管理的页面
        {
            path: '/userConfessionManage',
            name: 'userConfessionManage',
            component: {
                template: '#userConfessionManage',
                data: function () {
                    return {
                        confessionList: [],
                    }
                },
                methods:{
                    getUserConfessionManage(){
                        let that = this;
                        axios.get('/getUserConfessionManage',{
                            params:{
                                email: sessionStorage.email,
                            }
                        }).then(function(res){
                            let data = res.data;
                            if (data.code === 1) {
                                that.confessionList = data.data;
                            }
                        }).catch(function(err){
                            console.log(err);
                        })
                    },
                    deleteConfession(item){
                        let that = this;
                        this.$Modal.confirm({
                            title: '请确认',
                            content: '<p>是否确认发表？</p>',
                            okText: '确认',
                            cancelText: '取消',
                            onOk: ()=>{
                                axios.get('/deleteConfession',{
                                    params:{
                                        email: sessionStorage.email,
                                        dId: item.dId,
                                    }
                                }).then(function(res){
                                    let data = res.data;
                                    if (data.code === 1) {
                                        let confessionList = that.confessionList;
                                        for (let i in confessionList) {
                                            if (confessionList[i].dId === item.dId) {
                                                that.confessionList.splice(i,1);
                                            }
                                        }
                                        that.$Message.success('删除成功')
                                    }else {
                                        that.$Message.error('删除失败');
                                    }
                                }).catch(function(err){
                                    console.log(err);
                                })
                            }
                        })

                    },
                },
                created(){
                    this.getUserConfessionManage();
                }
            }
        }
    ]
})
// 书写路由规则

// 定义全局过滤器 --- 替换时间
Vue.filter('replaceTime',function(data){
    data = data.replace(/.000Z/g,"");
    let time = data.split('T');
    let date1 = new Date().getTime();
    let date2 = new Date(time[0] + ' ' + time[1]).getTime();
    let total = date1 - date2;
    let day = '' ;
    let reduceDay = parseInt(total / (1000 * 60 * 60 * 24));
    if (reduceDay <= 7) {
        if (reduceDay === 0) {
            day = '今天';
        } else if (reduceDay === 1) {
            day = '昨天'
        } else if (reduceDay === 2) {
            day = '前天';
        } else {
            day = reduceDay + "天前"
        }
    } else {
        day = time[0];
    }
    return day + ' ' + time[1].substring(0,5);
})
Vue.filter('replaceManageTime',function(data){
    data = data.replace(/.000Z/g,"");
    let time = data.split('T');
    return time[0] + ' ' + time[1];
})

// 定义全局过滤器 --- 替换时间

let app = new Vue({
    el: '#app',
    data: {
        visible: false,
        username: "",
        email: '',
    },
    methods: {
        show: function () {
            this.visible = true;
        },
        qihuan(){
            this.$refs['loginPage'].style.display = 'none';
            this.$refs['user'].$el.style.display = 'block';
        },
        quit(){
            this.$refs['loginPage'].style.display = 'block';
            this.$refs['user'].$el.style.display = 'none';  
            sessionStorage.removeItem('username');
            sessionStorage.removeItem('email');
            window.location.href = '/'
        }
    },
    watch: {
        $route(to,from){
            if (to.params.email) {
                this.username = to.params.username;
                this.email = to.params.email;
                sessionStorage.username = this.username;
                sessionStorage.email = this.email;
                this.qihuan();
            }
        }
    },
    mounted() {
        if (sessionStorage.email){
            this.qihuan()
        }
    },
    router:myRouter,    // 注册路由
})
