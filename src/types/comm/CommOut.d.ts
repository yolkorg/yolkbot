import OutBuffer from './OutBuffer';
import Pool from './Pool';

declare class CommOut {
    static buffer: OutBuffer | null;
    static bufferPool: Pool<OutBuffer>;
    static getBuffer(): OutBuffer;
}

export default CommOut;