import { Module } from '@nestjs/common';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { PaymentModule } from '../payment/payment.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BalanceEntity } from '../payment/entities/balance.entity';
import { UserEntity } from '../user/entities/user.entity';

@Module({
  imports: [
    ConfigModule,
    RedisModule,
    PaymentModule,
    TypeOrmModule.forFeature([BalanceEntity, UserEntity]),
  ],
  controllers: [ItemsController],
  providers: [ItemsService],
})
export class ItemsModule {}
