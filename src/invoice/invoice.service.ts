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
import config from '../config';
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
}

@Injectable()
export class BrokerService implements OnModuleInit, OnModuleDestroy {
  private connection: RabbitMQConnection;
  private producer: RabbitMQProducer;
  /**
   * Initialize the RabbitMQ connection and channel.
   */
  async onModuleInit() {
    try {
      this.connection = new RabbitMQConnection();
      await this.connection.init(config.rabbitMQ.url);
      console.log('RabbitMQ connection established.');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error.message);
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

@Injectable()
export class CronService implements OnModuleInit {
  private readonly logger = new Logger(CronService.name);
  constructor(private readonly schedulerRegistry: SchedulerRegistry) {}

  onModuleInit() {
    const cronJobs = this.schedulerRegistry.getCronJobs();
    cronJobs.forEach((value, key) => {
      this.logger.log(`Registered cron job: ${key}`);
    });
  }

  @Cron(CronExpression.EVERY_10_SECONDS, { name: 'exampleJob' })
  handleCron() {
    this.logger.log('Cron job executed');
  }
}
