import JThreeObjectEEWithID from "../../Base/JThreeObjectEEWithID";
import JThreeContext from "../../JThreeContext";
import ContextComponents from "../../ContextComponents";
/**
 * Abstract class to provide mouse tracking feature on a part of region on canvas.
 * This class is intended to be used in Canvas and viewport renderer.
 *
 * キャンバス内の特定領域におけるマウスイベントを管理するためのクラス。
 * 主にキャンバス自身や、ビューポートを持つレンダラによる使用を想定されている。
 */
class CanvasRegion extends JThreeObjectEEWithID {
    /**
     * Constructor
     * @param  {HTMLCanvasElement} canvasElement the canvas element which contains this region
     */
    constructor(canvasElement) {
        super();
        /**
         * Whether mouse is on the region or not.
         *
         * マウスが現在このクラスが管理する領域の上に乗っているかどうか。
         */
        this.mouseOver = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.lastMouseDownX = 0;
        this.lastMouseDownY = 0;
        this.mouseDownTracking = false;
        this.mouseLocalX = 0;
        this.mouseLocalY = 0;
        this.canvasElement = canvasElement;
        this.canvasElement.addEventListener("mousemove", this._mouseMoveHandler.bind(this), false);
        this.canvasElement.addEventListener("mouseenter", this._mouseEnterHandler.bind(this), false);
        this.canvasElement.addEventListener("mouseleave", this._mouseLeaveHandler.bind(this), false);
        this.canvasElement.addEventListener("mousedown", this._mouseDownHandler.bind(this), false);
        this.canvasElement.addEventListener("mouseup", this._mouseUpHandler.bind(this), false);
        this.canvasElement.addEventListener("touchend", this._mouseUpHandler.bind(this), false);
        this.canvasElement.addEventListener("touchstart", this._mouseDownHandler.bind(this), false);
        this.canvasElement.addEventListener("touchmove", this._mouseMoveHandler.bind(this), false);
        this.name = this.ID;
    }
    /**
     * The region managed by this class.(This getter should be overridden)
     *
     * このクラスによって管理されている領域(このgetterはオーバーライドされるべきものです。)
     */
    get region() {
        return null;
    }
    /**
     * Dispose used objects and event handlers.
     *
     *使ったオブジェクトやイベントハンドラの破棄
     */
    dispose() {
        this.canvasElement.removeEventListener("mousemove", this._mouseMoveHandler, false);
        this.canvasElement.removeEventListener("mouseenter", this._mouseEnterHandler, false);
        this.canvasElement.removeEventListener("mouseleave", this._mouseLeaveHandler, false);
        return;
    }
    _checkMouseInside(e) {
        // TODO fix bug here
        const rect = this.canvasElement.getBoundingClientRect();
        this.lastMouseX = this.mouseX;
        this.lastMouseY = this.mouseY;
        let clientX;
        if (typeof e.clientX === "undefined") {
            clientX = e.touches[0].clientX;
        }
        else {
            clientX = e.clientX;
        }
        let clientY;
        if (typeof e.clientY === "undefined") {
            clientY = e.touches[0].clientY;
        }
        else {
            clientY = e.clientY;
        }
        this.mouseX = clientX - rect.left;
        this.mouseY = clientY - rect.top;
        this.mouseOver = this.region.contains(this.mouseX, this.mouseY);
        const localPos = this.region.toLocal(this.mouseX, this.mouseY);
        this.mouseLocalX = localPos[0];
        this.mouseLocalY = localPos[1];
        const debug = JThreeContext.getContextComponent(ContextComponents.Debugger);
        debug.setInfo(`MouseState:${this.name}(${this.getTypeName()})`, {
            mouseOver: this.mouseOver,
            mousePositionX: this.mouseX,
            mousePositionY: this.mouseY,
            rawX: this.mouseX,
            rawY: this.mouseY
        });
        return this.mouseOver;
    }
    _mouseMoveHandler(e) {
        this._checkMouseInside(e);
        this.emit("mouse-move", {
            eventSource: e,
            enter: false,
            leave: false,
            mouseOver: this.mouseOver,
            region: this,
            mouseX: this.mouseX,
            mouseY: this.mouseY,
            mouseDownTracking: this.mouseDownTracking,
            trackDiffX: this.mouseX - this.lastMouseDownX,
            trackDiffY: this.mouseY - this.lastMouseDownY,
            diffX: this.mouseX - this.lastMouseX,
            diffY: this.mouseY - this.lastMouseY
        });
    }
    _mouseLeaveHandler(e) {
        this._checkMouseInside(e);
        if (this.mouseDownTracking) {
            this.mouseDownTracking = false;
        }
        this.emit("mouse-leave", {
            eventSource: e,
            enter: false,
            leave: true,
            mouseOver: this.mouseOver,
            mouseX: this.mouseX,
            mouseY: this.mouseY,
            region: this,
            diffX: this.mouseX - this.lastMouseX,
            diffY: this.mouseY - this.lastMouseY
        });
    }
    _mouseEnterHandler(e) {
        this._checkMouseInside(e);
        this.emit("mouse-enter", {
            eventSource: e,
            enter: true,
            leave: false,
            mouseOver: this.mouseOver,
            mouseX: this.mouseX,
            mouseY: this.mouseY,
            region: this,
            diffX: this.mouseX - this.lastMouseX,
            diffY: this.mouseY - this.lastMouseY
        });
    }
    _mouseDownHandler(e) {
        this._checkMouseInside(e);
        if (this.mouseOver) {
            this.mouseDownTracking = true;
            this.lastMouseDownX = this.mouseX;
            this.lastMouseDownY = this.mouseY;
        }
        this.emit("mouse-down", {
            enter: false,
            leave: false,
            mouseOver: this.mouseOver,
            mouseX: this.mouseX,
            mouseY: this.mouseY,
            region: this,
            diffX: this.mouseX - this.lastMouseX,
            diffY: this.mouseY - this.lastMouseY
        });
    }
    _mouseUpHandler(e) {
        this._checkMouseInside(e);
        if (this.mouseDownTracking) {
            this.mouseDownTracking = false;
        }
        this.emit("mouse-up", {
            enter: false,
            leave: false,
            mouseOver: this.mouseOver,
            mouseX: this.mouseX,
            mouseY: this.mouseY,
            region: this,
            mouseDownTracking: this.mouseDownTracking,
            trackDiffX: this.mouseX - this.lastMouseDownX,
            trackDiffY: this.mouseY - this.lastMouseDownY,
            diffX: this.mouseX - this.lastMouseX,
            diffY: this.mouseY - this.lastMouseY
        });
    }
}
export default CanvasRegion;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNvcmUvQ2FudmFzL0NhbnZhc1JlZ2lvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiT0FBTyxvQkFBb0IsTUFBTSxpQ0FBaUM7T0FHM0QsYUFBYSxNQUFNLHFCQUFxQjtPQUV4QyxpQkFBaUIsTUFBTSx5QkFBeUI7QUFDdkQ7Ozs7OztHQU1HO0FBQ0gsMkJBQTJCLG9CQUFvQjtJQUM3Qzs7O09BR0c7SUFDSCxZQUFZLGFBQWdDO1FBQzFDLE9BQU8sQ0FBQztRQTZCVjs7OztXQUlHO1FBQ0ksY0FBUyxHQUFZLEtBQUssQ0FBQztRQUUzQixXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBRW5CLFdBQU0sR0FBVyxDQUFDLENBQUM7UUFFbkIsZUFBVSxHQUFXLENBQUMsQ0FBQztRQUV2QixlQUFVLEdBQVcsQ0FBQyxDQUFDO1FBRXZCLG1CQUFjLEdBQVcsQ0FBQyxDQUFDO1FBRTNCLG1CQUFjLEdBQVcsQ0FBQyxDQUFDO1FBRTNCLHNCQUFpQixHQUFZLEtBQUssQ0FBQztRQUVuQyxnQkFBVyxHQUFXLENBQUMsQ0FBQztRQUV4QixnQkFBVyxHQUFXLENBQUMsQ0FBQztRQW5EN0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7UUFDbkMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMzRixJQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzdGLElBQUksQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDN0YsSUFBSSxDQUFDLGFBQWEsQ0FB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QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDO1FBQ2pDLENBQUM7UUFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNwQixLQUFLLEVBQUUsS0FBSztZQUNaLEtBQUssRUFBRSxLQUFLO1lBQ1osU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTO1lBQ3pCLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtZQUNuQixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07WUFDbkIsTUFBTSxFQUFFLElBQUk7WUFDWixpQkFBaUIsRUFBRSxJQUFJLENBQUMsaUJBQWlCO1lBQ3pDLFVBQVUsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxjQUFjO1lBQzdDLFVBQVUsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxjQUFjO1lBQzdDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVO1lBQ3BDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVO1NBQ3JDLENBQUMsQ0FBQztJQUNMLENBQUM7QUFDTCxDQUFDO0FBRUQsZUFBZSxZQUFZLENBQUMiLCJmaWxlIjoiQ29yZS9DYW52YXMvQ2FudmFzUmVnaW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEpUaHJlZU9iamVjdEVFV2l0aElEIGZyb20gXCIuLi8uLi9CYXNlL0pUaHJlZU9iamVjdEVFV2l0aElEXCI7XG5pbXBvcnQgSURpc3Bvc2FibGUgZnJvbSBcIi4uLy4uL0Jhc2UvSURpc3Bvc2FibGVcIjtcbmltcG9ydCBSZWN0YW5nbGUgZnJvbSBcIi4uLy4uL01hdGgvUmVjdGFuZ2xlXCI7XG5pbXBvcnQgSlRocmVlQ29udGV4dCBmcm9tIFwiLi4vLi4vSlRocmVlQ29udGV4dFwiO1xuaW1wb3J0IERlYnVnZ2VyIGZyb20gXCIuLi8uLi9EZWJ1Zy9EZWJ1Z2dlclwiO1xuaW1wb3J0IENvbnRleHRDb21wb25lbnRzIGZyb20gXCIuLi8uLi9Db250ZXh0Q29tcG9uZW50c1wiO1xuLyoqXG4gKiBBYnN0cmFjdCBjbGFzcyB0byBwcm92aWRlIG1vdXNlIHRyYWNraW5nIGZlYXR1cmUgb24gYSBwYXJ0IG9mIHJlZ2lvbiBvbiBjYW52YXMuXG4gKiBUaGlzIGNsYXNzIGlzIGludGVuZGVkIHRvIGJlIHVzZWQgaW4gQ2FudmFzIGFuZCB2aWV3cG9ydCByZW5kZXJlci5cbiAqXG4gKiDjgq3jg6Pjg7Pjg5DjgrnlhoXjga7nibnlrprpoJjln5/jgavjgYrjgZHjgovjg57jgqbjgrnjgqTjg5njg7Pjg4jjgpLnrqHnkIbjgZnjgovjgZ/jgoHjga7jgq/jg6njgrnjgIJcbiAqIOS4u+OBq+OCreODo+ODs+ODkOOCueiHqui6q+OChOOAgeODk+ODpeODvOODneODvOODiOOCkuaMgeOBpOODrOODs+ODgOODqeOBq+OCiOOCi+S9v+eUqOOCkuaDs+WumuOBleOCjOOBpuOBhOOCi+OAglxuICovXG5jbGFzcyBDYW52YXNSZWdpb24gZXh0ZW5kcyBKVGhyZWVPYmplY3RFRVdpdGhJRCBpbXBsZW1lbnRzIElEaXNwb3NhYmxlIHtcbiAgLyoqXG4gICAqIENvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSAge0hUTUxDYW52YXNFbGVtZW50fSBjYW52YXNFbGVtZW50IHRoZSBjYW52YXMgZWxlbWVudCB3aGljaCBjb250YWlucyB0aGlzIHJlZ2lvblxuICAgKi9cbiAgY29uc3RydWN0b3IoY2FudmFzRWxlbWVudDogSFRNTENhbnZhc0VsZW1lbnQpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuY2FudmFzRWxlbWVudCA9IGNhbnZhc0VsZW1lbnQ7XG4gICAgdGhpcy5jYW52YXNFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5fbW91c2VNb3ZlSGFuZGxlci5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgdGhpcy5jYW52YXNFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsIHRoaXMuX21vdXNlRW50ZXJIYW5kbGVyLmJpbmQodGhpcyksIGZhbHNlKTtcbiAgICB0aGlzLmNhbnZhc0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgdGhpcy5fbW91c2VMZWF2ZUhhbmRsZXIuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgIHRoaXMuY2FudmFzRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMuX21vdXNlRG93bkhhbmRsZXIuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgIHRoaXMuY2FudmFzRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLl9tb3VzZVVwSGFuZGxlci5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgdGhpcy5jYW52YXNFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaGVuZFwiLCB0aGlzLl9tb3VzZVVwSGFuZGxlci5iaW5kKHRoaXMpLCBmYWxzZSk7XG4gICAgdGhpcy5jYW52YXNFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaHN0YXJ0XCIsIHRoaXMuX21vdXNlRG93bkhhbmRsZXIuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgIHRoaXMuY2FudmFzRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwidG91Y2htb3ZlXCIsIHRoaXMuX21vdXNlTW92ZUhhbmRsZXIuYmluZCh0aGlzKSwgZmFsc2UpO1xuICAgIHRoaXMubmFtZSA9IHRoaXMuSUQ7XG4gIH1cblxuICAvKipcbiAgICogVGhlIG5hbWUgZm9yIGlkZW50aWZ5aW5nIHRoaXMgaW5zdGFuY2UuXG4gICAqIFJhbmRvbSBnZW5lcmF0ZWQgdW5pcXVlIElEIHdpbGwgYmUgdXNlZCBhcyBkZWZhdWx0LlxuICAgKlxuICAgKiDjgZPjga7jgq/jg6njgrnjga7jgqTjg7Pjgrnjgr/jg7PjgrnjgpLorZjliKXjgZnjgovjgZ/jgoHjga7lkI3liY1cbiAgICog44OH44OV44Kp44Or44OI44Gn44Gv44Op44Oz44OA44Og44Gr55Sf5oiQ44GV44KM44Gf44Om44OL44O844Kv44Gq5paH5a2X5YiX44GM55So44GE44KJ44KM44KL44CCXG4gICAqL1xuICBwdWJsaWMgbmFtZTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgaHRtbCBjYW52YXMgZWxlbWVudCBjb250YWluaW5nIHRoaXMgcmVuZGVyYWJsZSByZWdpb24uXG4gICAqXG4gICAqIOOBk+OBruOCr+ODqeOCueOBrueuoeeQhuOBmeOCi+ODrOODs+ODgOODquODs+OCsOWPr+iDvemgmOWfn+OBjOWxnuOBmeOCi+OCreODo+ODs+ODkOOCueOBrkhUTUxDYW52YXNFbGVtZW50XG4gICAqL1xuICBwdWJsaWMgY2FudmFzRWxlbWVudDogSFRNTENhbnZhc0VsZW1lbnQ7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgbW91c2UgaXMgb24gdGhlIHJlZ2lvbiBvciBub3QuXG4gICAqXG4gICAqIOODnuOCpuOCueOBjOePvuWcqOOBk+OBruOCr+ODqeOCueOBjOeuoeeQhuOBmeOCi+mgmOWfn+OBruS4iuOBq+S5l+OBo+OBpuOBhOOCi+OBi+OBqeOBhuOBi+OAglxuICAgKi9cbiAgcHVibGljIG1vdXNlT3ZlcjogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIHB1YmxpYyBtb3VzZVg6IG51bWJlciA9IDA7XG5cbiAgcHVibGljIG1vdXNlWTogbnVtYmVyID0gMDtcblxuICBwdWJsaWMgbGFzdE1vdXNlWDogbnVtYmVyID0gMDtcblxuICBwdWJsaWMgbGFzdE1vdXNlWTogbnVtYmVyID0gMDtcblxuICBwdWJsaWMgbGFzdE1vdXNlRG93blg6IG51bWJlciA9IDA7XG5cbiAgcHVibGljIGxhc3RNb3VzZURvd25ZOiBudW1iZXIgPSAwO1xuXG4gIHB1YmxpYyBtb3VzZURvd25UcmFja2luZzogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIHB1YmxpYyBtb3VzZUxvY2FsWDogbnVtYmVyID0gMDtcblxuICBwdWJsaWMgbW91c2VMb2NhbFk6IG51bWJlciA9IDA7XG5cblxuICAvKipcbiAgICogVGhlIHJlZ2lvbiBtYW5hZ2VkIGJ5IHRoaXMgY2xhc3MuKFRoaXMgZ2V0dGVyIHNob3VsZCBiZSBvdmVycmlkZGVuKVxuICAgKlxuICAgKiDjgZPjga7jgq/jg6njgrnjgavjgojjgaPjgabnrqHnkIbjgZXjgozjgabjgYTjgovpoJjln58o44GT44GuZ2V0dGVy44Gv44Kq44O844OQ44O844Op44Kk44OJ44GV44KM44KL44G544GN44KC44Gu44Gn44GZ44CCKVxuICAgKi9cbiAgcHVibGljIGdldCByZWdpb24oKTogUmVjdGFuZ2xlIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwb3NlIHVzZWQgb2JqZWN0cyBhbmQgZXZlbnQgaGFuZGxlcnMuXG4gICAqXG4gICAq5L2/44Gj44Gf44Kq44OW44K444Kn44Kv44OI44KE44Kk44OZ44Oz44OI44OP44Oz44OJ44Op44Gu56C05qOEXG4gICAqL1xuICBwdWJsaWMgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmNhbnZhc0VsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLl9tb3VzZU1vdmVIYW5kbGVyLCBmYWxzZSk7XG4gICAgdGhpcy5jYW52YXNFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsIHRoaXMuX21vdXNlRW50ZXJIYW5kbGVyLCBmYWxzZSk7XG4gICAgdGhpcy5jYW52YXNFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIHRoaXMuX21vdXNlTGVhdmVIYW5kbGVyLCBmYWxzZSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgcHJpdmF0ZSBfY2hlY2tNb3VzZUluc2lkZShlOiBNb3VzZUV2ZW50fFRvdWNoRXZlbnQpOiBib29sZWFuIHtcbiAgICAvLyBUT0RPIGZpeCBidWcgaGVyZVxuICAgIGNvbnN0IHJlY3QgPSB0aGlzLmNhbnZhc0VsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgdGhpcy5sYXN0TW91c2VYID0gdGhpcy5tb3VzZVg7XG4gICAgdGhpcy5sYXN0TW91c2VZID0gdGhpcy5tb3VzZVk7XG4gICAgbGV0IGNsaWVudFg7XG4gICAgaWYgKHR5cGVvZiAoPE1vdXNlRXZlbnQ+ZSkuY2xpZW50WCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgY2xpZW50WCA9ICg8VG91Y2hFdmVudD5lKS50b3VjaGVzWzBdLmNsaWVudFg7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNsaWVudFggPSAoPE1vdXNlRXZlbnQ+ZSkuY2xpZW50WDtcbiAgICB9XG4gICAgbGV0IGNsaWVudFk7XG4gICAgaWYgKHR5cGVvZiAoPE1vdXNlRXZlbnQ+ZSkuY2xpZW50WSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgY2xpZW50WSA9ICg8VG91Y2hFdmVudD5lKS50b3VjaGVzWzBdLmNsaWVudFk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNsaWVudFkgPSAoPE1vdXNlRXZlbnQ+ZSkuY2xpZW50WTtcbiAgICB9XG4gICAgdGhpcy5tb3VzZVggPSBjbGllbnRYIC0gcmVjdC5sZWZ0O1xuICAgIHRoaXMubW91c2VZID0gY2xpZW50WSAtIHJlY3QudG9wO1xuICAgIHRoaXMubW91c2VPdmVyID0gdGhpcy5yZWdpb24uY29udGFpbnModGhpcy5tb3VzZVgsIHRoaXMubW91c2VZKTtcbiAgICBjb25zdCBsb2NhbFBvcyA9IHRoaXMucmVnaW9uLnRvTG9jYWwodGhpcy5tb3VzZVgsIHRoaXMubW91c2VZKTtcbiAgICB0aGlzLm1vdXNlTG9jYWxYID0gbG9jYWxQb3NbMF07XG4gICAgdGhpcy5tb3VzZUxvY2FsWSA9IGxvY2FsUG9zWzFdO1xuICAgIGNvbnN0IGRlYnVnID0gSlRocmVlQ29udGV4dC5nZXRDb250ZXh0Q29tcG9uZW50PERlYnVnZ2VyPihDb250ZXh0Q29tcG9uZW50cy5EZWJ1Z2dlcik7XG4gICAgZGVidWcuc2V0SW5mbyhgTW91c2VTdGF0ZToke3RoaXMubmFtZX0oJHt0aGlzLmdldFR5cGVOYW1lKCkgfSlgLCB7XG4gICAgICBtb3VzZU92ZXI6IHRoaXMubW91c2VPdmVyLFxuICAgICAgbW91c2VQb3NpdGlvblg6IHRoaXMubW91c2VYLFxuICAgICAgbW91c2VQb3NpdGlvblk6IHRoaXMubW91c2VZLFxuICAgICAgcmF3WDogdGhpcy5tb3VzZVgsXG4gICAgICByYXdZOiB0aGlzLm1vdXNlWVxuICAgIH0pO1xuICAgIHJldHVybiB0aGlzLm1vdXNlT3ZlcjtcbiAgfVxuXG5cbiAgICBwcml2YXRlIF9tb3VzZU1vdmVIYW5kbGVyKGU6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICAgIHRoaXMuX2NoZWNrTW91c2VJbnNpZGUoZSk7XG4gICAgICB0aGlzLmVtaXQoXCJtb3VzZS1tb3ZlXCIsIHtcbiAgICAgICAgZXZlbnRTb3VyY2U6IGUsXG4gICAgICAgIGVudGVyOiBmYWxzZSxcbiAgICAgICAgbGVhdmU6IGZhbHNlLFxuICAgICAgICBtb3VzZU92ZXI6IHRoaXMubW91c2VPdmVyLFxuICAgICAgICByZWdpb246IHRoaXMsXG4gICAgICAgIG1vdXNlWDogdGhpcy5tb3VzZVgsXG4gICAgICAgIG1vdXNlWTogdGhpcy5tb3VzZVksXG4gICAgICAgIG1vdXNlRG93blRyYWNraW5nOiB0aGlzLm1vdXNlRG93blRyYWNraW5nLFxuICAgICAgICB0cmFja0RpZmZYOiB0aGlzLm1vdXNlWCAtIHRoaXMubGFzdE1vdXNlRG93blgsXG4gICAgICAgIHRyYWNrRGlmZlk6IHRoaXMubW91c2VZIC0gdGhpcy5sYXN0TW91c2VEb3duWSxcbiAgICAgICAgZGlmZlg6IHRoaXMubW91c2VYIC0gdGhpcy5sYXN0TW91c2VYLFxuICAgICAgICBkaWZmWTogdGhpcy5tb3VzZVkgLSB0aGlzLmxhc3RNb3VzZVlcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgX21vdXNlTGVhdmVIYW5kbGVyKGU6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICAgIHRoaXMuX2NoZWNrTW91c2VJbnNpZGUoZSk7XG4gICAgICBpZiAodGhpcy5tb3VzZURvd25UcmFja2luZykge1xuICAgICAgICB0aGlzLm1vdXNlRG93blRyYWNraW5nID0gZmFsc2U7XG4gICAgICB9XG4gICAgICB0aGlzLmVtaXQoXCJtb3VzZS1sZWF2ZVwiLCB7XG4gICAgICAgIGV2ZW50U291cmNlOiBlLFxuICAgICAgICBlbnRlcjogZmFsc2UsXG4gICAgICAgIGxlYXZlOiB0cnVlLFxuICAgICAgICBtb3VzZU92ZXI6IHRoaXMubW91c2VPdmVyLFxuICAgICAgICBtb3VzZVg6IHRoaXMubW91c2VYLFxuICAgICAgICBtb3VzZVk6IHRoaXMubW91c2VZLFxuICAgICAgICByZWdpb246IHRoaXMsXG4gICAgICAgIGRpZmZYOiB0aGlzLm1vdXNlWCAtIHRoaXMubGFzdE1vdXNlWCxcbiAgICAgICAgZGlmZlk6IHRoaXMubW91c2VZIC0gdGhpcy5sYXN0TW91c2VZXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9tb3VzZUVudGVySGFuZGxlcihlOiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICB0aGlzLl9jaGVja01vdXNlSW5zaWRlKGUpO1xuICAgICAgdGhpcy5lbWl0KFwibW91c2UtZW50ZXJcIiwge1xuICAgICAgICBldmVudFNvdXJjZTogZSxcbiAgICAgICAgZW50ZXI6IHRydWUsXG4gICAgICAgIGxlYXZlOiBmYWxzZSxcbiAgICAgICAgbW91c2VPdmVyOiB0aGlzLm1vdXNlT3ZlcixcbiAgICAgICAgbW91c2VYOiB0aGlzLm1vdXNlWCxcbiAgICAgICAgbW91c2VZOiB0aGlzLm1vdXNlWSxcbiAgICAgICAgcmVnaW9uOiB0aGlzLFxuICAgICAgICBkaWZmWDogdGhpcy5tb3VzZVggLSB0aGlzLmxhc3RNb3VzZVgsXG4gICAgICAgIGRpZmZZOiB0aGlzLm1vdXNlWSAtIHRoaXMubGFzdE1vdXNlWVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfbW91c2VEb3duSGFuZGxlcihlOiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICB0aGlzLl9jaGVja01vdXNlSW5zaWRlKGUpO1xuICAgICAgaWYgKHRoaXMubW91c2VPdmVyKSB7XG4gICAgICAgIHRoaXMubW91c2VEb3duVHJhY2tpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLmxhc3RNb3VzZURvd25YID0gdGhpcy5tb3VzZVg7XG4gICAgICAgIHRoaXMubGFzdE1vdXNlRG93blkgPSB0aGlzLm1vdXNlWTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZW1pdChcIm1vdXNlLWRvd25cIiwge1xuICAgICAgICBlbnRlcjogZmFsc2UsXG4gICAgICAgIGxlYXZlOiBmYWxzZSxcbiAgICAgICAgbW91c2VPdmVyOiB0aGlzLm1vdXNlT3ZlcixcbiAgICAgICAgbW91c2VYOiB0aGlzLm1vdXNlWCxcbiAgICAgICAgbW91c2VZOiB0aGlzLm1vdXNlWSxcbiAgICAgICAgcmVnaW9uOiB0aGlzLFxuICAgICAgICBkaWZmWDogdGhpcy5tb3VzZVggLSB0aGlzLmxhc3RNb3VzZVgsXG4gICAgICAgIGRpZmZZOiB0aGlzLm1vdXNlWSAtIHRoaXMubGFzdE1vdXNlWVxuICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICBwcml2YXRlIF9tb3VzZVVwSGFuZGxlcihlOiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICB0aGlzLl9jaGVja01vdXNlSW5zaWRlKGUpO1xuICAgICAgaWYgKHRoaXMubW91c2VEb3duVHJhY2tpbmcpIHtcbiAgICAgICAgdGhpcy5tb3VzZURvd25UcmFja2luZyA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgdGhpcy5lbWl0KFwibW91c2UtdXBcIiwge1xuICAgICAgICBlbnRlcjogZmFsc2UsXG4gICAgICAgIGxlYXZlOiBmYWxzZSxcbiAgICAgICAgbW91c2VPdmVyOiB0aGlzLm1vdXNlT3ZlcixcbiAgICAgICAgbW91c2VYOiB0aGlzLm1vdXNlWCxcbiAgICAgICAgbW91c2VZOiB0aGlzLm1vdXNlWSxcbiAgICAgICAgcmVnaW9uOiB0aGlzLFxuICAgICAgICBtb3VzZURvd25UcmFja2luZzogdGhpcy5tb3VzZURvd25UcmFja2luZyxcbiAgICAgICAgdHJhY2tEaWZmWDogdGhpcy5tb3VzZVggLSB0aGlzLmxhc3RNb3VzZURvd25YLFxuICAgICAgICB0cmFja0RpZmZZOiB0aGlzLm1vdXNlWSAtIHRoaXMubGFzdE1vdXNlRG93blksXG4gICAgICAgIGRpZmZYOiB0aGlzLm1vdXNlWCAtIHRoaXMubGFzdE1vdXNlWCxcbiAgICAgICAgZGlmZlk6IHRoaXMubW91c2VZIC0gdGhpcy5sYXN0TW91c2VZXG4gICAgICB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENhbnZhc1JlZ2lvbjtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==