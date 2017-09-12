# mock-n-serve
Example project, how to instruct a mockserver to respond with certain scenario's, using cucumberjs tagging and
pre-scenario hooks.

# Installation
```
npm install
```

# Run this
```
// start example client code
npm run client

// start selenium
npm run selenium
```

And now, run either the tests which kicks of the mockserver
```
npm run test
```

Or, run the mockserver, and change mocks during development
```
npm run mockserver
```

# Testing setup

 - Framework: CucumberJS (version 2.x) (https://github.com/cucumber/cucumber-js)
 - Selenium: Selenium Standalone (https://github.com/vvo/selenium-standalone)
 - Bindings: Selenium Webdriver (https://www.npmjs.com/package/selenium-webdriver)


# Resources
 - Webdriver implementation: https://github.com/SeleniumHQ/selenium/wiki/WebDriverJs

# Notes
The new Cucumber API does not expose tagging in hooks, which I relied on heavily.
Hopefully they add it back in? For now working with 2.x.

 https://github.com/cucumber/cucumber-js/issues/923