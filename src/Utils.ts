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