# Race Condition Scenarios - Concurrent User Actions

@billing @race
Scenario: Concurrent subscription upgrade conflict
  Given I have the billing page open
  And another admin initiates a plan change
  When I attempt to upgrade the plan
  Then I see "Plan was recently modified" message
  And I can refresh to see current state

@ideas @race
Scenario: Blog post modified during edit
  Given I am editing a blog post
  And another user publishes the same post
  When I attempt to save my changes
  Then I see optimistic lock conflict error
  And I can view diff and merge changes