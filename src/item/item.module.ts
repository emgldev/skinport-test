import { Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@liaoliaots/nestjs-redis';

@Module({
  imports: [ConfigModule, RedisModule],
  controllers: [ItemController],
  providers: [ItemService],
})
export class ItemModule {}
