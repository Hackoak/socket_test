import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export const chatMessageType = ['Text', 'Image', 'Video', 'Gif', 'Audio'];

export type ChatMessageDocument = ChatMessage & Document;

@Schema()
export class ChatMessage extends Document {
  @Prop({
    type: String,
    required: true,
  })
  uuid: string;

  @Prop({
    type: String,
    required: true,
  })
  message: string;

  @Prop({
    type: String,
    required: true,
    enum: chatMessageType,
  })
  type: string;

  @Prop({
    type: Types.ObjectId,
    required: true,
  })
  sender: any;

  @Prop({
    type: Types.ObjectId,
    required: true,
  })
  roomId: any;

  @Prop({
    type: Boolean,
    required: false,
    default: false,
  })
  isRead: boolean;

  @Prop({
    type: Boolean,
    required: false,
    default: false,
  })
  isWhenBlocked: boolean;

  @Prop({
    type: [Types.ObjectId],
    required: true,
  })
  isDeletedBy: any;

  @Prop({
    type: Number,
    required: true,
  })
  created: number;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
