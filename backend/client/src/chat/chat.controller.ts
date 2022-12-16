import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ChatService } from './chat.service';
import { CreateForFindChatRoom } from './dto/chatroom.dto';
import { DeleteAllMsgBySenderDto } from './dto/message.dto';

@Controller('chatRooms')
export class ChatController {
  constructor(private readonly chatRoomsService: ChatService) {}

  @Get('getAllChatRooms')
  async getAllChatRooms(@Res() res) {
    const thisUserID = res.locals._id;
    const roomList = await this.chatRoomsService.getAll(
      new Types.ObjectId(thisUserID),
    );

    const _responseList = await Promise.all(
      roomList.map(async (room) => {
        const messagesList = await this.chatRoomsService.getAllMessagesFromRoom(
          room._id,
        );
        if (messagesList.length === 0) {
          await this.chatRoomsService.deleteRoom(new Types.ObjectId(room._id));
          return null;
        }

        const otherUserID = room.user1._id.equals(thisUserID)
          ? room.user2
          : room.user1;

        const _tempUser = {
          roomId: room._id,

          //type420: usr.type420.title,
        };
        return _tempUser;
      }),
    );
    const responseList = _responseList.filter((r) => r !== null);
    return responseList;
  }

  @Get('room/:id')
  async getRoomData(@Res() res, @Param('id') id) {
    const thisUserID = res.locals._id;
    const room = await this.chatRoomsService.findById(new Types.ObjectId(id));
    const otherUserID = room.user1._id.equals(thisUserID)
      ? room.user2
      : room.user1;
    const _tempRoom = {
      roomId: room._id,
      userId: otherUserID._id,
      profileImage: otherUserID.profileImage,
      name: otherUserID.getName,
      isDeleted: otherUserID.isDeleted,
      online: otherUserID.isOnline,
      lastOnlineAt: otherUserID.lastOnlineAt,
      lastMsgAt: room.lastMsgAt,
      //type420: usr.type420.title,
    };
    return _tempRoom;
  }

  @Post('findOrCreateChatRoom')
  async createOrFindChatRoom(@Res() res, @Body() body: CreateForFindChatRoom) {
    const thisUserID = res.locals._id;
    const room = await this.chatRoomsService.findOrCreate(
      new Types.ObjectId(thisUserID),
      new Types.ObjectId(body.userId),
    );

    const otherUserID = room.user1._id.equals(thisUserID)
      ? room.user2
      : room.user1;

    const _tempUser = {
      roomId: room._id,
    };
    return _tempUser;
  }
}
