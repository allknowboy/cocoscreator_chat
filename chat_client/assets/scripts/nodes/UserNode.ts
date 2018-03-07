import { User } from "../objs/Params";
import ChatCtrl from "../ctrls/ChatCtrl";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UserNode extends cc.Component {

    user:User = null;

    /**
     * 初始化
     * @param user 
     */
    init(user:User){
        this.user = user;
        this.node.on(cc.Node.EventType.TOUCH_END,event=>{
            //获得控制脚本
            let chatCtrl = cc.find('Canvas/chat_room').getComponent(ChatCtrl);
            chatCtrl.showSingleBox(this.user); 
        });
    }

}
