import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { WalletGrpcService } from './wallet-grpc.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { WalletAmountDto } from './dto/wallet-amount.dto';

@Controller('wallets')
export class WalletController {
  constructor(private readonly walletGrpc: WalletGrpcService) {}

  @Post()
  create(@Body() createWalletDto: CreateWalletDto) {
    return this.walletGrpc.createWallet(createWalletDto);
  }

  @Get(':id')
  findOne(@Param('id') userId: string) {
    return this.walletGrpc.getWalletByUserId(userId);
  }

  @Post(':id/debit')
  debit(@Param('id') userId: string, @Body() body: WalletAmountDto) {
    return this.walletGrpc.debitWallet(userId, body.amount);
  }

  @Post(':id/credit')
  credit(@Param('id') userId: string, @Body() body: WalletAmountDto) {
    return this.walletGrpc.creditWallet(userId, body.amount);
  }
}
