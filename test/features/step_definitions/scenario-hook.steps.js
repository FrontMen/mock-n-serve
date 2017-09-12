var {defineSupportCode} = require('cucumber');

const fork = require('child_process').fork;
let colors = require('colors');

let server = {
        process: null,
        calls: 0
    },
    counters = {};

function createServer(args, callback){
    server.process = fork('test/server/index.js', args);
    server.process.on('message', function(data){
        if (data.ready){
            callback();
        }
    });
    server.process.on('exit', function(){
        server.process.removeAllListeners();
        server.calls = 0;
        server.exitCallback();
        server.process = null;
    })
}

function killServer(callback){
    server.exitCallback = callback;
    server.process.kill();
}


defineSupportCode(function({Before, After}) {

    Before(function (scenarioResult, callback) {
        let mockScenario = "";
        let mockTag = scenarioResult.scenario.tags.map(tag => tag.name).find(tag => tag.match(/mock/));
        if (mockTag){
            mockScenario = mockTag.slice(6);
        }

        let tagArguments = [`-s`, mockScenario];
        console.log(`[mockserver] ` + `Starting.`.green);
        createServer(tagArguments, callback);
    });

    After(function (scenarioResult, callback) {
        if (typeof (server.process || {}).kill === 'function') {
            console.log(`[mockserver] ` + `Shutdown.`.green);
            killServer(callback);
        } else {
            callback();
        }
    });
});


