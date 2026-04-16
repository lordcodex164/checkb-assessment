"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const grpc_js_1 = require("@grpc/grpc-js");
const microservices_2 = require("@nestjs/microservices");
const nestjs_pino_1 = require("nestjs-pino");
const user_service_1 = require("./user.service");
const createuser_dto_1 = require("./dto/createuser.dto");
let UserController = class UserController {
    constructor(userService, logger) {
        this.userService = userService;
        this.logger = logger;
    }
    async createUser(data) {
        const rpc = 'UserService.CreateUser';
        this.logger.info({ rpc, email: data?.email, nameLength: data?.name?.length ?? 0 }, 'gRPC request received');
        const dto = (0, class_transformer_1.plainToInstance)(createuser_dto_1.CreateUserDto, data);
        const errors = await (0, class_validator_1.validate)(dto);
        if (errors.length > 0) {
            const messages = errors.flatMap((e) => Object.values(e.constraints || {}));
            const fields = errors.map((e) => e.property);
            this.logger.warn({ rpc, fields, errors: messages }, 'Validation failed for CreateUser');
            throw new microservices_2.RpcException({
                code: grpc_js_1.status.INVALID_ARGUMENT,
                message: messages.join('; '),
            });
        }
        try {
            const result = await this.userService.createUser(dto);
            this.logger.info({ rpc, userId: result.id, email: result.email }, 'CreateUser completed');
            return result;
        }
        catch (error) {
            this.logRpcFailure(rpc, error);
            if (error instanceof common_1.ConflictException) {
                throw new microservices_2.RpcException({
                    code: grpc_js_1.status.ALREADY_EXISTS,
                    message: error.message,
                });
            }
            const err = error;
            throw new microservices_2.RpcException({
                code: grpc_js_1.status.INTERNAL,
                message: err.message || 'Internal server error',
            });
        }
    }
    async getUserById(data) {
        const rpc = 'UserService.GetUserById';
        this.logger.info({ rpc, userId: data?.id }, 'gRPC request received');
        if (!data.id || data.id.trim() === '') {
            this.logger.warn({ rpc }, 'Missing or empty user id');
            throw new microservices_2.RpcException({
                code: grpc_js_1.status.INVALID_ARGUMENT,
                message: 'User ID is required',
            });
        }
        try {
            const result = await this.userService.getUserById(data.id);
            this.logger.info({ rpc, userId: result.id }, 'GetUserById completed');
            return result;
        }
        catch (error) {
            this.logRpcFailure(rpc, error);
            if (error instanceof common_1.NotFoundException) {
                throw new microservices_2.RpcException({
                    code: grpc_js_1.status.NOT_FOUND,
                    message: error.message,
                });
            }
            const err = error;
            throw new microservices_2.RpcException({
                code: grpc_js_1.status.INTERNAL,
                message: err.message || 'Internal server error',
            });
        }
    }
    logRpcFailure(rpc, error) {
        if (error instanceof common_1.NotFoundException) {
            this.logger.warn({
                rpc,
                errMessage: error.message,
                httpStatus: error.getStatus(),
            }, 'gRPC handler: not found');
            return;
        }
        if (error instanceof common_1.ConflictException) {
            this.logger.warn({
                rpc,
                errMessage: error.message,
                httpStatus: error.getStatus(),
            }, 'gRPC handler: conflict');
            return;
        }
        if (error instanceof microservices_2.RpcException) {
            this.logger.error({
                rpc,
                errMessage: error.message,
                rpcError: error.getError(),
                errStack: error.stack,
            }, 'gRPC handler failed (RpcException)');
            return;
        }
        if (error instanceof Error) {
            this.logger.error({
                rpc,
                errMessage: error.message,
                errName: error.name,
                errStack: error.stack,
            }, 'gRPC handler failed');
            return;
        }
        this.logger.error({ rpc, error: String(error) }, 'gRPC handler failed');
    }
};
exports.UserController = UserController;
__decorate([
    (0, microservices_1.GrpcMethod)('UserService', 'CreateUser'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "createUser", null);
__decorate([
    (0, microservices_1.GrpcMethod)('UserService', 'GetUserById'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUserById", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)(),
    __param(1, (0, nestjs_pino_1.InjectPinoLogger)(UserController.name)),
    __metadata("design:paramtypes", [user_service_1.UserService,
        nestjs_pino_1.PinoLogger])
], UserController);
//# sourceMappingURL=user.controller.js.map