import { OnMessage, WebSocketService } from "../services/webSocket";

export class CallsController { 
    constructor(public readonly webSocketService: WebSocketService) {
        this.init();
    }
    
    init() {
        // this.webSocketService.onMessage.subscribe((e: OnMessage) => {
        //     const data = e.data;
        //     const ws = e.ws;
        //         if(data.type === 'newName') {
        //             console.log('newName', data);
        //             this.webSocketService.listUsers.push({name: data.message, ws: ws, status: 'online'});
        //             //nameUser = data.message;
        //             for(let user of this.webSocketService.listUsers) {
        //                 user.ws.send(JSON.stringify({type: 'user_list', message: this.webSocketService.listUsers.map( (e) => {return {name: e.name, status: e.status}})}));
        //             }
        //         }
        //         //исходящий вызов
        //         if(data.type === 'outgoing_call') {
        //             console.log('call',  data.message);
        //             const find = this.webSocketService.listUsers.find(e=> e.name === data.message.user);
        //             if(find) {
        //                 console.log('call find', find.name);
        //                 find.ws.send(JSON.stringify({type: 'outgoing_call', message: {offer: data.message.offer}}));
        //             }
        //         }
        //         //входящий
        //         if(data.type === 'incoming_call') {
        //           const find = this.webSocketService.listUsers.find(e=> e.name === data.message.user);
        //           if(find) {
        //                 find.ws.send(JSON.stringify({type: 'incoming_call', message: {offer: data.message.offer}}));
        //           }
        //         }

        //         //icecandidate
        //         if(data.type === 'icecandidate') {
        //           const find = this.webSocketService.listUsers.find(e=> e.name === data.message.user);
        //           if(find) {
        //             find.ws.send(JSON.stringify({type: 'icecandidate', message: {candidate: data.message.candidate}}));
        //           }
        //         }
        // })
        
    }
}