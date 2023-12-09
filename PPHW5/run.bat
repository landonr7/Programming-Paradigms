if %errorlevel% neq 0 (
    echo there was an error exiting
) else (
    echo Type-checking the front end
    pushd front_end
    call tsc -strict main.ts
    call move *.js ..
    popd
    call move *.js ./back_end
    echo Type-checking the back end
    pushd back_end
    mypy gashler.py --strict --ignore-missing-imports
    echo Running
    py gashler.py
    popd
    echo Done
)