import { Observable } from "rxjs";
import { OnMessage, WebSocketService } from "../services/webSocket";
import jwt from 'jsonwebtoken';
import { BdService } from "../../bd/bd-services";
import crypto  from 'crypto';
const iconArray: string[] = ['Tung-Tung-Tung-Sahur', 'Brr-Brr-Patapim', 'Cappuccino-Assassino', 'Ballerina-Capuchina', 'Saitama-meme', 'Pochita-Chainsaw', 'Luffy-Monkey', 'tralalero-tralala', 'Udin-Din-Din-Dun', 'Cartoon-Colorful', 'Peter-Griffin'];
function getRandomNumber(n: number) {
  return Math.floor(Math.random() * (n + 1));
}
export class Oauth {
    constructor(public readonly webSocketService: WebSocketService, public readonly bd: BdService) {
        this.init();
    }

        
    init() {
        this.webSocketService.onMessageAjax('send-token', async (e: OnMessage, brake: Observable<boolean>) => {
            console.log('send-token', e.data);
            const decoded: any = jwt.decode(e.data);
            console.log(decoded, 'decoded')
            const uuid = crypto.randomUUID();
            const result = await this.bd.criateOrSearchUser(decoded.name, decoded.email, uuid, decoded.sub);
            console.log(result, 'result',  result.rows[0])
            const r = result.rows[0];

            return {name: r.username, email: r.email, token: r.token, id: r.id}
        });

        this.webSocketService.onMessageAjax('authorization', async (e: OnMessage, brake: Observable<boolean>) => {
            if(e.data.token) {
                const r = await this.bd.searchToken(e.data.token);
                const user = r.rows[0];
                if(user) {
                    this.webSocketService.users.push({ws: e.ws, id: user.id});
                    this.webSocketService.getUserList();
                    return {id: user.id, username: user.username, email: user.email, codeWs: e.ws.codeWs};
                }
                return false;
            } else if (e.data.code){
                this.webSocketService.users.push({ws: e.ws, id: e.data.code});
                this.webSocketService.getUserList();
                return {code: e.data.code, codeWs: e.ws.codeWs}
            }
            return false;

            
        });

        this.webSocketService.onMessage('go-out', (e: OnMessage) => {
            this.webSocketService.clearUser(e.ws.codeWs);
        });

        this.webSocketService.onMessage('location', (el: OnMessage) => {
            console.log(el.data, "el.data")
            const find = this.webSocketService.listUsers.find(e => e.ws == el.ws.codeWs);
            if(find) {
                find.location = el.data;
                
            } else {
                this.webSocketService.listUsers.push({location: el.data, ws: el.ws.codeWs, icon: iconArray[getRandomNumber(iconArray.length - 1)]})
            }
        }); 

        this.webSocketService.onMessage('switch_off', (el: OnMessage) => {
            const index = this.webSocketService.listUsers.findIndex(e => e.ws == el.ws.codeWs);
            if (index !== -1) {
                this.webSocketService.listUsers.splice(index, 1);
            }
        });
    }
}