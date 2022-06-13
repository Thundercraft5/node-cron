# node-cron-jobs
A library to manage large-scale cron jobs.

# Usage

```js
import CronJobManager from "@thundercraft5/node-cron-jobs";

new CronJobManager({
	"* * * * *"() {
		console.log("this runs every minute");
	},
}).startAll(); // or use .start("<interval>")
```