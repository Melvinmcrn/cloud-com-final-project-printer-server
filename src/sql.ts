import {OkPacket, escape, ConnectionConfig, createConnection} from 'mysql';
import * as util from 'util';

// when deploy, change from "host" to "socketPath"

const config: ConnectionConfig = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASS,
  database: process.env.SQL_DATABASE,
  charset: 'utf8',
  timezone: 'utc',
};

if (process.env.SQL_HOST) {
  config.host = process.env.SQL_HOST;
} else if (process.env.SQL_SOCKET_PATH) {
  config.socketPath = process.env.SQL_SOCKET_PATH;
}

console.log('SQL config: ', config);

const makeDb = (config: ConnectionConfig) => {
  try {
    const connection = createConnection(config);

    return {
      query(queryString: string) {
        return util.promisify(connection.query).call(connection, queryString);
      },
      close() {
        return util.promisify(connection.end).call(connection);
      },
    };
  } catch (error) {
    console.error(error);
    throw new Error('Error occur while connecting to DB.');
  }
};

const db = makeDb(config);

const updateActualResultByImageId = async (
  id: string,
  predictedResult: string
): Promise<void> => {
  try {
    const queryString = `UPDATE validation_result SET predicted_result = ${escape(
      predictedResult
    )}, actual_result = ${escape(predictedResult)}
    WHERE id = ${escape(id)};`;
    const query = db.query(queryString);
    const result = <OkPacket>await query;
    if (!result.affectedRows || result.affectedRows < 1) {
      throw new Error();
    }
  } catch (error) {
    console.error('Error occur while updating prediction result.');
    throw error;
  }
};

export {updateActualResultByImageId};
