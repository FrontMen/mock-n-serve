#!/usr/bin/env node

'use strict'
const path = require('path')
const server = require(path.normalize('../lib/server'))

const cwd = process.cwd()
let defaults = {
  mocksFolder: path.join(cwd, 'mocks'),
  presetsFolder: path.join(cwd, 'presets'),
  port: 9090,
  wsProtocol: 'ws',
  wsPort: 9091,
  wsHostName: 'localhost'
}
let config = {}
let args = process.argv.slice(2)

args.filter((item, index) => index % 2 === 0).forEach((arg, i) => {
  const flag = arg
  const value = args[i * 2 + 1]

  switch (flag) {
    case '-mf':
    case '--mocksfolder':
      config.mocksFolder = path.join(cwd, value)
      break

    case '-pf':
    case '--presetsfolder':
      config.presetsFolder = path.join(cwd, value)
      break

    case '-s':
    case '--scenario':
      config.scenario = value
      break

    case '-p':
    case '--port':
      config.port = value
      break
    case '--websocketprotocol':
      config.wsProtocol = value
      break
    case '--websocketpublicport':
      config.wsPublicPort = value
      break
    case '--websocketport':
      config.wsPort = value
      break
    case '-wshn':
    case '--websockethostname':
      config.wsHostName = value
      break
  }
})

server(Object.assign({}, defaults, config))
