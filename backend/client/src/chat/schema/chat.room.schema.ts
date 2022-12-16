import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ChatMessage } from '../../chat/schema/chat.message.schema';

export type ChatRoomDocument = ChatRoom & Document;

@Schema()
export class ChatRoom extends Document {
  @Prop({
    type: Types.ObjectId,
    required: true,
  })
  user1: any;

  @Prop({
    type: Types.ObjectId,
    required: true,
  })
  user2: any;

  @Prop({
    type: [Types.ObjectId],
    required: false,
    default: [],
    ref: ChatMessage.name,
  })
  messages: ChatMessage[];

  @Prop({
    type: Number,
    required: false,
    default: Date.now(),
  })
  lastMsgAt: number;
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);
