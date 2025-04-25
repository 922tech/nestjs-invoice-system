import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { toJSONPlugin } from 'src/common/common.utils';

@Schema()
export class Item {
  @Prop({ required: true })
  sku: string; // Stock Keeping Unit

  @Prop({ required: true })
  qt: number; // Quantity of the item
}
export const ItemSchema = SchemaFactory.createForClass(Item);
ItemSchema.plugin(toJSONPlugin)

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ required: true })
  customer: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  reference: string;

  @Prop({ default: Date.now })
  date: Date;

  @Prop({ type: [Item], required: true, _id: false  })
  items: Item[];
}


export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

InvoiceSchema.plugin(toJSONPlugin)

export type InvoiceDocument = Invoice & Document;