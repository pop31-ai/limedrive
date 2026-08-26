export class HistoryManager {
  constructor(maxSteps = 50) {
    this.states = [];
    this.index = -1;
    this.maxSteps = maxSteps;
  }

  saveState(canvas) {
    const data = canvas.toDataURL();
    if (this.index < this.states.length - 1) {
      this.states = this.states.slice(0, this.index + 1);
    }
    this.states.push(data);
    if (this.states.length > this.maxSteps) {
      this.states.shift();
    }
    this.index = this.states.length - 1;
  }

  undo(canvas) {
    if (this.index > 0) {
      this.index--;
      this.restore(canvas);
      return true;
    }
    return false;
  }

  redo(canvas) {
    if (this.index < this.states.length - 1) {
      this.index++;
      this.restore(canvas);
      return true;
    }
    return false;
  }

  restore(canvas) {
    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = this.states[this.index];
  }

  canUndo() { return this.index > 0; }
  canRedo() { return this.index < this.states.length - 1; }

  clear() {
    this.states = [];
    this.index = -1;
  }
}
