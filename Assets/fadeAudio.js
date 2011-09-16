enum Fade {In, Out}
var fadeTime = 4.5;

function Update () {
	if(gameObject.Find("score").GetComponent("score").numLeaves==15){
		FadeAudio(fadeTime, Fade.Out);
	}
}
function FadeAudio (timer : float, fadeType : Fade) {
	var start = fadeType == Fade.In? 0.0 : 1.0;
	var end = fadeType == Fade.In? 1.0 : 0.0;
	var i = 0.0;
	var step = 1.0/timer;

	while (i <= 1.0) {
		i += step * Time.deltaTime;
		audio.volume = Mathf.Lerp(start, end, i);
		yield;
	}
}