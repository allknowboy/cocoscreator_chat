### 写在前头

&emsp;&emsp;**本实例主要给刚接触CocosCreator和网络开发小白使用。老司机可以马上调头，这是开往幼儿园的专列。**

### 背景

&emsp;&emsp;**聊天室作为大多数网络游戏开发人员的第一个项目，实现了一对多，一对一的数据交互，作为基石一般的存在，可以在上面搭建出各种复杂多变的网络程序，此篇作为我网络游戏开发的第一篇，希望与大家共勉。**

### 服务器的选择

> 与CocosCretor搭配的全栈解决方案当然是Nodejs了

- [Pomelo](https://github.com/NetEase/pomelo)
    - 网易开源的游戏应用服务器
    - 能用简单的代码搭建一个稳定的服务器
    - 丰富的组件
    - 完善的客户端类库
- [WebSocket](https://github.com/websockets/ws)
    - 浏览器原生支持
    - 方法监听简单明了
    - [阮一峰大大的详细解释](http://www.ruanyifeng.com/blog/2017/05/websocket.html)
- [Socket.io](https://github.com/socketio/socket.io)
    - 建立在webSicket之上
    - 拥有完善的处理方法
    - 类库更新十分勤快 拥有大量的用户

选型 | 结果
---|--
**Pomelo** 比较适合有一定的网络开发基础的人使用。 |**<font color=red>PASS</font>**   |
纯**WebSocket**的开发相对比较简单，但是有更好的方案. |**<font color=red>PASS</font>**  | 
**Socket.io** 反正我没找到更好的... |**<font color=blue>Bingo</font>** |

### 服务器的开发

> 码第一行代码之前默念 善哉善哉 bug去也  

**1.安装npm包**  
找到你的项目目录执行以下包安装命令
```bash
npm install express --save
npm install socket.io --save
npm install underscore --save
```
**2.引入包**  
编写一个app.js的文件

```js
const express = require('express');
const app = express();
const http = require('http').Server(app);
const sio = require('socket.io')(http);
const _ = require('underscore');
```

**3.设置跨域访问**  
之后使用express做工具服务器的时候会用到
```js
//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});
```
**4.绑定端口**  

```js
app.get('/',(req,res)=>{
    res.send('<h1>Hello world</h1>');
});

http.listen(3000, ()=>{
    console.log('listening on http://127.0.0.1:3000');
});
```
**5.测试绑定**  

启动服务器
```bash
node app
```
打开网址查看 出现HelloWorld即为成功

[http://127.0.0.1:3000](http://127.0.0.1:3000)

**6.编写一个简单聊天服务器**  
- 代码量50行左右 有完整的注释
- 简单的分析一下
    -  sio的on和emit与nodejs的事件监听和触发相似
    -  **connection**用来监听客户端的链接
    -  socket是获得的客户句柄
    -  socket.on 用于注册自定义事件
    -  user和msgObj的内容在客户端的Params.ts里  

```js
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
```



### 聊天室基本界面

```
graph TD
H(loading界面)-->A
A(用户名输入界面)-->B(聊天室界面)
B-->D(群聊界面)
B-->E(私聊界面)
```

### 项目的实际界面截图

> 登录界面

![](http://onb8jc081.bkt.clouddn.com/18-3-7/62636407.jpg)

> 聊天室的界面

![](http://onb8jc081.bkt.clouddn.com/18-3-7/89831164.jpg)

> 发群聊消息

![](http://onb8jc081.bkt.clouddn.com/18-3-7/91638788.jpg)

> 发私聊消息

![](http://onb8jc081.bkt.clouddn.com/18-3-7/79468759.jpg)

> 简单起见 私聊消息红色显示

![](http://onb8jc081.bkt.clouddn.com/18-3-7/50868367.jpg)

> 用户下线通知

![](http://onb8jc081.bkt.clouddn.com/18-3-7/88703544.jpg)

> 用户上线通知

![](http://onb8jc081.bkt.clouddn.com/18-3-7/22475358.jpg)


### 客户端的开发
**客户端代码会在后面放出 简单的分析下几个类**  

> NetUtil.ts  参考麒麟子的net.js   

- ts中window.io是不存在的需要使用转化获得

```ts
const io = (window as any).io || {};
```

- 使用io.connect连接到服务器

```ts
init(){
    let opts = {
        'reconnection':false,
        'force new connection': true,
        'transports':['websocket', 'polling']
    }
    this.sio = io.connect('http://127.0.0.1:3000',opts);

    this.sio.on('connect',(data)=>{
        console.log('connect');
        this.connected = true;
    })

    this.sio.on('disconnect',(data)=>{
        console.log("disconnect");
        this.connected = false;
    });

    this.startHearbeat();
}
```
- 封装on / emit方法 方便使用  

```ts
/**
 * 绑定事件
 * @param event 
 * @param cb 
 */
on(event:string,cb){
    this.sio.on(event,cb);
}

/**
 * 击发服务器事件
 * @param event 
 * @param data 
 */
emit(event:string,data?:any){
    if(data){
        this.sio.emit(event,data);
        return;
    }
    this.sio.emit(event);
}
```

> LoadingCtrl.ts  

- 就干了一件事情初始化连接
- 之后要优于其他操作的初始化都放到这里 比如 i18n
```ts
    //初始化项目
    initGame(){
        NetUtil.Instance.init();

    }
```

> LoginCtrl.ts  

- 获得用户名 并发送给服务器

```ts
login(){
    let name = this.userBox.string;
    if(name.length<2){
        return;
    }
    let user:User ={id:"",name,imgUrl:""};
    NetUtil.Instance.emit('login',user);
}
```

> ChatCtrl.ts

- 注册服务器的事件

```ts
    onLoad () {
        //注册用户登入登出信息
        NetUtil.Instance.on('loginInfo',(msg:string)=>{
            cc.log(msg);
            Toast.makeText(msg,Toast.LENGTH_LONG).show();
        })
        //获得当前用户信息
        NetUtil.Instance.on('userInfo',(user:User)=>{
            GameUtil.Instance.userInfo = user;
            cc.log(user);
        })
        //广播的用户列表信息
        NetUtil.Instance.on('userList',(userList)=>{
            cc.find('Canvas/login_room').active = false;
            //获取当前的用户列表
            this.userList = userList;
            //更新容器
            this.updateUserList(this.userList);
        });
        //注册发送给全部人的消息
        NetUtil.Instance.on('toAll',(msg:Message)=>{
            let node = cc.instantiate(this.otherMsgItem);
            node.getChildByName('name').getComponent(cc.Label).string = msg.from.name;
            node.getChildByName('msgBox').getChildByName('msg').getComponent(cc.Label).string = msg.msg;
            this.msgContent.addChild(node);
            if(this.msgContent.height>480){
                this.msgScrollView.scrollToBottom(0.3);
            }
        });
        //注册发送给一个人的消息
        NetUtil.Instance.on('toOne',(msg:Message)=>{
            let node = cc.instantiate(this.otherMsgItem);
            node.getChildByName('name').getComponent(cc.Label).string = msg.from.name;
            node.getChildByName('msgBox').getChildByName('msg').getComponent(cc.Label).string = msg.msg;
            node.getChildByName('msgBox').getChildByName('msg').color = cc.Color.RED;
            this.msgContent.addChild(node);
            if(this.msgContent.height>480){
                this.msgScrollView.scrollToBottom(0.3);
            }
        });
    }
```

> UserNode.ts

- 预制件通过user初始化
- 注册了点击事件
- 点击展示单独发送的面板

```ts
    init(user:User){
        this.user = user;
        this.node.on(cc.Node.EventType.TOUCH_END,event=>{
            //获得控制脚本
            let chatCtrl = cc.find('Canvas/chat_room').getComponent(ChatCtrl);
            chatCtrl.showSingleBox(this.user); 
        });
    }
```

> Params.ts

- 定义了两个接口

```ts
export interface User{
    id:string; //用户的id
    name:string; //用户名
    imgUrl:string; //用户头像的图片地址 
}

export interface Message{
    from:User ;     //发送的用户
    msg:string ;    //发送的信息
    to?:string ;    //发送给的人 没有则发送全部
}
```

### 下载：
GitHub地址：[https://github.com/SeaPlanet/cocoscreator_chat](https://github.com/SeaPlanet/cocoscreator_chat)


### 加入频道，实现分频道聊天

- 频道的概念即为游戏中分房间的概念，游戏房间中的数据只对房间内的人广播，可以大大提高效率，减少消耗

![](http://onb8jc081.bkt.clouddn.com/18-4-2/5640543.jpg)

![](http://onb8jc081.bkt.clouddn.com/18-4-2/4240174.jpg)


**之前用于保存用户的数组改为了对象**

```js
//保存用户的数组
var userList = {};
```

**修改后的用户登录接口**

- **userList[user.channel]** 用来保存用户
- **join**方法用于创建和加入频道
- **to**方法用于切换到频道
- 下面会出现的**leave**用于离开频道

```js
    //登录    
    socket.on('login',(user)=>{
        console.log('login');
        console.log(user);
        user.id = socket.id;
        if(!userList[user.channel]){
            userList[user.channel]=[];
        }
        userList[user.channel].push(user);
        socket.join(user.channel);
        //将频道赋值给socket
        socket.channel = user.channel;
        //群发用户列表
        sio.to(user.channel).emit('userList',userList[user.channel]);
        //发送当前用户列表信息
        socket.emit('userInfo',user);
        //除自己外广播用户登录信息
        socket.broadcast.to(user.channel).emit('loginInfo',user.name+"上线了。");
    });
```

**客户端处修改**

- 加入频道输入框
- 加入频道属性 


```ts
export interface User{
    id:string; //用户的id
    name:string; //用户名
    channel:string; //当前的频道
    imgUrl:string; //用户头像的图片地址 
}

```

### 更新下载：
GitHub地址：[https://github.com/SeaPlanet/cocoscreator_chat](https://github.com/SeaPlanet/cocoscreator_chat)


### Tips：

#### Socket.io的默认事件列表

> 服务端事件

事件名称 | 事件解释
---|---
connection | socket连接成功之后触发，用于初始化
message | 客户端通过socket.send来传送消息时触发此事件
anything | 收到任何事件时触发
disconnect | socket失去连接时触发


> 客户端事件

事件名称 | 事件解释
---|---
connect|连接成功
connecting|正在连接
disconnect|断开连接
connect_failed|连接失败
error|错误发生，并且无法被其他事件类型所处理
message|同服务器端message事件
anything|同服务器端anything事件
reconnect_failed|重连失败
reconnect|成功重连
reconnecting|正在重连



