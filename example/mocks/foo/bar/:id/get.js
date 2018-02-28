module.exports = {
  scenarios: [{
    title: 'default',
    responses: [{
      status: 200,
      data: {
        greeting: 'hello world, 0'
      }
    },
    {
      status: 200,
      data: {
        greeting: 'hello world, 1'
      }
    },
    {
      status: 200,
      data: {
        greeting: 'hello world, 2'
      }
    }]
  }, {
    title: 'server down',
    responses: [{
      status: 500
    }]
  }, {
    title: 'dynamic',
    parser: (req, res, next) => {
      console.log('PARSING')
      console.log(req.params)
      console.log(req.query)
      res.status(200).send({foo: 'bar'})
      return next()
    }
  }]
}
