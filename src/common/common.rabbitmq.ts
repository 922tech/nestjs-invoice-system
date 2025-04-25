import * as amqp from 'amqplib';

export class RabbitMQConnection {
  private static connection: amqp.Connection;
  private static channel: amqp.Channel;

  /**
   * Initializes the RabbitMQ connection and channel
   */
  public static async init(rabbitMQUrl: string): Promise<void> {
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
  public static getChannel(): amqp.Channel {
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
  public static async close(): Promise<void> {
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
  public static async publishToQueue(queue: string, message: any): Promise<void> {
    try {
      const channel = RabbitMQConnection.getChannel();
      await channel.assertQueue(queue, { durable: true });
      channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
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
  /**
   * Consumes messages from the specified queue
   */
  public static async subscribeToQueue(
    queue: string,
    onMessage: (message: any) => Promise<void>,
  ): Promise<void> {
    try {
      const channel = RabbitMQConnection.getChannel();
      await channel.assertQueue(queue, { durable: true });

      console.log(`Listening to queue "${queue}"...`);
      channel.consume(
        queue,
        async (msg) => {
          if (msg) {
            try {
              const content = JSON.parse(msg.content.toString());
              console.log(`Message received from queue "${queue}":`, content);
              await onMessage(content); 
              channel.ack(msg); // Acknowledge the message if everything was OK
            } catch (err) {
              console.error('Error processing message:', err.message);
              channel.nack(msg); // Requeue the message for retry
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
