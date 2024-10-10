import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { BalanceEntity } from '../payment/entities/balance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, BalanceEntity])],
  providers: [UserService],
})
export class UserModule {}
