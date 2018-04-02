import NetUtil from "../utils/NetUtil";
import { User, Message } from "../objs/Params";
import GameUtil from "../utils/GameUtil";
import UserNode from "../nodes/UserNode";
import Toast from "../utils/Toast";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ChatCtrl extends cc.Component {

    @property(cc.Node) userContent:cc.Node = null;
    @property(cc.Prefab) userItem:cc.Prefab = null;

    @property(cc.Node) msgContent:cc.Node = null;
    @property(cc.Prefab) otherMsgItem:cc.Prefab = null;
    @property(cc.Prefab) selfMsgItem:cc.Prefab = null;

    @property(cc.EditBox) sendAllBox:cc.EditBox = null;
    @property(cc.EditBox) sendOneBox:cc.EditBox = null;
    @property(cc.ScrollView) msgScrollView:cc.ScrollView = null;

    @property(cc.Node) singleBox:cc.Node = null;

    @property(cc.Label) userInfoLabel:cc.Label = null;

    userList:Array<User> = [];

    singleUser:User = null;


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
            this.userInfoLabel.string = `当前用户是：${user.name}  当前所处的频道是:${user.channel}`

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

    //更新用户列表的方法
    updateUserList(userList:Array<User>){
        //首先清空容器
        this.userContent.removeAllChildren();
        userList.forEach(user=>{
            //将用户数据加入容器
            let node = cc.instantiate(this.userItem);
            node.getComponent(UserNode).init(user);
            node.getChildByName('name').getComponent(cc.Label).string = user.name; 
            this.userContent.addChild(node);
        })
    }
    //发送给所有人的方法
    sendToAll(){
        let str = this.sendAllBox.string;
        if(str.length<1){
            return;
        }
        this.sendAllBox.string = "";
        let node = cc.instantiate(this.selfMsgItem);
        node.getChildByName('name').getComponent(cc.Label).string = GameUtil.Instance.userInfo.name;
        node.getChildByName('msgBox').getChildByName('msg').getComponent(cc.Label).string = str;
        this.msgContent.addChild(node);
        
        let msg:Message ={from:GameUtil.Instance.userInfo,msg:str}; 
        NetUtil.Instance.emit('toAll',msg);
        if(this.msgContent.height>480){
            this.msgScrollView.scrollToBottom(0.3);
        }
        
    }
    //发送给一个人的方法
    sendToOne(){
        let str = this.sendOneBox.string;
        if(str.length<1){
            return;
        }
        this.sendOneBox.string = "";
        let node = cc.instantiate(this.selfMsgItem);
        node.getChildByName('name').getComponent(cc.Label).string = GameUtil.Instance.userInfo.name;
        node.getChildByName('msgBox').getChildByName('msg').getComponent(cc.Label).string = str;
        this.msgContent.addChild(node);
        
        let msg:Message ={from:GameUtil.Instance.userInfo,msg:str,to:this.singleUser.id}; 
        NetUtil.Instance.emit('toOne',msg)
        if(this.msgContent.height>480){
            this.msgScrollView.scrollToBottom(0.3);
        }
        this.singleBox.active = false;
    }
    //显示当然消息界面的方法
    showSingleBox(user:User){
        //缓存需要发送的人的消息
        this.singleUser = user;
        this.singleBox.getChildByName('board').getChildByName('to').getComponent(cc.Label).string = user.name;
        this.singleBox.active = true;
    }
}
