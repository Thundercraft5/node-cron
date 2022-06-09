import CronError from "./CronError";

export const cronJobRegex = /^((((\d+,)+\d+|(\d+(\/|-|#)\d+)|\d+L?|\*(\/\d+)?|L(-\d+)?|\?|[A-Z]{3}(-[A-Z]{3})?) ?){5,7})$|(@(annually|yearly|monthly|weekly|daily|hourly|reboot))|(@every (\d+(ns|us|µs|ms|s|m|h))+)/u;

export default function validateInterval<T>(interval: T) {
	if (typeof interval !== "string" || !cronJobRegex.test(interval))
		throw new CronError("INVALID_CRON_JOB_INTERVAL", interval);

	return interval;
}