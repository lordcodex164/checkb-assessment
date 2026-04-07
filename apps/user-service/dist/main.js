"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const microservices_1 = require("@nestjs/microservices");
const path_1 = require("path");
const app_module_1 = require("./app.module");
const nestjs_pino_1 = require("nestjs-pino");
async function bootstrap() {
    const app = await core_1.NestFactory.createMicroservice(app_module_1.AppModule, {
        transport: microservices_1.Transport.GRPC,
        options: {
            package: 'user',
            protoPath: (0, path_1.join)(__dirname, '../../../packages/proto/user.proto'),
            url: process.env.USER_SERVICE_URL || '0.0.0.0:5001',
        },
    });
    app.useLogger(app.get(nestjs_pino_1.Logger));
    await app.listen();
    console.log('User Service is running on gRPC port 5001');
}
bootstrap();
//# sourceMappingURL=main.js.map