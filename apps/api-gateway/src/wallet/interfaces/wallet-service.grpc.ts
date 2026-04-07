import { Observable } from 'rxjs';
import type { WalletResponse } from './wallet-response.interface';

export interface WalletServiceGrpc {
  createWallet(request: {
    userId: string;
    type: string;
  }): Observable<WalletResponse>;

  getWallet(request: { userId: string }): Observable<WalletResponse>;

  creditWallet(request: {
    userId: string;
    amount: number;
  }): Observable<WalletResponse>;

  debitWallet(request: {
    userId: string;
    amount: number;
  }): Observable<WalletResponse>;
}
