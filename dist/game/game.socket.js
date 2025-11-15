import { Server, Socket } from "socket.io";
import { createShuffledDeck } from "./game.deck.js";
import { fetchUserIdAndRoom } from "../room/room.service.js";
import { startGame } from "./game.service.js";
import { emitUpdatedRoom } from "../room/room.socket.js";
export function registerGameHandlers(io, socket) {
    socket.on("startGame", () => {
        const { room } = fetchUserIdAndRoom(socket.id);
        if (!room)
            return;
        const game = startGame(room);
        emitUpdatedGame(io, room, game);
    });
}
function emitUpdatedGame(io, room, game) {
    io.to(room.id).emit("gameData", game);
}
//# sourceMappingURL=game.socket.js.map