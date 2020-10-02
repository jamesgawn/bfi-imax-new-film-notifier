import {Lambda} from './Lambda';
import {Context} from 'aws-lambda';

describe('Lambda.ts', () => {
  test('handler', () => {
    const callbackMock = jest.fn();
    const contextMock = {} as Context;
    Lambda.handler({}, contextMock, callbackMock);
    expect(callbackMock).toBeCalledWith(null, 'Hello World');
  });
});
