const io = (window as any).io || {};
export default class NetUtil{
    public static readonly Instance: NetUtil = new NetUtil();
    private NetUtil(){}
    //网络延时 ms
    delayMS:number = 0;
    private sio = null;
    private connected:boolean = false;
    private isPinging:boolean = false;
    private lastRecieveTime:number = 0;
    private lastSendTime:number = 0;
    /** 
     * 初始化
    */
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

    /** 
     * 获取客户端实体
    */
    getClient(){
        return this.sio;
    }

    /** 
     * 开启心跳包
    */
    startHearbeat(){
        this.sio.on('game_pong',()=>{
            //console.log('game_pong');
            this.lastRecieveTime = Date.now();
            this.delayMS = this.lastRecieveTime - this.lastSendTime;
            //console.log(this.delayMS);
        });
        this.lastRecieveTime = Date.now();
        if(!this.isPinging){
            this.isPinging = true;
            cc.game.on(cc.game.EVENT_HIDE,()=>{
                this.ping();
            });
            setInterval(()=>{
                if(this.sio){
                    this.ping();                
                }
            },2000);
            setInterval(()=>{
                if(this.sio){
                    if(Date.now() - this.lastRecieveTime > 10000){
                        this.close();
                    }         
                }
            },500);
        }   
    }

    /** 
     * ping
    */
    ping(){
        if(this.sio){
            this.lastSendTime = Date.now();
            this.sio.emit('game_ping');
        }
    }

    /** 
     * 关闭
    */
    close(){
        console.log('close');
        this.delayMS = null;
        if(this.sio && this.connected){
            this.connected = false;
            this.sio.disconnect();
        }
        this.sio = null;
    }

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



}
