import OutBuffer from './OutBuffer.js';
import Pool from './Pool.js';

class CommOut {
    static buffer = null;
    static bufferPool = new Pool(() => new OutBuffer(16384), 2);
    static getBuffer() {
        const b2 = this.bufferPool.retrieve();
        b2.idx = 0;
        return b2;
    }
}

export default CommOut;