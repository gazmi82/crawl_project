import { RequestMaker, DefaultRequestMaker } from '../../src/RequestMaker'
import * as fs from 'fs'
import * as path from 'path'
import * as nock from 'nock'
import Config from '../../src/Config';

export class TestNockRequestMaker extends DefaultRequestMaker {
  private nockFile
  constructor (private fileBaseName: string) {
    super(new Config({}))
    this.startNockRecording()
  }

  saveNockFile () {
    if (!fs.existsSync(this.nockFile)) {
      let nockObjects = nock.recorder.play()
      fs.writeFileSync(this.nockFile, JSON.stringify(nockObjects, null, 2))
      console.info('Saved recorded request: ' + this.nockFile)
    }
  }

  private startNockRecording () {
    this.nockFile = path.join(path.resolve(), 'tests', 'data', this.fileBaseName + '.nock.json')
    if (fs.existsSync(this.nockFile)) {
      // console.info('Using cache requests from ', this.nockFile)
      nock.load(this.nockFile)
    } else {
      console.info('Start recording requests')
      nock.recorder.rec({
        dont_print: true,
        output_objects: true
      })
    }
  }
}
