/// <reference types="node" />
declare const CronError: {
    new <Code extends "INVALID_CRON_JOB_INTERVAL" | "INVALID_CRON_JOB_CLASS" | "INVALID_CRON_SET_INTERVAL" | "INTERVAL_ALREADY_RUNNING" | "INTERVAL_ALREADY_STOPPED">(code: Code, ...formats: Required<Parameters<Exclude<{
        INVALID_CRON_JOB_INTERVAL: (interval?: any) => string;
        INVALID_CRON_JOB_CLASS: (Class: Function) => string;
        INVALID_CRON_SET_INTERVAL: (setInterval?: any, interval?: any) => string;
        INTERVAL_ALREADY_RUNNING: (interval?: any) => string;
        INTERVAL_ALREADY_STOPPED: (interval?: any) => string;
    }[Code], string>>>): {
        "__#1@#message": string;
        readonly "$$<Symbol>codedError": true;
        readonly "$$<Symbol>code": string;
        readonly "$$<Symbol>rawMessage": string;
        readonly name: string;
        message: string;
        getErrorName(): string | undefined;
        stack?: string | undefined;
        cause?: Error | undefined;
        readonly [Symbol.species]: {
            new (message?: string | undefined): {
                name: string;
                message: string;
                stack?: string;
                cause?: Error;
            };
            new (message?: string | undefined, options?: ErrorOptions | undefined): {
                name: string;
                message: string;
                stack?: string;
                cause?: Error;
            };
            captureStackTrace(targetObject: object, constructorOpt?: Function | undefined): void;
            prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
            stackTraceLimit: number;
        };
        readonly [Symbol.toStringTag]: string | undefined;
    };
    readonly "$$<Symbol>codedErrorClass": boolean;
    [Symbol.hasInstance](instance: any): boolean;
} & {
    new (message?: string | undefined): {
        name: string;
        message: string;
        stack?: string;
        cause?: Error;
    };
    new (message?: string | undefined, options?: ErrorOptions | undefined): {
        name: string;
        message: string;
        stack?: string;
        cause?: Error;
    };
    captureStackTrace(targetObject: object, constructorOpt?: Function | undefined): void;
    prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
    stackTraceLimit: number;
};
export default CronError;
//# sourceMappingURL=CronError.d.ts.map