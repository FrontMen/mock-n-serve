"use strict";

// Imports
const fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors')

const Handlebars = require("handlebars");
const template = fs.readFileSync('./test/server/mock-selection.hbs', 'utf8');
const commandLineArgs = require('command-line-args');
const options = commandLineArgs([{ name: 'scenario', alias: 's', type: String }]);

let mocks = [],
    app = express(),
    scenario = false;

if (options.scenario){
    scenario = require(path.resolve(__dirname, "scenario", `${options.scenario}.json`));
}

// Apply middleware
app.use(cors());
app.use(express.static('./test/server/static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
process.send = process.send ? process.send : function() {};

app.get("/mocks", function(req, res, next) {
    let html = Handlebars.compile(template)({mocks: mocks});
    res.writeHead(200, {
        "Content-Length": Buffer.byteLength(html),
        "Content-Type": "text/html"
    });
    res.write(html);
    res.end();

    return next();
});

app.post("/mocks/select", function(req, res, next) {
    let method = req.body.method;
    let path = req.body.path;
    let mock = mocks.find((mock) => { return mock.method === method && mock.path === path});
    let scenario = req.body.scenario;
    mock.selected = scenario === "default" ? false : scenario;
    res.status(200).send();
});


// load custom mocks from the mockfolder
loadMocks(path.resolve(__dirname, "./mocks"), 0);
app.listen(8080, function() {
    process.send({ready: true});
});

// Diarrhea code... CLEANUP JUSTICE
// TODO make code below into understandable chunks
function loadMocks(pointer, depth){
    fs.readdir(pointer, (err, entries) => {
        if (!err){
            // folder, use recursion...
            entries.forEach((entry) => {
                loadMocks(path.resolve(pointer, entry), depth + 1);
            });
        } else {
            // file, setup api
            let mock = require(pointer);
            let method = pointer.split("/").slice(-1)[0].split(".")[0],
                path = "/" + pointer.split("/").slice(-depth, -1).join("/");
            let callCount = 0;
            mocks.push({ method: method, path: path, mock: mock, selected: null });
            app[method](path, (req,res, next) => {
                let selected = mocks.find(((mock) => {
                    return mock.path === path && mock.method === method })||{}).selected ||
                    (scenario && scenario[method][path]);

                if (selected){
                    let currentScenario = mock.scenarios
                        .find((scenario) => scenario.title === selected);

                        let response = currentScenario.responses[callCount];

                    res.status(response.status).send(response.data || response.parse && response.parse(req.params));


                    if (currentScenario.responses[callCount + 1]){
                        callCount++;
                    } else {
                        callCount = 0;
                    }
                } else {
                    res.status(mock.status).send(mock.data);
                }
                next();
            });
        }
    });
}