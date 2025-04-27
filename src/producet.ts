import * as r from './common/common.rabbitmq';
// HACK

const connection = new r.RabbitMQConnection();
async function runMain(){
await connection.init('amqp://guest:guest@localhost:5672')

const pro = new r.RabbitMQProducer(connection);
pro.publishToQueue('test', {mse: '1234'}).then((r) => {
    console.log(r, 'published');
})
console.log('logged');
}

runMain().then((e) => {
    console.log('started');
    console.log(e);
})