import * as core from '@actions/core'
import axios from 'axios'
import * as fs from 'fs'

// Publish an OCI image to the GHCR using docker http v2 specification
export async function generate(): Promise<void> {
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
    
    const TOKEN: string = core.getInput('token')
    core.setSecret(TOKEN)
  } catch (error) {
      errorResponseHandling(error, semver)
  }
}
