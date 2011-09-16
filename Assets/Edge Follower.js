/*
find more cool stuff on  www.CreatedByBrett.com

This script finds cliff edges and creates invisible walls along them.
It is attached to a prefab, which is placed just below the cliff edge, next to it and parallel to it.  The prefab also contains 3 small, elongated cubes or cylinders in the shape of an arrow, pointing "forward", 1 unit long or less.  This indicates visually the direction that the code will begin seeking and following the edge of the cliff.
*/


//PUBLIC INSPECTOR VARIABLES

public var fl_rotation_degrees : float = 10; //number of degrees to rotate per "step", while seeking the edge of the cliff
public var fl_wall_segment_length : float = 5; //length in units of each wall segement
public var i_max_wall_segments : int = 1000; //maximum number of wall segments to create
public var i_wall_height : int = 30; //height of the invisible wall
public var go_stopping_point : GameObject; //NOT REQUIRED -- if the wall should stop at a point, place an object there and drag it into this variable in the Inspector



//PRIVATE VARIABLES

private var aj_triangles = new Array(); //int array
private var aj_vertices = new Array(); //Vector3 array
private var b_reached_end : boolean; //whether the "circle" was completed, an ending prefab was encountered, or the maximum number of wall sections has been reached/exceeded
private var fl_rotate_away_from_terrain : float; //amount and direction (pos/neg) to rotate away from the terrain
private var fl_rotate_towards_terrain : float; //amount and direction (pos/neg) to rotate towards the terrain
private var i_count_wall_sections : int = 0; //number of sections of wall that have been created
private var i_vertices_index : int; //counting through the vertices
private var q_starting_rotation : Quaternion; //starting rotation of this transform
private var v3_starting_point : Vector3; //starting point of this transform with the y-axis set to zero
private var v3_stopping_point : Vector3; //NOT REQUIRED -- where the wall should end


//MONOBEHAVIOUR FUNCTIONS

function Start() {
    //setup
    doSetupVariables();
    doRemoveMyColliders(); //take the colliders off this prefab so it doesn't interefere with raycasts
    doAddPointToArray(transform.position); //add the starting point to the array of points along the wall
    
    //find wall points
    doFindIfTerrainIsLeftOrRight(); //this sets fl_rotate to positive or negative degrees
    while (!b_reached_end) {
        doFindWallPoints();
        i_count_wall_sections ++;
    }
    doConnectFirstAndLastWallPoints(); //if appropriate, complete the circle of walls
    
    //create walls
    doCreateWallMesh();
    
    //hide this prefab
    doHideAll();
}



//PRIVATE FUNCTIONS

private function doAddPointToArray(v3_point_fp : Vector3) : void {
    var v3_point : Vector3;
    v3_point = v3_point_fp; //this should be the World position, not local

    //add a "fence post" (at the wall edge point) to the array of vertices
    aj_vertices[i_vertices_index] = v3_point_fp;
    i_vertices_index++;
    aj_vertices[i_vertices_index] = v3_point_fp + (Vector3.up * i_wall_height);
    i_vertices_index++;
}

private function doCreateTriangles(i_index_fp : int, i_1_fp : int, i_2_fp : int, i_3_fp : int, i_4_fp : int) {
    //create 4 triangles between each consecutive pair of "fence posts", to cover the space between them thoroughly.  Create each triangle in 2 ways (like 0,1,2 and 0,2,1) so it's impenetrable from both sides
    var i_index : int;
    i_index = i_index_fp * 24;

    //triangle 1, version 1
    aj_triangles[i_index + 0] = i_1_fp;
    aj_triangles[i_index + 1] = i_2_fp;
    aj_triangles[i_index + 2] = i_3_fp;
    
    //triangle 1, version 2
    aj_triangles[i_index + 3] = i_1_fp;
    aj_triangles[i_index + 4] = i_3_fp;
    aj_triangles[i_index + 5] = i_2_fp;
    
    //triangle 2, version 1
    aj_triangles[i_index + 6] = i_1_fp;
    aj_triangles[i_index + 7] = i_2_fp;
    aj_triangles[i_index + 8] = i_4_fp;
    
    //triangle 2, version 2
    aj_triangles[i_index + 9] = i_1_fp;
    aj_triangles[i_index + 10] = i_4_fp;
    aj_triangles[i_index + 11] = i_2_fp;
    
    //triangle 3, version 1
    aj_triangles[i_index + 12] = i_1_fp;
    aj_triangles[i_index + 13] = i_3_fp;
    aj_triangles[i_index + 14] = i_4_fp;
    
    //triangle 3, version 2
    aj_triangles[i_index + 15] = i_1_fp;
    aj_triangles[i_index + 16] = i_4_fp;
    aj_triangles[i_index + 17] = i_3_fp;
    
    //triangle 4, version 1
    aj_triangles[i_index + 18] = i_2_fp;
    aj_triangles[i_index + 19] = i_3_fp;
    aj_triangles[i_index + 20] = i_4_fp;

    //triangle 4, version 2
    aj_triangles[i_index + 21] = i_2_fp;
    aj_triangles[i_index + 22] = i_4_fp;
    aj_triangles[i_index + 23] = i_3_fp;
}

