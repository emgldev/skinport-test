import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BalanceEntity } from './balance.entity';

@Entity()
export class PaymentEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ type: 'decimal' })
  amount: number;

  @ApiProperty()
  @Column({ nullable: true })
  itemName: string;

  @ApiProperty()
  @ManyToOne(() => BalanceEntity, { onDelete: 'CASCADE' })
  from: BalanceEntity;

  @ApiProperty()
  @ManyToOne(() => BalanceEntity, { onDelete: 'CASCADE' })
  to: BalanceEntity;

  /* Timestamps */
  @ApiProperty()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
