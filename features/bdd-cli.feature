@cli
Feature: Run BDD tests from the CLI

  As a developer
  I want to run my tests
  So that I know if my implementation does the right thing

  Background:
    Given I deleted the folder called "myTestProject"
    And   I created a folder called "myTestProject/features/step_definitions"

  Scenario: Run test
    Given I created a file called "myTestProject/features/my.feature" with
      """
      Feature: My empty feature
      """
    When  I run chimp inside "myTestProject"
    Then  I see "0 scenarios" in the console
    And   I see "0 steps" in the console

  Scenario: Watch mode without @dev tag does not run any scenarios
    Given I created a file called "myTestProject/features/my.feature" with
      """
      Feature: My empty feature

      Scenario: Visit Google
        When  I visit "http://www.google.com"
        Then  I see the title of "Google"
      """
    When  I run chimp inside "myTestProject" in watch mode
    Then  I see "0 scenarios" in the console
    And   I see "0 steps" in the console

  Scenario: Watch mode with @dev tag reruns when file changes
    Given I created a file called "myTestProject/features/my.feature" with
      """
      Feature: My feature

      Scenario: Visit Google
        When  I visit "http://www.google.com"
        Then  I see the title of "Google"
      """
    And   I created a file called "myTestProject/features/step_definitions/steps.js" with
      """
      module.exports = function () {

        this.When(/^I visit "([^"]*)"$/, function (url, callback) {
          this.browser.url(url).call(callback);
        });

        this.Then(/^I see the title of "([^"]*)"$/, function (title, callback) {
          this.browser.getTitle().should.become(title).and.notify(callback);
        });

      };
      """
    And   I run chimp inside "myTestProject" in watch mode

    When I created a file called "myTestProject/features/my.feature" with
      """
      Feature: My updated feature

      @dev
      Scenario: Visit Google
        When  I visit "http://www.google.com"
        Then  I see the title of "Google"
      """
    And   I wait for the chimp to finish rerunning
    Then  I see "1 scenario (1 passed)" in the console
    And   I see "2 steps (2 passed)" in the console