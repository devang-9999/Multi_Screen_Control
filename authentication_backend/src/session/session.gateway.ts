/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';

interface MyJwtPayload extends JwtPayload {
  sessionId: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SessionGateway
  implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      if (!token) {
        console.log(' No token, disconnecting socket');
        client.disconnect();
        return;
      }

      const payload = jwt.verify(
        token,
        'MY_SECRET_KEY',
      ) as MyJwtPayload;
      console.log(payload)
      client.join(payload.sessionId);

      console.log(
        ` Socket ${client.id} joined session ${payload.sessionId}`,
      );
    } catch (err) {
      console.log(' Invalid token, disconnecting socket');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log('Socket disconnected:', client.id);
  }

  sendOtpToOldSessions(sessionIds: string[], otp: string) {
    console.log(' Sending OTP to sessions:', sessionIds);

    sessionIds.forEach((id) => {
      this.server.to(id).emit('OTP_ALERT', {
        message: 'New device login detected',
        otp,
      });
    });
  }

  forceLogout(sessionIds: string[]) {
    console.log(' Forcing logout for sessions:', sessionIds);

    sessionIds.forEach((id) => {
      this.server.to(id).emit('FORCE_LOGOUT', {
        message: 'You have been logged out',
      });
    });
  }
}
