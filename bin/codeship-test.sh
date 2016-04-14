#!/bin/bash

echo "Testing branch: ${CI_BRANCH}"

# REDO WHEN POLYMER 1.0 GOES LIVE

# If polymer 1.0
if [ ${CI_BRANCH} == "polymer1.0" -o ${CI_BRANCH} == "v1*" ]; then
    if [ ${PIPE_NUM} == 1 ]; then
        # Run local tests
        echo "Starting local WCT tests"
        npm install
        bower install
        wct
    else
        echo "Pipe not used"
    fi
else
    # make sure wct-sauce plugin works with old version of wct
    cd ../uqlibrary-elements
    ./bin/elements_local_tests.sh
    cd ../uqlibrary-hours
    ../uqlibrary-elements/bin/sauce.sh
fi