import {
  RabbitMQConnection,
  RabbitMQConsumer,
} from '../common/common.rabbitmq';
import config from '../config';

async function runWorker() {
  const connection = new RabbitMQConnection();
  await connection.init(config.rabbitMQ.url);

  const consumer = new RabbitMQConsumer(connection);
  consumer.subscribeToQueue('test', async (e) => {
    console.log(e);
  });
}
runWorker().then((e)=>console.log(e))
