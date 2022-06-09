import CronJob from "./CronJob";
import CronJobMap from "./CronJobMap";
import CronSet from "./CronSet";
export declare type CronJobsObject = {
    [K: string]: CronFunc | CronFunc[];
};
export declare type CronJobs<T extends CronJobsObject = {}> = {
    [K in Extract<keyof T, string>]: CronFunc | CronFunc[];
};
export declare type ConstructorReturnType<T extends abstract new (...args: any[]) => any> = T extends abstract new (...args: any[]) => infer R ? R : unknown;
export declare type CronFunc = (date?: Date) => void;
export default class CronJobManager<T extends CronJobs<T> = CronJobsObject, J extends typeof CronJob[] = typeof CronJob[], I extends string = Extract<keyof T, string>> {
    #private;
    get jobs(): CronJobMap<I>;
    constructor(jobs?: T & ThisType<CronJobManager<T, J, I>>, jobClasses?: [...J]);
    start(interval: I): CronSet<I>;
    startAll(): this;
    getAllIntervals(): I[];
    getRunningJobs(interval: I): CronJob<I>[];
    getRunningIntervals(): I[];
    getAllRunningJobs(): CronJob<I>[];
    getStoppedJobs(interval: I): CronSet<I>;
    getAllStoppedJobs(): CronSet<I>[];
    getStopIntervals(): I[];
    stopAll(): this;
    stop(interval: I): CronSet<I>;
    restart(interval: I): CronSet<I>;
    restartAll(): CronSet<I>[];
}
//# sourceMappingURL=CronJobManager.d.ts.map