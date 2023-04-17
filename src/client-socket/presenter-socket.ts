import Game from "@/core/game";
import createAppSocket from "../app-socket/lib/core/AppSocket";
import NativeSocketTransport from "../app-socket/lib/transport-stompjs/NativeSocketTransport";
import { playerJoinMessage } from "./IncomingMessages";

const presenterSocket = createAppSocket({
    url: `ws://192.168.1.23:8080/coop-presenter`,
    transport: new NativeSocketTransport(),
    debug: true
});

presenterSocket.subscribe(playerJoinMessage, (event) => {
    Game.joinPlayer(event.body.playerName, event.body.playerId)
})

presenterSocket.connect()

export default presenterSocket