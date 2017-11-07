import Poolify from 'engine/Poolify';
import { PoolClass } from 'engine/Poolify';

class Node implements PoolClass {
    public prev        : Node;
    public next        : Node;
    public item        : any;
    public inUse       : boolean;

    constructor() {
        this.clear();
    }

    public clear(): void {
        this.prev = null;
        this.next = null;
        this.item = null;
    }

    public delete(): void {
        pool.free(this);
    }

    public static allocate(item: any): Node {
        let ret = pool.allocate();

        ret.item = item;

        return ret;
    }
}

let pool = new Poolify(100, Node);

class List<T> {
    private _head           : Node;
    private _tail           : Node;
    private _length         : number;

    constructor() {
        this._head = null;
        this._tail = null;
        this._length = 0;
    }

    public push(item: T): void {
        let node = Node.allocate(item);

        if (this._head == null) {
            this._head = node;
            this._tail = node;
        } else {
            let tail = this._tail;
            
            node.prev = tail;
            tail.next = node;

            this._tail = node;
        }

        this._length += 1;
    }

    public remove(item: T): void {
        let node = this._head;

        while (node) {
            if (node.item == item) {
                if (node.prev){
                    if (this._tail == node) { this._tail = node.prev; }
                    node.prev.next = node.next;
                }

                if (node.next){ 
                    if (this._head == node) { this._head = node.next; }
                    node.next.prev = node.prev;
                }

                node.delete();

                this._length -= 1;

                return;
            }

            node = node.next;
        }
    }

    public getAt(index: number): T {
        let node = this._head,
            count = 0;

        while (count < index) {
            node = node.next;
            if (!node) {
                return null;
            }
        }

        return node.item;
    }

    public each(callback: Function): void {
        let item = this._head;

        while (item) {
            callback(item.item);

            item = item.next;
        }
    };

    public sort(sortCheck: Function): void {
        if (this._length < 2) { return; }

        let node = this._head.next,
            compare = this._head;

        while (node) {
            let next = node.next;

            if (sortCheck(node.item, compare.item)) {
                if (node.prev) { node.prev.next = node.next; }
                if (node.next) { node.next.prev = node.prev; }

                node.next = compare;
                node.prev = compare.prev;

                if (compare.prev) compare.prev.next = node;
                compare.prev = node;
                
                if (compare == this._head) { this._head = node; } 
                if (compare == this._tail) { this._tail = node; }

                node = next;
                compare = this._head;
            } else {
                compare = compare.next;
            }

            if (compare == node) {
                node = next;
                compare = this._head;
            }
        }
    }

    public get head(): Node {
        return this._head;
    }

    public get length(): number {
        return this._length;
    }
}

export default List;