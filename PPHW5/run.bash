#!/bin/bash
set -e
echo Type-checking the front end
pushd front_end
tsc -strict main.ts
mv *.js ..
popd

mv .js ./back_end
echo Type-checking the back end
pushd back_end
mypy main.py --strict --ignore-missing-imports
echo Running
python gashler.py
popd
echo Done
