import { PinoLogger } from 'nestjs-pino';
import { UserService } from './user.service';
export declare class UserController {
    private readonly userService;
    private readonly logger;
    constructor(userService: UserService, logger: PinoLogger);
    createUser(data: {
        email: string;
        name: string;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: string;
    }>;
    getUserById(data: {
        id: string;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: string;
    }>;
    private logRpcFailure;
}
