const {defineSupportCode} = require('cucumber');
const {expect} = require("chai");
const {By, until, Builder} = require('selenium-webdriver');

const driver = new Builder()
    .forBrowser('chrome')
    .build();

const responses = {
    "default": JSON.stringify({lol: "wut"}),
    "first": JSON.stringify({normalFlow: "First call"}),
    "second": JSON.stringify({normalFlow: "Second call"}),
    "bad": JSON.stringify({message: "You are so dumb..."}),
    "down": "500"
};


defineSupportCode(function({Given, When, Then}) {
    Given(/^the user is on the example page$/, function(next) {
        driver.get("localhost:3000")
            .then(_ => driver.wait(until.titleIs('EXAMPLE', 4000)))
            .then(_ => next());
    });
    When(/^a request to the foo\/bar\/1234 endpoint is made$/, function(next) {
        driver.findElement({id: "get-foo-bar-1234"})
            .then((el) => { return el.click() })
            .then(_ => next());
    });
    Then(/^the response should match the (.+) response$/, function(responseType, next) {
        driver.findElement({id: "response"})
            .then((el) => { return el.getText()})
            .then((text) => {
                expect(text).to.equal(responses[responseType]);
                next();
            });

    });
});