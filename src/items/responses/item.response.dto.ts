import { ApiProperty } from '@nestjs/swagger';

export class ItemResponseDto {
  @ApiProperty({ type: () => Item, isArray: true })
  items: Item[];
}

export class Item {
  @ApiProperty()
  marketHashName: string;

  @ApiProperty()
  minPriceTradable: number;

  @ApiProperty()
  minPriceNonTradable: number;
}
