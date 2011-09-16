var numLeaves : int = 0;
function Update () {
	guiText.text = 	numLeaves+" / 15";	
	if(numLeaves==15){
		wait();
	}
}
function wait() {
	yield WaitForSeconds(5);
	Application.LoadLevel("winter");
}