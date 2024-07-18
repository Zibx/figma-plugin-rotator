export class Point {
  public x: number;
  public y: number;
  public z: number;
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  set(axis: number, val: number) {
    if (axis === 0) {
      this.x = val;
    } else if (axis === 1) {
      this.y = val;
    } else {
      this.z = val;
    }
  }
  add(x: Point | number = 0, y = 0, z = 0) {
    if (typeof x === 'number') {
      return new Point(this.x + x, this.y + y, this.z + z);
    }

    return new Point(this.x + x.x, this.y + x.y, this.z + x.z);
  }
  sub(x: Point | number = 0, y = 0, z = 0) {
    if (typeof x === 'number') {
      return new Point(this.x - x, this.y - y, this.z - z);
    }

    return new Point(this.x - x.x, this.y - x.y, this.z - x.z);
  }
  div(x: Point | number = 1, y = 1, z = 1) {
    if (typeof x === 'number') {
      return new Point(this.x / x, this.y / y, this.z / z);
    }

    return new Point(this.x / x.x, this.y / x.y, this.z / x.z);
  }
  mul(x: Point | number = 1, y = 1, z = 1) {
    if (typeof x === 'number') {
      return new Point(this.x * x, this.y * y, this.z * z);
    }

    return new Point(this.x * x.x, this.y * x.y, this.z * x.z);
  }
  length() {
    return Math.hypot(this.x, this.y);
  }
  atan2() {
    return Math.atan2(this.x, this.y);
  }
}
