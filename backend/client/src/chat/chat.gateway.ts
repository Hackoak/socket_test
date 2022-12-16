import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Types } from 'mongoose';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateMessageDto, DeleteMsgForMeDto } from './dto/message.dto';

const JOIN_ROOM = 'join_room';
const JOIN_ROOM_RESP = 'join_room_response';
const MSG_TO_SERVER = 'msg_to_server';
const MSG_TO_CLIENT = 'msg_to_client';
const GET_ALL_MESSAGES = 'get_all_messages';
const GET_ALL_ROOMS = 'get_all_rooms';
const MARK_MESSAGE_AS_SEEN = 'mark_message_as_seen';
const MARK_ONLINE = 'mark_online';
const MARK_OFFLINE = 'mark_offline';
const USER_ONLINE_OFFLINE_UPDATE = 'user_online_offline_update';
const UNREAD_CHAT_MESSAGES_LIST = 'UNREAD_CHAT_MESSAGES_LIST';
const GENERAL_MESSAGES = 'GENERAL_MESSAGES';
const DELETE_MESSAGE = 'DELETE_MESSAGE';
const DEL_MES_CALLBACK_CLIENT = 'DEL_MES_CALLBACK_CLIENT';

const DELETE_ALL_MESSAGE_BY_USER = 'DELETE_ALL_MESSAGE_BY_USER';
const DEL_USER_MES_CALLBACK_CLIENT = 'DEL_USER_MES_CALLBACK_CLIENT';

const DELETE_MESSAGE_FOR_ME = 'DELETE_MESSAGE_FOR_ME';
const DEL_MES_FOR_ME_CALLBACK_CLIENT = 'DEL_MES_FOR_ME_CALLBACK_CLIENT';

