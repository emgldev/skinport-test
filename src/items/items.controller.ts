import { Body, Controller, Get, Post } from '@nestjs/common';
import { ItemsService } from './items.service';
import { ApiDefaultResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BuyItemDto } from './dto/buy-item.dto';
import { ItemResponseDto } from './responses/item.response.dto';
import { PaymentEntity } from '../payment/entities/payment.entity';

@ApiTags('Items')
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @ApiDefaultResponse({ type: ItemResponseDto })
  @Get()
  findAll() {
    return this.itemsService.findAll();
  }

  // TODO: check JWT token
  @ApiDefaultResponse({ type: PaymentEntity })
  @Post('buy')
  async buyItem(@Body() dto: BuyItemDto) {
    return this.itemsService.buyItem(dto.name);
  }
}
