import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BalanceEntity, BalanceType } from './entities/balance.entity';
import { EntityManager, Repository } from 'typeorm';
import { PaymentEntity } from './entities/payment.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(BalanceEntity)
    private readonly balanceRepository: Repository<BalanceEntity>,
    private readonly entityManager: EntityManager,
  ) {}

  async transferBalance(
    fromBalanceId: number,
    toBalanceId: number,
    amount: number,
    additionalInfo?: string,
  ) {
    return await this.entityManager.transaction(async (entityManager) => {
      const balanceRepository = entityManager.getRepository(BalanceEntity);
      const paymentRepository = entityManager.getRepository(PaymentEntity);
      const from = await balanceRepository.findOne({
        where: {
          id: fromBalanceId,
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });
      const to = await balanceRepository.findOne({
        where: {
          id: toBalanceId,
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });

      if (from.amount < amount) throw new Error('No funds');
      from.amount = parseFloat((from.amount - amount).toFixed(2));
      to.amount = parseFloat((+to.amount + amount).toFixed(2));

      await balanceRepository.save([from, to]);

      return paymentRepository.save(
        paymentRepository.create({
          to,
          from,
          amount,
          ...(additionalInfo ? { itemName: additionalInfo } : {}),
        }),
      );
    });
  }

  async getSystemBalance(): Promise<BalanceEntity> {
    const systemBalance = await this.balanceRepository.findOne({
      where: { type: BalanceType.SYSTEM },
    });
    if (!systemBalance) {
      return await this.balanceRepository.save(
        this.balanceRepository.create({ type: BalanceType.SYSTEM }),
      );
    }
    return systemBalance;
  }
}
