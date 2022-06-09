import CronJob from "./CronJob";
export default class CronSet<I extends string = string> extends Set<CronJob> {
    #private;
    interval: I;
    constructor(interval: I);
    add(job: CronJob<I>): this;
    add(...jobs: CronJob<I>[]): this;
    delete(job: CronJob<I>): boolean;
    delete(...jobs: CronJob<I>[]): boolean;
    [Symbol.iterator](): IterableIterator<CronJob<I>>;
}
//# sourceMappingURL=CronSet.d.ts.map