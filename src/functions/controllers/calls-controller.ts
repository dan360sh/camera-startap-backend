import { Observable } from "rxjs";
import { OnMessage, WebSocketService } from "../services/webSocket";

export class CallsController { 
    constructor(public readonly webSocketService: WebSocketService) {
        this.init();
    }
    
    init() {
        this.webSocketService.onMessageAjax('call', async (e: OnMessage, brake: Observable<boolean>) => {
            console.log("Привет мир",e. data);
            return new Promise ((resolve) => {
                const findUser = this.webSocketService.listUsers.find(el => el.id == e.data.id);
                if (findUser) {
                    const ajaxCall = findUser.ws.sendAjax('incoming-call', {id: e.ws.codeWs});
                    brake.subscribe(e => {
                        ajaxCall.stop();
                        console.log("это конец");

                        resolve({errorCode: "stop"});
                    });
                    ajaxCall.promise.then(r => {
                        console.log("ответ", r);
                        if (r) {
                            resolve({id: findUser.ws.codeWs});
                        }
                    });

                }else {
                    resolve({errorCode: "stop"});
                }  
            })
        });

        this.webSocketService.onMessage('icecandidate', (e) => {
            const find = this.webSocketService.listUsers.find(el => el.ws.codeWs == e.data.id);
            if(find) {
                find.ws.send('icecandidate', e.data.candidate);
            }
            
        });

        this.webSocketService.onMessageAjax('offer',  async (e: OnMessage, brake: Observable<boolean>) => {
          console.log('offer e', e)
          const findUser = this.webSocketService.listUsers.find(el => el.id == e.data.id);
          console.log('offer findUser', findUser)
            if (findUser) {
                 const r: any = await findUser.ws.sendAjax('incoming-offer', {id: e.ws.codeWs, offer: e.data.offer}).promise;
                 console.log('offer r', r)
                if (r) {
                    return {id: findUser.ws.codeWs,  offer: r}
                }
            }
            return {
                errorCode: "stop"
            }
            
        });
        
    }
}