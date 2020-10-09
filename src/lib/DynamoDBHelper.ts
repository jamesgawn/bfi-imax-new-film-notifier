import {DynamoDB} from "aws-sdk";
import {FriendlyError} from "./FriendlyError";
import {IRecord} from "../domain/IRecord";
import {Base} from "./Base";

export class DynamoDBHelper extends Base {
  tableName: string;
  client: DynamoDB.DocumentClient;
  constructor(tableName: string) {
    super();
    this.tableName = tableName;
    this.client = new DynamoDB.DocumentClient({
      convertEmptyValues: true
    });
  }

  async getRecordById<T>(id: string) {
    try {
      const params = {
        TableName: this.tableName,
        Key: {
          "id": id,
        }
      };
      this.log.info(`Retrieving record ${id}`);
      const result = await this.client.get(params).promise();
      this.log.info(`Retrieved record ${id}`);
      return result.Item as T;
    } catch (err) {
      this.log.error(`Failed to retrieve record ${id}`, err);
      throw new FriendlyError(`Unable to retrieve record ${id}`, err);
    }
  }

  async putRecord<T extends IRecord>(record: T) {
    const params = {
      Item: record,
      TableName: this.tableName,
    };
    try {
      this.log.info(`Putting record ${record.id}`);
      const result = await this.client.put(params).promise();
      this.log.info(`Put record ${record.id}`);
      return result;
    } catch (err) {
      this.log.error(`Failed to put record ${record.id}`, err);
      throw new FriendlyError(`Unable to store details of record ${record.id}`, err);
    }
  }
}
