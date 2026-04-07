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
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("../../../../node_modules/.prisma/client/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const nestjs_pino_1 = require("nestjs-pino");
let PrismaService = class PrismaService extends client_1.PrismaClient {
    constructor(logger) {
        const adapter = new adapter_pg_1.PrismaPg({
            connectionString: process.env.DATABASE_URL,
        });
        super({
            adapter,
            log: [
                { emit: 'event', level: 'query' },
                { emit: 'event', level: 'error' },
                { emit: 'event', level: 'warn' },
            ],
        });
        this.logger = logger;
    }
    async onModuleInit() {
        this.logger.info('Prisma connected to database');
        if (process.env.NODE_ENV !== 'production') {
            this.$on('query', (e) => {
                if (e.duration > 200) {
                }
            });
        }
    }
    async onModuleDestroy() {
        this.logger.info('Prisma disconnected from database');
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_pino_1.InjectPinoLogger)(PrismaService.name)),
    __metadata("design:paramtypes", [nestjs_pino_1.PinoLogger])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map