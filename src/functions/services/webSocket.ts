import { WebSocketServer } from "ws";
import { firstValueFrom, Observable, Subject } from 'rxjs';
import crypto  from 'crypto';
export interface UsersStatus {
    name: string,
    ws: Ws,
    location?: number[],
    id: string,
    status: string
}
export interface OnMessage  {ws: Ws, data: any};
export class Ws {
    constructor(public readonly ws: any, public readonly codeWs: string, public readonly listUser: UsersStatus[], public readonly responseAjax: Subject<any>) {}
    code: string | null = null;
    send(type: string, data: any) {
        console.log(JSON.stringify(data), "data123")
        this.ws.send(JSON.stringify({type: type, message: data}));
    }

    sendAjax(type: string, message: any, timeConnect: number = 100000): {promise: Promise<any>, stop: () => void} {
        
        this.code = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        this.ws.send(JSON.stringify({message, type, code: this.code, timeConnect, to: 'front'}));
        const p =  new Promise((resolve) => {
            this.responseAjax.subscribe((e) => {
            if (e.code == this.code) {
                if(e.errorCode == 'stop') {
                resolve({errorCode: 'stop'});
                } else {
                resolve(e.message);
                }
            }
            })
        });
        
        return {promise: p, stop: () => {
            this.ws.send(JSON.stringify({message, type, code: this.code, timeConnect, to: 'front', errorCode: 'stop'}));
      }};
        
    }

    stop () {
        this.responseAjax.next({code: this.code, errorCode: 'stop'});
    }
}
export class WebSocketService {

    private wss! : WebSocketServer;
    listUsers: UsersStatus[] = [];
    private readonly _onMessage = new Subject<OnMessage>();
    // Ответ от фронта
    responseAjax = new Subject();
    //для обычных запросов
    onMessage!: (type: string, fun: (e: OnMessage) => void) => void;
    //Запрос с ответом 
    onMessageAjax!: (type: string,  fun: (e: OnMessage,  brake: Observable<boolean>) =>  Promise<Object>) => void;
    constructor () {
        //this.init();
    }

    async init() {
        this.onMessage = function (type: string, fun: (e: OnMessage) => void) {
            this._onMessage.subscribe((e: OnMessage) => {
                
                try {
                    if(e.data.type === type){
                        e.data = e.data.message;
                        fun(e);
                    }
                } catch (err) {
                    console.log("произошла ошибка: ",e.data, err );
                }
            })
        }

        this.onMessageAjax = async function (type: string, fun: (e: OnMessage, brake: Observable<boolean>) => Promise<any> | any) {
            const brakeCode: {[key: string]:{brake:  Subject<boolean>, b: boolean}} = {} //{[key => ]}
            this._onMessage.subscribe(async (e: OnMessage) => {
                const code = e.data.code;
                if(e.data.type === type){
                   
                   if(brakeCode[code]) {
                        if(e.data.errorCode){
                            brakeCode[code].brake.next(true);
                            brakeCode[code].b =  false;
                        }
                   }else {
                        //code = e.data.code;
                        brakeCode[code] = {brake: new Subject<boolean>(), b: true};
                        console.log(" brakeCode[e.data.code]",  brakeCode[e.data.code])
                        //e.data = e.data.message;
                        try {
                            const b = brakeCode[code];
                            console.log(" brakeCode[e.data.code]xxxxx",  brakeCode[code], code, b)
                            if(b){
                                const message = await fun({...e, data: e.data.message}, b.brake.asObservable());
                                if(brakeCode[code].b) {
                                    e.ws.ws.send(JSON.stringify({type, message, code: code, to: 'server'}));
                                }
                            } else {
                                throw new Error("хуйня какая то")
                            }
                        
                        } catch (err){
                            console.log("errror ", err);
                            e.ws.ws.send(JSON.stringify({type, code: code, to: 'server', errorCode: 'stop'}));
                        }
                  
                   } 
                   
                }
                delete brakeCode[code];
            });
        }


        this.wss = new WebSocketServer({ port: 3200 });
        this.wss.on('connection', (ws: WebSocketServer) => {
            const codeWs = crypto.randomUUID();
            //let userId: any = null;
            ws.on("close", ()=> {
                console.log("close");
                this.clearUser (codeWs);
            });
            ws.on('message', async (message: string) => {
            
             console.log("message", message+ "");
             try {
                const data = JSON.parse(message);
                if(data.to == 'front') {
                    this.responseAjax.next(data);
                    
                } else {
                    this._onMessage.next({ws: new Ws(ws, codeWs, this.listUsers, this.responseAjax), data: data});
                }
                

             } catch (e) {
                console.log("ошибка",e)
             }

            });
        });
    }

    
    clearUser (codeWs: string) {
        if(codeWs) {
            const index = this.listUsers.findIndex(user => user.ws.codeWs === codeWs);
            if (index !== -1) {
                this.listUsers.splice(index, 1);
                this.reloadUserList();
            }
        }
    }

    reloadUserList() {
        for(let user of this.listUsers) {
            let listFilter = this.listUsers.filter( (e) => {
                if(user.location){
                    if(user.id !== e.id) {
                        return e;
                    }
                }
            });
            console.log(listFilter, "listFilter");
            user.ws.send('user_list', listFilter.map(e => { return {
                    name: e.name, status: e.status, id: e.id, location: e.location
            }}));  
        }
    }
}