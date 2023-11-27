import * as core from '@actions/core'
import * as github from '@actions/github'
import * as CryptoJS from 'crypto-js'
import { generate } from './docker-api-client'

jest.mock('@actions/core')
jest.mock('@actions/github')
jest.mock('crypto-js')

describe('generate', () => {
  it('should fail if repository is not found', async () => {
    process.env.GITHUB_REPOSITORY = ''
    await generate()
    expect(core.setFailed).toHaveBeenCalledWith('Could not find Repository!')
  })

  it('should fail if layers_count is not greater than 0', async () => {
    process.env.GITHUB_REPOSITORY = 'test/repo'
    core.getInput.mockReturnValueOnce('0')
    await generate()
    expect(core.setFailed).toHaveBeenCalledWith('layers_count must be greater than 0!')
  })

  // Add more tests here for other conditions and paths in your function
})