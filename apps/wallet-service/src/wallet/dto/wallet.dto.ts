import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsPositive,
  IsUUID,
} from 'class-validator';

export class CreateWalletDto {
  @IsString({ message: 'userId must be a string' })
  @IsNotEmpty({ message: 'userId is required' })
  @IsUUID('4', { message: 'userId must be a valid UUID' })
  userId: string;

  @IsString({ message: 'type must be a string' })
  @IsNotEmpty({ message: 'type is required' })
  type: string;
}

export class GetWalletDto {
  @IsString({ message: 'userId must be a string' })
  @IsNotEmpty({ message: 'userId is required' })
  @IsUUID('4', { message: 'userId must be a valid UUID' })
  userId: string;
}

export class CreditWalletDto {
  @IsString({ message: 'userId must be a string' })
  @IsNotEmpty({ message: 'userId is required' })
  @IsUUID('4', { message: 'userId must be a valid UUID' })
  userId: string;

  @IsNumber({}, { message: 'amount must be a number' })
  @IsPositive({ message: 'amount must be a positive number' })
  amount: number;
}

export class DebitWalletDto {
  @IsString({ message: 'userId must be a string' })
  @IsNotEmpty({ message: 'userId is required' })
  @IsUUID('4', { message: 'userId must be a valid UUID' })
  userId: string;

  @IsNumber({}, { message: 'amount must be a number' })
  @IsPositive({ message: 'amount must be a positive number' })
  amount: number;
}
