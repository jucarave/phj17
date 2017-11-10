import { Vector3, vec3 } from 'engine/math/Vector3';
import Config from 'engine/Config';
import { PI2 } from 'engine/Constants';
import Camera from 'engine/Camera';

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

    return (ret + PI2) % PI2;
}

export function getSquaredDistance(position1: Vector3, position2: Vector3): number {
    let x = position1.x - position2.x,
        y = position1.y - position2.y,
        z = position1.z - position2.z;
    return x*x + y*y + z*z;
}

export function coordsToOrtho(camera: Camera, x: number, y: number): Vector3 {
    return vec3(
        x - camera.screenSize.x / 2.0,
        (camera.screenSize.y / 2.0) - y,
        0.0
    );
}

export function pixelCoordsToWorld(vector: Vector3): Vector3 {
    return vector.set(
        vector.x * Config.PIXEL_UNIT_RELATION,
        vector.y * Config.PIXEL_UNIT_RELATION,
        vector.z * Config.PIXEL_UNIT_RELATION
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

let smallPool: Array<any> = [];
export function rememberPoolAlloc(object: any): any {
    smallPool.push(object);
    return object;
}

export function freePoolAlloc(): void {
    for (let i=0,obj;obj=smallPool[i];i++) {
        obj.delete();
    }

    smallPool.length = 0;
}