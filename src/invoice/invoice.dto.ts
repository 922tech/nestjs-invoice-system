import { IsString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ItemDto {
  @ApiProperty({
    description: 'Stock Keeping Unit (SKU) of the item',
    example: 'ITEM-001',
  })
  @IsString()
  sku!: string;

  @ApiProperty({
    description: 'Quantity of the item',
    example: 2,
  })
  @IsNumber()
  qt!: number;
}

export class CreateInvoiceDto {
  @ApiProperty({
    description: 'Name or identifier of the customer',
    example: 'John Doe',
  })
  @IsString()
  customer!: string;

  @ApiProperty({
    description: 'Total amount of the invoice',
    example: 1500.75,
  })
  @IsNumber()
  amount!: number;

  @ApiProperty({
    description: 'Reference code for the invoice',
    example: 'INV-2025-001',
  })
  @IsString()
  reference!: string;

  @ApiProperty({
    description: 'List of items in the invoice',
    type: [ItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items!: ItemDto[];
}