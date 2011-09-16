function OnCollisionEnter(theCollision : Collision){
	if(theCollision.gameObject.name == "wind"){
		transform.GetComponent(Cloth).useGravity = true;
		gameObject.Find("score").GetComponent("score").numLeaves+=1;
		Destroy(this);
	}
}