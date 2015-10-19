Feature: Author a Website

  As a web page author
  I want to set the heading of my page
  So that I can create the simplest website in the world

  @focus
  Scenario: Author using the Meteor settings file1
    Given I have authored the site title as "Meteor Cucumber by Xolv.io"
    When  I navigate to "/"
    Then  I should see the heading "Intentional Failure"

  Scenario: Author using the Meteor settings file2
    Given I have authored the site title as "Meteor Cucumber by Xolv.io"
    When  I navigate to "/"
    Then  I should see the heading "Meteor Cucumber by Xolv.io"
