const express = require('express');
const app = express();
const http = require('http').Server(app);
const sio = require('socket.io')(http);
const _ = require('underscore');

const User = require('./models/User');
const Message = require('./models/Message');

//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});


app.get('/',(req,res)=>{
    res.send('<h1>Hello world</h1>');
});

http.listen(3000, ()=>{
    console.log('listening on *:3000');
});


/**********************关于聊天的相关操作*************************/
//保存用户的数组
var userList = {};
//接收客户端的连接
sio.on('connection',socket=>{
    //注册
    socket.on('register',registerObj=>{
        User.findOrCreate({where: {account: registerObj.name}, defaults: {password:registerObj.password}})
        .spread((user, created) => {
            // console.log(user.get({
            //     plain: true
            // }))
            // console.log(created)
            socket.uid = user.get('uid');
            if(created){
                //发送当前用户列表信息
                socket.emit('registerInfo','注册成功');
            }
            else{
                //发送当前用户列表信息
                socket.emit('registerInfo','用户名已经存在');
            }
        })
    });



    //登录    
    socket.on('login',(user)=>{
        console.log('login');
        console.log(user);

        User.findOne({where: {account: user.name,password:user.password}}).then(user=>{
            console.log(user);
            if(user){
                socket.uid = user.get('uid');
            }
            else{
                //发送当前用户列表信息
                socket.emit('loginInfo','登录失败');
                return;
            }
        });

        user.id = socket.id;
        if(!userList[user.channel]){
            userList[user.channel]=[];
        }
        userList[user.channel].push(user);
        socket.join(user.channel);
        socket.channel = user.channel;
        //群发用户列表
        sio.to(user.channel).emit('userList',userList[user.channel]);
        //发送当前用户列表信息
        socket.emit('userInfo',user);
        //除自己外广播用户登录信息
        socket.broadcast.to(user.channel).emit('loginInfo',user.name+"上线了。");
    });
    //客户端断开
    socket.on('disconnect',()=>{
        //查出当前离开的用户
        //console.log(socket.channel);
        if(socket.channel){
            socket.leave(socket.channel,()=>{
                //用户离开频道的回调
            })
        }

        let user = _.findWhere(userList[socket.channel],{id:socket.id});
        if(user){
            //剔除当前离线用户
			userList[socket.channel] = _.without(userList[socket.channel],user);
            //发送当前用户列表信息
			sio.to(socket.channel).emit('userList',userList[socket.channel]);
			//除自己外广播用户断线信息
            socket.broadcast.to(user.channel).emit('loginInfo',user.name+"下线了。");
            
            //删除当前的频道
            if(userList[socket.channel].length==0){
                delete userList[socket.channel];
                delete socket.channel;
            }
        }
    });
    //群发事件
    socket.on('toAll',function(msgObj){
        Message.create({
            fromuid:socket.uid,
            message:msgObj.msg,
        }).then(value=>{
            console.log(`插入数据 ${value}`);
        });

        console.log(`++++++++++++++${msgObj.from.channel}+++++++++++++++`);
		socket.broadcast.to(msgObj.from.channel).emit('toAll',msgObj);
    });
    //单发事件
	socket.on('toOne',function(msgObj){
		let toSocket = _.findWhere(sio.sockets.sockets,{id:msgObj.to});
		toSocket.emit('toOne', msgObj);
	});

    /**
     * 心跳包
     */
    socket.on('game_ping',function(data){
        socket.emit('game_pong');
    });
});
