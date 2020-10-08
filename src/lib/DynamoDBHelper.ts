import {DynamoDB} from "aws-sdk";
import {FriendlyError} from "./FriendlyError";
import {IRecord} from "../domain/IRecord";

export class DynamoDBHelper {
  tableName: string;
  client: DynamoDB.DocumentClient;
  constructor(tableName: string) {
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
      const result = await this.client.get(params).promise();
      return result.Item as T;
    } catch (err) {
      throw new FriendlyError(`Unable to retrieve record ${id}`, err);
    }
  }

  async putRecord<T extends IRecord>(record: T) {
    const params = {
      Item: record,
      TableName: this.tableName,
    };
    try {
      return await this.client.put(params).promise();
    } catch (err) {
      throw new FriendlyError(`Unable to store details of record ${record.id}`, err);
    }
  }
}
