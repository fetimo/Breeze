var startingPitch = -3;
var timeToDecrease = 20;
function Start() {
    audio.pitch = startingPitch;
}
function Update () {
	var move : float = Input.GetAxis("Horizontal");
	var move2 : float = Input.GetAxis("Vertical");
	if(move>0 && !audio.isPlaying){
		audio.pan = 1;
		audio.Play();
	}
	if(move2==0) {
		if(move==0 && audio.isPlaying){
			audio.Stop();
		}
	}
	if(move<0 && !audio.isPlaying){
		audio.pan = -1;
		audio.Play();
	}	
	if(move2!=0 && !audio.isPlaying){
		audio.Play();
		if(move2==0 && audio.isPlaying){
			audio.Stop();
		}
	}
	if(audio.pitch > 0){
        audio.pitch -= ((Time.deltaTime * startingPitch) / timeToDecrease);
	} else {
	 	audio.pitch = startingPitch;
	}
}