using UnityEngine;
using System.Collections;


public class Thruster : MonoBehaviour {
   // declare the variables
   public float Speed = 150;
   public float Drag = 0;
   public float DragNoMovement = 0;
   const float  airDrag = 0F;

   void FixedUpdate () {
      // get the inputs
      float horizontal = Input.GetAxis ("Horizontal");
      float vertical = Input.GetAxis ("Vertical");
      float altitude = Input.GetAxis ("UpDown");

      // check to see if the user is moving
      bool userMoved = Mathf.Abs (horizontal) > 0.1F || Mathf.Abs (vertical) > 0.1F || Mathf.Abs (altitude) > 0.1F;

      // determine the force vector
      float x = horizontal * Speed;         
      float z = vertical * Speed;
      float y = altitude * Speed;
      rigidbody.AddRelativeForce (new Vector3 (x, y, z), ForceMode.VelocityChange);
      
      // apply the appropriate drag when moving
      if (userMoved)
         rigidbody.drag = Drag;
      else
         rigidbody.drag = DragNoMovement;
   }
   
   
   void Start () {
      if (rigidbody==null)
         gameObject.AddComponent ("Rigidbody");

      // don't let the physics engine rotate the character
      rigidbody.freezeRotation = true;
   }
}