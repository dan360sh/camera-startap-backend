import { WebSocketServer } from "ws";
import { Observable, Subject } from 'rxjs';
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
    constructor(public readonly ws: any, public readonly codeWs: string) {}
    send(data: any) {
        console.log(JSON.stringify(data), "data123")
        this.ws.send(JSON.stringify(data));
    }

    userSend(data: any) {
        data = JSON.stringify(data);
    }
}
export class WebSocketService {

    private wss! : WebSocketServer;
    listUsers: UsersStatus[] = [];
    private readonly _onMessage = new Subject<OnMessage>();
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
            this._onMessage.subscribe(async (e: OnMessage) => {
                const brake = new Subject<boolean>();
                let code: string | null = null;
                let b = true;
                if(e.data.type === type){
                   if(code && code == e.data.code) {
                        if(e.data.errorCode){
                            brake.next(true);
                            b =  false;
                        }
                   }else {
                        code = e.data.code;
                        e.data = e.data.message;
                        try {
                            const message = await fun(e, brake.asObservable());
                            if(b) {
                                e.ws.send({type, message, code, to: 'server'});
                            }
                        
                        }catch (err){

                        }
                  
                   } 
                   
                }
                code = null;
                b = true;
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
                this._onMessage.next({ws: new Ws(ws, codeWs), data: JSON.parse(message)});

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
            user.ws.send({type: 'user_list', message: listFilter.map(e => { return {
                    name: e.name, status: e.status, id: e.id, location: e.location
            }})});  
        }
    }
}