private function doCreateWallMesh() {
    var i_fence_posts : int;
    var ms_mesh : Mesh; //the wall mesh
    
    //create triangles
    for (i_fence_posts = 0; i_fence_posts < (aj_vertices.length/2)-1; i_fence_posts++) {
        doCreateTriangles(i_fence_posts, (i_fence_posts*2) + 0, (i_fence_posts*2) + 1, (i_fence_posts*2) + 2, (i_fence_posts*2) + 3);
    }
    
    //create the mesh filter
    if (GetComponent("MeshFilter") == null) {
        gameObject.AddComponent("MeshFilter");
    }
    ms_mesh = GetComponent(MeshFilter).mesh;
    
    //assign the vertices & triangles for this mesh
    ms_mesh.Clear();
    ms_mesh.vertices = aj_vertices;
    ms_mesh.RecalculateBounds();
    ms_mesh.triangles = aj_triangles;
    
    //remove all colliders
    Destroy(GetComponent(BoxCollider));
    Destroy(GetComponent(SphereCollider));
    Destroy(GetComponent(CapsuleCollider));
    Destroy(GetComponent(MeshCollider));
    Destroy(GetComponent(WheelCollider));
    Destroy(GetComponent(RaycastCollider));

    //create a mesh collider in this shape
    gameObject.AddComponent("MeshCollider");
    GetComponent("MeshCollider").mesh = ms_mesh;

    //move this object to the origin, so all world points from aj_vertices will match the local positions
    transform.rotation.eulerAngles.x = 0;
    transform.rotation.eulerAngles.y = 0;
    transform.rotation.eulerAngles.z = 0;
    transform.position = Vector3.zero;

    //make sure these don't interfere with OnMouseOver
    gameObject.layer = LayerMask.NameToLayer("Ignore Raycast");

    //clear out global variables so they don't waste memory
    ms_mesh = null;
    aj_triangles = null;
    aj_vertices = null;
}

private function doConnectFirstAndLastWallPoints() {
    var fl_distance : float;
    var v3_actual_start_point : Vector3;
    fl_distance = Vector3.Distance(v3_starting_point, getX_and_Z_Only(transform.position));
    if ((fl_distance < fl_wall_segment_length * 0.9) && (fl_distance > 0.05)) { //if this point is really close to the starting point
        v3_actual_start_point = Vector3(v3_starting_point.x, transform.position.y, v3_starting_point.z);
        doAddPointToArray(v3_actual_start_point); //make a wall between this point and the starting point
    }
}

private function doFindIfTerrainIsLeftOrRight() {
    var b_above_terrain : boolean; //whether this point is above the terrain or above empty space
    var b_found_edge : boolean = false; //whether the cliff edge has been found
    var fl_rotation_value : float; //the value (10,20,30,40) 
    var fl_rotation_sign : float = 1;
    var fl_rotation_change : float = 0;
    
    b_above_terrain = isAboveTerrain(); //is the endpoint currently above the terrain?

    //move the transform 10 degrees left, then 10 degrees right, 20 degrees left, 20 degrees right, etc., searching for the edge of the cliff
    while (!b_found_edge) {
        //determine how much to change the angle by
        fl_rotation_value = Mathf.Abs(fl_rotation_change) + 10; //10, 20, 30, 40, etc.
        fl_rotation_sign = -fl_rotation_sign; // 1 or -1
        fl_rotation_change = -(fl_rotation_value * fl_rotation_sign); //-10, 20, -30, 40, -50, 60, etc.
        
        if (isAboveTerrain() == b_above_terrain) { //the edge hasn't been found
            doRotateDegrees(fl_rotation_change);
        } else { //found the edge!
            b_found_edge = true;
            
            //set the directions for "towards terrain" and "away from terrain"
            fl_rotation_degrees = Mathf.Abs(fl_rotation_degrees);
            if (isAboveTerrain()) { //the current point is above the terrain
                if (fl_rotation_change > 0) { //the current point is clockwise from the last point checked
                    fl_rotate_away_from_terrain = fl_rotation_degrees;
                } else { //the current point is counterclockwise from the last point checked
                    fl_rotate_away_from_terrain = -fl_rotation_degrees;
                }
            } else { //the current point is above empty space
                if (fl_rotation_change > 0) { //the current point is clockwise from the last point checked
                    fl_rotate_away_from_terrain = -fl_rotation_degrees;
                } else { //the current point is counterclockwise from the last point checked
                    fl_rotate_away_from_terrain = fl_rotation_degrees;
                }
            }
            fl_rotate_towards_terrain =    -fl_rotate_away_from_terrain; //"towards" is just the opposite direction of "away from"
        }

        if (fl_rotation_change > 170) { //can't find terrain!  bail out
            Debug.Log("PLACEMENT ERROR:  can't find terrain edge!  Place prefab closer to the edge of the cliff and 1/2 unit below it.");
            b_found_edge = true; //allows code to end
            b_reached_end = true; //allows code to end
            return;
        }
    }
    
}

