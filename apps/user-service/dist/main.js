"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const microservices_1 = require("@nestjs/microservices");
const path_1 = require("path");
const app_module_1 = require("./app.module");
const PROTO_PATH = (0, path_1.join)(__dirname, '../../../packages/proto/user.proto');
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.connectMicroservice({
        transport: microservices_1.Transport.GRPC,
        options: {
            package: 'user',
            protoPath: PROTO_PATH,
            url: '0.0.0.0:5001',
        },
    });
    await app.startAllMicroservices();
    console.log(`gRPC running on 5001`);
    console.log('User Service is running on gRPC port 5001');
}
bootstrap();
//# sourceMappingURL=main.js.map