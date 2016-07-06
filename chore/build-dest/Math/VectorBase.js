import { InvalidStringException } from "../Exceptions";
class VectorBase {
    constructor() {
        this._magnitudeSquaredCache = -1;
        this._magnitudeCache = -1;
    }
    get magnitude() {
        if (this._magnitudeCache < 0) {
            this._magnitudeCache = Math.sqrt(this.sqrMagnitude);
        }
        return this._magnitudeCache;
    }
    get ElementCount() {
        return 0;
    }
    get sqrMagnitude() {
        if (this._magnitudeSquaredCache < 0) {
            let sum = 0;
            let r = this.rawElements;
            for (let i = 0; i < this.ElementCount; i++) {
                sum += r[i] * r[i];
            }
            this._magnitudeSquaredCache = sum;
        }
        return this._magnitudeSquaredCache;
    }
    static __elementEquals(v1, v2) {
        if (v1.ElementCount !== v2.ElementCount) {
            return false;
        }
        for (let i = 0; i < v1.ElementCount; i++) {
            if (v1.rawElements[i] !== v2.rawElements[i]) {
                return false;
            }
        }
        return true;
    }
    static __nearlyElementEquals(v1, v2) {
        if (v1.ElementCount !== v2.ElementCount) {
            return false;
        }
        let error = 0.01;
        for (let i = 0; i < v1.ElementCount; i++) {
            if (Math.abs(v1.rawElements[i] - v2.rawElements[i]) > error) {
                return false;
            }
        }
        return true;
    }
    static __fromGenerationFunction(v1, v2, gen) {
        let f = new Float32Array(v1.ElementCount);
        for (let i = 0; i < f.length; i++) {
            f[i] = gen(i, v1, v2);
        }
        return f;
    }
    static __parse(str) {
        const checkRegex = /(-?)([\d,E\+\-\.]+)?(n)?\(([-\d,E\+\.\s]+)\)/g;
        const matches = checkRegex.exec(str);
        if (matches) {
            if (!matches[4]) {
                throw new InvalidStringException(`The specified string '${str}' is not containing braced vector.`);
            }
            return {
                needNormalize: matches[3] === "n",
                needNegate: matches[1] === "-",
                coefficient: parseFloat(matches[2]),
                elements: VectorBase._parseRawVector(matches[4])
            };
        }
        else {
            // Assume this is simplified format.
            return {
                needNormalize: false,
                needNegate: false,
                elements: VectorBase._parseRawVector(str),
                coefficient: undefined
            };
        }
    }
    static _parseRawVector(str) {
        const splitted = str.split(",");
        const result = new Array(splitted.length);
        for (let i = 0; i < splitted.length; i++) {
            result[i] = parseFloat(splitted[i]);
            if (isNaN(result[i])) {
                throw new Error(`Unexpected vector string ${str}`);
            }
        }
        return result;
    }
}
export default VectorBase;

