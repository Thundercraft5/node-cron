---
Created: 20[[24-04-13]]T10:17
Edited: 2024-10-29T17:32
---
# node-cron-manager
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