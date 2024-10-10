import { Module } from '@nestjs/common';
import { ItemsModule } from './items/items.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    ItemsModule,
    ConfigModule.forRoot(),
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        config: {
          url: configService.get('REDIS_URL', 'redis://localhost:6379'),
        },
      }),
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: configService.get('DB_TYPE') as any,
        host: configService.get('DB_HOST'),
        port: parseInt(configService.get('DB_PORT')),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME') as any,
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    UserModule,
    PaymentModule,
  ],
})
export class AppModule {}