function doFindWallPoints() {
    var b_created_wall_section : boolean = false;
    var i_count_rotations : int = 0;
    var i_max_rotations : int;
    
    i_max_rotations = 355 / fl_rotation_degrees; //nearly a full circle
    b_above_terrain = isAboveTerrain(); //set the starting value -- above terrain or not

    while (!b_created_wall_section) {
        if (isAboveTerrain()) { //it's above terrain
            if (b_above_terrain) { //it was above terrain last time too
                doRotateAwayFromTerrain();
            } else { //found the edge!
                doMoveForward(); //move the game object forward to this point
                doAddPointToArray(transform.position); //add this new point to the array of points
                doResetVariables();
                b_reached_end = isReachedEnd();
                b_created_wall_section = true; //tell the loop to continue
            }
        } else { //it's above empty space
            if (b_above_terrain) { //found the edge!
                doMoveForward(); //move the game object forward to this point
                doAddPointToArray(transform.position); //add this new point to the array of points
                doResetVariables();
                b_reached_end = isReachedEnd();
                b_created_wall_section = true; //tell the loop to continue
            } else {
                doRotateTowardsTerrain();
            }
        }

        i_count_rotations++;
        if (i_count_rotations > i_max_rotations) { //can't find terrain!  bail out
            Debug.Log("can't find terrain edge -- " + gameObject.name);
            b_reached_end = true; //allows code to end
            return;
        }
    }
}

private function doHideAll() {
    var mr_meshrenderer : MeshRenderer;
    var mr_meshrenderers; //it doesn't like having a type, even MeshRenderer[]

    mr_meshrenderers = GetComponentsInChildren(MeshRenderer);
    for (mr_meshrenderer in mr_meshrenderers) {
        Destroy(mr_meshrenderer);
    }
}

private function doMoveForward() {
    transform.position += getForward();
}

private function doRemoveMyColliders() {
    var co_colliders = gameObject.GetComponents (Collider);
    var co_collider : Collider;
    for (co_collider in co_colliders) {
        Destroy(co_collider);
    }
}

private function doResetVariables() {
}

private function doRotateAwayFromTerrain() {
    doRotateDegrees(fl_rotate_away_from_terrain);
}

private function doRotateDegrees(fl_rotate_fp : float) {
    var fl_rotate_to : float;
    fl_rotate_to = transform.rotation.eulerAngles.y + fl_rotate_fp;
    fl_rotate_to = (fl_rotate_to + 720) % 360;
    transform.rotation.eulerAngles.y = fl_rotate_to;
}

private function doRotateTowardsTerrain() {
    doRotateDegrees(fl_rotate_towards_terrain);
}

private function doSetupVariables() {
    q_starting_rotation = transform.rotation;
    v3_starting_point = getX_and_Z_Only(transform.position);
    if (go_stopping_point != null) {
        v3_stopping_point = getX_and_Z_Only(go_stopping_point.transform.position);
        Destroy(go_stopping_point);
    } else {
        v3_stopping_point = Vector3(1000,1000,1000);
    }
}

private function getForward() : Vector3 { //returns one wall segment length forward
    return (transform.forward.normalized * fl_wall_segment_length);
}

private function getX_and_Z_Only(v3_vector_fp : Vector3) : Vector3 {
    return (Vector3(v3_vector_fp.x, 0, v3_vector_fp.z));
}

private function isAboveTerrain() : boolean {
    var v3_endpoint : Vector3;
    v3_endpoint = transform.position + getForward(); //get the end point of the transform
    v3_endpoint += Vector3(0,2,0); //move up 2 units
    return (Physics.Raycast (v3_endpoint, -Vector3.up, 2)); //return whether there's ground below the new point
}

private function isReachedEnd() : boolean {
    b_reached_end = false;
    
    //is this close to the starting point?
    if (Vector3.Distance(v3_starting_point, getX_and_Z_Only(transform.position)) < fl_wall_segment_length * 0.9) {
        b_reached_end = true;
    }
    
    //is this close to the stopping point (if there is one)?
    if (Vector3.Distance(v3_stopping_point, getX_and_Z_Only(transform.position)) < fl_wall_segment_length * 0.9) {
        b_reached_end = true;
    }
    
    //have we reached or exceeded the maximum number of wall segments?
    if (i_count_wall_sections >= i_max_wall_segments) {
        b_reached_end = true;
    }

    //return the value
    return (b_reached_end);
}