@WebSocketGateway({ namespace: '/chat1' })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private chatService: ChatService) {}

  @WebSocketServer()
  wss: Server;

  afterInit(server: Socket) {
    console.log('server initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log('Client connected ' + client.id);
  }

  async handleDisconnect(client: Socket) {
    console.log(client.id + ' disconnected ');
    // const user = await this.profileService.getuserByClientID(client.id);
    // if (!user) {
    //   return;
    // }
    // await this.profileService.markUserOffline(user._id);
    // this.broadcastToRooms(user.firebaseId, false);
  }

  @SubscribeMessage(MARK_ONLINE)
  async handleMarkOnline(client: Socket, firebaseId: string) {
    if (firebaseId === null) {
      return;
    }
    // await this.profileService.markUserOnline(firebaseId, client.id);
    console.log('Firebase Client ' + firebaseId + ' ONLINE');
    this.broadcastToRooms(firebaseId, true);

    // get my profile

    // const myProfile = await this.profileService.getUserByFirebaseID(firebaseId);
    // if (!myProfile) {
    //   return;
    // }

    // get all rooms

    // get all unread messages from all rooms

    client.emit(UNREAD_CHAT_MESSAGES_LIST);
    //send to client
  }

  @SubscribeMessage(MARK_OFFLINE)
  async handleMarkOffline(client: Socket, firebaseId: string) {
    console.log(client.id + ' offline ');
  }

  // @SubscribeMessage(GET_ALL_ROOMS)
  // async handleGetAllRooms(client: Socket, userId: string) {
  //   const rooms = await this.chatService.getAll(new Types.ObjectId(userId));

  //   const _responseList = await Promise.all(
  //     rooms.map(async (m) => {
  //       const otherUserID = m.user1._id.equals(userId) ? m.user2 : m.user1;

  //       const usr = await this.profileService.getUserById(otherUserID._id);
  //       if (usr === null) {
  //         return null;
  //       }
  //       const _tempUser = {
  //         roomId: m._id.valueOf(),
  //         userId: usr._id,
  //         profileImage: usr.profileImage,
  //         name: usr.getName,
  //         isDeleted: usr.isDeleted,
  //         online: usr.isOnline,
  //         lastOnlineAt: usr.lastOnlineAt,
  //         lastMsgAt: m.lastMsgAt,
  //         //type420: usr.type420.title,
  //       };
  //       return _tempUser;
  //     }),
  //   );
  //   const responseList = _responseList.filter((r) => r !== null);

  //   client.emit(GET_ALL_ROOMS, responseList.length == 0 ? [] : responseList);

  //   //START joining rooms
  //   const roomIdsList = responseList.map((r) => r.roomId);
  //   roomIdsList.push('private_room_' + userId);
  //   await client.join(roomIdsList);
  //   //END joining rooms
  //   client.emit(JOIN_ROOM_RESP, Array.from(client.rooms));
  // }

  @SubscribeMessage(JOIN_ROOM)
  async handleJoinRoom(client: Socket, roomIds: string[]) {
    await client.join(roomIds);
    if (typeof roomIds === 'string' || roomIds instanceof String) {
      client.emit(JOIN_ROOM_RESP, [roomIds]);
      return;
    }
    client.emit(JOIN_ROOM_RESP, client.rooms);
  }

  @SubscribeMessage(GET_ALL_MESSAGES)
  async handleGetAllMessages(client: Socket, roomId: string) {
    const messagesList = await this.chatService.getAllMessagesFromRoom(roomId);
    client.emit(UNREAD_CHAT_MESSAGES_LIST, messagesList);
  }

  @SubscribeMessage(MSG_TO_SERVER)
  async handleMessageToServer(
    client: Socket,
    newMessage: {
      uuid: string;
      senderId: string;
      roomId: string;
      message: string;
      type: string;
      time: number;
    },
  ) {
    console.log(newMessage);
    const room = await this.chatService.findById(
      new Types.ObjectId(newMessage.roomId),
    );
    if (room === null) {
      return;
    }
    const senderUserData = room.user1._id.equals(
      new Types.ObjectId(newMessage.senderId),
    )
      ? room.user1
      : room.user2;

    const otherUserID = room.user1._id.equals(
      new Types.ObjectId(newMessage.senderId),
    )
      ? room.user2
      : room.user1;
    console.log('beforeBlocked : ' + otherUserID.blockedUsers);

    console.log('After UnBlocked : ' + otherUserID.blockedUsers);

    const isExist = otherUserID.blockedUsers.find((e) =>
      e._id.equals(new Types.ObjectId(newMessage.senderId)),
    );
    let isWhenBlocked = false;
    if (isExist) {
      isWhenBlocked = true;
    }
    const newMsg = new CreateMessageDto(
      newMessage.roomId,
      newMessage.uuid,
      newMessage.message,
      newMessage.type,
      newMessage.roomId,
      newMessage.senderId,
      isWhenBlocked,
      newMessage.time,
    );
    const createdMessgae = await this.chatService.createNewMessageInRoom(
      newMsg,
    );

    console.log('isWhenBlocked :' + createdMessgae);
    this.wss.to(newMessage.roomId).emit(MSG_TO_CLIENT, createdMessgae);
    // sending pushnotification
    //     const room = await this.chatService.findById(new Types.ObjectId(newMessage.roomId));
    //     if (room === null) {
    //       return;
    //     }
    //     const otherUserID = room.user1._id.equals(new Types.ObjectId(newMessage.senderId)) ? room.user2 : room.user1;

    this.wss
      .to('private_room_' + otherUserID._id.valueOf())
      .emit(GENERAL_MESSAGES, 'call_get_all_rooms');

    if (isExist) {
      return;
    }
    if (otherUserID !== null && otherUserID.pushNotificationKey !== null) {
      // this.sendNotification(newMessage.senderId, otherUserID._id, room._id);
    }
  }

  // @SubscribeMessage(DELETE_MESSAGE)
  // async handleDeleteMessageToServer(
  //   client: Socket,
  //   MessageBody: { uuid: string; roomId: string },
  // ) {
  //   console.log(MessageBody);
  //   const deleteMessgae = await this.chatService.deleteMessageByuuid(
  //     MessageBody.uuid,
  //   );

  //   this.wss
  //     .to(MessageBody.roomId)
  //     .emit(DEL_MES_CALLBACK_CLIENT, {
  //       uuid: MessageBody.uuid,
  //       roomId: MessageBody.roomId,
  //     });
  // }

  // @SubscribeMessage(DELETE_MESSAGE_FOR_ME)
  // async handleDelMesForMeToServer(
  //   client: Socket,
  //   MessageBody: { uuid: string; user_id: string; roomId: string },
  // ) {
  //   console.log(MessageBody);
  //   var deleteForMeDto = new DeleteMsgForMeDto(
  //     MessageBody.uuid,
  //     MessageBody.user_id,
  //   );
  //   const deleteMesForMe = await this.chatService.deleteMesageForMe(
  //     deleteForMeDto,
  //   );
  //   const msgModel = await this.chatService.findMsgByUuid(MessageBody.uuid);

  //   this.wss
  //     .to(MessageBody.roomId)
  //     .emit(DEL_MES_FOR_ME_CALLBACK_CLIENT, msgModel);
  // }

  // @SubscribeMessage(DELETE_ALL_MESSAGE_BY_USER)
  // async handleDeleteAllUserMessagesToServer(
  //   client: Socket,
  //   MessageBody: { senderId: string; roomId: string },
  // ) {
  //   console.log(MessageBody);
  //   const deleteAllMessgae = await this.chatService.deleteAllMesageBySender({
  //     sender_id: MessageBody.senderId,
  //     roomId: MessageBody.roomId,
  //   });

  //   this.wss
  //     .to(MessageBody.roomId)
  //     .emit(DEL_USER_MES_CALLBACK_CLIENT, {
  //       senderId: MessageBody.senderId,
  //       roomId: MessageBody.roomId,
  //     });
  // }

  // async sendNotification(senderId: string, receiverId: string, roomId: string) {
  //   const sender = await this.profileService.getUserById(senderId);
  //   const receiver = await this.profileService.getUserById(receiverId);
  //   // FIXME: roomId and senderId is exchanged i leav it a it is bcz db will clash on old Apple account users
  //   // here add the sender Id for notification message to show the user details
  //   const notificationDto = new SendPushNotificationDto(
  //     APP_NAME,
  //     sender.getName + ' sent a message',
  //     [receiver.pushNotificationKey],
  //     NotificationType.Message,
  //     roomId,
  //     sender.getName,
  //     sender.profileImage,
  //     receiver._id,
  //     sender._id,
  //   );
  //   this.notificationService.sendPushNotification(notificationDto);
  // }

  // @SubscribeMessage(MARK_MESSAGE_AS_SEEN)
  // async handleMarkMessageAsSeen(client: Socket, messageId: string) {
  //   if (!messageId) {
  //     return;
  //   }
  //   await this.chatService.markMessageAsRead(messageId);
  //   client.emit(MARK_MESSAGE_AS_SEEN, messageId);
  // }

  async broadcastToRooms(firebaseId: string, status: boolean) {
    // const roomsList = await this.chatService.getAll(
    //   new Types.ObjectId(user._id),
    // );
    // const idsList = roomsList.forEach((r) => {
    //   const _tempUser = {
    //     roomId: r._id,
    //     //type420: usr.type420.title,
    //   };
    //   this.wss.to(r._id.valueOf()).emit(USER_ONLINE_OFFLINE_UPDATE, _tempUser);
    // });
  }
}
