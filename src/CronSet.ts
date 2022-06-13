
import CronError from "./CronError";
import CronJob from "./CronJob";
import validateInterval from "./validateInterval";

export default class CronSet<I extends string = string> extends Set<CronJob> {
	interval: I;

	constructor(interval: I) {
		super();
		this.interval = validateInterval(interval);
	}

	add(job: CronJob<I>): this;
	add(...jobs: CronJob<I>[]): this;
	add(...jobs: CronJob<I>[]) {
		if (jobs.length > 1) jobs.forEach(job => this.#add(job));
		else this.#add(jobs[0]!);

		return this;
	}

	delete(job: CronJob<I>): boolean;
	delete(...jobs: CronJob<I>[]): boolean;
	delete(...jobs: CronJob<I>[]) {
		return jobs.length > 1
			? jobs.map(job => this.#delete(job)).every(Boolean)
			: this.#delete(jobs[0]!);
	}

	#add(job: CronJob<I>) {
		if (job.interval != this.interval)
			throw new CronError("INVALID_CRON_SET_INTERVAL", this.interval, job.interval);

		super.add(job);

		return this;
	}

	#delete(job: CronJob<I>) {
		if (job.interval != this.interval)
			throw new CronError("INVALID_CRON_SET_INTERVAL", this.interval, job.interval);

		return super.delete(job);
	}

	[Symbol.iterator]() {
		return this.values() as IterableIterator<CronJob<I>>;
	}
}