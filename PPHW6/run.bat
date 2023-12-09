echo Type-checking the front end
pushd front_end
call tsc --strict --target esnext main.ts
popd

echo Type-checking the back end
pushd back_end
mypy main.py --strict --ignore-missing-imports
echo Running
py main.py
popd
echo Done