import { Server, Socket } from "socket.io";
import { createShuffledDeck } from "./game.deck.js";
import { fetchUserIdAndRoom } from "../room/room.service.js";
import { attackMove, counterMove, defendMove, endAttackerTurn, firstMoveDealt, startGame, yieldTurn } from "./game.service.js";
import { emitUpdatedRoom } from "../room/room.socket.js";
import type { Card, Game, PlayedCards } from "./game.type.js";
import type { Room } from "../room/room.type.js";

export function registerGameHandlers(io: Server, socket: Socket) {

    socket.on("startGame", () => {
        const {room} = fetchUserIdAndRoom(socket.id)
        if (!room) return

        const {success, game, error, message} = startGame(room)
        if (success && game) {
            emitUpdatedGame(io, room, game)
            message && emitCommentToRoom(io,room,message)
        } else {
            error && emitErrorMessageToSocket(socket, error)
        }
    })

    socket.on("firstMove", ({card} : {card: Card}) => {
        const {room, userId} = fetchUserIdAndRoom(socket.id)
        if (!room || !userId) return
        const game = room.game
        if (!game) return

        const {success, game: updatedGame, error, message} = firstMoveDealt(userId, card, game)
        if (success && updatedGame ) {
            emitUpdatedGame(io, room, updatedGame)
            message && emitCommentToRoom(io,room,message)
        } else {
            error && emitErrorMessageToSocket(socket, error)
        }
    })

    socket.on("attackMove", ({card}: {card: Card}) => {
        const {room, userId} = fetchUserIdAndRoom(socket.id)
        if (!room || !userId) return
        const game = room.game
        if (!game) return

        const {success, game: updatedGame, error, message} = attackMove(userId, card, game)
        if (success && updatedGame ) {
            emitUpdatedGame(io, room, updatedGame)
            message && emitCommentToRoom(io,room,message)
        } else {
            error && emitErrorMessageToSocket(socket, error)
        }
    })

    socket.on("endAttackerTurn", () => {
        const {room, userId} = fetchUserIdAndRoom(socket.id)
        if (!room || !userId) return
        const game = room.game
        if (!game) return

        const {success, game: updatedGame, error, message} = endAttackerTurn(userId, game)
        if (success && updatedGame ) {
            emitUpdatedGame(io, room, updatedGame)
            console.log(message);
            message && emitCommentToRoom(io,room,message)
        } else {
            error && emitErrorMessageToSocket(socket, error)
        }
    })

    socket.on("defendMove", ({defCard, cardPair}: {defCard: Card, cardPair: PlayedCards}) => {
        const {room, userId} = fetchUserIdAndRoom(socket.id)
        if (!room || !userId) return
        const game = room.game
        if (!game) return

        const {success, game: updatedGame, error, message} = defendMove(userId, defCard, cardPair,  game)
        if (success && updatedGame ) {
            emitUpdatedGame(io, room, updatedGame)
            message && emitCommentToRoom(io,room,message)
        } else {
            error && emitErrorMessageToSocket(socket, error)
        }
    })
    
    socket.on("counterMove", ({counterCard}: {counterCard: Card}) => {
        const {room, userId} = fetchUserIdAndRoom(socket.id)
        if (!room || !userId) return
        const game = room.game
        if (!game) return
        
        const {success, game: updatedGame, error, message} = counterMove(userId, counterCard, game)
        if (success && updatedGame ) {
            emitUpdatedGame(io, room, updatedGame)
            message && emitCommentToRoom(io,room,message)
        } else {
            error && emitErrorMessageToSocket(socket, error)
        }
    })
    
    socket.on("yieldTurn", () => {
        const {room, userId} = fetchUserIdAndRoom(socket.id)
        if (!room || !userId) return
        const game = room.game
        if (!game) return

        const {success, game: updatedGame, error, message} = yieldTurn(userId, game)
        if (success && updatedGame ) {
            emitUpdatedGame(io, room, updatedGame)
            message && emitCommentToRoom(io,room,message)
        } else {
            error && emitErrorMessageToSocket(socket, error)
        }
    })
}

export function emitUpdatedGame(io: Server, room: Room, game: Game | null) {
    io.to(room.id).emit("gameData", game)
}

export function emitCommentToRoom(io: Server, room: Room, comment: string){
    io.to(room.id).emit("newComment", comment)
}

export function emitErrorMessageToSocket(socket: Socket, errorMsg: string) {
    socket.emit("errorMessage", errorMsg)
}

