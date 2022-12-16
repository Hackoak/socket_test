import { IsIn, IsNotEmpty, IsString, IsBoolean } from "class-validator";
import { chatMessageType } from "../schema/chat.message.schema";

export class CreateMessageDto {

    @IsNotEmpty()
    @IsString()
    roomId: string;

    @IsNotEmpty()
    @IsString()
    uuid: string;

    @IsNotEmpty()
    @IsString()
    message: string;

    @IsNotEmpty()
    @IsString()
    @IsIn(chatMessageType)
    type: string;

    @IsNotEmpty()
    @IsString()
    chatId: string;

    @IsNotEmpty()
    @IsString()
    sender: string;

    @IsNotEmpty()
    @IsBoolean()
    isWhenBlocked: boolean;


    @IsNotEmpty()
    @IsString()
    created: number;

    constructor(roomId: string, uuid: string, message: string, type: string, chatId: string, senderId: string, isWhenBlocked: boolean, created: number) {
        this.roomId = roomId;
        this.uuid = uuid;
        this.message = message;
        this.type = type;
        this.chatId = chatId;
        this.sender = senderId;
        this.isWhenBlocked = isWhenBlocked;
        this.created = created;
    }

}


export class DeleteAllMsgBySenderDto {

    @IsNotEmpty()
    @IsString()
    roomId: string;

    @IsNotEmpty()
    @IsString()
    sender_id: string;

}

export class DeleteMsgForMeDto {

    @IsNotEmpty()
    @IsString()
    uuid: string;

    @IsNotEmpty()
    @IsString()
    user_id: string;

    constructor(uuid: string, user_id: string) {
        this.uuid = uuid,
        this.user_id = user_id
    }

}