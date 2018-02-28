let socket

init().then(() => {
  socket.addEventListener('message', (_event) => {
    let event = JSON.parse(_event.data)
    switch (event.type) {
      case 'mocks:all':
        updateMocks(event.payload)
        break
      case 'mock:update':
        updateMock(event.payload)
        break
      case 'presets:all':
        updatePresets(event.payload)
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

// UI EVENTS
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
  toggleCreateInterface()

  if (title === '_new') {
    return
  }

  socket.send(JSON.stringify({
    type: 'preset:select',
    payload: {
      title
    }
  }))
}

function createPreset () {
  toggleCreateInterface()
  let title = document.querySelector('#new-preset').value
  socket.send(JSON.stringify({
    type: 'preset:create',
    payload: {
      title
    }
  }))
}

function savePreset () {
  toggleCreateInterface()
  document.querySelector('#new-preset').classList.add('u-hidden')
  socket.send(JSON.stringify({
    type: 'preset:save'
  }))
}

// SOCKET EVENT HANDLERS
function updateMocks (mocks) {
  document.querySelector('#mocks').innerHTML = ''
  _.each(mocks, (mock) => {
    mock.selectedScenario = mock.selectedScenario || ''
    mock.id = (mock.method + mock.url).replace(/\/|:/g, '-')
    let template = _.template(document.querySelector('#mock-template').innerHTML)(mock)
    document.querySelector('#mocks').innerHTML += template
  })
}

function updatePresets (presets) {
  document.querySelector('#presets').innerHTML = ''
  let template = _.template(document.querySelector('#presets-template').innerHTML)({
    presets: presets
  })
  document.querySelector('#presets').innerHTML = template
}

function updateMock (mock) {
  mock.selectedScenario = mock.selectedScenario || ''
  mock.id = (mock.method + mock.url).replace(/\/|:/g, '-')
  let template = _.template(document.querySelector('#mock-template').innerHTML)(mock)
  document.querySelector(`#${mock.id}`).innerHTML = template
}

function toggleCreateInterface () {
  let isCreating = document.querySelector('#preset-selection').value === '_new'
  if (isCreating) {
    document.querySelector('#create-preset').classList.remove('u-hidden')
    document.querySelector('#save-preset').classList.add('u-hidden')
    return
  }
  document.querySelector('#create-preset').classList.add('u-hidden')
  document.querySelector('#save-preset').classList.remove('u-hidden')

}
