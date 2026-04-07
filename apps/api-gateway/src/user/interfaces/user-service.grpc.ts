import { Observable } from 'rxjs';
import type { UserResponse } from './user-response.interface';

/** Shape of the Nest gRPC client stub for `user.UserService`. */
export interface UserServiceGrpc {
  createUser(request: {
    email: string;
    name: string;
  }): Observable<UserResponse>;

  getUserById(request: { id: string }): Observable<UserResponse>;
}
