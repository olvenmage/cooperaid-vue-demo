import Game from "@/core/game";
import createAppSocket from "../app-socket/lib/core/AppSocket";
import NativeSocketTransport from "../app-socket/lib/transport-stompjs/NativeSocketTransport";
import { playerJoinMessage } from "./IncomingMessages";

const presenterSocket = createAppSocket({
    url: `ws://127.0.0.1:8080/coop-presenter`,
    transport: new NativeSocketTransport(),
    debug: true
});

presenterSocket.subscribe(playerJoinMessage, (event) => {
    console.log("PLAYER ATTEMPTS TO JOIN")
    console.log(event)
    Game.joinPlayer(event.body.playerClass, event.body.playerId)
})

presenterSocket.connect()

export default presenterSocket