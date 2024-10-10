import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BalanceEntity } from './entities/balance.entity';
import { PaymentEntity } from './entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BalanceEntity, PaymentEntity])],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
