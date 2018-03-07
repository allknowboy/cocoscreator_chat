import NetUtil from "../utils/NetUtil";
import GameUtil from "../utils/GameUtil";
import IoUtils from "../utils/IoUtil";
import { User } from "../objs/Params";

const {ccclass, property} = cc._decorator;

@ccclass
export default class LoginCtrl extends cc.Component {

    @property(cc.Label) label: cc.Label = null;
    @property(cc.EditBox) userBox: cc.EditBox = null;


    login(){
        let name = this.userBox.string;
        if(name.length<2){
            return;
        }
        let user:User ={id:"",name,imgUrl:""};
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
