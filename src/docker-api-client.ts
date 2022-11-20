import * as core from '@actions/core'
import axios from 'axios'
import * as fs from 'fs'

// Publish an OCI image to the GHCR using docker http v2 specification
export async function generate(): Promise<void> {
  try {
    const TOKEN: string = core.getInput('token')
    core.setSecret(TOKEN)
  } catch (error) {
      errorResponseHandling(error, semver)
  }
}
