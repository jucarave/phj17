class Poolify {
    private _limit              : number;
    private _class              : PoolClass;
    private _members            : Array<PoolClass>;

    constructor(limit: number, ClassName: any) {
        this._limit = limit;
        this._class = ClassName;
        this._members = new Array(limit);

        for (let i=0;i<limit;i++) {
            let obj = new ClassName();
            obj.inUse = false;
            this._members[i] = obj;
        }
    }

    public allocate(): any {
        for (let i=0,member;member=this._members[i];i++) {
            if (!member.inUse) {
                member.inUse = true;
                return member;
            }
        }

        console.log(this._class);
        throw new Error("Ran out of objects, limit set: " + this._limit); 
    }

    public free(object: any) {
        object.clear();
        object.inUse = false;
    }
}

export default Poolify;

export interface PoolClass {
    inUse            : boolean;

    clear(): void;
    delete(): void;
}