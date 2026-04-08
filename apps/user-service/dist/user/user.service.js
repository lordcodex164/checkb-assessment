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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_pino_1 = require("nestjs-pino");
const prisma_service_1 = require("../prisma/prisma.service");
let UserService = class UserService {
    constructor(prisma, logger) {
        this.prisma = prisma;
        this.logger = logger;
    }
    async createUser(dto) {
        this.logger.info({
            op: 'createUser',
            receivedDto: dto,
            dtoType: typeof dto,
            keys: Object.keys(dto || {}),
            emailValue: dto?.email,
            emailType: typeof dto?.email
        }, 'Full DTO received from gRPC');
        if (!dto?.email || typeof dto.email !== 'string') {
            this.logger.error({ dto }, 'Email is missing or invalid');
            throw new Error('Email is required and must be a string');
        }
        if (!dto?.name || typeof dto.name !== 'string') {
            this.logger.error({ dto }, 'Name is missing or invalid');
            throw new Error('Name is required');
        }
        this.logger.info({ op: 'createUser', email: dto.email }, 'Checking email uniqueness before insert');
        console.log("email is ", dto.email);
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email.trim() },
        });
        if (existingUser) {
            this.logger.warn({ op: 'createUser', email: dto.email }, 'Email already registered');
            throw new common_1.ConflictException(`User with email ${dto.email} already exists`);
        }
        const user = await this.prisma.user.create({
            data: {
                email: dto.email.trim(),
                name: dto.name.trim(),
            },
        });
        this.logger.info({ op: 'createUser', userId: user.id }, 'User created successfully');
        return this.formatUser(user);
    }
    async getUserById(id) {
        this.logger.debug({ op: 'getUserById', userId: id }, 'Prisma findUnique');
        if (!id || id.trim() === '') {
            this.logger.warn({ op: 'getUserById' }, 'Rejected empty user id');
            throw new common_1.NotFoundException('User ID is required');
        }
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            this.logger.warn({ op: 'getUserById', userId: id }, 'No row for id');
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        this.logger.info({
            op: 'getUserById',
            userId: user.id,
            email: user.email,
        }, 'User loaded');
        return this.formatUser(user);
    }
    formatUser(user) {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt.toISOString(),
        };
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, nestjs_pino_1.InjectPinoLogger)(UserService.name)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        nestjs_pino_1.PinoLogger])
], UserService);
//# sourceMappingURL=user.service.js.map