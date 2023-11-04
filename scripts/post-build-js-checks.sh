#!/bin/bash
#check for ESLint violations
if (grep '<error' build/eslint.xml 1> /dev/null 2>&1) then
  sumEslint=$(cat build/eslint.xml | grep -o '<error' | wc -l)
  echo "ESLint found "${sumEslint}" issues!";
#  curl -H "Authorization: token $GITHUB_TOKEN" --request POST --data '{"state": "failure", "context": "ESLint", "description": "ESLint found '"${sumEslint}"' issues!"}' https://api.github.com/repos/lkrnac/manucap/statuses/${GITHUB_SHA} > /dev/null
    curl -L \
      -X POST \
      -H "Accept: application/vnd.github+json" \
      -H "Authorization: Bearer $GITHUB_TOKEN" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      https://api.github.com/repos/lkrnac/manucap/check-runs \
      -d '{"name":"ESLint","head_sha":'"${GITHUB_SHA}"',"status":"completed","conclusion":"failure","output":{"title":"ESLint found '"${sumEslint}"' issues!","summary":"","text":""}}'
else
#  curl -H "Authorization: token $GITHUB_TOKEN" --request POST --data '{"state": "success", "context": "ESLint", "description": "ESLint Passed"}' https://api.github.com/repos/lkrnac/manucap/statuses/${GITHUB_SHA} > /dev/null
    curl -L \
      -X POST \
      -H "Accept: application/vnd.github+json" \
      -H "Authorization: Bearer $GITHUB_TOKEN" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      https://api.github.com/repos/lkrnac/manucap/check-runs \
      -d '{"name":"ESLint","head_sha":'"${GITHUB_SHA}"',"status":"completed","conclusion":"success","output":{"title":"ESLint passed","summary":"","text":""}}'
fi

# Check console outputs from JS test suite
CONSOLE_PROBLEMS=$(cat js-build.log | \
  # THESE ARE MOST WIDE SPREAD:
  pcre2grep -Mv 'console.error.*\n.*Warning: An update to.*inside a test'| \
  pcre2grep -Mv 'console.warn.*\n.*Warning: componentWillMount has been renamed' | \
  pcre2grep -Mv 'console.warn.*\n.*Warning: componentWillReceiveProps has been renamed' | \

  pcre2grep -Mv 'console.warn.*\n.*Warning: React.createFactory\(\) is deprecated' | \
  pcre2grep -Mv 'console.error.*\n.*Warning: Cannot update a component' | \
  pcre2grep -Mv 'console.error.*\n.*Warning: React does not recognize the' | \
  pcre2grep -Mv 'console.error.*\n.*Warning: You provided a' | \
  pcre2grep -Mv 'console.error.*\n.*Warning: render\(\): Rendering components directly into document.body is discouraged' | \
  pcre2grep -Mv 'console.error.*\n.*Error: Error: connect' | \
  pcre2grep -Mv 'console.error.*\n.*Warning: Failed prop type:' | \
  pcre2grep -Mv 'console.error.*\n.*Warning: render\(\.\.\.\): Replacing React-rendered children with a new root component' | \
  pcre2grep -Mv 'console.error.*\n.*Warning: A component is changing a controlled input to be uncontrolled' | \
  pcre2grep -Mv 'console.error.*\n.*Warning: A component is changing an uncontrolled input to be controlled' | \
  pcre2grep -Mv 'console.log.*\n.*base\.preprocess\(\) File' | \
  pcre2grep -Mv 'console.error.*\n.*Unexpected key ' | \
  pcre2grep -Mv 'console.error.*\n.*Warning: Expected `onClick` listener to be a function' | \
  pcre2grep -Mv 'console.error.*\n.*Warning: useLayoutEffect does nothing on the server' | \

  pcre2grep -Mv 'console.warn.*\n.*A response was recieved but no data entry was found' | \
  pcre2grep -Mv 'console.warn.*\n.*Please see https:' | \

  pcre2grep -Mv 'console.warn.*\n.*is missing in the.*defaultValue' | \
  pcre2grep -Mv 'console.warn.*\n.*Global fetch is deprecated and will be unsupported in a future version' | \
  pcre2grep -Mv 'console.error.*\n.*Warning: Received `false` for a non-boolean attribute' | \
  pcre2grep -Mv 'console.error.*\n.*Warning: Unknown event handler property' | \
  pcre2grep -Mv 'console.warn.*\n.*Deprecation warning:' | \
  pcre2grep -Mv 'console.error.*\n.*Warning: Each child in a list should have a unique' | \
  pcre2grep -Mv 'console.error.*\n.*Warning: validateDOMNesting' | \
  pcre2grep -Mv 'console.warn.*\n.*Warning: You cannot change <Router history>' | \
  pcre2grep -Mv 'console.error.*\n.*Warning: It looks like you.*re using the wrong act' | \
  pcre2grep -Mv 'console.error.*\n.*Warning: Failed context type: The context ' | \
  pcre2grep -Mv 'console.error.*\n.*Warning: Can.*t perform a React state update on an unmounted component' | \

  pcre2grep -Mv 'console.error.*\n.*Warning: ErrorBoundary: Error boundaries should implement' | \
  pcre2grep -Mv 'console.log.*\n.*App error boundary Error: testing error boundary' | \
  pcre2grep -Mv 'console.error.*\n.*The above error occurred in the' | \
  pcre2grep -Mv 'console.error.*\n.*Error: Uncaught' | \

  # Remove `c` from following command to troubleshoot which issue was not caught by above suppressions
  pcre2grep -Mc '(\A\s*console\..*\n.*)|(Network Error)|(ECONNREFUSED)|(UnhandledPromiseRejectionWarning)')

if (( CONSOLE_PROBLEMS > 0 )); then
  curl -H "Authorization: token $GITHUB_TOKEN" --request POST --data '{"state": "failure", "context": "console-issues", "description": "Found '"${CONSOLE_PROBLEMS}"' browser console issues!"}' https://api.github.com/repos/lkrnac/manucap/statuses/${GITHUB_SHA} > /dev/null
  echo $CONSOLE_PROBLEMS
else
  curl -H "Authorization: token $GITHUB_TOKEN" --request POST --data '{"state": "success", "context": "console-issues", "description": "Browser console issues check passed"}' https://api.github.com/repos/lkrnac/manucap/statuses/${GITHUB_SHA} > /dev/null
  echo OK
fi
