Feature: Use browser inside steps

  As a developer
  I want to have webdriver available to me in my steps
  So that I don't have to configure my world object and I focus on testing

  @watch
  Scenario: Visit Google
    When  I visit "http://www.google.com"
    Then  I see the title of "Google"

  @not-watch
  Scenario: Visit Github
    When  I visit "http://www.github.com"
    Then  I see the title of "The world's leading software development platform · GitHub"
