interface ProgressInfo {
    /**
       * Count of completed steps
       * @TJS-type integer
       */
    completed: number;
    /**
     * Count of total steps
     * @TJS-type integer
     */
    total: number;
    weighting?: number;
}
declare class ProgressTracker {
    private tasks;
    progressHook: (totalProgress: ProgressInfo, change: string) => void;
    addTask(key: string, totalSteps: number, weighting?: number): void;
    finishTash(key: string): void;
    removeTask(key: any): void;
    increaseTotalStepsBy(key: string, additionalCount: number): void;
    increaseCompletedSteps(key: string): void;
    private get totalProgress();
}
export { ProgressTracker, ProgressInfo };
