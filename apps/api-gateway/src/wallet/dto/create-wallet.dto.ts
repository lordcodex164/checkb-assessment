import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateWalletDto {
  @IsUUID('4')
  userId: string;

  @IsString()
  @IsNotEmpty()
  type: string;
}
