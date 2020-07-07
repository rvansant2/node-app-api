import mongoose from 'mongoose';

import winstonLogger from '../logger/winston';

mongoose.Promise = global.Promise;

const connect = async (uri, options) => {
  const configOptions = options || {};

  await mongoose.connect(uri, configOptions);
  const { connection } = mongoose;

  const connectWithRetry = () => {
    connection.on('connected', () => {
      winstonLogger.info(`Connected to MongoDB at: ${uri}`);
    });
  };

  connection.on('error', err => {
    winstonLogger.error(`Mongoose default connection error: ${err}`);
    setTimeout(connectWithRetry, 5000);
  });
  connectWithRetry();

  return connection;
};

export default connect;
