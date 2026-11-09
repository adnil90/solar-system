import { Vector3 } from "three";
import { expect, it } from "vitest";

function eclipticToThree(x: number, y: number, z: number): Vector3 {
  return new Vector3(x, z, -y);
}

it("the ecliptic-to-Three.js mapping (x, z, -y) is a proper rotation under Vector3.cross, with ecliptic north as Three.js +Y", () => {
  const crossed = eclipticToThree(1, 0, 0).cross(eclipticToThree(0, 1, 0));
  const north = eclipticToThree(0, 0, 1);

  expect(crossed.x === north.x, `x ${crossed.x} vs ${north.x}`).toBe(true);
  expect(crossed.y === north.y, `y ${crossed.y} vs ${north.y}`).toBe(true);
  expect(crossed.z === north.z, `z ${crossed.z} vs ${north.z}`).toBe(true);

  expect(north.x === 0, `x ${north.x}`).toBe(true);
  expect(north.y === 1, `y ${north.y}`).toBe(true);
  expect(north.z === 0, `z ${north.z}`).toBe(true);
});
