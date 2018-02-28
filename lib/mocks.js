'use strict'
const fs = require('fs')
const path = require('path')
const notFound = {
  status: 404
}

module.exports = (_folder) => {
  let mocks = []
  let folder = _folder
  load(folder, mocks)

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
      return match || {response: () => notFound}
    },
    reset: (payload) => {
      mocks = payload
    },
    loadPreset: (preset) => {
      let setup = preset.setup
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
function load (location, target) {
  walk(location, target, 0)
}

function walk (location, target, depth) {
  let entries = [];
  try {
    entries = fs.readdirSync(location)
  } catch (e) {
    console.log(location)
    let mock = require(location)

    let url = '/' + location.split('/').slice(-depth, -1).join('/')
    let method = location.split('/').slice(-1)[0].split('.')[0].toUpperCase()

    let obj = {
      url,
      method,
      mock,
      callCount: 0,
      nextResponse: 0,
      response: (req) => {
        // figure out if we have an active scenario
        let scenario = (mock.scenarios || []).find((s) => s.title === obj.selectedScenario) || mock.scenarios[0]
        // no scenarios at all for this path, short circuit
        if (!scenario) {
          return notFound
        }

        let response = (scenario.responses || {})[obj.nextResponse] || (scenario.responses || {})[0]
        // reset counter if we looped all the responses

        obj.callCount++
        obj.nextResponse = obj.callCount % (scenario.responses || []).length

        // scenario might be a function instead of predefined responses
        if (scenario.parser) {
          return scenario.parser(req)
        }

        // scenario exists but we don't have any responses defined
        if (!response) {
          return notFound
        }

        // everything ok! increment counter and return response
        return response
      }
    }

    target.push(obj)
  }
  entries.forEach((entry) => {
    walk(path.resolve(location, entry), target, depth + 1)
  })
}
