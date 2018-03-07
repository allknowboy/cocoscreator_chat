import NetUtil from "../utils/NetUtil";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Loading extends cc.Component {

    //初始化项目
    initGame(){
        NetUtil.Instance.init();

    }

    onLoad () {
        this.initGame();
        setTimeout(()=>{
            cc.director.loadScene('Chat');
        },1000);

    }
}
