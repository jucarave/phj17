import { Vector3 } from './math/Vector3';
import { CAMERA_ORTHO_WIDTH, CAMERA_ORTHO_HEIGHT, PIXEL_UNIT_RELATION } from './Constants';

export function createUUID(): string {
    let date = (new Date()).getTime(),
        ret = ('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx').replace(/[xy]/g, (c: string): string => {
            let ran = (date + Math.random() * 16) % 16 | 0;
            date = Math.floor(date / 16);

            return (c == 'x' ? ran : (ran&0x3|0x8)).toString(16);
        });

    return ret;
}

export function degToRad(degrees: number): number {
    return degrees * Math.PI / 180;
}

export function get2DVectorDir(x: number, y: number): number {
    if (x == 1 && y == 0) { return 0; }else 
    if (x == 1 && y == -1) { return degToRad(45); }else 
    if (x == 0 && y == -1) { return degToRad(90); }else
    if (x == -1 && y == -1) { return degToRad(135); }else
    if (x == -1 && y == 0) { return Math.PI; }else
    if (x == -1 && y == 1) { return degToRad(225); }else
    if (x == 0 && y == 1) { return degToRad(270); }else
    if (x == 1 && y == 1) { return degToRad(315); }
}

export function get2DAngle(position1: Vector3, position2: Vector3): number {
    let x = position2.x - position1.x,
        y = position2.z - position1.z;

    let ret = Math.atan2(-y, x);

    return ret;
}

export function getSquaredDistance(position1: Vector3, position2: Vector3): number {
    let x = position1.x - position2.x,
        y = position1.x - position2.x,
        z = position1.x - position2.x;
    return x*x + y*y + z*z;
}

export function coordsToOrtho(x: number, y: number): Vector3 {
    return new Vector3(
        x - CAMERA_ORTHO_WIDTH / 2.0,
        (CAMERA_ORTHO_HEIGHT / 2.0) - y,
        0.0
    );
}

export function pixelCoordsToWorld(x: number = 0, y: number = 0, z: number = 0): Vector3 {
    return new Vector3(
        x * PIXEL_UNIT_RELATION,
        y * PIXEL_UNIT_RELATION,
        z * PIXEL_UNIT_RELATION
    );
}

export function roundUpPowerOf2(x: number): number {
    let ret = 2;

    while (ret < x) {
        ret *= 2;
    }

    return ret;
}

export function httpRequest(url: string, callback: Function): void {
    let http = new XMLHttpRequest();

    http.open('GET', url, true);
    http.onreadystatechange = function() {
          if (http.readyState == 4 && http.status == 200) {
            callback(http.responseText);
        }
    };

    http.send();
}