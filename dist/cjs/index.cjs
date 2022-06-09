var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/node-cron/src/task.js
var require_task = __commonJS({
  "node_modules/node-cron/src/task.js"(exports, module2) {
    "use strict";
    var EventEmitter = require("events");
    var Task = class extends EventEmitter {
      constructor(execution) {
        super();
        if (typeof execution !== "function") {
          throw "execution must be a function";
        }
        this._execution = execution;
      }
      execute(now) {
        let exec;
        try {
          exec = this._execution(now);
        } catch (error) {
          return this.emit("task-failed", error);
        }
        if (exec instanceof Promise) {
          return exec.then(() => this.emit("task-finished")).catch((error) => this.emit("task-failed", error));
        } else {
          this.emit("task-finished");
          return exec;
        }
      }
    };
    module2.exports = Task;
  }
});

// node_modules/node-cron/src/convert-expression/month-names-conversion.js
var require_month_names_conversion = __commonJS({
  "node_modules/node-cron/src/convert-expression/month-names-conversion.js"(exports, module2) {
    "use strict";
    module2.exports = (() => {
      const months = [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december"
      ];
      const shortMonths = [
        "jan",
        "feb",
        "mar",
        "apr",
        "may",
        "jun",
        "jul",
        "aug",
        "sep",
        "oct",
        "nov",
        "dec"
      ];
      function convertMonthName(expression, items) {
        for (let i = 0; i < items.length; i++) {
          expression = expression.replace(new RegExp(items[i], "gi"), parseInt(i, 10) + 1);
        }
        return expression;
      }
      function interprete(monthExpression) {
        monthExpression = convertMonthName(monthExpression, months);
        monthExpression = convertMonthName(monthExpression, shortMonths);
        return monthExpression;
      }
      return interprete;
    })();
  }
});

// node_modules/node-cron/src/convert-expression/week-day-names-conversion.js
var require_week_day_names_conversion = __commonJS({
  "node_modules/node-cron/src/convert-expression/week-day-names-conversion.js"(exports, module2) {
    "use strict";
    module2.exports = (() => {
      const weekDays = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"
      ];
      const shortWeekDays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
      function convertWeekDayName(expression, items) {
        for (let i = 0; i < items.length; i++) {
          expression = expression.replace(new RegExp(items[i], "gi"), parseInt(i, 10));
        }
        return expression;
      }
      function convertWeekDays(expression) {
        expression = expression.replace("7", "0");
        expression = convertWeekDayName(expression, weekDays);
        return convertWeekDayName(expression, shortWeekDays);
      }
      return convertWeekDays;
    })();
  }
});

