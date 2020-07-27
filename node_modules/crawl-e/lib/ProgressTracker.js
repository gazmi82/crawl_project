"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressTracker = void 0;
var _ = require("underscore");
var ProgressTracker = /** @class */ (function () {
    function ProgressTracker() {
        this.tasks = {};
        // progress tracking
        this.progressHook = function () { };
    }
    ProgressTracker.prototype.addTask = function (key, totalSteps, weighting) {
        if (weighting === void 0) { weighting = 1; }
        this.tasks[key] = {
            completed: 0,
            total: totalSteps,
            weighting: weighting
        };
        this.progressHook(this.totalProgress, "added " + key + " with total of " + totalSteps);
    };
    ProgressTracker.prototype.finishTash = function (key) {
        var totalSteps = this.tasks[key].total;
        this.tasks[key].completed = totalSteps;
        this.progressHook(this.totalProgress, "finished " + key + " with total of " + totalSteps);
    };
    ProgressTracker.prototype.removeTask = function (key) {
        if (!this.tasks[key]) {
            return;
        }
        var totalSteps = this.tasks[key].total;
        delete this.tasks[key];
        this.progressHook(this.totalProgress, "removed " + key + " with total of " + totalSteps);
    };
    ProgressTracker.prototype.increaseTotalStepsBy = function (key, additionalCount) {
        if (!this.tasks[key]) {
            this.addTask(key, 0);
        }
        this.tasks[key].total += additionalCount;
        this.progressHook(this.totalProgress, "increased total of " + key + " by " + additionalCount);
    };
    ProgressTracker.prototype.increaseCompletedSteps = function (key) {
        this.tasks[key].completed++;
        var updateMsg = this.tasks[key].completed === this.tasks[key].total
            ? "finished " + key + " with total of " + this.tasks[key].total
            : "increased complete of " + key + " by +1 to " + this.tasks[key].completed + "/" + this.tasks[key].total;
        this.progressHook(this.totalProgress, updateMsg);
    };
    Object.defineProperty(ProgressTracker.prototype, "totalProgress", {
        get: function () {
            return _.values(this.tasks).reduce(function (prev, curr) { return ({
                completed: prev.completed + (curr.completed * curr.weighting),
                total: prev.total + (curr.total * curr.weighting)
            }); }, { completed: 0, total: 0 });
        },
        enumerable: false,
        configurable: true
    });
    return ProgressTracker;
}());
exports.ProgressTracker = ProgressTracker;
