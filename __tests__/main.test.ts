import {run} from '../src/main'
import * as core from '@actions/core'
import * as github from '@actions/github'

describe ('test context', () => {

  // Inputs for mock @actions/core
  let inputs = {} as any  

  beforeAll(() => {
    console.log('*****beforeAll****')
    // Mock getInput
    jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
      console.log(`getInput: ${name} = ${inputs[name]}`)
      return inputs[name]
    })

    jest.spyOn(core, 'setFailed').mockImplementation(param => {
      return param
    })

    // Mock error/warning/info/debug
    jest.spyOn(core, 'error').mockImplementation(jest.fn())
    jest.spyOn(core, 'warning').mockImplementation(jest.fn())
    jest.spyOn(core, 'info').mockImplementation(jest.fn())
    jest.spyOn(core, 'debug').mockImplementation(jest.fn())
    // jest.spyOn(apiClient, 'publishOciArtifact').mockImplementation(jest.fn())
  })

  afterEach(() => {
    github.context.payload = {}
    github.context.eventName = ''
  })
  
  test('test', async () => {
    inputs.layers_count = '1'
    inputs.token = 'token' 
    inputs.layer_0 = { media_type: 'application/vnd.docker.image.rootfs.diff.tar.gzip', blob_path: './__tests__/test_res.tar.gz' }
    const response = await run()
  })
})
