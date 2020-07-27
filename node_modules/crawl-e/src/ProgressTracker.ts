import * as _ from 'underscore'

interface ProgressInfo {
  /**
     * Count of completed steps
     * @TJS-type integer
     */
  completed: number

  /**
   * Count of total steps
   * @TJS-type integer
   */
  total: number

  weighting?: number
}

class ProgressTracker {
  private tasks: { [key: string]: ProgressInfo } = {}

  // progress tracking
  progressHook: (totalProgress: ProgressInfo, change: string) => void = () => { }

  addTask(key: string, totalSteps: number, weighting: number = 1) {
    this.tasks[key] = {
      completed: 0,
      total: totalSteps,
      weighting: weighting
    }
    this.progressHook(this.totalProgress, `added ${key} with total of ${totalSteps}`)
  }

  finishTash(key: string) {
    let totalSteps = this.tasks[key].total
    this.tasks[key].completed = totalSteps
    this.progressHook(this.totalProgress, `finished ${key} with total of ${totalSteps}`)
  }

  removeTask(key) {
    if (!this.tasks[key]) { return }
    let totalSteps = this.tasks[key].total
    delete this.tasks[key]
    this.progressHook(this.totalProgress, `removed ${key} with total of ${totalSteps}`)
  }

  increaseTotalStepsBy(key: string, additionalCount: number) {
    if (!this.tasks[key]) { this.addTask(key, 0) }
    this.tasks[key].total += additionalCount
    this.progressHook(this.totalProgress, `increased total of ${key} by ${additionalCount}`)
  }

  increaseCompletedSteps(key: string) {
    this.tasks[key].completed++
    let updateMsg = this.tasks[key].completed === this.tasks[key].total
      ? `finished ${key} with total of ${this.tasks[key].total}`
      : `increased complete of ${key} by +1 to ${this.tasks[key].completed}/${this.tasks[key].total}`
    this.progressHook(this.totalProgress, updateMsg)
  }

  private get totalProgress(): ProgressInfo {
    return _.values(this.tasks).reduce((prev, curr) => ({
      completed: prev.completed + (curr.completed * curr.weighting),
      total: prev.total + (curr.total * curr.weighting)
    }),
      { completed: 0, total: 0 }
    )
  }

}

export { ProgressTracker, ProgressInfo } 