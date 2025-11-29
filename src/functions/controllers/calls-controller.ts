import { Observable } from "rxjs";
import { OnMessage, WebSocketService } from "../services/webSocket";

export class CallsController { 
    constructor(public readonly webSocketService: WebSocketService) {
        this.init();
    }
    
    init() {
        this.webSocketService.onMessageAjax('call', async (e: OnMessage, brake: Observable<boolean>) => {
            console.log("Привет мир",e. data);
            let user1 = this.webSocketService.listUsers.find(el => el.ws == e.data.id);

            let user2 = this.webSocketService.listUsers.find(el => el.ws == e.ws.codeWs);
            if(user1?.callIs || user1?.callIs) {
                return {errorCode: "stop"};
            }
            if(user1) {user1.callIs = true;}
            if(user2) { user2.callIs = true;}
            return new Promise ((resolve) => {
                const findUser = this.webSocketService.users.find(el => el.ws.codeWs == e.data.id);
                if (findUser) {
                    const ajaxCall = findUser.ws.sendAjax('incoming-call', {id: e.ws.codeWs});
                    brake.subscribe(e => {
                        ajaxCall.stop();
                        console.log("это конец");
                        if(user1) {user1.callIs = false;}
                        if(user2) { user2.callIs = false;}
                        resolve({errorCode: "stop"});
                    });
                    ajaxCall.promise.then(r => {
                        console.log("ответ", r);
                        if (r.errorCode) {
                            if(user1) {user1.callIs = false;}
                            if(user2) { user2.callIs = false;}
                            resolve({errorCode: 'stop'});
                        } else {
                            resolve({id: findUser.ws.codeWs});
                        }  
                    });

                }else {
                    if(user1) {user1.callIs = false;}
                    if(user2) { user2.callIs = false;}
                    resolve({errorCode: "stop"});
                }  
            });
        });

        this.webSocketService.onMessage('icecandidate', (e) => {
            const find = this.webSocketService.users.find(el => el.ws.codeWs == e.data.id);
            if(find) {
                find.ws.send('icecandidate', e.data.candidate);
            }
            
        });

        this.webSocketService.onMessage('stop-call', (e) => {
            let user1 = this.webSocketService.listUsers.find(el => el.ws == e.data.id);
            let user2 = this.webSocketService.listUsers.find(el => el.ws == e.ws.codeWs);
            if(user1) {user1.callIs = false;}
            if(user2) { user2.callIs = false;}
        })

        this.webSocketService.onMessageAjax('offer',  async (e: OnMessage, brake: Observable<boolean>) => {
          console.log('offer e', e)
          const findUser = this.webSocketService.users.find(el => el.ws.codeWs == e.data.id);
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