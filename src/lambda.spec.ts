import {handler} from './lambda';
import {Context} from 'aws-lambda';

describe('lambda.ts', () => {
  test('handler', () => {
    const callbackMock = jest.fn();
    const contextMock = {} as Context;
    handler({}, contextMock, callbackMock);
    expect(callbackMock).toBeCalledWith(null, 'Hello World');
  });
});
