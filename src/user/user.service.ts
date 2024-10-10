import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { BalanceEntity } from '../payment/entities/balance.entity';

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(BalanceEntity)
    private readonly balanceRepository: Repository<BalanceEntity>,
  ) {}

  async onModuleInit() {
    // creating a test user if one does not exist
    const user = await this.userRepository.findOne({ where: {} });
    if (!user) {
      await this.userRepository.save(
        this.userRepository.create({
          balance: await this.balanceRepository.save(
            this.balanceRepository.create({ amount: 1000 }),
          ),
        }),
      );
    }
  }
}
