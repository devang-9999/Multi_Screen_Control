/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable prettier/prettier */

import { Socket, Server } from "socket.io";
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketServer, WebSocketGateway } from "@nestjs/websockets";
import jwt from "jsonwebtoken";
import { JwtPayload } from 'jsonwebtoken';

interface MyJwtPayload extends JwtPayload {
    sessionId: string;
}
@WebSocketGateway({ cors: true })
export class AuthGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer()
    server: Server;

    private sockets = new Map<any, string>();

    handleConnection(client: Socket) {
        const token = client.handshake.auth?.token as string;
        if (!token) return client.disconnect()

        const payload = jwt.verify(token, "SECRET_KEY_123") as MyJwtPayload;
        this.sockets.set(payload.sessionId, client.id);
    }

    handleDisconnect(sessionIds: string[]) {
        sessionIds.forEach(sessionId => {
            const socketId = this.sockets.get(sessionId);
            if (socketId) {
                this.server.to(socketId).emit("logout");
            }
        })
    }
}