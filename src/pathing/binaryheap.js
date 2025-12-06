class BinaryHeap {
    constructor(scoreFunction) {
        this.content = [];
        this.scoreFunction = scoreFunction;
    }

    push(element) {
        this.content.push(element);
        this.bubbleUp(this.content.length - 1);
    }

    rescoreElement(node) {
        const index = this.content.indexOf(node);
        if (index !== -1) {
            this.bubbleUp(index);
            this.sinkDown(index);
        }
    }

    pop() {
        const result = this.content[0];
        const end = this.content.pop();
        if (this.content.length > 0) {
            this.content[0] = end;
            this.sinkDown(0);
        }
        return result;
    }

    remove(node) {
        const index = this.content.indexOf(node);
        if (index === -1) return;

        const end = this.content.pop();
        if (index < this.content.length) {
            this.content[index] = end;
            this.bubbleUp(index);
            this.sinkDown(index);
        }
    }

    size() {
        return this.content.length;
    }

    bubbleUp(n) {
        const element = this.content[n];
        const score = this.scoreFunction(element);
        
        while (n > 0) {
            const parentN = (n - 1) >> 1;
            const parent = this.content[parentN];
            const parentScore = this.scoreFunction(parent);
            
            if (score >= parentScore) break;

            this.content[parentN] = element;
            this.content[n] = parent;
            n = parentN;
        }
    }

    includes(n) {
        return this.content.includes(n);
    }

    sinkDown(n) {
        const length = this.content.length;
        const element = this.content[n];
        const elemScore = this.scoreFunction(element);

        while (true) {
            const child1N = (n << 1) + 1;
            const child2N = child1N + 1;
            let swap = null;

            if (child1N < length) {
                const child1Score = this.scoreFunction(this.content[child1N]);
                if (child1Score < elemScore) swap = child1N;
            }

            if (child2N < length) {
                const child2Score = this.scoreFunction(this.content[child2N]);
                if (child2Score < (swap === null ? elemScore : this.scoreFunction(this.content[child1N]))) {
                    swap = child2N;
                }
            }

            if (swap === null) break;

            this.content[n] = this.content[swap];
            this.content[swap] = element;
            n = swap;
        }
    }
}

export default BinaryHeap;
export { BinaryHeap };