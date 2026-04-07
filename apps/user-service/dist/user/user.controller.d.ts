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
        id: any;
        email: any;
        name: any;
    }>;
    getUserById(data: {
        id: string;
    }): Promise<{
        id: any;
        email: any;
        name: any;
    }>;
}
