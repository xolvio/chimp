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
    When  I run cuke-monkey inside "myTestProject"
    Then  I see "0 scenarios" in the console
    And   I see "0 steps" in the console

