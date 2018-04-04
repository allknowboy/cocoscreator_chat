import NetUtil from "../utils/NetUtil";
import GameUtil from "../utils/GameUtil";
import IoUtils from "../utils/IoUtil";
import { User } from "../objs/Params";
import Toast from "../utils/Toast";

const {ccclass, property} = cc._decorator;

const md5 = require('../libs/md5.min');

@ccclass
export default class LoginCtrl extends cc.Component {

    @property(cc.Label) label: cc.Label = null;
    @property(cc.EditBox) userBox: cc.EditBox = null;
    @property(cc.EditBox) passwordBox: cc.EditBox = null;
    @property(cc.EditBox) channelBox: cc.EditBox = null;

    onLoad(){
        NetUtil.Instance.on('registerInfo',msg=>{
            Toast.makeText(msg,Toast.LENGTH_LONG).show();
        });

        NetUtil.Instance.on('loginInfo',msg=>{
            Toast.makeText(msg,Toast.LENGTH_LONG).show();
        });

    }

    register(){
        let name = this.userBox.string;
        if(name.length<2){
            return;
        }

        let password = this.passwordBox.string;
        if(password.length<2){
            return;
        }
        password = md5(password);

        let user ={name,password};
        NetUtil.Instance.emit('register',user);
    }


    login(){
        let name = this.userBox.string;
        if(name.length<2){
            return;
        }

        let channel = this.channelBox.string;
        if(channel.length<2){
            return;
        }

        let password = this.passwordBox.string;
        if(password.length<2){
            return;
        }
        password = md5(password);

        let user:User ={id:"",name,password,imgUrl:"",channel};
        NetUtil.Instance.emit('login',user);
    }

    update (dt) {
        this.label.string = `${NetUtil.Instance.delayMS}ms`;
        
        if(NetUtil.Instance.delayMS<50){
            this.label.node.color = cc.Color.GREEN;
        }
        else{
            this.label.node.color = cc.Color.RED;
        }
    }
}
