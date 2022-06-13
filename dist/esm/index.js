import require$$2 from "child_process";
import require$$0$1 from "crypto";
import require$$0 from "events";
import require$$1 from "path";

// src/utils/formatWordList.ts
function formatWordList(list, and = false) {
	const last = list.pop(),
		lastWord = and ? "and" : "or";

	if (list.length > 1) {
		const commaSeparated = list.map((s, i) => `${ i % 5 == 0 && i ? "\n" : "" }"${ s }"`);

		return `${ commaSeparated.join(", ") }, ${ lastWord } "${ last }"`;
	} else
		return `${ list.length == 1 ? `"${ list[0] }" ${ lastWord } ` : "" }"${ last }"`;
}

// src/utils/formatErrorMessage.ts
function formatErrorMessage(messages2, code, ...formats) {
	if (!(code in messages2))
		throw new ReferenceError("INVALID_MESSAGE_CODE", code, formatWordList(Object.keys(messages2)));
	const message = typeof messages2[code] === "function" ? messages2[code](...formats) : messages2[code];

	if (typeof messages2[code] === "function" && messages2[code].length > formats.length)
		throw new RangeError("MESSAGE_CODE_MISSING_FORMATS", code, messages2[code].length, formats.length);

	return message;
}

// src/makeCodedError.ts
function makeCodedError(messages2, Base) {
	if ("$$<Symbol>codedError" in Base)
		throw new TypeError$1("ERROR_CLASS_ALREADY_EXTENDED", Base);

	return class extends Base {
		static get ["$$<Symbol>codedErrorClass"]() {
			return true;
		}

		static [Symbol.hasInstance](instance) {
			const constructor = instance[Symbol.species] || instance.constructor;

			return instance instanceof Base || constructor === this;
		}

		static {
			Object.defineProperty(this, "name", { value: Base.name });
		}

		#message = "";
		["$$<Symbol>codedError"];
		["$$<Symbol>code"];
		["$$<Symbol>rawMessage"];
		constructor(code, ...formats) {
			super(formatErrorMessage(messages2, code, ...formats));
			if (typeof messages2[code] !== "string")
				this["$$<Symbol>rawMessage"] = messages2[code]?.toString() ?? null;
			this["$$<Symbol>code"] = code.toLocaleUpperCase();
			Object.defineProperty(this, "$$<Symbol>codedError", { value: true });
		}

		get name() {
			return `${ this.getErrorName() }${ this["$$<Symbol>code"] ? ` [${ this["$$<Symbol>code"] }]` : "" }`;
		}

		get message() {
			return !this.#message ? "" : this.#message;
		}

		set message(value) {
			this.#message = value;
		}

		get [Symbol.species]() {
			return Base;
		}

		get [Symbol.toStringTag]() {
			return this.getErrorName();
		}

		getErrorName() {
			const names = [];
			let cur = this.constructor;

			while (cur) {
				names.push(cur.name);
				cur = Object.getPrototypeOf(cur);
			}

			return names.find(name => name != "CodedError");
		}
	};
}

// src/nativeMessages.ts
const messages = {
		ERROR_CLASS_ALREADY_EXTENDED: Class => `Error class "${ Class.name }" is already a coded error class.`,
		INVALID_MESSAGE_CODE: (code = "", validCodes = "") => `Error code "${ code }" was not found in the provided messages registry.
List of valid codes: ${ validCodes }`,
		MESSAGE_CODE_MISSING_FORMATS: (code = "", required = 0, received = 0) => `Message code "${ code }" expects at least ${ required } format arguments, got ${ received } instead`,
		METHOD_NOT_IMPLEMENTED: (Class, name = "") => `Method ${ Class.name }#${ name }() is not implemented.`,
	},
	nativeMessages_default = messages;

// src/makeErrors.ts
function makeErrors(messages2, errors, includeNativeCodes = true) {
	if (includeNativeCodes)
		messages2 = { ...messages2, ...nativeMessages_default };
	const ret = {},
		entries = Object.entries(errors);

	for (const [k, error] of entries)
		ret[k] = makeCodedError(messages2, error);


	return ret;
}

