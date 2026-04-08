"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const microservices_1 = require("@nestjs/microservices");
const path_1 = require("path");
const nestjs_pino_1 = require("nestjs-pino");
const app_module_1 = require("./app.module");
const PROTO_PATH = (0, path_1.join)(__dirname, '../../../packages/proto/user.proto');
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bufferLogs: true });
    app.useLogger(app.get(nestjs_pino_1.Logger));
    const listenUrl = process.env.USER_SERVICE_URL ?? '0.0.0.0:5001';
    app.connectMicroservice({
        transport: microservices_1.Transport.GRPC,
        options: {
            package: 'user',
            protoPath: PROTO_PATH,
            url: listenUrl,
        },
    });
    await app.startAllMicroservices();
    const logger = app.get(nestjs_pino_1.Logger);
    logger.log(`user-service gRPC ready | bind=${listenUrl} | proto=${PROTO_PATH} | NODE_ENV=${process.env.NODE_ENV ?? 'undefined'}`);
}
bootstrap();
//# sourceMappingURL=main.js.map