import { Client } from "pg";
import { CallsController } from "./functions/controllers/calls-controller";
import { Oauth } from "./functions/controllers/oauth";
import { RestApi } from "./functions/services/rest-service";
import { WebSocketService } from "./functions/services/webSocket";
import { BdService } from "./bd/bd-services";


(async () => {
    console.log("Привет мир");
    const bd = new BdService();
    await bd.init();
    const ws = new WebSocketService();
    await ws.init();
    const restApi = new RestApi(ws);
    new Oauth(ws, bd);
    new CallsController(ws);
})();

