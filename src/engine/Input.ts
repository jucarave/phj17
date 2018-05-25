import Vector3 from './math/Vector3';
import { createUUID } from './Utils';
import Config from './Config';

interface Callback {
    id: string;
    callback: Function;
}

class Input {
    private _element                 : HTMLElement;
    private _keydownCallbacks        : Array<Callback>;
    private _keyupCallbacks          : Array<Callback>;
    private _mousemoveCallbacks      : Array<Callback>;
    private _elementFocus            : boolean;

    public readonly mousePosition    : Vector3;

    constructor() {
        this._element = null;
        this._keydownCallbacks = [];
        this._keyupCallbacks = [];
        this._mousemoveCallbacks = [];
        this._elementFocus = false;

        this.mousePosition = new Vector3(0, 0, 0);
    }
    
    private _handleKeydown(keyEvent: KeyboardEvent): void {
        if (!this._elementFocus) { return; }

        for (let i=0,callback;callback=this._keydownCallbacks[i];i++) {
            callback.callback(keyEvent.keyCode);
        }
    }

    private _handleKeyup(keyEvent: KeyboardEvent): void {
        for (let i=0,callback;callback=this._keyupCallbacks[i];i++) {
            callback.callback(keyEvent.keyCode);
        }
    }

    private _handleMouseMove(mouseEvent: MouseEvent): void {
        if (!this._elementFocus) { return; }

        const position = this._element.getBoundingClientRect();
        this.mousePosition.set(mouseEvent.clientX - position.left, mouseEvent.clientY - position.top, 0);
        
        for (let i=0,callback;callback=this._mousemoveCallbacks[i];i++) {
            callback.callback(mouseEvent.movementX, mouseEvent.movementY);
        }
    }

    private _handlePointerLockChange(): void {
        this._elementFocus = (document.pointerLockElement === this._element);
    }
    
    private _deleteFromList(list: Array<Callback>, id: string): boolean {
        for (let i=0,callback;callback=list[i];i++) {
            if (callback.id == id) {
                list.splice(i, 1);
                return true;
            }
        }

        return false;
    }

    private _createCallbackToList(list: Array<Callback>, callback: Function): string {
        let ret: Callback = {
            id: createUUID(),
            callback: callback
        }

        list.push(ret);

        return ret.id;
    }

    public init(focusElement: HTMLElement): void {
        this._element = focusElement;

        document.addEventListener("keydown", (keyEvent: KeyboardEvent) => { this._handleKeydown(keyEvent); });
        document.addEventListener("keyup", (keyEvent: KeyboardEvent) => { this._handleKeyup(keyEvent); });

        this._element.addEventListener("mousemove", (ev: MouseEvent) => { this._handleMouseMove(ev); });

        document.addEventListener('pointerlockchange', () => { this._handlePointerLockChange(); }, false);
        document.addEventListener('mozpointerlockchange', () => { this._handlePointerLockChange(); }, false);
        document.addEventListener('webkitpointerlockchange', () => { this._handlePointerLockChange(); }, false);

        this._element.requestFullscreen = this._element.requestFullscreen || this._element.webkitRequestFullScreen || (<any>this._element).mozRequestFullScreen;

        document.addEventListener("click", (event: MouseEvent) => {
            if (Config.PLAY_FULLSCREEN && this._element.requestFullscreen) {
                this._element.requestFullscreen();
            }

            if (Config.LOCK_POINTER && this._element.requestPointerLock) {
                this._element.requestPointerLock();
            } else {
                this._elementFocus = (event.target == this._element);
            }
        });
    } 

    public onKeydown(callback: Function): string {
        return this._createCallbackToList(this._keydownCallbacks, callback);
    }
    
    public onKeyup(callback: Function): string {
        return this._createCallbackToList(this._keyupCallbacks, callback);
    }

    public onMouseMove(callback: Function): string {
        return this._createCallbackToList(this._mousemoveCallbacks, callback);
    }

    public deleteCallback(id: string): void {
        if (this._deleteFromList(this._keydownCallbacks, id)) { return; }
        if (this._deleteFromList(this._keyupCallbacks, id)) { return; }
        if (this._deleteFromList(this._mousemoveCallbacks, id)) { return; }
    }
}

export default (new Input());