/**
 * 吐司的显示任务
 */
interface ToastTask{
    text:string,
    duration:number
}

/**
 * 吐司的实体
 */
class ToastObject{
    private _text;
    private _duration;
    private _gravity;
    private _x = 0;
    private _y = 0;

    /**
     * 初始化
     * @param text 
     * @param duration 
     */
    constructor(text:string,duration:number){
        this._text = text;
        this._duration = duration;
    }

    /**
     * 显示Toast的方法
     */
    show() {
        if(Toast.showing){
            let text = this._text;
            let duration = this._duration;
            Toast.TaskArray.push({text,duration});

            //超过5条之前的直接舍弃
            if(Toast.TaskArray.length>Toast.MAX_ARRAY){
                Toast.TaskArray.shift();
            }

            return;
        }
        // 加载背景纹理
        if (Toast.bgSpriteFrame == null) {
                cc.loader.load({ 'uuid': 'b43ff3c2-02bb-4874-81f7-f2dea6970f18' },(error, result)=>{
                        if (error) {
                            cc.error(error);
                            return;
                        }
                        Toast.bgSpriteFrame = new cc.SpriteFrame(result);
                        Toast.bgSpriteFrame.insetTop = 3;
                        Toast.bgSpriteFrame.insetBottom = 3;
                        Toast.bgSpriteFrame.insetLeft = 4;
                        Toast.bgSpriteFrame.insetRight = 4;
                        //加载完再调用
                        this.show();
                    });
            return;
        }
        Toast.showing = true;
        // canvas
        var canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
        var width = canvas.node.width;
        var height = canvas.node.height;
        if (this._duration === undefined) {
            this._duration = Toast.LENGTH_SHORT;
        }
        // 背景图片设置
        let bgNode = new cc.Node();
        // 背景图片透明度
        bgNode.opacity = 200;
        let bgSprite = bgNode.addComponent(cc.Sprite);
        bgSprite.type = cc.Sprite.Type.SLICED;
        let bgLayout = bgNode.addComponent(cc.Layout);
        bgLayout.resizeMode = cc.Layout.ResizeMode.CONTAINER;

        // Lable文本格式设置
        let textNode = new cc.Node();
        let textLabel = textNode.addComponent(cc.Label);
        textLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        textLabel.verticalAlign = cc.Label.VerticalAlign.CENTER;
        textLabel.fontSize = 20;
        textLabel.string = this._text;

        //背景图片与文本内容的间距
        let hPadding = textLabel.fontSize / 8;
        let vPadding = 2;
        bgLayout.paddingLeft = hPadding;
        bgLayout.paddingRight = hPadding;
        bgLayout.paddingTop = vPadding;
        bgLayout.paddingBottom = vPadding;

        // 当文本宽度过长时，设置为自动换行格式
        if (this._text.length * textLabel.fontSize > width / 3) {
            textNode.width = width / 3;
            textLabel.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        }

        bgNode.addChild(textNode);
        if (Toast.bgSpriteFrame) {
            bgSprite.spriteFrame = Toast.bgSpriteFrame;
        }
        // gravity 设置Toast显示的位置
        if (this._gravity == Toast.CENTER) {
            textNode.y = 0;
            textNode.x = 0;
        } else if (this._gravity == Toast.TOP) {
            textNode.y = textNode.y + (height / 5) * 2;
        } else if (this._gravity == Toast.TOP_LEFT) {
            textNode.y = textNode.y + (height / 5) * 2;
            textNode.x = textNode.x + (width / 5);
        } else if (this._gravity == Toast.LEFT) {
            textNode.x = textNode.x + (width / 5);
        } else if (this._gravity == Toast.BOTTOM_LEFT) {
            textNode.y = textNode.y - (height / 5) * 2;
            textNode.x = textNode.x + (width / 5);
        } else if (this._gravity == Toast.BOTTOM) {
            textNode.y = textNode.y - (height / 5) * 2;
        } else if (this._gravity == Toast.BOTTOM_RIGHT) {
            textNode.y = textNode.y - (height / 5) * 2;
            textNode.x = textNode.x - (width / 5);
        } else if (this._gravity == Toast.RIGHT) {
            textNode.x = textNode.x - (width / 5);
        } else if (this._gravity == Toast.TOP_RIGHT) {
            textNode.y = textNode.y + (height / 5) * 2;
            textNode.x = textNode.x - (width / 5);
        } else {
            // 默认情况 BOTTOM
            textNode.y = textNode.y - (height / 5) * 2;
        }
        textNode.x = textNode.x + this._x;
        textNode.y = textNode.y + this._y;

        canvas.node.addChild(bgNode);

        let finished = cc.callFunc((target)=>{
            bgNode.destroy();
            Toast.showing = false;
            //showing
            if(Toast.TaskArray.length==0){
                
            }
            else{
                let task =  Toast.TaskArray.shift();
                Toast.showText(task.text,task.duration);
            }
        });
        let action = cc.sequence(cc.moveBy(this._duration,cc.p(0,0)),cc.fadeOut(0.3), finished);
        bgNode.runAction(action);
    }

    /**
     * 
     * @param gravity 位置
     * @param x 偏移值x
     * @param y 偏移值y
     */
    setGravity(gravity:number, x:number, y:number) {
        this._gravity = gravity;
        this._x = x;
        this._y = y;
    }
}


export default class Toast{
    /**
     * 时长
     */
    static LENGTH_LONG:number = 3.5;
    static LENGTH_SHORT:number = 1;
    /**
     * 位置
     */
    static CENTER:number = 0;
    static TOP:number = 1;
    static TOP_LEFT:number = 2;
    static LEFT:number = 3;
    static BOTTOM_LEFT:number = 4;
    static BOTTOM:number = 5;
    static BOTTOM_RIGHT:number = 6;
    static RIGHT:number = 7;
    static TOP_RIGHT:number = 8;

    static bgSpriteFrame:cc.SpriteFrame = null;

    //任务队列
    static TaskArray:Array<ToastTask> = [];

    //是否正在显示
    static showing:boolean = false;

    static MAX_ARRAY:number = 5;
    /**
     * 
     * 创建一个吐司
     * @param text 文本
     * @param duration 时长
     */
    static makeText(text:string,duration:number){
        return new ToastObject(text, duration);
    }

    /**
     * 
     * 显示一个吐司
     * @param text 文本
     * @param duration 时长
     */
    static showText(text:string,duration:number){
        Toast.makeText(text, duration).show();
    }

}
