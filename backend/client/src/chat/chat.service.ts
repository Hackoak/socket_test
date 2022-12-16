import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CreateMessageDto,
  DeleteAllMsgBySenderDto,
  DeleteMsgForMeDto,
} from './dto/message.dto';
import { ChatMessage, ChatMessageDocument } from './schema/chat.message.schema';
import { ChatRoom, ChatRoomDocument } from './schema/chat.room.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatRoom.name) private ChatModel: Model<ChatRoomDocument>,
    @InjectModel(ChatMessage.name)
    private ChatMessageModel: Model<ChatMessageDocument>,
  ) {}

  async getAll(id: Types.ObjectId): Promise<ChatRoom[]> {
    const rooms = await this.ChatModel.find({
      $or: [{ user1: id }, { user2: id }],
    })
      .populate('user1')
      .populate('user2');
    // Sorting the list to dsc - Newly added user at first
    const sortedRooms = rooms.sort(
      (objA, objB) =>
        new Date(objB.lastMsgAt).getTime() - new Date(objA.lastMsgAt).getTime(),
    );
    return sortedRooms;
  }

  async create(u1: Types.ObjectId, u2: Types.ObjectId): Promise<ChatRoom> {
    const newMatch = new this.ChatModel({
      user1: u1,
      user2: u2,
    });
    return await newMatch.save();
  }

  async find(u1: Types.ObjectId, u2: Types.ObjectId): Promise<ChatRoom> {
    return await this.ChatModel.findOne({
      $or: [
        { user1: u1, user2: u2 },
        { user1: u2, user2: u1 },
      ],
    })
      .populate('user1')
      .populate('user2');
  }

  async findById(roomId: Types.ObjectId): Promise<ChatRoom> {
    return await this.ChatModel.findOne({ _id: roomId })
      .populate('user1')
      .populate('user2');
  }

  async findMsgByUuid(uuid: string): Promise<ChatRoom> {
    return await this.ChatMessageModel.findOne({ uuid: uuid }).populate(
      'sender',
    );
  }

  async findOrCreate(
    u1: Types.ObjectId,
    u2: Types.ObjectId,
  ): Promise<ChatRoom> {
    const oldMatch = await this.find(
      new Types.ObjectId(u1),
      new Types.ObjectId(u2),
    );
    if (oldMatch) {
      return oldMatch;
    }
    return await this.create(u1, u2);
  }

  async deleteRoom(roomId: Types.ObjectId) {
    return await this.ChatModel.deleteOne({ _id: roomId });
  }

  async delete(u1: Types.ObjectId, u2: Types.ObjectId) {
    return await this.ChatModel.deleteOne({
      $or: [
        { user1: u1, user2: u2 },
        { user1: u2, user2: u1 },
      ],
    });
  }

  async getAllMessagesFromRoom(roomId: string): Promise<ChatMessage[]> {
    const match = await this.ChatModel.findOne({
      _id: new Types.ObjectId(roomId),
    })
      .populate('messages')
      .populate({
        path: 'messages',
        populate: {
          path: 'sender',
        //   model: Profile.name,
        },
      });
    if (match === null) {
      return [];
    }
    return match.messages;
  }

  async getAllUnreadMessagesFromRooms(
    roomIds: string[],
  ): Promise<ChatMessage[]> {
    return await this.ChatMessageModel.find({
      roomId: { $in: roomIds },
      isRead: false,
    }).populate('sender');
  }

  async createNewMessageInRoom(msg: CreateMessageDto): Promise<ChatMessage> {
    const newMessage = new this.ChatMessageModel({
      uuid: msg.uuid,
      message: msg.message,
      type: msg.type,
      sender: new Types.ObjectId(msg.sender),
      roomId: new Types.ObjectId(msg.roomId),
      isRead: msg.isWhenBlocked,
      isWhenBlocked: msg.isWhenBlocked,
      created: Date.now(),
    });
    await newMessage.save();
    await this.ChatModel.updateOne(
      { _id: new Types.ObjectId(msg.roomId) },
      { $push: { messages: newMessage } },
    );
    return await this.ChatMessageModel.findOne({
      _id: newMessage._id,
    }).populate('sender');
  }

  async deleteMessageByuuid(uuid: string) {
    return await this.ChatMessageModel.deleteOne({ uuid: uuid });
  }

  async markMessageAsRead(uuid: string) {
    return await this.ChatMessageModel.findOneAndUpdate(
      { uuid: uuid },
      { isRead: true },
    );
  }
  async updateLastMsgTiming(id: string, timeStamp: number) {
    return await this.ChatModel.updateOne(
      { _id: new Types.ObjectId(id) },
      { lastMsgAt: timeStamp },
    );
  }

  async deleteAllMesageBySender(deleteAllMsgDto: DeleteAllMsgBySenderDto) {
    try {
      await this.ChatMessageModel.updateMany(
        { roomId: new Types.ObjectId(deleteAllMsgDto.roomId) },
        {
          $push: { isDeletedBy: new Types.ObjectId(deleteAllMsgDto.sender_id) },
        },
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  async deleteMesageForMe(delMsgForMeDto: DeleteMsgForMeDto) {
    try {
      await this.ChatMessageModel.findOneAndUpdate(
        { uuid: delMsgForMeDto.uuid },
        { $push: { isDeletedBy: delMsgForMeDto.user_id } },
      );
      return true;
    } catch (error) {
      return false;
    }
  }
}
