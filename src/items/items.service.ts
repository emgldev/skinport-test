import { Injectable, NotFoundException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { Item } from './responses/item.response.dto';
import { chunk } from 'lodash';
import { InjectRepository } from '@nestjs/typeorm';
import { BalanceEntity, BalanceType } from '../payment/entities/balance.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { PaymentService } from '../payment/payment.service';

@Injectable()
export class ItemsService {
  private readonly redis: Redis | null;
  private readonly api: AxiosInstance;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly paymentService: PaymentService,
    @InjectRepository(BalanceEntity)
    private readonly balanceRepository: Repository<BalanceEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    this.redis = this.redisService.getOrThrow();

    this.api = axios.create({
      baseURL: this.configService.get('BASE_API_URL'),
      params: { app_id: this.configService.get('APP_ID'), currency: 'EUR' },
    });
  }

  async findAll() {
    const lastSyncTime = await this.redis.get('lastSyncTime');
    const isSyncNeeded = Date.now() - +lastSyncTime > 5 * 60 * 1000; // TODO: sync items every 5 minutes with @Cron
    if (isSyncNeeded) {
      return this.syncItems();
    } else {
      const keys = await this.redis.keys('item:*');
      return Promise.all(keys.map((key) => this.getRedisItem(key)));
    }
  }

  async syncItems() {
    try {
      const [nonTradableItemsResponse, tradableItemsResponse] =
        await Promise.all([
          this.api.get('/v1/items?tradable=0'),
          this.api.get('/v1/items?tradable=1'),
        ]);
      const nonTradableItems = nonTradableItemsResponse.data;
      const tradableItems = tradableItemsResponse.data;
      const items: Item[] = nonTradableItems.map((item) => {
        const tradableItem = tradableItems.find(
          (tradable) => tradable.market_hash_name === item.market_hash_name,
        );
        return {
          marketHashName: item.market_hash_name,
          minPriceTradable: tradableItem.min_price,
          minPriceNonTradable: item.min_price,
        } as Item;
      });
      await this.cacheItems(items);
      await this.redis.set('lastSyncTime', Date.now());
      return items;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async cacheItems(items: Item[]) {
    for (const itemsChunk of chunk(items, 5000)) {
      const pipeline = this.redis.pipeline();
      for (const item of itemsChunk) {
        pipeline.set(
          this.getItemPrefix(item.marketHashName),
          `${item.minPriceTradable}:${item.minPriceNonTradable}`,
        );
      }
      await pipeline.exec();
    }
  }

  async buyItem(name: string) {
    // get test user
    const user = await this.userRepository.findOne({
      where: {},
      relations: { balance: true },
    });
    //
    const item = await this.getRedisItem(this.getItemPrefix(name));
    if (!item) {
      throw new NotFoundException(
        'Item not found. Make new sync (GET /items).',
      );
    }
    const systemBalance = await this.paymentService.getSystemBalance();
    return this.paymentService.transferBalance(
      user.balance.id,
      systemBalance.id,
      item.minPriceNonTradable,
      item.marketHashName,
    );
  }

  async getRedisItem(key: string): Promise<Item | null> {
    const value = await this.redis.get(key);
    if (!value) return null;
    const [minPriceTradable, minPriceNonTradable] = value.split(':');
    return {
      marketHashName: key.split(':')[1],
      minPriceTradable: +minPriceTradable,
      minPriceNonTradable: +minPriceNonTradable,
    };
  }

  getItemPrefix(s: string) {
    return `item:${s}`;
  }
}
