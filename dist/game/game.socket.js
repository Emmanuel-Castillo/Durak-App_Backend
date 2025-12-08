import { Server, Socket } from "socket.io";
import { createShuffledDeck } from "./game.deck.js";
import { fetchUserIdAndRoom } from "../room/room.service.js";
import { attackMove, counterMove, defendMove, endAttackerTurn, firstMoveDealt, startGame, yieldTurn } from "./game.service.js";
import { emitUpdatedRoom } from "../room/room.socket.js";
export function registerGameHandlers(io, socket) {
    socket.on("startGame", () => {
        const { room } = fetchUserIdAndRoom(socket.id);
        if (!room)
            return;
        const { success, game, error, message } = startGame(room);
        if (success && game) {
            emitUpdatedGame(io, room, game);
            message && emitCommentToRoom(io, room, message);
        }
        else {
            error && emitErrorMessageToSocket(socket, error);
        }
    });
    socket.on("firstMove", ({ card }) => {
        const { room, userId } = fetchUserIdAndRoom(socket.id);
        if (!room || !userId)
            return;
        const game = room.game;
        if (!game)
            return;
        const { success, game: updatedGame, error, message } = firstMoveDealt(userId, card, game);
        if (success && updatedGame) {
            emitUpdatedGame(io, room, updatedGame);
            message && emitCommentToRoom(io, room, message);
        }
        else {
            error && emitErrorMessageToSocket(socket, error);
        }
    });
    socket.on("attackMove", ({ card }) => {
        const { room, userId } = fetchUserIdAndRoom(socket.id);
        if (!room || !userId)
            return;
        const game = room.game;
        if (!game)
            return;
        const { success, game: updatedGame, error, message } = attackMove(userId, card, game);
        if (success && updatedGame) {
            emitUpdatedGame(io, room, updatedGame);
            message && emitCommentToRoom(io, room, message);
        }
        else {
            error && emitErrorMessageToSocket(socket, error);
        }
    });
    socket.on("endAttackerTurn", () => {
        const { room, userId } = fetchUserIdAndRoom(socket.id);
        if (!room || !userId)
            return;
        const game = room.game;
        if (!game)
            return;
        const { success, game: updatedGame, error, message } = endAttackerTurn(userId, game);
        if (success && updatedGame) {
            emitUpdatedGame(io, room, updatedGame);
            console.log(message);
            message && emitCommentToRoom(io, room, message);
        }
        else {
            error && emitErrorMessageToSocket(socket, error);
        }
    });
    socket.on("defendMove", ({ defCard, cardPair }) => {
        const { room, userId } = fetchUserIdAndRoom(socket.id);
        if (!room || !userId)
            return;
        const game = room.game;
        if (!game)
            return;
        const { success, game: updatedGame, error, message } = defendMove(userId, defCard, cardPair, game);
        if (success && updatedGame) {
            emitUpdatedGame(io, room, updatedGame);
            message && emitCommentToRoom(io, room, message);
        }
        else {
            error && emitErrorMessageToSocket(socket, error);
        }
    });
    socket.on("counterMove", ({ counterCard }) => {
        const { room, userId } = fetchUserIdAndRoom(socket.id);
        if (!room || !userId)
            return;
        const game = room.game;
        if (!game)
            return;
        const { success, game: updatedGame, error, message } = counterMove(userId, counterCard, game);
        if (success && updatedGame) {
            emitUpdatedGame(io, room, updatedGame);
            message && emitCommentToRoom(io, room, message);
        }
        else {
            error && emitErrorMessageToSocket(socket, error);
        }
    });
    socket.on("yieldTurn", () => {
        const { room, userId } = fetchUserIdAndRoom(socket.id);
        if (!room || !userId)
            return;
        const game = room.game;
        if (!game)
            return;
        const { success, game: updatedGame, error, message } = yieldTurn(userId, game);
        if (success && updatedGame) {
            emitUpdatedGame(io, room, updatedGame);
            message && emitCommentToRoom(io, room, message);
        }
        else {
            error && emitErrorMessageToSocket(socket, error);
        }
    });
}
export function emitUpdatedGame(io, room, game) {
    io.to(room.id).emit("gameData", game);
}
export function emitCommentToRoom(io, room, comment) {
    io.to(room.id).emit("newComment", comment);
}
export function emitErrorMessageToSocket(socket, errorMsg) {
    socket.emit("errorMessage", errorMsg);
}
//# sourceMappingURL=game.socket.js.map