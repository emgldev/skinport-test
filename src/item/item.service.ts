import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { Item } from './dto/item.response.dto';
import { chunk } from 'lodash';

@Injectable()
export class ItemService {
  private readonly redis: Redis | null;
  private readonly api: AxiosInstance;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
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
    if (false) {
      return this.syncItems();
    } else {
      const keys = await this.redis.keys('item:*');
      return Promise.all(
        keys.map(async (key) => {
          const value = await this.redis.get(key);
          const [minPriceTradable, minPriceNonTradable] = value.split(':');
          return {
            marketHashName: key.split(':')[1],
            minPriceTradable: +minPriceTradable,
            minPriceNonTradable: +minPriceNonTradable,
          };
        }),
      );
    }
  }

  async syncItems() {
    try {
      console.log(Date.now());
      const [nonTradableItemsResponse, tradableItemsResponse] =
        await Promise.all([
          this.api.get('/v1/items?tradable=0'),
          this.api.get('/v1/items?tradable=1'),
        ]);
      const nonTradableItems = nonTradableItemsResponse.data;
      const tradableItems = tradableItemsResponse.data;
      console.log(Date.now());
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
      console.log(Date.now());
      await this.cacheItems(items);
      console.log(Date.now());
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

  getItemPrefix(s: string) {
    return `item:${s}`;
  }
}
