Feature: Use browser inside steps

#  As a developer
#  I want to have webdriver available to me in my steps
#  So that I don't have to configure my world object and I focus on testing
#
  Scenario: Run test
    When  I visit "http://www.google.com"
#    Then  I see the title of "Google"