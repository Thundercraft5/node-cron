import type { ScheduledTask } from "node-cron";
import type { CronFunc, default as CronJobManager } from "./CronJobManager";
export default class CronJob<I extends string = string> {
    cronTask: ScheduledTask;
    interval: I;
    caller: (date: Date) => void;
    manager: CronJobManager;
    constructor(interval?: I, func?: CronFunc);
    init(manager: CronJobManager): this;
    run(date: Date): void;
    stop(date: Date): void;
    restart(date: Date): void;
}
//# sourceMappingURL=CronJob.d.ts.map