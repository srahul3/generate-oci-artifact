import * as core from '@actions/core'
import {wait} from './wait'
import * as docker_api from './docker-api-client'
import * as github from '@actions/github'

export async function run(): Promise<void> {
  try {
    const response = await docker_api.generate()    
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
