/*
 * 2D and 3D vectors for easy position computations
 */

export class vec3D {
  x: number;
  y: number;
  z: number;
  constructor(x:number, y:number, z:number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  add(v:vec3D) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
  }
  len():number {
    return Math.sqrt(Math.pow(this.x,2) +
                     Math.pow(this.y,2) +
                     Math.pow(this.z,2));
  }
  dist(v:vec3D):number {
    return Math.sqrt(Math.pow(this.x-v.x,2) +
                     Math.pow(this.y-v.y,2) +
                     Math.pow(this.z-v.z,2));
  }
}

// Is not part of the class because it does not modify the object
export function scale(v:vec3D, dt:number):vec3D {
  return new vec3D(v.x*dt, v.y*dt, v.z*dt);
}
