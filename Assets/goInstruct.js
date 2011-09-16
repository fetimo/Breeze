var mySkin : GUISkin;
function OnGUI () {
	GUI.skin = mySkin;
	if (GUI.Button (Rect (Screen.width - 700, 300, 200, 50), "Instructions")) {
		Application.LoadLevel("instructions");
	}
}