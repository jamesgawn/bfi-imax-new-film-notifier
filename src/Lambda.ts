import {Callback, Context} from 'aws-lambda';

export class Lambda {
  static handler(event : {}, context : Context, callback : Callback) {
    callback(null, 'Hello World');
  }
}
