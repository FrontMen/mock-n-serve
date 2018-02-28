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
  let wsPort = config.port + 1
  let mocks = Mocks(config.mocksFolder)
  let presets = Presets(config.presetsFolder)

  // read preset, save it to mocks
  mocks.loadPreset(presets.current())
  let wss = new ws.Server({
    port: wsPort
  })

  app.use(cors())
  app.use(express.json())
  app.use(express.static(path.join(__dirname, 'static')))

  // WEBSOCKET META INFORMATION
  app.get('/ws', (req, res) => {
    res.status(200).send({port: wsPort})
  })

  // UI
  app.get('/ui', (req, res) => {
    // getCurrentMocks
    res.status(200)
      .set('Content-Length', Buffer.byteLength(html))
      .set('Content-Type', 'text/html')
      .send(html)
  })

  app.use((req, res) => {
    // if no url match, we assume a call to a mock
    let mock = mocks.get(req.path, req.method)
    let response = mock.response(req)
    res.status(response.status).send(response.data).end()

    // inform ui about mock call
    wss.clients.forEach((client) => {
      if (client.readyState === ws.OPEN) {
        client.send(JSON.stringify({
          type: 'mock:update', payload: mock
        }))
      }
    })
  })

  // start mock server
  app.listen(config.port)

  wss.on('connection', (ws) => {
    ws.on('message', (_message) => {
      // incoming event from ui
      let message = JSON.parse(_message)
      switch (message.type) {
        case 'mock:select':
          mocks.get(message.payload.endpoint, message.payload.method).selectedScenario = message.payload.scenario
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