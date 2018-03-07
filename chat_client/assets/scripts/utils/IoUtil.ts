export default class IoUtils {
    /**
     * 获取数据
     * @param key 键
     */
    static get(key:string):string{
        return cc.sys.localStorage.getItem(key);
    }

    /**
     * 保存数据
     * @param key 键
     * @param value 值 
     */
    static put(key:string, value:string){
        cc.sys.localStorage.setItem(key, value);
    }

    /**
     * 删除数据
     * @param key 键
     */
    static remove(key:string){
        cc.sys.localStorage.removeItem(key) ;
    }
}