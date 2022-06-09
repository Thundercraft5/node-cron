import CronJob from "./CronJob";
import CronSet from "./CronSet";
import validateInterval from "./validateInterval";

export default class CronJobMap<I extends string = string> extends Map<I, CronSet<I>> {
	get(interval: I) {
		if (!this.has(interval)) super.set(interval, new CronSet(interval));

		return super.get(interval)! as CronSet<I>;
	}

	set(interval: I, value = new CronSet<I>(interval)) {
		super.set(validateInterval(interval), value);

		return this;
	}

	add(interval: I, ...jobs: CronJob<I>[]) {
		const set = this.get(validateInterval(interval));

		jobs.forEach(job => set.add(job));

		return this;
	}

	remove(interval: I, ...jobs: CronJob<I>[]) {
		const set = this.get(validateInterval(interval));

		set.delete(...jobs);

		return this;
	}

	has(interval: I) {
		return super.has(validateInterval(interval));
	}
}