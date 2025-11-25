import { Observable } from "rxjs";
import { OnMessage, WebSocketService } from "../services/webSocket";

export class CallsController { 
    constructor(public readonly webSocketService: WebSocketService) {
        this.init();
    }
    
    init() {
        this.webSocketService.onMessageAjax('call', async (e: OnMessage, brake: Observable<boolean>) => {
            console.log("Привет мир",e. data);
            const findUser = this.webSocketService.listUsers.find(el => el.id == e.data.id);
            if (findUser) {
                const r: any = await findUser.ws.sendAjax('incoming-call', {id: e.ws.codeWs});
                console.log("ответ", r);
                if (r) {
                    return {id: findUser.ws.codeWs}
                }
            } 
            return {
                errorCode: "stop"
            }
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
                 const r: any = await findUser.ws.sendAjax('incoming-offer', {id: e.ws.codeWs, offer: e.data.offer});
                 console.log('offer r', r)
                if (r) {
                    return {id: findUser.ws.codeWs,  offer: e.data.offer}
                }
            }
            return {
                errorCode: "stop"
            }
            
        });
        
    }
}