// node_modules/node-cron/src/convert-expression/asterisk-to-range-conversion.js
var require_asterisk_to_range_conversion = __commonJS({
  "node_modules/node-cron/src/convert-expression/asterisk-to-range-conversion.js"(exports, module2) {
    "use strict";
    module2.exports = (() => {
      function convertAsterisk(expression, replecement) {
        if (expression.indexOf("*") !== -1) {
          return expression.replace("*", replecement);
        }
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
    })();
  }
});

// node_modules/node-cron/src/convert-expression/range-conversion.js
var require_range_conversion = __commonJS({
  "node_modules/node-cron/src/convert-expression/range-conversion.js"(exports, module2) {
    "use strict";
    module2.exports = (() => {
      function replaceWithRange(expression, text, init, end) {
        const numbers = [];
        let last = parseInt(end);
        let first = parseInt(init);
        if (first > last) {
          last = parseInt(init);
          first = parseInt(end);
        }
        for (let i = first; i <= last; i++) {
          numbers.push(i);
        }
        return expression.replace(new RegExp(text, "i"), numbers.join());
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
        for (let i = 0; i < expressions.length; i++) {
          expressions[i] = convertRange(expressions[i]);
        }
        return expressions;
      }
      return convertAllRanges;
    })();
  }
});

// node_modules/node-cron/src/convert-expression/step-values-conversion.js
var require_step_values_conversion = __commonJS({
  "node_modules/node-cron/src/convert-expression/step-values-conversion.js"(exports, module2) {
    "use strict";
    module2.exports = (() => {
      function convertSteps(expressions) {
        var stepValuePattern = /^(.+)\/(\w+)$/;
        for (var i = 0; i < expressions.length; i++) {
          var match = stepValuePattern.exec(expressions[i]);
          var isStepValue = match !== null && match.length > 0;
          if (isStepValue) {
            var baseDivider = match[2];
            if (isNaN(baseDivider)) {
              throw baseDivider + " is not a valid step value";
            }
            var values = match[1].split(",");
            var stepValues = [];
            var divider = parseInt(baseDivider, 10);
            for (var j = 0; j <= values.length; j++) {
              var value = parseInt(values[j], 10);
              if (value % divider === 0) {
                stepValues.push(value);
              }
            }
            expressions[i] = stepValues.join(",");
          }
        }
        return expressions;
      }
      return convertSteps;
    })();
  }
});

// node_modules/node-cron/src/convert-expression/index.js
var require_convert_expression = __commonJS({
  "node_modules/node-cron/src/convert-expression/index.js"(exports, module2) {
    "use strict";
    var monthNamesConversion = require_month_names_conversion();
    var weekDayNamesConversion = require_week_day_names_conversion();
    var convertAsterisksToRanges = require_asterisk_to_range_conversion();
    var convertRanges = require_range_conversion();
    var convertSteps = require_step_values_conversion();
    module2.exports = (() => {
      function appendSeccondExpression(expressions) {
        if (expressions.length === 5) {
          return ["0"].concat(expressions);
        }
        return expressions;
      }
      function removeSpaces(str) {
        return str.replace(/\s{2,}/g, " ").trim();
      }
      function normalizeIntegers(expressions) {
        for (let i = 0; i < expressions.length; i++) {
          const numbers = expressions[i].split(",");
          for (let j = 0; j < numbers.length; j++) {
            numbers[j] = parseInt(numbers[j]);
          }
          expressions[i] = numbers;
        }
        return expressions;
      }
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
    })();
  }
});

// node_modules/node-cron/src/pattern-validation.js
var require_pattern_validation = __commonJS({
  "node_modules/node-cron/src/pattern-validation.js"(exports, module2) {
    "use strict";
    var convertExpression = require_convert_expression();
    var validationRegex = /^(?:\d+|\*|\*\/\d+)$/;
    function isValidExpression(expression, min, max) {
      const options = expression.split(",");
      for (const option of options) {
        const optionAsInt = parseInt(option, 10);
        if (!Number.isNaN(optionAsInt) && (optionAsInt < min || optionAsInt > max) || !validationRegex.test(option))
          return false;
      }
      return true;
    }
    function isInvalidSecond(expression) {
      return !isValidExpression(expression, 0, 59);
    }
    function isInvalidMinute(expression) {
      return !isValidExpression(expression, 0, 59);
    }
    function isInvalidHour(expression) {
      return !isValidExpression(expression, 0, 23);
    }
    function isInvalidDayOfMonth(expression) {
      return !isValidExpression(expression, 1, 31);
    }
    function isInvalidMonth(expression) {
      return !isValidExpression(expression, 1, 12);
    }
    function isInvalidWeekDay(expression) {
      return !isValidExpression(expression, 0, 7);
    }
    function validateFields(patterns, executablePatterns) {
      if (isInvalidSecond(executablePatterns[0]))
        throw new Error(`${patterns[0]} is a invalid expression for second`);
      if (isInvalidMinute(executablePatterns[1]))
        throw new Error(`${patterns[1]} is a invalid expression for minute`);
      if (isInvalidHour(executablePatterns[2]))
        throw new Error(`${patterns[2]} is a invalid expression for hour`);
      if (isInvalidDayOfMonth(executablePatterns[3]))
        throw new Error(`${patterns[3]} is a invalid expression for day of month`);
      if (isInvalidMonth(executablePatterns[4]))
        throw new Error(`${patterns[4]} is a invalid expression for month`);
      if (isInvalidWeekDay(executablePatterns[5]))
        throw new Error(`${patterns[5]} is a invalid expression for week day`);
    }
    function validate(pattern) {
      if (typeof pattern !== "string")
        throw new TypeError("pattern must be a string!");
      const patterns = pattern.split(" ");
      const executablePatterns = convertExpression(pattern).split(" ");
      if (patterns.length === 5)
        patterns.unshift("0");
      validateFields(patterns, executablePatterns);
    }
    module2.exports = validate;
  }
});

// node_modules/node-cron/src/time-matcher.js
var require_time_matcher = __commonJS({
  "node_modules/node-cron/src/time-matcher.js"(exports, module2) {
    var validatePattern = require_pattern_validation();
    var convertExpression = require_convert_expression();
    function matchPattern(pattern, value) {
      if (pattern.indexOf(",") !== -1) {
        const patterns = pattern.split(",");
        return patterns.indexOf(value.toString()) !== -1;
      }
      return pattern === value.toString();
    }
    var TimeMatcher = class {
      constructor(pattern, timezone) {
        validatePattern(pattern);
        this.pattern = convertExpression(pattern);
        this.timezone = timezone;
        this.expressions = this.pattern.split(" ");
      }
      match(date) {
        date = this.apply(date);
        const runOnSecond = matchPattern(this.expressions[0], date.getSeconds());
        const runOnMinute = matchPattern(this.expressions[1], date.getMinutes());
        const runOnHour = matchPattern(this.expressions[2], date.getHours());
        const runOnDay = matchPattern(this.expressions[3], date.getDate());
        const runOnMonth = matchPattern(this.expressions[4], date.getMonth() + 1);
        const runOnWeekDay = matchPattern(this.expressions[5], date.getDay());
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
            timeZone: this.timezone
          });
          return new Date(dtf.format(date));
        }
        return date;
      }
    };
    module2.exports = TimeMatcher;
  }
});

