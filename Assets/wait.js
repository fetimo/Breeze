function Update () {
	wait();
}
function wait() {
	yield WaitForSeconds(6);
	Application.LoadLevel("breeze");
}
function OnMouseUp () {
    Application.LoadLevel ("breeze");
}