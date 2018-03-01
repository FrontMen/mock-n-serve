module.exports = {
  scenarios: [{
    title: 'default',
    responses: [{
      status: 200,
      data: {
        greeting: 'hello world'
      }
    },{
      status: 200,
      data: {
        greeting: 'hello world'
      }
    }]
  },
  {
    title: 'yolo',
    responses: [{
      status: 200,
      data: {
        yolo: 'true dat'
      }
    }]
  }]
}
