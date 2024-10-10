import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../user/entities/user.entity';

export enum BalanceType {
  SYSTEM = 'SYSTEM',
}

@Entity()
export class BalanceEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ default: 0, type: 'decimal' })
  amount: number;

  @ApiProperty()
  @Column({ type: 'enum', enum: BalanceType, unique: true, nullable: true })
  type: BalanceType;

  @ApiProperty({ type: () => UserEntity })
  @OneToOne(() => UserEntity, (user) => user.balance, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  /* Timestamps */
  @ApiProperty()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
