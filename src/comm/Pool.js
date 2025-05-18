class Pool {
    constructor(constructorFn, size) {
        this.size = 0;
        this.originalSize = size;
        this.constructorFn = constructorFn;
        this.objects = [];
        this.idx = 0;
        this.numActive = 0;
        this.expand(size);
    }
    expand(num) {
        for (let i2 = 0; i2 < num; i2++) {
            const obj = this.constructorFn();
            obj.id = i2 + this.size;
            obj.active = false;
            this.objects.push(obj);
        }
        this.size += num;
    }
    retrieve(id) {
        if (id) {
            while (id >= this.size) this.expand(this.originalSize);

            this.numActive++;
            this.objects[id].active = true;
            return this.objects[id];
        }
        let i2 = this.idx;
        do {
            i2 = (i2 + 1) % this.size;
            const obj = this.objects[i2];
            if (!obj.active) {
                this.idx = i2;
                this.numActive++;
                obj.active = true;
                return obj;
            }
        } while (i2 !== this.idx);
        this.expand(this.originalSize);
        return this.retrieve();
    }
    recycle(obj) {
        obj.active = false;
        this.numActive--;
    }
    forEachActive(fn) {
        for (let i2 = 0; i2 < this.size; i2++) {
            const obj = this.objects[i2];
            if (obj.active === true) fn(obj, i2);
        }
    }
}

export default Pool;