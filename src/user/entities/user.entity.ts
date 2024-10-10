import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BalanceEntity } from '../../payment/entities/balance.entity';

@Entity()
export class UserEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ default: 'Test' })
  name: string;

  @ApiProperty({ type: () => BalanceEntity })
  @OneToOne(() => BalanceEntity, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn()
  balance: BalanceEntity;

  /* Timestamps */
  @ApiProperty()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
