import { WebSocketServer } from "ws";
interface UsersStatus{
    name: string,
    ws: any,
    status: string
}
export class WebSocketService {

    private wss! : WebSocketServer;
    listUsers: UsersStatus[] = [];
    constructor () {
        this.init();
    }

    async init() {
        this.wss = new WebSocketServer({ port: 3200 });
        this.wss.on('connection', (ws: WebSocketServer) => {
            let nameUser: any = null;
            ws.on("close", ()=> {
                console.log("close");
                if(nameUser) {
                    const index = this.listUsers.findIndex(user => user.name === nameUser);
                    if (index !== -1) {
                        this.listUsers.splice(index, 1);
                        for(let user of this.listUsers) {
                            user.ws.send(JSON.stringify({type: 'user_list', message: this.listUsers.map( (e) => {return {name: e.name, status: e.status}})}));
                        }
                    }
                }
            });
            ws.on('message', async (message: string) => {
             console.log("message", message+ "");
             try {
                const data = JSON.parse(message);
                if(data.type === 'newName') {
                    console.log('newName', data);
                    this.listUsers.push({name: data.message, ws: ws, status: 'online'});
                    nameUser = data.message;
                    for(let user of this.listUsers) {
                        user.ws.send(JSON.stringify({type: 'user_list', message: this.listUsers.map( (e) => {return {name: e.name, status: e.status}})}));
                    }
                }
                //исходящий вызов
                if(data.type === 'outgoing_call') {
                    console.log('call',  data.message);
                    const find = this.listUsers.find(e=> e.name === data.message.user);
                    if(find) {
                        console.log('call find', find.name);
                        find.ws.send(JSON.stringify({type: 'outgoing_call', message: {offer: data.message.offer, user: nameUser}}));
                    }
                }
                //входящий
                if(data.type === 'incoming_call') {
                  const find = this.listUsers.find(e=> e.name === data.message.user);
                  if(find) {
                        find.ws.send(JSON.stringify({type: 'incoming_call', message: {offer: data.message.offer, user: nameUser}}));
                  }
                }

                //icecandidate
                if(data.type === 'icecandidate') {
                  const find = this.listUsers.find(e=> e.name === data.message.user);
                  if(find) {
                    find.ws.send(JSON.stringify({type: 'icecandidate', message: {candidate: data.message.candidate, user: nameUser}}));
                  }
                }

             } catch (e) {
                console.log("ошибка",e)
             }
             
             //ws.send("hello, i server");

            });
        });
    }
}