//# sourceMappingURL=data:application/json;base64,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QkFDcEIsVUFBVSxFQUFFLEtBQUs7Z0JBQ2pCLFFBQVEsRUFBRSxVQUFVLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQztnQkFDekMsV0FBVyxFQUFFLFNBQVM7YUFDdkIsQ0FBQztRQUNKLENBQUM7SUFDSCxDQUFDO0lBRUQsT0FBZSxlQUFlLENBQUMsR0FBVztRQUN4QyxNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2hDLE1BQU0sTUFBTSxHQUFHLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMxQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUN6QyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JCLE1BQU0sSUFBSSxLQUFLLENBQUMsNEJBQTRCLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDckQsQ0FBQztRQUNILENBQUM7UUFDRCxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ2hCLENBQUM7QUFDSCxDQUFDO0FBRUQsZUFBZSxVQUFVLENBQUMiLCJmaWxlIjoiTWF0aC9WZWN0b3JCYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtHTE19IGZyb20gXCJnbC1tYXRyaXhcIjtcbmltcG9ydCB7RnVuYzN9IGZyb20gXCIuLi9CYXNlL0RlbGVnYXRlc1wiO1xuaW1wb3J0IHtJbnZhbGlkU3RyaW5nRXhjZXB0aW9ufSBmcm9tIFwiLi4vRXhjZXB0aW9uc1wiO1xuaW50ZXJmYWNlIElWZWN0b3JQYXJzZURlc2NyaXB0aW9uIHtcbiAgbmVlZE5vcm1hbGl6ZTogYm9vbGVhbjtcbiAgbmVlZE5lZ2F0ZTogYm9vbGVhbjtcbiAgY29lZmZpY2llbnQ6IG51bWJlcjtcbiAgZWxlbWVudHM6IG51bWJlcltdO1xufVxuXG5jbGFzcyBWZWN0b3JCYXNlIHtcblxuICBwdWJsaWMgcmF3RWxlbWVudHM6IEdMTS5JQXJyYXk7XG4gIHByaXZhdGUgX21hZ25pdHVkZVNxdWFyZWRDYWNoZTogbnVtYmVyID0gLTE7XG4gIHByaXZhdGUgX21hZ25pdHVkZUNhY2hlOiBudW1iZXIgPSAtMTtcblxuICBwdWJsaWMgZ2V0IG1hZ25pdHVkZSgpIHtcbiAgICBpZiAodGhpcy5fbWFnbml0dWRlQ2FjaGUgPCAwKSB7XG4gICAgICB0aGlzLl9tYWduaXR1ZGVDYWNoZSA9IE1hdGguc3FydCh0aGlzLnNxck1hZ25pdHVkZSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9tYWduaXR1ZGVDYWNoZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgRWxlbWVudENvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHNxck1hZ25pdHVkZSgpOiBudW1iZXIge1xuICAgIGlmICh0aGlzLl9tYWduaXR1ZGVTcXVhcmVkQ2FjaGUgPCAwKSB7XG4gICAgICBsZXQgc3VtID0gMDtcbiAgICAgIGxldCByID0gdGhpcy5yYXdFbGVtZW50cztcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5FbGVtZW50Q291bnQ7IGkrKykge1xuICAgICAgICBzdW0gKz0gcltpXSAqIHJbaV07XG4gICAgICB9XG4gICAgICB0aGlzLl9tYWduaXR1ZGVTcXVhcmVkQ2FjaGUgPSBzdW07XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9tYWduaXR1ZGVTcXVhcmVkQ2FjaGU7XG4gIH1cblxuICBwcm90ZWN0ZWQgc3RhdGljIF9fZWxlbWVudEVxdWFscyh2MTogVmVjdG9yQmFzZSwgdjI6IFZlY3RvckJhc2UpOiBib29sZWFuIHtcbiAgICBpZiAodjEuRWxlbWVudENvdW50ICE9PSB2Mi5FbGVtZW50Q291bnQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2MS5FbGVtZW50Q291bnQ7IGkrKykge1xuICAgICAgaWYgKHYxLnJhd0VsZW1lbnRzW2ldICE9PSB2Mi5yYXdFbGVtZW50c1tpXSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcHJvdGVjdGVkIHN0YXRpYyBfX25lYXJseUVsZW1lbnRFcXVhbHModjE6IFZlY3RvckJhc2UsIHYyOiBWZWN0b3JCYXNlKTogYm9vbGVhbiB7XG4gICAgaWYgKHYxLkVsZW1lbnRDb3VudCAhPT0gdjIuRWxlbWVudENvdW50KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGxldCBlcnJvciA9IDAuMDE7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2MS5FbGVtZW50Q291bnQ7IGkrKykge1xuICAgICAgaWYgKE1hdGguYWJzKHYxLnJhd0VsZW1lbnRzW2ldIC0gdjIucmF3RWxlbWVudHNbaV0pID4gZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHByb3RlY3RlZCBzdGF0aWMgX19mcm9tR2VuZXJhdGlvbkZ1bmN0aW9uPFQgZXh0ZW5kcyBWZWN0b3JCYXNlPih2MTogVCwgdjI6IFQsIGdlbjogRnVuYzM8bnVtYmVyLCBULCBULCBudW1iZXI+KTogR0xNLklBcnJheSB7XG4gICAgbGV0IGYgPSBuZXcgRmxvYXQzMkFycmF5KHYxLkVsZW1lbnRDb3VudCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmLmxlbmd0aDsgaSsrKSB7XG4gICAgICBmW2ldID0gZ2VuKGksIHYxLCB2Mik7XG4gICAgfVxuICAgIHJldHVybiBmO1xuICB9XG5cbiAgcHJvdGVjdGVkIHN0YXRpYyBfX3BhcnNlKHN0cjogc3RyaW5nKTogSVZlY3RvclBhcnNlRGVzY3JpcHRpb24ge1xuICAgIGNvbnN0IGNoZWNrUmVnZXggPSAvKC0/KShbXFxkLEVcXCtcXC1cXC5dKyk/KG4pP1xcKChbLVxcZCxFXFwrXFwuXFxzXSspXFwpL2c7XG4gICAgY29uc3QgbWF0Y2hlcyA9IGNoZWNrUmVnZXguZXhlYyhzdHIpO1xuICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICBpZiAoIW1hdGNoZXNbNF0pIHsgLy8gV2hlbiAoeCx4LHgseCkgd2FzIG5vdCBzcGVjaWZlZFxuICAgICAgICB0aHJvdyBuZXcgSW52YWxpZFN0cmluZ0V4Y2VwdGlvbihgVGhlIHNwZWNpZmllZCBzdHJpbmcgJyR7c3RyfScgaXMgbm90IGNvbnRhaW5pbmcgYnJhY2VkIHZlY3Rvci5gKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIG5lZWROb3JtYWxpemU6IG1hdGNoZXNbM10gPT09IFwiblwiLFxuICAgICAgICBuZWVkTmVnYXRlOiBtYXRjaGVzWzFdID09PSBcIi1cIixcbiAgICAgICAgY29lZmZpY2llbnQ6IHBhcnNlRmxvYXQobWF0Y2hlc1syXSksXG4gICAgICAgIGVsZW1lbnRzOiBWZWN0b3JCYXNlLl9wYXJzZVJhd1ZlY3RvcihtYXRjaGVzWzRdKVxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQXNzdW1lIHRoaXMgaXMgc2ltcGxpZmllZCBmb3JtYXQuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBuZWVkTm9ybWFsaXplOiBmYWxzZSxcbiAgICAgICAgbmVlZE5lZ2F0ZTogZmFsc2UsXG4gICAgICAgIGVsZW1lbnRzOiBWZWN0b3JCYXNlLl9wYXJzZVJhd1ZlY3RvcihzdHIpLFxuICAgICAgICBjb2VmZmljaWVudDogdW5kZWZpbmVkXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc3RhdGljIF9wYXJzZVJhd1ZlY3RvcihzdHI6IHN0cmluZyk6IG51bWJlcltdIHtcbiAgICBjb25zdCBzcGxpdHRlZCA9IHN0ci5zcGxpdChcIixcIik7XG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IEFycmF5KHNwbGl0dGVkLmxlbmd0aCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzcGxpdHRlZC5sZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0W2ldID0gcGFyc2VGbG9hdChzcGxpdHRlZFtpXSk7XG4gICAgICBpZiAoaXNOYU4ocmVzdWx0W2ldKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuZXhwZWN0ZWQgdmVjdG9yIHN0cmluZyAke3N0cn1gKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBWZWN0b3JCYXNlO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9