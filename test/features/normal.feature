Feature: Testcases with specific mock configuration
  As a sane developer
  I want to have control over the mock responses
  So that I can play out all sorts of scenarios on my app

  #default
  Scenario: Default flow
    Given the user is on the example page
    When a request to the foo/bar/1234 endpoint is made
    Then the response should match the default response

  @mock-multiple
  Scenario: Multiple responses flow
    Given the user is on the example page
    When a request to the foo/bar/1234 endpoint is made
    Then the response should match the first response
    When a request to the foo/bar/1234 endpoint is made
    Then the response should match the second response


  @mock-bad-request
  Scenario: Multiple responses flow
    Given the user is on the example page
    When a request to the foo/bar/1234 endpoint is made
    Then the response should match the bad response

  @mock-broken
  Scenario: Multiple responses flow
    Given the user is on the example page
    When a request to the foo/bar/1234 endpoint is made
    Then the response should match the down response
