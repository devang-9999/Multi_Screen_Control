/* eslint-disable prettier/prettier */
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SessionGateway implements OnGatewayConnection {

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  sendOtpToOldSessions(sessionIds: string[], otp: string) {
    sessionIds.forEach(id => {
      this.server.to(id).emit('OTP_ALERT', {
        message: 'New device login detected',
        otp,
      });
    });
  }

  forceLogout(sessionIds: string[]) {
    sessionIds.forEach(id => {
      this.server.to(id).emit('FORCE_LOGOUT', {
        message: 'You have been logged out',
      });
    });
  }
}
