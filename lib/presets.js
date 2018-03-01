'use strict'
const fs = require('fs')
const path = require('path')
const MANUAL = 'manual'

module.exports = (_folder) => {
  let presets = []
  let folder = _folder

  let service = {
    current: () => presets.find(preset => preset.selected),
    all: () => presets,
    get: (title) => presets.find((preset) => preset.title === title),
    select: (title) => {
      let selection = presets.find((preset) => preset.title === title)
      if (selection) {
        presets.forEach(preset => { preset.selected = false })
        selection.selected = true
      }
    },
    create: (title, mocks) => {
      presets.push({title})
      service.select(title)
      service.save(mocks)
    },
    save: (mocks = []) => {
      let setup = {}
      mocks.forEach((mock) => {
        if (mock.selectedScenario) {
          setup[mock.url] = {
            [mock.method]: mock.selectedScenario
          }
        }
      })
      let target = service.current()
      target.setup = setup
      if (target.title === MANUAL) {
        return
      }
      fs.writeFileSync(path.resolve(folder, target.title) + '.json', JSON.stringify(setup))
    }
  }

  try {
    load(folder, presets)
  } catch (e) {
    console.log(e)
  }
  // by default, manual selection
  service.create(MANUAL)
  service.select(MANUAL)

  return service
}

function load (location, target) {
  let entries = fs.readdirSync(location)
  entries.forEach((entry) => {
    target.push({
      title: entry.split('.').slice(0, -1).join(),
      setup: require(path.resolve(location, entry))
    })
  })
}
