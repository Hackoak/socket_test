import { IsNotEmpty, IsString } from "class-validator";

export class CreateForFindChatRoom{

    @IsNotEmpty()
    @IsString()
    userId: string;
}