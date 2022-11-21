import * as core from '@actions/core'
import axios from 'axios'
import * as fs from 'fs'
import * as github from '@actions/github'
import * as CryptoJS from 'crypto-js'

// Publish an OCI image to the GHCR using docker http v2 specification
export async function generate(): Promise<void> {
  try {
    const repository: string = process.env.GITHUB_REPOSITORY || ''
    if (repository === '') {
      core.setFailed('Could not find Repository!')
      return
    }

    var tag_name: string = core.getInput('tag_name') || ''
    if (github.context.eventName === 'release') {
      tag_name = github.context.payload.release.tag_name
    }

    const layers_count: number = parseInt(core.getInput('layers_count') || '0', 0)
    if (layers_count === 0) {
      core.setFailed('layers_count must be greater than 0!')
      return
    }

    const TOKEN: string = core.getInput('token')
    core.setSecret(TOKEN)
    const auth = Buffer.from(`:${TOKEN}`).toString('base64')
    core.setSecret(auth)

    // create the manifest
    var manifest = {
      schemaVersion: 2,
      mediaType: 'application/vnd.docker.distribution.manifest.v2+json',
      config: {
        mediaType: 'application/vnd.docker.container.image.v1+json',
        size: 0,
        digest: 'sha256:autocalculated'
      },
      layers: [],
      annotations: {
        'org.opencontainers.image.ref.name': tag_name
      }
    }

    const layers_manifest : any[] = []

    for (let i = 0; i < layers_count; i++) {
      const input_layer: string = core.getInput(`layer_${i}`) || ''
      const layer_media_type: string = core.getInput(`layer_${i}.media_type`) || ''
      const layer_blob_path: string = core.getInput(`layer_${i}.blob_path`) || ''
      const file_stream = fs.createReadStream(layer_blob_path)
      
      const response = await axios.post(
        `https://ghcr.io/v2/${repository}/blobs/uploads/`,
        {
          headers: {            
            'Content-Type': "application/octet-stream",
            'Content-Length': "0",
            'Authorization': 'Bearer ${auth}',        
          }
        }
      )
      
      if (response.status !== 202) {
        core.setFailed(`Could not upload layer ${i}!`)
        return
      }
      var location = response.headers['Location']
      if (location === undefined) {
        core.setFailed(`Could not find Location header!`)
        return
      }

      // size of the file
      const size = fs.statSync (layer_blob_path).size
      const chunk_size = 1024 * 1024 * 10 // 10MB
      const chunks = Math.ceil(size / chunk_size)
      for (let j = 0; j < chunks; j++) {
        const start = j * chunk_size
        const end = Math.min(size, start + chunk_size)
        const chunk = file_stream.read(end - start)
        const upload_chunk_size = end - start
        
        const response = await axios.patch(
          location, chunk,
          {
            headers: {            
              'Content-Type': 'application/octet-stream',
              'Content-Length': `${upload_chunk_size}`,              
              "Content-Range": `${start}-${end - 1}`,
            }
          }
        )

        if (response.status !== 202) {
          core.setFailed(`Could not upload layer ${i}!`)
          return
        }
      } // end for the chunks upload

      const fileBuffer = fs.readFileSync(layer_blob_path);
      const sha256 = CryptoJS.SHA256(CryptoJS.enc.Latin1.parse(fileBuffer.toString()));
      const digest = `sha256:${sha256.toString(CryptoJS.enc.Hex)}`

      // close the upload    
      const response_close = await axios.put( location, null,
      {
        headers: {
          'Content-Length': `0`,
          'Content-Type': 'application/octet-stream',
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept': '*/*',
        },
        params: {
          digest: `${digest}`
        }
      })

      const layer_manifest = {
        "mediaType": layer_media_type,
        "size": size,
        "digest": `${digest}`
      }
      layers_manifest.push(layer_manifest)
    } // end for the layers upload
          
    
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      handleAxiosError(error);
    } else {
      core.setFailed(error.message)
    }
  }
  
}

function handleAxiosError(error: any) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }
    console.log(error.config);
}
    
