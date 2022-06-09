import makeErrors from "@thundercraft5/node-errors";

const { Error: CronError } = makeErrors({
	INVALID_CRON_JOB_INTERVAL: (interval = "") => `An invalid cron job interval was provided ("${ interval }").`,
	INVALID_CRON_JOB_CLASS: (Class: Function) => `An invalid cron job class was provided (${ Class.name }). All cron job classes must extend \`CronJob\`.`,
	INVALID_CRON_SET_INTERVAL: (setInterval = "", interval = "") => `An invalid cron set interval was provided ("${interval}"). All jobs added to this set must be of interval "${setInterval}".`,
	INTERVAL_ALREADY_RUNNING: (interval = "") => `Cron job with interval "${interval}" is already running.`,
	INTERVAL_ALREADY_STOPPED: (interval = "") => `Cron job with interval "${interval}" is already stopped.`,
}, {
	Error: class CronError extends Error {},
});	

export default CronError;