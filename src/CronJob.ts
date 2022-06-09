
import { TypeError } from "@thundercraft5/node-errors";
	
import CronError from "./CronError";
import { cronJobRegex } from "./validateInterval";

import type { ScheduledTask } from "node-cron";

import type { CronFunc } from "./CronJobManager";
import type CronJobManager from "./CronJobManager";


export default class CronJob<I extends string = string> {
	cronTask: ScheduledTask;
	interval: I;
	caller: (date: Date) => void;
	manager: CronJobManager;

	constructor(interval?: I, func?: CronFunc) {
		if (!interval || !cronJobRegex.test(interval)) throw new CronError("INVALID_CRON_JOB_INTERVAL", interval);

		if (func) this.run = func;
		this.interval = interval;
		this.caller = (date: Date) => {
			try {
				this.run.call(this.manager, date);
			} catch (e: any) {
				console.warn(`Cron job with interval "${ interval }" failed with exception: ${ e.stack || e }`);
			}
		};
	}

	init(manager: CronJobManager) {
		this.manager = manager;

		return this;
	}

	run(date: Date) {
		throw new TypeError("METHOD_NOT_IMPLEMENTED", this.constructor, "run");
	}

	stop(date: Date) {
		this.cronTask.stop();
	}

	restart(date: Date) {
		this.cronTask.start();
	}
}