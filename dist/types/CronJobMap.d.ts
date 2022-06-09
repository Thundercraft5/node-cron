import CronJob from "./CronJob";
import CronSet from "./CronSet";
export default class CronJobMap<I extends string = string> extends Map<I, CronSet<I>> {
    get(interval: I): CronSet<I>;
    set(interval: I, value?: CronSet<I>): this;
    add(interval: I, ...jobs: CronJob<I>[]): this;
    remove(interval: I, ...jobs: CronJob<I>[]): this;
    has(interval: I): boolean;
}
//# sourceMappingURL=CronJobMap.d.ts.map