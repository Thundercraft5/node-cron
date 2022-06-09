import cron, { ScheduledTask } from "node-cron";

import CronJob from "./CronJob";
import CronJobMap from "./CronJobMap";
import CronError from "./CronError";
import CronSet from "./CronSet";
import validateInterval from "./validateInterval";

export type CronJobsObject =  {
	[K: string]: CronFunc | CronFunc []
}
export type CronJobs<T extends CronJobsObject = {}> = {
	[K in Extract<keyof T, string>]: CronFunc | CronFunc []
};
export type ConstructorReturnType<T extends abstract new (...args: any[]) => any> = T extends abstract new (...args: any[]) => infer R ? R : unknown;

export type CronFunc = (date?: Date) => void;
export default class CronJobManager<
	T extends CronJobs<T> = CronJobsObject,
	J extends typeof CronJob[] = typeof CronJob[],
	I extends string = Extract<keyof T, string>,
> {
	#jobs = new CronJobMap<I>();
	#runningJobs = new CronJobMap<I>();
	#stoppedJobs = new CronJobMap<I>();

	get jobs() {
		return this.#jobs;
	}

	constructor(
		jobs: T & ThisType<CronJobManager<T, J, I>> = {} as T,
		// @ts-ignore
		jobClasses: [...J] = [],
	) {
		// eslint-disable-next-line
		(Object.entries(jobs) as [[I, T[keyof T]]])
			.forEach(([interval, func]) => {
				validateInterval(interval);
				let cronFunc: CronFunc | CronFunc[] = func;

				if (!Array.isArray(func)) cronFunc = [func];

				// eslint-disable-next-line
			(cronFunc as CronFunc[]).forEach(func => {
					this.#jobs.add(interval, new CronJob<I>(interval, func).init(this));
				});
			});

		jobClasses.forEach(Job => {
			if (!(Job?.prototype instanceof CronJob)) throw new CronError("INVALID_CRON_JOB_CLASS", Job);
			const job = new Job<I>().init(this);

			this.#jobs.add(job.interval, job);
		});
	}

	start(interval: I) {
		if (this.#runningJobs.has(interval)) throw new CronError("INTERVAL_ALREADY_RUNNING", interval)

		this.#runningJobs.add(interval, ...[...this.#jobs.get(interval)]
			.map(job => (job.cronTask = cron.schedule(job.interval, job.caller), job)));

		return this.#runningJobs.get(interval);
	}

	startAll() {
		for (const interval of this.#jobs.keys()) this.start(interval);

		return this;
	}

	getAllIntervals() { return [...this.#jobs.keys()]; }

	getRunningJobs(interval: I) {
		return [...this.#runningJobs.get(interval)];
	}

	getRunningIntervals() { return [...this.#runningJobs.keys()]; }

	getAllRunningJobs() {
		return [...this.#runningJobs.values()].map(set => [...set]).flat(1);
	}

	getStoppedJobs(interval: I) {
		return this.#stoppedJobs.get(interval);
	}

	getAllStoppedJobs() {
		return [...this.#stoppedJobs.values()].flat(1) as CronSet<I>[];
	}

	getStopIntervals() { return [...this.#stoppedJobs.keys()]; }


	stopAll() {
		this.getRunningIntervals().forEach(interval => this.stop(interval));

		return this;
	}

	stop(interval: I) {
		const jobs = this.getRunningJobs(interval).map(job => (job.cronTask.stop(), job));

		this.#stoppedJobs.add(interval, ...jobs);

		return this.#stoppedJobs.get(interval);
	}

	restart(interval: I) {
		const jobs = this.getStoppedJobs(interval);

		[...jobs].forEach(job => job.cronTask.start());

		this.#stoppedJobs.get(interval).clear();
		this.#runningJobs.get(interval).add(...jobs);

		return jobs;
	}

	restartAll() {
		const stopped = this.getAllStoppedJobs(),
			stoppedIntervals = [...this.#stoppedJobs.keys()];

		for (const interval of stoppedIntervals) this.restart(interval);

		return stopped;
	}
}