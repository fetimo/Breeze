function Update () {
    if (Input.GetKey ("escape")) {
        Application.Quit();
    }
}

function Start () {
	wait();
}
function wait() {
	yield WaitForSeconds(4);
	Application.Quit();
}
function OnMouseUp () {
    Application.Quit();
}