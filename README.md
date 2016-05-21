# Racer

## Track Creation

Only tested in Blender and the BABYLON.js exporter v4.4.4. Textures can be inline or exported, they just have to be placed in the correct directory.

Tracks support the following objects:

  *  /^_path\.(\d+)/mi - Paths are **HITBOX**es dictating how the paths must be followed.
  * /^_ground\.(\d+)/mi - Grounds are **HITBOX**es that cause drag when players contact.
  * static - Any mesh that contains static are static collision meshes. Tracks, walls, etc
  * spawns - A mesh where every vertex is used as a location to spawn karts. There must be at least 8 vertexes, the vertexes must be more than 12 units (meters) apart from each other, and the vertexs must be above the static meshes by 7 units.

Also, the static mesh below the spawns must be perfectly flat.

Static meshes MUST have rotation and scale applied.

Every triangle in the static mesh is far and away the biggest expense on processing, so limiting these (invisible and approximate to the world geometry) is key.

Path hitboxes must start in front of the start line and be in front of all spawns.

### **HITBOX**

HITBOX are cubes that can be transformed, scaled, and rotated, but **not** applied. They cannot be any mesh, they MUST be cubes.

Generating them along bezier curves (ie. tracks) is tough, but not impossible. Note, using the Array/Fit Curve/Merge/Curve pattern works great for normal geometry and static collisions, but do **NOT** use that with hitboxes.

To do this, [Use Dupliframes](http://blender.stackexchange.com/questions/510/how-can-i-duplicate-a-mesh-along-a-curve) 



    Based on what you explained in the comments above, I think what you want are Dupliframes. My answer is based on the example in the wiki.

    In short, you add a curve to the scene and in the Curve menu under Path Animation, you enable Follow. (You should also set the frames to a more reasonable number as needed such as 10 or so)

    Then add the object and in the Object menu under Duplication enable Frames and disable Speed.

    Then parent the object to the curve or path, first select the object then the curve (so that the curve is the active object) and use Ctrl + P and Set Parent to Object. After, you can select the object and use Alt + O to reset its origin.

    Finally, you can now change the orientation of the object by either rotating it (either in Edit mode or Object mode). The arrangement of objects can, of course, be further enhanced by editing the curve. (Shaping it into text etc)
    
Make sure to remove extra objects and unparent the first object (once isolated) from the curve. Also make sure the results actually line up; most need to be nudged.