import * as amqp from 'amqplib';
import config from '../config';

export class RabbitMQConnection {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  /**
   * Initializes the RabbitMQ connection and channel
   */
  public async init(rabbitMQUrl: string): Promise<void> {
    if (!this.connection) {
      try {
        this.connection = await amqp.connect(rabbitMQUrl);
        this.channel = await this.connection.createChannel();
        console.log('RabbitMQ connection established.');
      } catch (err) {
        console.error('Failed to connect to RabbitMQ:', err.message);
        throw err;
      }
    }
  }

  /**
   * Returns the RabbitMQ channel
   */
  public getChannel(): amqp.Channel {
    if (!this.channel) {
      throw new Error(
        'RabbitMQ channel is not initialized. Call init() first.',
      );
    }
    return this.channel;
  }

  /**
   * Closes the RabbitMQ connection
   */
  public async close(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
      console.log('RabbitMQ connection closed.');
    }
  }
}

export class RabbitMQProducer {
  private channel: amqp.Channel;

  /**
   * Constructor accepts a RabbitMQConnection instance
   */
  constructor(private connection: RabbitMQConnection) {
    this.channel = connection.getChannel();
  }

  /**
   * Publishes a message to the specified queue
   */
  public async publishToQueue(queue: string, message: any): Promise<void> {
    try {
      await this.channel.assertQueue(queue, { durable: true });
      this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
        persistent: true,
      });
      console.log(`Message sent to queue "${queue}":`, message);
    } catch (err) {
      console.error('Failed to send message to RabbitMQ:', err.message);
      throw err;
    }
  }
}

export class RabbitMQConsumer {
  private channel: amqp.Channel;

  /**
   * Constructor accepts a RabbitMQConnection instance
   */
  constructor(private connection: RabbitMQConnection) {
    this.channel = connection.getChannel();
  }

  /**
   * Consumes messages from the specified queue
   */
  public async subscribeToQueue(
    queue: string,
    onMessage: (message: any) => Promise<void>,
  ): Promise<void> {
    try {
      await this.channel.assertQueue(queue, { durable: true });

      console.log(`Listening to queue "${queue}"...`);
      this.channel.consume(
        queue,
        async (msg) => {
          if (msg) {
            try {
              const content = JSON.parse(msg.content.toString());
              console.log(`Message received from queue "${queue}":`, content);
              await onMessage(content);
              this.channel.ack(msg); // Acknowledge the message if everything was OK
            } catch (err) {
              console.error('Error processing message:', err.message);
              this.channel.nack(msg); // Requeue the message for retry
            }
          }
        },
        { noAck: false }, // Ensure manual acknowledgment
      );
    } catch (err) {
      console.error('Failed to consume messages from RabbitMQ:', err.message);
      throw err;
    }
  }
}

const connection = new RabbitMQConnection();
async function sendMessage() {
  await connection.init(config.rabbitMQ.url);
  const pro = new RabbitMQProducer(connection);
  pro.publishToQueue('test', { mse: '1234' }).then((r) => {
    console.log(r, 'published');
  });
  console.log('logged');
}


