import { Server, Socket } from "socket.io";
import { createShuffledDeck } from "./game.deck.js";
import { fetchUserIdAndRoom } from "../room/room.service.js";
import { startGame } from "./game.service.js";
import { emitUpdatedRoom } from "../room/room.socket.js";
import type { Game } from "./game.type.js";
import type { Room } from "../room/room.type.js";

export function registerGameHandlers(io: Server, socket: Socket) {

    socket.on("startGame", () => {
        const {room} = fetchUserIdAndRoom(socket.id)
        if (!room) return

        const game = startGame(room)
        emitUpdatedGame(io, room, game)
    })
}

function emitUpdatedGame(io: Server, room: Room, game: Game) {
    io.to(room.id).emit("gameData", game)
}