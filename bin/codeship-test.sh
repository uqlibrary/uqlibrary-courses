#!/bin/bash

echo "Testing branch: ${CI_BRANCH}"

if [ ${PIPE_NUM} == 1 ]; then
    # Run local tests
    echo "Starting local WCT tests"
    npm install
    bower install
    wct
else
    echo "Pipe not used"
fi
