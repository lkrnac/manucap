#!/bin/bash
GITHUB_TOKEN=$CD_GITHUB_TOKEN

#check for TSLint violations
if (grep '<error' */build/tslint.xml 1> /dev/null 2>&1) then
  sumTslint=$(cat */build/tslint.xml | grep -c '<error')
  curl -H "Authorization: token $GITHUB_TOKEN" --request POST --data '{"state": "failure", "context": "travis-ci/TSLint", "description": "TSLint found '"${sumTslint}"' issues!"}' https://api.github.com/repos/dotsub/vtms-subtitle-edit-ui/statuses/${TRAVIS_COMMIT} > /dev/null
else
  curl -H "Authorization: token $GITHUB_TOKEN" --request POST --data '{"state": "success", "context": "travis-ci/TSLint", "description": "TSLint Passed"}' https://api.github.com/repos/dotsub/vtms-subtitle-edit-ui/statuses/${TRAVIS_COMMIT} > /dev/null
fi