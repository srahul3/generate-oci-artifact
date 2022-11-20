import * as core from '@actions/core'
import {wait} from './wait'
import * as docker_api from './docker-api-client'

async function run(): Promise<void> {
  try {
    const repository: string = process.env.GITHUB_REPOSITORY || ''
    if (repository === '') {
      core.setFailed('Could not find Repository!')
      return
    }

    if (github.context.eventName === 'release') {
      const semver: string = github.context.payload.release.tag_name
    }

    const layers: string = core.getInput('layers')
    const annotations: string = core.getInput('annotations')
    

    const response = await docker_api.generate()
    
    const ms: string = core.getInput('milliseconds')
    core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    core.debug(new Date().toTimeString())
    await wait(parseInt(ms, 10))
    core.debug(new Date().toTimeString())

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
