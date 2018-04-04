export interface User{
    id:string; //用户的id
    name:string; //用户名
    password:string; //密码
    channel:string; //当前的频道
    imgUrl:string; //用户头像的图片地址 
}

export interface Message{
    from:User ;     //发送的用户
    msg:string ;    //发送的信息
    to?:string ;    //发送给的人 没有则发送全部
}