// src/nativeErrors.ts
var {
	TypeError: TypeError$1,
	RangeError,
	ReferenceError,
	Error: Error$1,
} = makeErrors(nativeMessages_default, {
	TypeError: globalThis.TypeError,
	RangeError: globalThis.RangeError,
	ReferenceError: globalThis.ReferenceError,
	Error: globalThis.Error,
});
const { Error: CronError } = makeErrors({
		INVALID_CRON_JOB_INTERVAL: (interval = "") => `An invalid cron job interval was provided ("${ interval }").`,
		INVALID_CRON_JOB_CLASS: Class => `An invalid cron job class was provided (${ Class.name }). All cron job classes must extend \`CronJob\`.`,
		INVALID_CRON_SET_INTERVAL: (setInterval = "", interval = "") => `An invalid cron set interval was provided ("${ interval }"). All jobs added to this set must be of interval "${ setInterval }".`,
		INTERVAL_ALREADY_RUNNING: (interval = "") => `Cron job with interval "${ interval }" is already running.`,
		INTERVAL_ALREADY_STOPPED: (interval = "") => `Cron job with interval "${ interval }" is already stopped.`,
	}, {
		Error: class CronError extends Error {},
	}),

	cronJobRegex = /^((((\d+,)+\d+|(\d+(\/|-|#)\d+)|\d+L?|\*(\/\d+)?|L(-\d+)?|\?|[A-Z]{3}(-[A-Z]{3})?) ?){5,7})$|(@(annually|yearly|monthly|weekly|daily|hourly|reboot))|(@every (\d+(ns|us|µs|ms|s|m|h))+)/u;

function validateInterval(interval) {
	if (typeof interval !== "string" || !cronJobRegex.test(interval))
		throw new CronError("INVALID_CRON_JOB_INTERVAL", interval);

	return interval;
}

class CronJob {
	cronTask;
	interval;
	caller;
	manager;
	constructor(interval, func) {
		if (!interval || !cronJobRegex.test(interval))
			throw new CronError("INVALID_CRON_JOB_INTERVAL", interval);
		if (func)
			this.run = func;
		this.interval = interval;
		this.caller = date => {
			try {
				this.run.call(this.manager, date);
			} catch (e) {
				console.warn(`Cron job with interval "${ interval }" failed with exception: ${ e.stack || e }`);
			}
		};
	}

	init(manager) {
		this.manager = manager;

		return this;
	}

	run(date) {
		throw new TypeError$1("METHOD_NOT_IMPLEMENTED", this.constructor, "run");
	}

	stop(date) {
		this.cronTask.stop();
	}

	restart(date) {
		this.cronTask.start();
	}
}

const commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {},
	EventEmitter$3 = require$$0;

class Task$1 extends EventEmitter$3 {
	constructor(execution) {
		super();
		if (typeof execution !== "function")
			throw "execution must be a function";

		this._execution = execution;
	}

	execute(now) {
		let exec;

		try {
			exec = this._execution(now);
		} catch (error) {
			return this.emit("task-failed", error);
		}

		if (exec instanceof Promise)
			return exec
                .then(() => this.emit("task-finished"))
                .catch(error => this.emit("task-failed", error));
		else {
			this.emit("task-finished");

			return exec;
		}
	}
}

const task = Task$1,

	monthNamesConversion$1 = (() => {
		const months = ["january", "february", "march", "april", "may", "june", "july",
				"august", "september", "october", "november", "december"],
			shortMonths = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug",
				"sep", "oct", "nov", "dec"];

		function convertMonthName(expression, items) {
			for (const [i, item] of items.entries())
				expression = expression.replace(new RegExp(item, "gi"), parseInt(i, 10) + 1);


			return expression;
		}

		function interprete(monthExpression) {
			monthExpression = convertMonthName(monthExpression, months);
			monthExpression = convertMonthName(monthExpression, shortMonths);

			return monthExpression;
		}

		return interprete;
	})(),

	weekDayNamesConversion$1 = (() => {
		const weekDays = ["sunday", "monday", "tuesday", "wednesday", "thursday",
				"friday", "saturday"],
			shortWeekDays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

		function convertWeekDayName(expression, items) {
			for (const [i, item] of items.entries())
				expression = expression.replace(new RegExp(item, "gi"), parseInt(i, 10));


			return expression;
		}

		function convertWeekDays(expression) {
			expression = expression.replace("7", "0");
			expression = convertWeekDayName(expression, weekDays);

			return convertWeekDayName(expression, shortWeekDays);
		}

		return convertWeekDays;
	})(),

	asteriskToRangeConversion = (() => {
		function convertAsterisk(expression, replecement) {
			if (expression.includes("*"))
				return expression.replace("*", replecement);


			return expression;
		}

		function convertAsterisksToRanges(expressions) {
			expressions[0] = convertAsterisk(expressions[0], "0-59");
			expressions[1] = convertAsterisk(expressions[1], "0-59");
			expressions[2] = convertAsterisk(expressions[2], "0-23");
			expressions[3] = convertAsterisk(expressions[3], "1-31");
			expressions[4] = convertAsterisk(expressions[4], "1-12");
			expressions[5] = convertAsterisk(expressions[5], "0-6");

			return expressions;
		}

		return convertAsterisksToRanges;
	})(),

	rangeConversion = (() => {
		function replaceWithRange(expression, text, init, end) {
			const numbers = [];
			let last = parseInt(end),
				first = parseInt(init);

			if (first > last) {
				last = parseInt(init);
				first = parseInt(end);
			}

			for (let i = first; i <= last; i++)
				numbers.push(i);


			return expression.replace(new RegExp(text, "i"), numbers.join(","));
		}

		function convertRange(expression) {
			const rangeRegEx = /(\d+)-(\d+)/;
			let match = rangeRegEx.exec(expression);

			while (match !== null && match.length > 0) {
				expression = replaceWithRange(expression, match[0], match[1], match[2]);
				match = rangeRegEx.exec(expression);
			}

			return expression;
		}

		function convertAllRanges(expressions) {
			for (let i = 0; i < expressions.length; i++)
				expressions[i] = convertRange(expressions[i]);


			return expressions;
		}

		return convertAllRanges;
	})(),

	stepValuesConversion = (() => {
		function convertSteps(expressions) {
			const stepValuePattern = /^(.+)\/(\w+)$/;

			for (let i = 0; i < expressions.length; i++) {
				const match = stepValuePattern.exec(expressions[i]),
					isStepValue = match !== null && match.length > 0;

				if (isStepValue) {
					const baseDivider = match[2];

					if (isNaN(baseDivider))
						throw `${ baseDivider } is not a valid step value`;

					const values = match[1].split(","),
						stepValues = [],
						divider = parseInt(baseDivider, 10);

					for (let j = 0; j <= values.length; j++) {
						const value = parseInt(values[j], 10);

						if (value % divider === 0)
							stepValues.push(value);
					}
					expressions[i] = stepValues.join(",");
				}
			}

			return expressions;
		}

		return convertSteps;
	})(),
	monthNamesConversion = monthNamesConversion$1,
	weekDayNamesConversion = weekDayNamesConversion$1,
	convertAsterisksToRanges = asteriskToRangeConversion,
	convertRanges = rangeConversion,
	convertSteps = stepValuesConversion,
	convertExpression$2 = (() => {
		function appendSeccondExpression(expressions) {
			if (expressions.length === 5)
				return ["0"].concat(expressions);


			return expressions;
		}

		function removeSpaces(str) {
			return str.replace(/\s{2,}/g, " ").trim();
		}

		// Function that takes care of normalization.
		function normalizeIntegers(expressions) {
			for (let i = 0; i < expressions.length; i++) {
				const numbers = expressions[i].split(",");

				for (let j = 0; j < numbers.length; j++)
					numbers[j] = parseInt(numbers[j]);

				expressions[i] = numbers;
			}

			return expressions;
		}

		/*
		 * The node-cron core allows only numbers (including multiple numbers e.g 1,2).
		 * This module is going to translate the month names, week day names and ranges
		 * to integers relatives.
		 *
		 * Month names example:
		 *  - expression 0 1 1 January,Sep *
		 *  - Will be translated to 0 1 1 1,9 *
		 *
		 * Week day names example:
		 *  - expression 0 1 1 2 Monday,Sat
		 *  - Will be translated to 0 1 1 1,5 *
		 *
		 * Ranges example:
		 *  - expression 1-5 * * * *
		 *  - Will be translated to 1,2,3,4,5 * * * *
		 */
		function interprete(expression) {
			let expressions = removeSpaces(expression).split(" ");

			expressions = appendSeccondExpression(expressions);
			expressions[4] = monthNamesConversion(expressions[4]);
			expressions[5] = weekDayNamesConversion(expressions[5]);
			expressions = convertAsterisksToRanges(expressions);
			expressions = convertRanges(expressions);
			expressions = convertSteps(expressions);

			expressions = normalizeIntegers(expressions);

			return expressions.join(" ");
		}

		return interprete;
	})(),
	convertExpression$1 = convertExpression$2,

	validationRegex = /^(?:\d+|\*|\*\/\d+)$/;

/**
 * @param {string} expression The Cron-Job expression.
 * @param {number} min The minimum value.
 * @param {number} max The maximum value.
 * @returns {boolean}
 */
function isValidExpression(expression, min, max) {
	const options = expression.split(",");

	for (const option of options) {
		const optionAsInt = parseInt(option, 10);

		if (
			!Number.isNaN(optionAsInt)
                && (optionAsInt < min || optionAsInt > max)
            || !validationRegex.test(option)
		)
			return false;
	}

	return true;
}

/**
 * @param {string} expression The Cron-Job expression.
 * @returns {boolean}
 */
function isInvalidSecond(expression) {
	return !isValidExpression(expression, 0, 59);
}

/**
 * @param {string} expression The Cron-Job expression.
 * @returns {boolean}
 */
function isInvalidMinute(expression) {
	return !isValidExpression(expression, 0, 59);
}

/**
 * @param {string} expression The Cron-Job expression.
 * @returns {boolean}
 */
function isInvalidHour(expression) {
	return !isValidExpression(expression, 0, 23);
}

/**
 * @param {string} expression The Cron-Job expression.
 * @returns {boolean}
 */
function isInvalidDayOfMonth(expression) {
	return !isValidExpression(expression, 1, 31);
}

/**
 * @param {string} expression The Cron-Job expression.
 * @returns {boolean}
 */
function isInvalidMonth(expression) {
	return !isValidExpression(expression, 1, 12);
}

/**
 * @param {string} expression The Cron-Job expression.
 * @returns {boolean}
 */
function isInvalidWeekDay(expression) {
	return !isValidExpression(expression, 0, 7);
}

/**
 * @param {string[]} patterns The Cron-Job expression patterns.
 * @param {string[]} executablePatterns The executable Cron-Job expression
 * patterns.
 * @returns {void}
 */
function validateFields(patterns, executablePatterns) {
	if (isInvalidSecond(executablePatterns[0]))
		throw new Error(`${ patterns[0] } is a invalid expression for second`);

	if (isInvalidMinute(executablePatterns[1]))
		throw new Error(`${ patterns[1] } is a invalid expression for minute`);

	if (isInvalidHour(executablePatterns[2]))
		throw new Error(`${ patterns[2] } is a invalid expression for hour`);

	if (isInvalidDayOfMonth(executablePatterns[3]))
		throw new Error(
			`${ patterns[3] } is a invalid expression for day of month`,
		);

	if (isInvalidMonth(executablePatterns[4]))
		throw new Error(`${ patterns[4] } is a invalid expression for month`);

	if (isInvalidWeekDay(executablePatterns[5]))
		throw new Error(`${ patterns[5] } is a invalid expression for week day`);
}

/**
 * Validates a Cron-Job expression pattern.
 *
 * @param {string} pattern The Cron-Job expression pattern.
 * @returns {void}
 */
function validate$1(pattern) {
	if (typeof pattern !== "string")
		throw new TypeError("pattern must be a string!");

	const patterns = pattern.split(" "),
		executablePatterns = convertExpression$1(pattern).split(" ");

	if (patterns.length === 5) patterns.unshift("0");

	validateFields(patterns, executablePatterns);
}

const patternValidation = validate$1,
	validatePattern = patternValidation,
	convertExpression = convertExpression$2;

function matchPattern(pattern, value) {
	if (pattern.includes(",")) {
		const patterns = pattern.split(",");

		return patterns.includes(value.toString());
	}

	return pattern === value.toString();
}

class TimeMatcher$1 {
	constructor(pattern, timezone) {
		validatePattern(pattern);
		this.pattern = convertExpression(pattern);
		this.timezone = timezone;
		this.expressions = this.pattern.split(" ");
	}

	match(date) {
		date = this.apply(date);

		const runOnSecond = matchPattern(this.expressions[0], date.getSeconds()),
			runOnMinute = matchPattern(this.expressions[1], date.getMinutes()),
			runOnHour = matchPattern(this.expressions[2], date.getHours()),
			runOnDay = matchPattern(this.expressions[3], date.getDate()),
			runOnMonth = matchPattern(this.expressions[4], date.getMonth() + 1),
			runOnWeekDay = matchPattern(this.expressions[5], date.getDay());

		return runOnSecond && runOnMinute && runOnHour && runOnDay && runOnMonth && runOnWeekDay;
	}

	apply(date) {
		if (this.timezone) {
			const dtf = new Intl.DateTimeFormat("en-US", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
				hourCycle: "h23",
				fractionalSecondDigits: 3,
				timeZone: this.timezone,
			});

			return new Date(dtf.format(date));
		}

		return date;
	}
}

const timeMatcher = TimeMatcher$1,
	EventEmitter$2 = require$$0,
	TimeMatcher = timeMatcher;

class Scheduler$1 extends EventEmitter$2 {
	constructor(pattern, timezone, autorecover) {
		super();
		this.timeMatcher = new TimeMatcher(pattern, timezone);
		this.autorecover = autorecover;
	}

	start() {
		// clear timeout if exists
		this.stop();

		let lastCheck = process.hrtime(),
			lastExecution = this.timeMatcher.apply(new Date());
		const matchTime = () => {
			const delay = 1000,
				elapsedTime = process.hrtime(lastCheck),
				elapsedMs = (elapsedTime[0] * 1e9 + elapsedTime[1]) / 1e6,
				missedExecutions = Math.floor(elapsedMs / 1000);

			for (let i = missedExecutions; i >= 0; i--) {
				const date = new Date(Date.now() - i * 1000),
				 date_tmp = this.timeMatcher.apply(date);

				if (lastExecution.getTime() < date_tmp.getTime() && (i === 0 || this.autorecover) && this.timeMatcher.match(date)) {
					this.emit("scheduled-time-matched", date_tmp);
					date_tmp.setMilliseconds(0);
					lastExecution = date_tmp;
				}
			}
			lastCheck = process.hrtime();
			this.timeout = setTimeout(matchTime, delay);
		};

		matchTime();
	}

	stop() {
		if (this.timeout)
			clearTimeout(this.timeout);

		this.timeout = null;
	}
}

const scheduler = Scheduler$1,

	/*
	 * Unique ID creation requires a high quality random # generator.  In node.js
	 * this is pretty straight-forward - we use the crypto API.
	 */

	crypto = require$$0$1,

	rng$2 = function nodeRNG() {
		return crypto.randomBytes(16);
	},

	/**
	 * Convert array of 16 byte values to UUID string format of the form:
	 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
	 */

	byteToHex = [];

for (let i = 0; i < 256; ++i)
	byteToHex[i] = (i + 0x100).toString(16).slice(1);


function bytesToUuid$2(buf, offset) {
	let i = offset || 0,
		bth = byteToHex;

	// join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
	return [
		bth[buf[i++]], bth[buf[i++]],
		bth[buf[i++]], bth[buf[i++]], "-",
		bth[buf[i++]], bth[buf[i++]], "-",
		bth[buf[i++]], bth[buf[i++]], "-",
		bth[buf[i++]], bth[buf[i++]], "-",
		bth[buf[i++]], bth[buf[i++]],
		bth[buf[i++]], bth[buf[i++]],
		bth[buf[i++]], bth[buf[i++]],
	].join("");
}

let bytesToUuid_1 = bytesToUuid$2,

	rng$1 = rng$2,
	bytesToUuid$1 = bytesToUuid_1,

	/*
	 * **`v1()` - Generate time-based UUID**
	 * 
	 * Inspired by https://github.com/LiosK/UUID.js
	 * and http://docs.python.org/library/uuid.html
	 */

	_nodeId,
	_clockseq,

	// Previous uuid creation time
	_lastMSecs = 0,
	_lastNSecs = 0;

// See https://github.com/uuidjs/uuid for API details
function v1$1(options, buf, offset) {
	let i = buf && offset || 0,
		b = buf || [];

	options = options || {};
	let node = options.node || _nodeId,
		clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

	/*
	 * node and clockseq need to be initialized to random values if they're not
	 * specified.  We do this lazily to minimize issues related to insufficient
	 * system entropy.  See #189
	 */
	if (node == null || clockseq == null) {
		const seedBytes = rng$1();

		if (node == null)
		// Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
			node = _nodeId = [
				seedBytes[0] | 0x01,
				seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5],
			];

		if (clockseq == null)
		// Per 4.2.2, randomize (14 bit) clockseq
			clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
	}

	/*
	 * UUID timestamps are 100 nano-second units since the Gregorian epoch,
	 * (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
	 * time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
	 * (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
	 */
	let msecs = options.msecs !== undefined ? options.msecs : Date.now(),

		/*
		 * Per 4.2.1.2, use count of uuid's generated during the current clock
		 * cycle to simulate higher resolution clock
		 */
		nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1,

		// Time since last uuid creation (in msecs)
		dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000;

	// Per 4.2.1.2, Bump clockseq on clock regression
	if (dt < 0 && options.clockseq === undefined)
		clockseq = clockseq + 1 & 0x3fff;


	/*
	 * Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
	 * time interval
	 */
	if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined)
		nsecs = 0;


	// Per 4.2.1.2 Throw error if too many uuids are requested
	if (nsecs >= 10000)
		throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");


	_lastMSecs = msecs;
	_lastNSecs = nsecs;
	_clockseq = clockseq;

	// Per 4.1.4 - Convert from unix epoch to Gregorian epoch
	msecs += 12219292800000;

	// `time_low`
	const tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;

	b[i++] = tl >>> 24 & 0xff;
	b[i++] = tl >>> 16 & 0xff;
	b[i++] = tl >>> 8 & 0xff;
	b[i++] = tl & 0xff;

	// `time_mid`
	const tmh = msecs / 0x100000000 * 10000 & 0xfffffff;

	b[i++] = tmh >>> 8 & 0xff;
	b[i++] = tmh & 0xff;

	// `time_high_and_version`
	b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
	b[i++] = tmh >>> 16 & 0xff;

	// `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
	b[i++] = clockseq >>> 8 | 0x80;

	// `clock_seq_low`
	b[i++] = clockseq & 0xff;

	// `node`
	for (let n = 0; n < 6; ++n)
		b[i + n] = node[n];


	return buf ? buf : bytesToUuid$1(b);
}

const v1_1 = v1$1,

	rng = rng$2,
	bytesToUuid = bytesToUuid_1;

function v4$1(options, buf, offset) {
	const i = buf && offset || 0;

	if (typeof options === "string") {
		buf = options === "binary" ? new Array(16) : null;
		options = null;
	}
	options = options || {};

	const rnds = options.random || (options.rng || rng)();

	// Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
	rnds[6] = rnds[6] & 0x0f | 0x40;
	rnds[8] = rnds[8] & 0x3f | 0x80;

	// Copy bytes to buffer, if provided
	if (buf)
		for (let ii = 0; ii < 16; ++ii)
			buf[i + ii] = rnds[ii];



	return buf || bytesToUuid(rnds);
}

const v4_1 = v4$1,

	v1 = v1_1,
	v4 = v4_1,

	uuid$2 = v4;

uuid$2.v1 = v1;
uuid$2.v4 = v4;

const uuid_1 = uuid$2,
	EventEmitter$1 = require$$0,
	Task = task,
	Scheduler = scheduler,
	uuid$1 = uuid_1;

class ScheduledTask$1 extends EventEmitter$1 {
	constructor(cronExpression, func, options) {
		super();
		if (!options)
			options = {
				scheduled: true,
				recoverMissedExecutions: false,
			};


		this.options = options;
		this.options.name = this.options.name || uuid$1.v4();

		this._task = new Task(func);
		this._scheduler = new Scheduler(cronExpression, options.timezone, options.recoverMissedExecutions);

		this._scheduler.on("scheduled-time-matched", now => {
			this.now(now);
		});

		if (options.scheduled !== false)
			this._scheduler.start();


		if (options.runOnInit === true)
			this.now("init");
	}

	now(now = "manual") {
		const result = this._task.execute(now);

		this.emit("task-done", result);
	}

	start() {
		this._scheduler.start();
	}

	stop() {
		this._scheduler.stop();
	}
}

const scheduledTask = ScheduledTask$1,
	EventEmitter = require$$0,
	path = require$$1,
	{ fork } = require$$2,
	uuid = uuid_1,

	daemonPath = `${ __dirname }/daemon.js`;

class BackgroundScheduledTask$1 extends EventEmitter {
	constructor(cronExpression, taskPath, options) {
		super();
		if (!options)
			options = {
				scheduled: true,
				recoverMissedExecutions: false,
			};

		this.cronExpression = cronExpression;
		this.taskPath = taskPath;
		this.options = options;
		this.options.name = this.options.name || uuid.v4();

		if (options.scheduled)
			this.start();
	}

	start() {
		this.stop();
		this.forkProcess = fork(daemonPath);

		this.forkProcess.on("message", message => {
			switch (message.type) {
				case "task-done":
					this.emit("task-done", message.result);
					break;
			}
		});

		const { options } = this;

		options.scheduled = true;

		this.forkProcess.send({
			type: "register",
			path: path.resolve(this.taskPath),
			cron: this.cronExpression,
			options,
		});
	}

	stop() {
		if (this.forkProcess)
			this.forkProcess.kill();
	}

	pid() {
		if (this.forkProcess)
			return this.forkProcess.pid;
	}

	isRunning() {
		return !this.forkProcess.killed;
	}
}

const backgroundScheduledTask = BackgroundScheduledTask$1,

	storage$1 = (() => {
		if (!commonjsGlobal.scheduledTasks)
			commonjsGlobal.scheduledTasks = new Map();


		return {
			save(task) {
				if (!task.options) {
					const uuid = uuid_1;

					task.options = {};
					task.options.name = uuid.v4();
				}
				commonjsGlobal.scheduledTasks.set(task.options.name, task);
			},
			getTasks() {
				return commonjsGlobal.scheduledTasks;
			},
		};
	})(),
	ScheduledTask = scheduledTask,
	BackgroundScheduledTask = backgroundScheduledTask,
	validation = patternValidation,
	storage = storage$1;

/**
 * @typedef {Object} CronScheduleOptions
 * @prop {boolean} [scheduled] if a scheduled task is ready and running to be
 *  performed when the time matches the cron expression.
 * @prop {string} [timezone] the timezone to execute the task in.
 */

/**
 * Creates a new task to execute the given function when the cron
 *  expression ticks.
 *
 * @param {string} expression The cron expression.
 * @param {Function} func The task to be executed.
 * @param {CronScheduleOptions} [options] A set of options for the scheduled task.
 * @returns {ScheduledTask} The scheduled task.
 */
function schedule(expression, func, options) {
	const task = createTask(expression, func, options);

	storage.save(task);

	return task;
}

function createTask(expression, func, options) {
	if (typeof func === "string")
		return new BackgroundScheduledTask(expression, func, options);

	return new ScheduledTask(expression, func, options);
}

/**
 * Check if a cron expression is valid.
 *
 * @param {string} expression The cron expression.
 * @returns {boolean} Whether the expression is valid or not.
 */
function validate(expression) {
	try {
		validation(expression);

		return true;
	} catch {
		return false;
	}
}

/**
 * Gets the scheduled tasks.
 *
 * @returns {ScheduledTask[]} The scheduled tasks.
 */
function getTasks() {
	return storage.getTasks();
}

const nodeCron = { schedule, validate, getTasks };

class CronSet extends Set {
	interval;
	constructor(interval) {
		super();
		this.interval = validateInterval(interval);
	}

	add(...jobs) {
		if (jobs.length > 1)
			jobs.forEach(job => this.#add(job));
		else
			this.#add(jobs[0]);

		return this;
	}

	delete(...jobs) {
		return jobs.length > 1
			? jobs.map(job => this.#delete(job)).every(Boolean)
			: this.#delete(jobs[0]);
	}

	#add(job) {
		if (job.interval != this.interval)
			throw new CronError("INVALID_CRON_SET_INTERVAL", this.interval, job.interval);
		super.add(job);

		return this;
	}

	#delete(job) {
		if (job.interval != this.interval)
			throw new CronError("INVALID_CRON_SET_INTERVAL", this.interval, job.interval);

		return super.delete(job);
	}

	[Symbol.iterator]() {
		return this.values();
	}
}

class CronJobMap extends Map {
	get(interval) {
		if (!this.has(interval))
			super.set(interval, new CronSet(interval));

		return super.get(interval);
	}

	set(interval, value = new CronSet(interval)) {
		super.set(validateInterval(interval), value);

		return this;
	}

	add(interval, ...jobs) {
		const set = this.get(validateInterval(interval));

		jobs.forEach(job => set.add(job));

		return this;
	}

	remove(interval, ...jobs) {
		const set = this.get(validateInterval(interval));

		set.delete(...jobs);

		return this;
	}

	has(interval) {
		return super.has(validateInterval(interval));
	}
}

class CronJobManager {
	#jobs = new CronJobMap();
	#runningJobs = new CronJobMap();
	#stoppedJobs = new CronJobMap();
	get jobs() {
		return this.#jobs;
	}

	constructor(jobs = {},
		// @ts-ignore
		jobClasses = []) {
		// eslint-disable-next-line
        Object.entries(jobs)
            .forEach(([interval, func]) => {
            	validateInterval(interval);
            	let cronFunc = func;

            	if (!Array.isArray(func))
            		cronFunc = [func];
            	// eslint-disable-next-line
            cronFunc.forEach(func => {
            		this.#jobs.add(interval, new CronJob(interval, func).init(this));
            	});
            });
		jobClasses.forEach(Job => {
			if (!(Job?.prototype instanceof CronJob))
				throw new CronError("INVALID_CRON_JOB_CLASS", Job);
			const job = new Job().init(this);

			this.#jobs.add(job.interval, job);
		});
	}

	start(interval) {
		if (this.#runningJobs.has(interval))
			throw new CronError("INTERVAL_ALREADY_RUNNING", interval);
		this.#runningJobs.add(interval, ...[...this.#jobs.get(interval)]
            .map(job => (job.cronTask = nodeCron.schedule(job.interval, job.caller), job)));

		return this.#runningJobs.get(interval);
	}

	startAll() {
		for (const interval of this.#jobs.keys())
			this.start(interval);

		return this;
	}

	getAllIntervals() { return [...this.#jobs.keys()]; }
	getRunningJobs(interval) {
		return [...this.#runningJobs.get(interval)];
	}

	getRunningIntervals() { return [...this.#runningJobs.keys()]; }
	getAllRunningJobs() {
		return [...this.#runningJobs.values()].map(set => [...set]).flat(1);
	}

	getStoppedJobs(interval) {
		return this.#stoppedJobs.get(interval);
	}

	getAllStoppedJobs() {
		return [...this.#stoppedJobs.values()].flat(1);
	}

	getStopIntervals() { return [...this.#stoppedJobs.keys()]; }
	stopAll() {
		this.getRunningIntervals().forEach(interval => this.stop(interval));

		return this;
	}

	stop(interval) {
		const jobs = this.getRunningJobs(interval).map(job => (job.cronTask.stop(), job));

		this.#stoppedJobs.add(interval, ...jobs);

		return this.#stoppedJobs.get(interval);
	}

	restart(interval) {
		const jobs = this.getStoppedJobs(interval);

		[...jobs].forEach(job => job.cronTask.start());
		this.#stoppedJobs.get(interval).clear();
		this.#runningJobs.get(interval).add(...jobs);

		return jobs;
	}

	restartAll() {
		const stopped = this.getAllStoppedJobs(),
			stoppedIntervals = [...this.#stoppedJobs.keys()];

		for (const interval of stoppedIntervals)
			this.restart(interval);

		return stopped;
	}
}

export { CronError, CronJob, CronJobManager, CronJobMap, CronSet, CronJobManager as default, validateInterval };
// # sourceMappingURL=index.js.map