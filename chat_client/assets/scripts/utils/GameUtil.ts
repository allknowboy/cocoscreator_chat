import { User } from "../objs/Params";

export default class GameUtil {

    public static readonly Instance: GameUtil = new GameUtil();
    private GameUtil(){}

    //用户信息
    userInfo:User;

    /** 
     * 获得guid
    */
    guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
          return v.toString(16);
        });
    }



}
