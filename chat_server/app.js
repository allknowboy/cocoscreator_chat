const express = require('express');
const app = express();
const http = require('http').Server(app);
const sio = require('socket.io')(http);
const _ = require('underscore');

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
var userList = [];
//接收客户端的连接
sio.on('connection',socket=>{
    //登录    
    socket.on('login',(user)=>{
        console.log('login');
        console.log(user);
        user.id = socket.id;
        userList.push(user);
        //群发用户列表
        sio.emit('userList',userList);
        //发送当前用户列表信息
        socket.emit('userInfo',user);
        //除自己外广播用户登录信息
        socket.broadcast.emit('loginInfo',user.name+"上线了。");
    });
    //客户端断开
    socket.on('disconnect',()=>{
        //查出当前离开的用户
        let user = _.findWhere(userList,{id:socket.id});
        if(user){
            //剔除当前离线用户
			userList = _.without(userList,user);
            //发送当前用户列表信息
			sio.emit('userList',userList);
			//除自己外广播用户断线信息
			socket.broadcast.emit('loginInfo',user.name+"下线了。");
        }

    });
    //群发事件
    socket.on('toAll',function(msgObj){
		socket.broadcast.emit('toAll',msgObj);
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
