# Partial State Scenarios - Incomplete Flows

@keywords @partial
Scenario: Blog generation preserves progress on navigation
  Given I am generating blogs from keywords
  And generation is in progress
  When I navigate to another page
  Then I see "Generation in progress" warning
  And I can cancel or continue in background

@profile @partial
Scenario: Draft saved on unexpected page refresh
  Given I have partially filled my profile form
  When I refresh the browser
  Then my form data is restored from local storage
  And unsaved changes indicator appears