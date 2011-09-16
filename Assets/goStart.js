var mySkin : GUISkin;
function OnGUI () {
	GUI.skin = mySkin;
	if (GUI.Button (Rect (Screen.width - 700, 250, 200, 50), "Start")) {
		Application.LoadLevel("intro");
	}
}