// node_modules/node-cron/src/scheduler.js
var require_scheduler = __commonJS({
  "node_modules/node-cron/src/scheduler.js"(exports, module2) {
    "use strict";
    var EventEmitter = require("events");
    var TimeMatcher = require_time_matcher();
    var Scheduler = class extends EventEmitter {
      constructor(pattern, timezone, autorecover) {
        super();
        this.timeMatcher = new TimeMatcher(pattern, timezone);
        this.autorecover = autorecover;
      }
      start() {
        this.stop();
        let lastCheck = process.hrtime();
        let lastExecution = this.timeMatcher.apply(new Date());
        const matchTime = () => {
          const delay = 1e3;
          const elapsedTime = process.hrtime(lastCheck);
          const elapsedMs = (elapsedTime[0] * 1e9 + elapsedTime[1]) / 1e6;
          const missedExecutions = Math.floor(elapsedMs / 1e3);
          for (let i = missedExecutions; i >= 0; i--) {
            const date = new Date(new Date().getTime() - i * 1e3);
            let date_tmp = this.timeMatcher.apply(date);
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
        if (this.timeout) {
          clearTimeout(this.timeout);
        }
        this.timeout = null;
      }
    };
    module2.exports = Scheduler;
  }
});

// ../../node_modules/uuid/lib/rng.js
var require_rng = __commonJS({
  "../../node_modules/uuid/lib/rng.js"(exports, module2) {
    var crypto = require("crypto");
    module2.exports = function nodeRNG() {
      return crypto.randomBytes(16);
    };
  }
});

// ../../node_modules/uuid/lib/bytesToUuid.js
var require_bytesToUuid = __commonJS({
  "../../node_modules/uuid/lib/bytesToUuid.js"(exports, module2) {
    var byteToHex = [];
    for (i = 0; i < 256; ++i) {
      byteToHex[i] = (i + 256).toString(16).substr(1);
    }
    var i;
    function bytesToUuid(buf, offset) {
      var i2 = offset || 0;
      var bth = byteToHex;
      return [
        bth[buf[i2++]],
        bth[buf[i2++]],
        bth[buf[i2++]],
        bth[buf[i2++]],
        "-",
        bth[buf[i2++]],
        bth[buf[i2++]],
        "-",
        bth[buf[i2++]],
        bth[buf[i2++]],
        "-",
        bth[buf[i2++]],
        bth[buf[i2++]],
        "-",
        bth[buf[i2++]],
        bth[buf[i2++]],
        bth[buf[i2++]],
        bth[buf[i2++]],
        bth[buf[i2++]],
        bth[buf[i2++]]
      ].join("");
    }
    module2.exports = bytesToUuid;
  }
});

// ../../node_modules/uuid/v1.js
var require_v1 = __commonJS({
  "../../node_modules/uuid/v1.js"(exports, module2) {
    var rng = require_rng();
    var bytesToUuid = require_bytesToUuid();
    var _nodeId;
    var _clockseq;
    var _lastMSecs = 0;
    var _lastNSecs = 0;
    function v1(options, buf, offset) {
      var i = buf && offset || 0;
      var b = buf || [];
      options = options || {};
      var node = options.node || _nodeId;
      var clockseq = options.clockseq !== void 0 ? options.clockseq : _clockseq;
      if (node == null || clockseq == null) {
        var seedBytes = rng();
        if (node == null) {
          node = _nodeId = [
            seedBytes[0] | 1,
            seedBytes[1],
            seedBytes[2],
            seedBytes[3],
            seedBytes[4],
            seedBytes[5]
          ];
        }
        if (clockseq == null) {
          clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 16383;
        }
      }
      var msecs = options.msecs !== void 0 ? options.msecs : new Date().getTime();
      var nsecs = options.nsecs !== void 0 ? options.nsecs : _lastNSecs + 1;
      var dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 1e4;
      if (dt < 0 && options.clockseq === void 0) {
        clockseq = clockseq + 1 & 16383;
      }
      if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === void 0) {
        nsecs = 0;
      }
      if (nsecs >= 1e4) {
        throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
      }
      _lastMSecs = msecs;
      _lastNSecs = nsecs;
      _clockseq = clockseq;
      msecs += 122192928e5;
      var tl = ((msecs & 268435455) * 1e4 + nsecs) % 4294967296;
      b[i++] = tl >>> 24 & 255;
      b[i++] = tl >>> 16 & 255;
      b[i++] = tl >>> 8 & 255;
      b[i++] = tl & 255;
      var tmh = msecs / 4294967296 * 1e4 & 268435455;
      b[i++] = tmh >>> 8 & 255;
      b[i++] = tmh & 255;
      b[i++] = tmh >>> 24 & 15 | 16;
      b[i++] = tmh >>> 16 & 255;
      b[i++] = clockseq >>> 8 | 128;
      b[i++] = clockseq & 255;
      for (var n = 0; n < 6; ++n) {
        b[i + n] = node[n];
      }
      return buf ? buf : bytesToUuid(b);
    }
    module2.exports = v1;
  }
});

// ../../node_modules/uuid/v4.js
var require_v4 = __commonJS({
  "../../node_modules/uuid/v4.js"(exports, module2) {
    var rng = require_rng();
    var bytesToUuid = require_bytesToUuid();
    function v4(options, buf, offset) {
      var i = buf && offset || 0;
      if (typeof options == "string") {
        buf = options === "binary" ? new Array(16) : null;
        options = null;
      }
      options = options || {};
      var rnds = options.random || (options.rng || rng)();
      rnds[6] = rnds[6] & 15 | 64;
      rnds[8] = rnds[8] & 63 | 128;
      if (buf) {
        for (var ii = 0; ii < 16; ++ii) {
          buf[i + ii] = rnds[ii];
        }
      }
      return buf || bytesToUuid(rnds);
    }
    module2.exports = v4;
  }
});

// ../../node_modules/uuid/index.js
var require_uuid = __commonJS({
  "../../node_modules/uuid/index.js"(exports, module2) {
    var v1 = require_v1();
    var v4 = require_v4();
    var uuid = v4;
    uuid.v1 = v1;
    uuid.v4 = v4;
    module2.exports = uuid;
  }
});

// node_modules/node-cron/src/scheduled-task.js
var require_scheduled_task = __commonJS({
  "node_modules/node-cron/src/scheduled-task.js"(exports, module2) {
    "use strict";
    var EventEmitter = require("events");
    var Task = require_task();
    var Scheduler = require_scheduler();
    var uuid = require_uuid();
    var ScheduledTask2 = class extends EventEmitter {
      constructor(cronExpression, func, options) {
        super();
        if (!options) {
          options = {
            scheduled: true,
            recoverMissedExecutions: false
          };
        }
        this.options = options;
        this.options.name = this.options.name || uuid.v4();
        this._task = new Task(func);
        this._scheduler = new Scheduler(cronExpression, options.timezone, options.recoverMissedExecutions);
        this._scheduler.on("scheduled-time-matched", (now) => {
          this.now(now);
        });
        if (options.scheduled !== false) {
          this._scheduler.start();
        }
        if (options.runOnInit === true) {
          this.now("init");
        }
      }
      now(now = "manual") {
        let result = this._task.execute(now);
        this.emit("task-done", result);
      }
      start() {
        this._scheduler.start();
      }
      stop() {
        this._scheduler.stop();
      }
    };
    module2.exports = ScheduledTask2;
  }
});

// node_modules/node-cron/src/background-scheduled-task/index.js
var require_background_scheduled_task = __commonJS({
  "node_modules/node-cron/src/background-scheduled-task/index.js"(exports, module2) {
    var EventEmitter = require("events");
    var path = require("path");
    var { fork } = require("child_process");
    var uuid = require_uuid();
    var daemonPath = `${__dirname}/daemon.js`;
    var BackgroundScheduledTask = class extends EventEmitter {
      constructor(cronExpression, taskPath, options) {
        super();
        if (!options) {
          options = {
            scheduled: true,
            recoverMissedExecutions: false
          };
        }
        this.cronExpression = cronExpression;
        this.taskPath = taskPath;
        this.options = options;
        this.options.name = this.options.name || uuid.v4();
        if (options.scheduled) {
          this.start();
        }
      }
      start() {
        this.stop();
        this.forkProcess = fork(daemonPath);
        this.forkProcess.on("message", (message) => {
          switch (message.type) {
            case "task-done":
              this.emit("task-done", message.result);
              break;
          }
        });
        let options = this.options;
        options.scheduled = true;
        this.forkProcess.send({
          type: "register",
          path: path.resolve(this.taskPath),
          cron: this.cronExpression,
          options
        });
      }
      stop() {
        if (this.forkProcess) {
          this.forkProcess.kill();
        }
      }
      pid() {
        if (this.forkProcess) {
          return this.forkProcess.pid;
        }
      }
      isRunning() {
        return !this.forkProcess.killed;
      }
    };
    module2.exports = BackgroundScheduledTask;
  }
});

// node_modules/node-cron/src/storage.js
var require_storage = __commonJS({
  "node_modules/node-cron/src/storage.js"(exports, module2) {
    module2.exports = (() => {
      if (!global.scheduledTasks) {
        global.scheduledTasks = /* @__PURE__ */ new Map();
      }
      return {
        save: (task) => {
          if (!task.options) {
            const uuid = require_uuid();
            task.options = {};
            task.options.name = uuid.v4();
          }
          global.scheduledTasks.set(task.options.name, task);
        },
        getTasks: () => {
          return global.scheduledTasks;
        }
      };
    })();
  }
});

// node_modules/node-cron/src/node-cron.js
var require_node_cron = __commonJS({
  "node_modules/node-cron/src/node-cron.js"(exports, module2) {
    "use strict";
    var ScheduledTask2 = require_scheduled_task();
    var BackgroundScheduledTask = require_background_scheduled_task();
    var validation = require_pattern_validation();
    var storage = require_storage();
    function schedule(expression, func, options) {
      const task = createTask(expression, func, options);
      storage.save(task);
      return task;
    }
    function createTask(expression, func, options) {
      if (typeof func === "string")
        return new BackgroundScheduledTask(expression, func, options);
      return new ScheduledTask2(expression, func, options);
    }
    function validate(expression) {
      try {
        validation(expression);
        return true;
      } catch (_) {
        return false;
      }
    }
    function getTasks() {
      return storage.getTasks();
    }
    module2.exports = { schedule, validate, getTasks };
  }
});

// src/index.ts
var src_exports = {};
__export(src_exports, {
  CronError: () => CronError_default,
  CronJob: () => CronJob,
  CronJobManager: () => CronJobManager,
  CronJobMap: () => CronJobMap,
  CronSet: () => CronSet,
  default: () => CronJobManager,
  validateInterval: () => validateInterval
});
module.exports = __toCommonJS(src_exports);

// src/CronJobManager.ts
var import_node_cron = __toESM(require_node_cron(), 1);

// node_modules/@thundercraft5/node-errors/dist/index.js
function formatWordList(list, and = false) {
  const last = list.pop(), lastWord = and ? "and" : "or";
  if (list.length > 1) {
    const commaSeparated = list.map((s, i) => `${i % 5 == 0 && i ? "\n" : ""}"${s}"`);
    return `${commaSeparated.join(", ")}, ${lastWord} "${last}"`;
  } else
    return `${list.length == 1 ? `"${list[0]}" ${lastWord} ` : ""}"${last}"`;
}
function formatErrorMessage(messages2, code, ...formats) {
  if (!(code in messages2))
    throw new ReferenceError("INVALID_MESSAGE_CODE", code, formatWordList(Object.keys(messages2)));
  const message = typeof messages2[code] === "function" ? messages2[code](...formats) : messages2[code];
  if (typeof messages2[code] === "function" && messages2[code].length > formats.length)
    throw new RangeError("MESSAGE_CODE_MISSING_FORMATS", code, messages2[code].length, formats.length);
  return message;
}
function makeCodedError(messages2, Base) {
  if ("$$<Symbol>codedError" in Base)
    throw new TypeError2("ERROR_CLASS_ALREADY_EXTENDED", Base);
  return class extends Base {
    static get ["$$<Symbol>codedErrorClass"]() {
      return true;
    }
    static [Symbol.hasInstance](instance) {
      let constructor = instance[Symbol.species] || instance.constructor;
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
      return `${this.getErrorName()}${this["$$<Symbol>code"] ? ` [${this["$$<Symbol>code"]}]` : ""}`;
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
      return names.find((name) => name != "CodedError");
    }
  };
}
var messages = {
  ERROR_CLASS_ALREADY_EXTENDED: (Class) => `Error class "${Class.name}" is already a coded error class.`,
  INVALID_MESSAGE_CODE: (code = "", validCodes = "") => `Error code "${code}" was not found in the provided messages registry.
List of valid codes: ${validCodes}`,
  MESSAGE_CODE_MISSING_FORMATS: (code = "", required = 0, received = 0) => `Message code "${code}" expects at least ${required} format arguments, got ${received} instead`,
  METHOD_NOT_IMPLEMENTED: (Class, name = "") => `Method ${Class.name}#${name}() is not implemented.`
};
var nativeMessages_default = messages;
function makeErrors(messages2, errors, includeNativeCodes = true) {
  if (includeNativeCodes)
    messages2 = { ...messages2, ...nativeMessages_default };
  const ret = {};
  const entries = Object.entries(errors);
  for (const [k, error] of entries) {
    ret[k] = makeCodedError(messages2, error);
  }
  return ret;
}
var {
  TypeError: TypeError2,
  RangeError,
  ReferenceError,
  Error: Error2
} = makeErrors(nativeMessages_default, {
  TypeError: globalThis.TypeError,
  RangeError: globalThis.RangeError,
  ReferenceError: globalThis.ReferenceError,
  Error: globalThis.Error
});
var SymbolCodedErrorClass = Symbol("codedErrorClass");
var SymbolCodedError = Symbol("codedError");
var SymbolCode = Symbol("code");
var SymbolRawMessage = Symbol("rawMessage");

// src/CronError.ts
var { Error: CronError } = makeErrors({
  INVALID_CRON_JOB_INTERVAL: (interval = "") => `An invalid cron job interval was provided ("${interval}").`,
  INVALID_CRON_JOB_CLASS: (Class) => `An invalid cron job class was provided (${Class.name}). All cron job classes must extend \`CronJob\`.`,
  INVALID_CRON_SET_INTERVAL: (setInterval = "", interval = "") => `An invalid cron set interval was provided ("${interval}"). All jobs added to this set must be of interval "${setInterval}".`,
  INTERVAL_ALREADY_RUNNING: (interval = "") => `Cron job with interval "${interval}" is already running.`,
  INTERVAL_ALREADY_STOPPED: (interval = "") => `Cron job with interval "${interval}" is already stopped.`
}, {
  Error: class CronError2 extends Error {
  }
});
var CronError_default = CronError;

// src/validateInterval.ts
var cronJobRegex = /^((((\d+,)+\d+|(\d+(\/|-|#)\d+)|\d+L?|\*(\/\d+)?|L(-\d+)?|\?|[A-Z]{3}(-[A-Z]{3})?) ?){5,7})$|(@(annually|yearly|monthly|weekly|daily|hourly|reboot))|(@every (\d+(ns|us|µs|ms|s|m|h))+)/u;
function validateInterval(interval) {
  if (typeof interval !== "string" || !cronJobRegex.test(interval))
    throw new CronError_default("INVALID_CRON_JOB_INTERVAL", interval);
  return interval;
}

// src/CronJob.ts
var CronJob = class {
  cronTask;
  interval;
  caller;
  manager;
  constructor(interval, func) {
    if (!interval || !cronJobRegex.test(interval))
      throw new CronError_default("INVALID_CRON_JOB_INTERVAL", interval);
    if (func)
      this.run = func;
    this.interval = interval;
    this.caller = (date) => {
      try {
        this.run.call(this.manager, date);
      } catch (e) {
        console.warn(`Cron job with interval "${interval}" failed with exception: ${e.stack || e}`);
      }
    };
  }
  init(manager) {
    this.manager = manager;
    return this;
  }
  run(date) {
    throw new TypeError2("METHOD_NOT_IMPLEMENTED", this.constructor, "run");
  }
  stop(date) {
    this.cronTask.stop();
  }
  restart(date) {
    this.cronTask.start();
  }
};

// src/CronSet.ts
var CronSet = class extends Set {
  interval;
  constructor(interval) {
    super();
    this.interval = validateInterval(interval);
  }
  add(...jobs) {
    if (jobs.length > 1)
      jobs.forEach((job) => this.#add(job));
    else
      this.#add(jobs[0]);
    return this;
  }
  delete(...jobs) {
    return jobs.length > 1 ? jobs.map((job) => this.#delete(job)).every(Boolean) : this.#delete(jobs[0]);
  }
  #add(job) {
    if (job.interval != this.interval)
      throw new CronError_default("INVALID_CRON_SET_INTERVAL", this.interval, job.interval);
    super.add(job);
    return this;
  }
  #delete(job) {
    if (job.interval != this.interval)
      throw new CronError_default("INVALID_CRON_SET_INTERVAL", this.interval, job.interval);
    return super.delete(job);
  }
  [Symbol.iterator]() {
    return this.values();
  }
};

// src/CronJobMap.ts
var CronJobMap = class extends Map {
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
    jobs.forEach((job) => set.add(job));
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
};

// src/CronJobManager.ts
var CronJobManager = class {
  #jobs = new CronJobMap();
  #runningJobs = new CronJobMap();
  #stoppedJobs = new CronJobMap();
  get jobs() {
    return this.#jobs;
  }
  constructor(jobs = {}, jobClasses = []) {
    Object.entries(jobs).forEach(([interval, func]) => {
      validateInterval(interval);
      let cronFunc = func;
      if (!Array.isArray(func))
        cronFunc = [func];
      cronFunc.forEach((func2) => {
        this.#jobs.add(interval, new CronJob(interval, func2).init(this));
      });
    });
    jobClasses.forEach((Job) => {
      if (!(Job?.prototype instanceof CronJob))
        throw new CronError_default("INVALID_CRON_JOB_CLASS", Job);
      const job = new Job().init(this);
      this.#jobs.add(job.interval, job);
    });
  }
  start(interval) {
    if (this.#runningJobs.has(interval))
      throw new CronError_default("INTERVAL_ALREADY_RUNNING", interval);
    this.#runningJobs.add(interval, ...[...this.#jobs.get(interval)].map((job) => (job.cronTask = import_node_cron.default.schedule(job.interval, job.caller), job)));
    return this.#runningJobs.get(interval);
  }
  startAll() {
    for (const interval of this.#jobs.keys())
      this.start(interval);
    return this;
  }
  getAllIntervals() {
    return [...this.#jobs.keys()];
  }
  getRunningJobs(interval) {
    return [...this.#runningJobs.get(interval)];
  }
  getRunningIntervals() {
    return [...this.#runningJobs.keys()];
  }
  getAllRunningJobs() {
    return [...this.#runningJobs.values()].map((set) => [...set]).flat(1);
  }
  getStoppedJobs(interval) {
    return this.#stoppedJobs.get(interval);
  }
  getAllStoppedJobs() {
    return [...this.#stoppedJobs.values()].flat(1);
  }
  getStopIntervals() {
    return [...this.#stoppedJobs.keys()];
  }
  stopAll() {
    this.getRunningIntervals().forEach((interval) => this.stop(interval));
    return this;
  }
  stop(interval) {
    const jobs = this.getRunningJobs(interval).map((job) => (job.cronTask.stop(), job));
    this.#stoppedJobs.add(interval, ...jobs);
    return this.#stoppedJobs.get(interval);
  }
  restart(interval) {
    const jobs = this.getStoppedJobs(interval);
    [...jobs].forEach((job) => job.cronTask.start());
    this.#stoppedJobs.get(interval).clear();
    this.#runningJobs.get(interval).add(...jobs);
    return jobs;
  }
  restartAll() {
    const stopped = this.getAllStoppedJobs(), stoppedIntervals = [...this.#stoppedJobs.keys()];
    for (const interval of stoppedIntervals)
      this.restart(interval);
    return stopped;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CronError,
  CronJob,
  CronJobManager,
  CronJobMap,
  CronSet,
  validateInterval
});
//# sourceMappingURL=index.cjs.map
