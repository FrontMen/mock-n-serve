let socket

init().then(() => {
  socket.addEventListener('message', (_event) => {
    let event = JSON.parse(_event.data)
    switch (event.type) {
      case 'mocks:all':
        initMocks(event.payload)
        break
      case 'mock:update':
        updateMock(event.payload)
        break
      case 'presets:all':
        initPresets(event.payload)
        break
      default:
        console.log('unknown event', _event)
    }
  })
})

function init () {
  return new Promise((resolve, reject) => {
    fetch('/ws').then(response => response.json())
      .then((ws) => {
        socket = new WebSocket(`ws://localhost:${ws.port}`)
        socket.addEventListener('open', () => {
          resolve()
        })
      }).catch(reject)
  })
}

function mockChange (url, method, value) {
  socket.send(JSON.stringify({
    type: 'mock:select',
    payload: {
      endpoint: url,
      method: method,
      scenario: value
    }
  }))
}

function presetChange (title) {
  socket.send(JSON.stringify({
    type: 'preset:select',
    payload: {
      title
    }
  }))
}

function createPreset () {
  let title = document.querySelector('#new-preset').value
  socket.send(JSON.stringify({
    type: 'preset:create',
    payload: {
      title
    }
  }))
}

function savePreset () {
  socket.send(JSON.stringify({
    type: 'preset:save'
  }))
}

function initMocks (mocks) {
  document.querySelector('#mocks').innerHTML = ''
  _.each(mocks, (mock) => {
    mock.selectedScenario = mock.selectedScenario || ''
    mock.id = (mock.method + mock.url).replace(/\/|:/g, '-')
    let template = _.template(document.querySelector('#mock-template').innerHTML)(mock)
    document.querySelector('#mocks').innerHTML += template
  })
}

function initPresets (presets) {
  document.querySelector('#presets').innerHTML = ''
  let template = _.template(document.querySelector('#presets-template').innerHTML)({
    presets: presets
  })
  document.querySelector('#presets').innerHTML = template
}

function updateMock (mock) {
  mock.id = (mock.method + mock.url).replace(/\/|:/g, '-')
  let template = _.template(document.querySelector('#mock-template').innerHTML)(mock)
  document.querySelector(`#${mock.id}`).innerHTML = template
}
