class Poolify {
    private _limit              : number;
    private _length             : number;
    private _class              : any;
    private _members            : Array<any>;

    constructor(limit: number, ClassName: any) {
        this._limit = limit;
        this._length = limit;
        this._class = ClassName;
        this._members = new Array(limit);

        for (let i=0;i<limit;i++) {
            this._members.push(new ClassName());
        }
    }

    public allocate(): any {
        if (this._length == 0) { 
            console.log(this._class);
            throw new Error("Ran out of objects, limit set: " + this._limit); 
        }

        this._length -= 1;
        return this._members.pop();
    }

    public free(object: any) {
        object.clear();

        this._length += 1;
        this._members.push(object);
    }
}

export default Poolify;