import { RestApi } from "./functions/services/rest-service";
import { WebSocketService } from "./functions/services/webSocket";


(async () => {
    console.log("Привет мир");
    const ws = new WebSocketService();
    const restApi = new RestApi(ws);
})();

