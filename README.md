# Racer

## Track Creation

Only tested in Blender and the BABYLON.js exporter v4.4.4. Textures can be inline or exported, they just have to be placed in the correct directory.

Tracks support the following objects:

  *  /^_path\.(\d+)/mi - Paths are **HITBOX**es dictating how the paths must be followed.
  * /^_ground\.(\d+)/mi - Grounds are **HITBOX**es that cause drag when players contact.
  * static - Any mesh that contains static are static collision meshes. Tracks, walls, etc
  * spawns - A mesh where every vertex is used as a location to spawn karts. There must be at least 8 vertexes, the vertexes must be more than 12 units (meters) apart from each other, and the vertexs must be above the static meshes by 7 units.

Also, the static mesh below the spawns must be perfectly flat.

### **HITBOX**

HITBOX are cubes that can be transformed, scaled, and rotated, but **not** applied. They cannot be any mesh, they MUST be cubes.


