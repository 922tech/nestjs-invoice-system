import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Invoice, InvoiceDocument } from './invoice.schema';
import { Model } from 'mongoose';
import { CreateInvoiceDto } from './invoice.dto';
import {
  RabbitMQConnection,
  RabbitMQProducer,
} from '../common/common.rabbitmq';
import config, { isDev } from '../config';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
  ) {}

  async create(obj: CreateInvoiceDto) {
    return await this.invoiceModel.create(obj);
  }

  async findAll(filters: any, options: { page: number; limit: number }) {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const invoices = await this.invoiceModel
      .find(filters)
      .sort({ createdAt: -1 }) // Sort by creation date (newest first)
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.invoiceModel.countDocuments(filters).exec();

    return {
      total,
      page,
      limit,
      data: invoices.map((invoice) => invoice.toJSON()),
    };
  }

  /**
   * Retrieve a specific invoice by ID
   */
  async findOneById(id: string): Promise<InvoiceDocument | null> {
    return await this.invoiceModel.findById(id).exec();
  }

  async calculateTotalDailySales(): Promise<number> {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const result = await this.invoiceModel.aggregate([
      {
        $match: {
          date: {
            $gte: last24Hours,
            $lte: now,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$amount' },
        },
      },
    ]);

    return result.length > 0 ? result[0].totalSales : 0;
  }

  async calculateTotalQuantityPerSKU(): Promise<
    { sku: string; totalQuantity: number }[]
  > {
    const result = await this.invoiceModel.aggregate([
      {
        $unwind: '$items',
      },
      {
        $group: {
          _id: '$items.sku',
          totalQuantity: { $sum: '$items.quantity' },
        },
      },
      {
        $project: {
          _id: 0,
          sku: '$_id',
          totalQuantity: 1,
        },
      },
    ]);

    return result;
  }
}

@Injectable()
export class BrokerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CronService.name);
  private connection: RabbitMQConnection;
  private producer: RabbitMQProducer;
  /**
   * Initialize the RabbitMQ connection and channel.
   */
  async onModuleInit() {
    try {
      this.connection = new RabbitMQConnection();
      await this.connection.init(config.rabbitMQ.url);
      this.logger.log('RabbitMQ connection established.');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ:', error.message);
      throw error;
    }
  }

  /**
   * Close the RabbitMQ connection when the application shuts down.
   */
  async onModuleDestroy() {
    if (this.connection) {
      await this.connection.close();
    }
  }

  async sendMessage(
    message: any,
    queue: string = config.rabbitMQ.queues.default,
  ): Promise<void> {
    this.producer = new RabbitMQProducer(this.connection);
    return this.producer.publishToQueue(queue, message);
  }
}

enum EventTypes {
  REPORT = 'report'
}

@Injectable()
export class CronService implements OnModuleInit {
  private readonly logger = new Logger(CronService.name);
  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly brokerService: BrokerService,
    private readonly invoiceService: InvoiceService,
  ) {}

  onModuleInit() {
    const cronJobs = this.schedulerRegistry.getCronJobs();
    cronJobs.forEach((value, key) => {
      this.logger.log(`Registered cron job: ${key}`);
    });
  }

  @Cron(
    isDev
      ? CronExpression.EVERY_5_SECONDS
      : CronExpression.EVERY_DAY_AT_NOON,
    { name: 'caclulationJob' },
  )
  async handleCron() {
    const dailySales = await this.invoiceService.calculateTotalDailySales();
    const salesPerSku =
      await this.invoiceService.calculateTotalQuantityPerSKU();
    this.brokerService.sendMessage({ 'event': EventTypes.REPORT, dailySales, salesPerSku });
  }
}
