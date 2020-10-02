import { Lambda } from "./Lambda";
import { Context } from "aws-lambda";

describe('Lambda.ts', () => {
    test('handler', () => {
        let callbackMock = jest.fn();
        let contextMock = {} as Context;
        Lambda.handler({}, contextMock, callbackMock);
        expect(callbackMock).toBeCalledWith(null, "Hello World");
    });
});