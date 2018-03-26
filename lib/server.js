'use strict'
const express = require('express')
const ws = require('ws')
const fs = require('fs')
const path = require('path')
const cors = require('cors')
const html = fs.readFileSync(path.join(__dirname, './static/ui.html'), 'utf8')

const Mocks = require('./mocks.js')
const Presets = require('./presets.js')
let app = express()

module.exports = (config) => {
  let wsPort = config.wsPort
  let wsPublicPort = config.wsPublicPort
  let wsProtocol = config.wsProtocol
  let wsHostName = config.wsHostName

  app.use(cors())
  app.use(express.json())
  app.use(express.static(path.join(__dirname, 'static')))

  // HEALTHCHECK
  app.get('/health', (req, res) => {
    res.sendStatus(204)
  })

  // WEBSOCKET META INFORMATION
  app.get('/ws', (req, res) => {
    res.status(200).send({port: wsPublicPort, hostName: wsHostName, protocol: wsProtocol})
  })

  // UI
  app.get('/ui', (req, res) => {
    // getCurrentMocks
    res.status(200)
      .set('Content-Length', Buffer.byteLength(html))
      .set('Content-Type', 'text/html')
      .send(html)
  })

  app.post('/presets/select', (req, res) => {
    presets.select(req.body.title)
    mocks.loadPreset(presets.current())
    res.sendStatus(204)
  })

  let mocks = Mocks(config.mocksFolder, app, onMockCall)
  let presets = Presets(config.presetsFolder, mocks)

  // read preset, save it to mocks
  mocks.loadPreset(presets.current())

  let wss = new ws.Server({
    port: wsPort
  })

  function onMockCall (mock) {
    wss.clients.forEach((client) => {
      if (client.readyState === ws.OPEN) {
        client.send(JSON.stringify({
          type: 'mock:update', payload: mock
        }))
      }
    })
  }

  // start mock server
  app.listen(config.port)

  wss.on('connection', (ws) => {
    ws.on('message', (_message) => {
      // incoming event from ui
      let message = JSON.parse(_message)
      switch (message.type) {
        case 'mock:select':
          let mock = mocks.get(message.payload.endpoint, message.payload.method)
          mock.selectedScenario = message.payload.scenario
          mock.callCount = 0
          mock.nextResponse = 0
          break
        case 'preset:select':
          presets.select(message.payload.title)
          mocks.loadPreset(presets.current())
          ws.send(JSON.stringify({type: 'mocks:all', payload: mocks.all()}))
          break
        case 'preset:create':
          presets.create(message.payload.title, mocks.all())
          presets.select(message.payload.title)
          ws.send(JSON.stringify({type: 'presets:all', payload: presets.all()}))
          break
        case 'preset:save':
          // grasp current configuration, save it to preset
          presets.save(mocks.all())
          break
        case 'preset:change':
          // dump current config, load preset config
          presets.set(message.payload.title, message.payload.config)
          break
        default:
          console.log('unknown message type', message)
      }
    })
    ws.on('error', () => console.log('maybe a disconnect?'))
    ws.send(JSON.stringify({type: 'mocks:all', payload: mocks.all()}))
    ws.send(JSON.stringify({type: 'presets:all', payload: presets.all()}))
  })
}
