import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import { WebSocketService } from './webSocket';
export class RestApi{
    app: Application = express();
    constructor (public ws: WebSocketService) {
        this.app.use(cors());
        const PORT = process.env.PORT || 3000;
        this.app.use(express.json()); // для application/json
        this.app.use(express.urlencoded({ extended: true })); // для form-dat
        this.app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

        this.app.post('/outgoingCall', (req: Request, res: Response) => {
            console.log(req.body, "req.body");
            const data = req.body;
            const find = ws.listUsers.find(data.user);
            if(find) {
                //find.ws.send(JSON.stringify({type: 'call', message}))
            }
            
            res.json({user: 'hello'});
        })
    }

}
