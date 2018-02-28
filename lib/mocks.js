'use strict'
const fs = require('fs')
const path = require('path')
const notFound = {
  status: 404
}

module.exports = (_folder, _app, _onMockCall) => {
  let mocks = []
  let app = _app
  let folder = _folder
  let onMockCall = _onMockCall
  load(folder, mocks, app, onMockCall)

  let service = {
    all: () => {
      return mocks
    },
    get: (url, method) => {
      let match = mocks.find((mock) => {
        let urlParts = url.split('/')
        let mockParts = mock.url.split('/')

        if (urlParts.length !== mockParts.length) {
          return false
        }

        return urlParts.every((part, i) => part === mockParts[i] ||
          mockParts[i].charAt(0) === ':' ||
          mockParts[i].charAt(0) === '_')
      })
      return match
    },
    loadPreset: (preset) => {
      let setup = preset.setup
      mocks.forEach((mock) => {
        mock.callCount = 0
        mock.nextResponse = 0
      })
      for (let path in setup) {
        for (let method in setup[path]) {
          let mock = service.get(path, method)
          mock.selectedScenario = setup[path][method]
        }
      }
    }
  }
  return service
}

// maybe make this some utility?
function load (location, target, app, onMockCall) {
  walk(location, target, 0, app, onMockCall)
}

function walk (location, target, depth, app, onMockCall) {
  let entries = [];
  try {
    entries = fs.readdirSync(location)
  } catch (e) {
    console.log(location)
    let mock = require(location)

    let url = '/' + location.split('/').slice(-depth, -1).join('/').replace(/_/g, ':')
    let method = location.split('/').slice(-1)[0].split('.')[0]

    let obj = {
      url,
      method,
      mock,
      callCount: 0,
      nextResponse: 0
    }

    app[method](url, (req, res, next) => {
      // call something to inform server that a mock has been called
      let scenario = (obj.mock.scenarios || []).find((s) => s.title === obj.selectedScenario) || obj.mock.scenarios[0]
      if (!scenario) {
        res.sendStatus(404)
        return next()
      }

      let response = (scenario.responses || {})[obj.nextResponse] || (scenario.responses || {})[0]
      obj.callCount++
      obj.nextResponse = obj.callCount % (scenario.responses || []).length

      if (scenario.parser) {
        onMockCall(obj)
        return scenario.parser(req, res, next)
      }

      if (!response) {
        res.sendStatus(404)
        return next()
      }

      onMockCall(obj)
      res.status(response.status).send(response.data)
      return next()
    })

    target.push(obj)
  }
  entries.forEach((entry) => {
    walk(path.resolve(location, entry), target, depth + 1, app, onMockCall)
  })
}
