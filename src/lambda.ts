import {Callback, Context} from 'aws-lambda';

export const handler = (event : any, context : Context, callback : Callback)
    : void => {
  callback(null, 'Hello World');
};
