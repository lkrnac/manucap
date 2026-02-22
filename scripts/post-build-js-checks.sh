#!/bin/bash
# check for ESLint violations
if (grep '<error' build/eslint.xml 1> /dev/null 2>&1) then
    sumEslint=$(cat build/eslint.xml | grep -o '<error' | wc -l)
    echo "ESLint found ${sumEslint} issues!";
    curl -L \
      -X POST \
      -H "Accept: application/vnd.github+json" \
      -H "Authorization: Bearer ${GITHUB_TOKEN}" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      https://api.github.com/repos/lkrnac/manucap/check-runs \
      -d '{"name":"ESLint","head_sha":"'${GITHUB_SHA}'","status":"completed","conclusion":"failure","output":{"title":"ESLint found '${sumEslint}' issues!","summary":"","text":""}}'
else
    curl -L \
      -X POST \
      -H "Accept: application/vnd.github+json" \
      -H "Authorization: Bearer ${GITHUB_TOKEN}" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      https://api.github.com/repos/lkrnac/manucap/check-runs \
      -d '{"name":"ESLint","head_sha":"'${GITHUB_SHA}'","status":"completed","conclusion":"success","output":{"title":"ESLint passed","summary":"","text":""}}'
fi

# Check console outputs from JS test suite
CONSOLE_PROBLEMS=$(cat js-build.log | \
  # TODO: Try to fix/remove these console errors
  pcre2grep -Mv 'console.error.*\n.*Warning: An update to.*inside a test'| \
  pcre2grep -Mv 'console.error.*\n.*Warning: You provided a' | \
  pcre2grep -Mv 'console.error.*\n.*Warning: render\(\): Rendering components directly into document.body is discouraged' | \
  pcre2grep -Mv 'console.error.*\n.*Warning: render\(\.\.\.\): Replacing React-rendered children with a new root component' | \
  pcre2grep -Mv 'console.error.*\n.*Warning: Each child in a list should have a unique' | \
  pcre2grep -Mv 'console.error.*\n.*VIDEOJS: ERROR: \(CODE:4 MEDIA_ERR_SRC_NOT_SUPPORTED\) No compatible source was found for this media' | \
  pcre2grep -Mv 'console.warn.*\n.*VIDEOJS: WARN: The element supplied is not included in the DOM' | \
  pcre2grep -Mv 'console.warn.*\n.*Preload parameter of wavesurfer.load will be ignored because' | \
  pcre2grep -Mv 'console.error.*\n.*Error: Not implemented: HTMLMediaElement\.prototype\.pause' | \
  pcre2grep -Mv 'console.error.*\n.*Support for defaultProps will be removed from memo components in a future major release. Use JavaScript default parameters instead.' | \
  pcre2grep -Mv 'console.error.*\n.*Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.' | \

  # Remove `c` from following command to troubleshoot which issue was not caught by above suppressions
  pcre2grep -Mc '(\A\s*console\..*\n.*)|(Network Error)|(ECONNREFUSED)|(UnhandledPromiseRejectionWarning)')

#Use for troubleshooting:
#echo "$CONSOLE_PROBLEMS" | tee found-errors.txt

if (( CONSOLE_PROBLEMS > 0 )); then
    curl -L \
      -X POST \
      -H "Accept: application/vnd.github+json" \
      -H "Authorization: Bearer ${GITHUB_TOKEN}" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      https://api.github.com/repos/lkrnac/manucap/check-runs \
      -d '{"name":"Console issues","head_sha":"'${GITHUB_SHA}'","status":"completed","conclusion":"failure","output":{"title":"Found '${CONSOLE_PROBLEMS}' browser console issues!","summary":"","text":"'$CONSOLE_PROBLEMS'"}}'
    echo $CONSOLE_PROBLEMS
else
    curl -L \
      -X POST \
      -H "Accept: application/vnd.github+json" \
      -H "Authorization: Bearer ${GITHUB_TOKEN}" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      https://api.github.com/repos/lkrnac/manucap/check-runs \
      -d '{"name":"Console issues","head_sha":"'${GITHUB_SHA}'","status":"completed","conclusion":"success","output":{"title":"Browser console issues check passed","summary":"","text":""}}'
  echo OK
fi
