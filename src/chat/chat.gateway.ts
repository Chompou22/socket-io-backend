import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
@WebSocketGateway(3001, {
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer()
  server: Server;

  // this both connect and disconnect functions are created to keep track of a new client connection by perform log their Id.
  handleConnection(client: Socket) {
    console.log('A new client connected...', client.id);

    // this will broadcast to all the clients that listened to the client-user-joined event when a new client user joined the group chat.
    this.server.emit('client-user-joined', {
      message: `A new client user joined the chat : ${client.id}`,
    });
  }

  handleDisconnect(client: Socket) {
    console.log('A new client disconnect...', client.id);

    // this will broadcast to all the clients that listened to the client-user-left event when a new client user left the group chat.
    this.server.emit('client-user-left', {
      message: `A client user left the chat : ${client.id}`,
    });
  }

  @SubscribeMessage('newMessage')
  handleNewMessage(@MessageBody() message: any) {
    this.server.emit('reply', message); // this message will broadcast to all the clients that listened to the reply event.
  }

  // @SubscribeMessage('newMessage')
  // handleNewMessage(client: Socket, message: any) {
  //   console.log(message);

  //   client.emit('reply', 'This is a reply'); // this message will reply to a single client that listened to the reply event.

  //   this.server.emit('reply', 'broadcasting...'); // this message will broadcast to all the clients that listened to the reply event.
  // }

  //socket.on() : listen the events by using @SubscribeMessage

  //io.emit() : this used to broadcast a message to all the connected clients

  //socket.emit() : emit the messages by using socket.emit() which just sends a message to one single client
  // then we also need to specify the event and then payload
}
