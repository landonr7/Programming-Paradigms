echo ab to be in test
pushd test
echo in test
javac Game.java View.java Controller.java
java Game
echo leaving test
popd
echo out of test
