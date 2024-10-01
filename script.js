class Notes {

  constructor(containerClass) {
    this._containerClass = containerClass;
    this._panning = false;
    this._dragging = false;
    this._saveTimer = undefined;
    this._offset = undefined;
    this._zoom = 100;


    let container = document.querySelector(this._containerClass);
    container.addEventListener("mousedown", this.onMouseDown.bind(this));
    container.addEventListener("wheel", this.onWheelMove.bind(this));

    document.querySelector(".add-button").addEventListener("click", this.createNote.bind(this));

    this.loadState();
    this.render();
  }

  render() {
    const section = document.querySelector(".notespace");
    section.innerHTML = "";

    if (this._drawingOrder && this._drawingOrder.length > 0) {
      for (let id of this._drawingOrder) {
        this.drawNote(id, this._notes[id])
      }
    } else {
      for (let [id, note] of Object.entries(this._notes)) {
        this.drawNote(id, note);
      }
    }
  }

  get noteWidth() {
    const defaultWidth = parseInt(getComputedStyle(document.body)["font-size"]) * 20;
    return defaultWidth * this._zoom / 100;
  }

  drawNote(id, note) {
    let container = document.querySelector(this._containerClass);

    let noteElem = document.createElement("div");

    noteElem.classList.add("note");
    noteElem.innerHTML = `
      <textarea class="note-text" id="${id}" name="Note ${id}" placeholder="Type something...">${note.content}</textarea>`;

    noteElem.id = id;

    noteElem.style.width = this.noteWidth + "px";
    noteElem.style.height = this.noteWidth + "px";
    noteElem.style.padding = this.noteWidth / 10;


    noteElem.style.left = this._offset.x + note.x + "px";
    noteElem.style.top = this._offset.y + note.y + "px";

    noteElem.oninput = (event) => {
      this._notes[id].content = event.target.value;
      this.saveState();
    }

    container.append(noteElem);
  }

  createNote() {
    let id;

    if (Object.keys(this._notes).length <= 0) { id = 1 }
    else { id = parseInt(Object.keys(this._notes).at(-1)) + 1; }

    let note = {
      content: "",
      x: parseInt(Math.random() * (document.documentElement.clientWidth - this.noteWidth)),
      y: parseInt(Math.random() * (document.documentElement.clientHeight - this.noteWidth)),
    }

    this._notes[id] = note;
    this.moveToTop(id);

    this.saveState();

    this.drawNote(id, note);
  }

  loadState() {
    const notes = JSON.parse(localStorage.getItem("notes"));
    const drawingOrder = JSON.parse(localStorage.getItem("drawingOrder"));
    const offset = JSON.parse(localStorage.getItem("offset"))
    const zoom = JSON.parse(localStorage.getItem("zoom"));

    this._notes = notes || {};
    this._drawingOrder = notes ? (drawingOrder || (notes && Object.keys(notes)) || []) : [];
    this._offset = offset || { x: 0, y: 0 };
    this._zoom = zoom || 100;

    this.saveState();
  }

  saveState() {
    // Only run the save op once in a while to prevent issues
    clearTimeout(this._saveTimer);
    setTimeout(() => {
      localStorage.setItem("notes", JSON.stringify(this._notes));
      localStorage.setItem("drawingOrder", JSON.stringify(this._drawingOrder));
      localStorage.setItem("offset", JSON.stringify(this._offset));
      localStorage.setItem("zoom", JSON.stringify(this._zoom));
    }, 50);
  }

  moveToTop(id) {
    id = id.toString();
    const newOrder = [...this._drawingOrder.filter((item) => item !== id), id];
    this._drawingOrder = newOrder;
  }

  handleDrag(event) {
    const target = event.target.closest("div.note");

    this._dragging = true;

    let offsetX = event.clientX - target.offsetLeft;
    let offsetY = event.clientY - target.offsetTop;

    // Move note to end of html element to make it render on top of others
    document.querySelector(this._containerClass).append(target);

    const onMouseMove = (event) => {
      if (!this._dragging) return;

      event.preventDefault();

      target.style.left = event.clientX - offsetX + "px";
      target.style.top = event.clientY - offsetY + "px";

    }

    const onMouseUp = () => {
      if (!this._dragging) return;

      this._dragging = false;

      this._notes[target.id].x = parseInt(target.style.left);
      this._notes[target.id].y = parseInt(target.style.top);

      this.moveToTop(target.id);
      this.saveState();

      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("selectstart", () => false);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("selectstart", () => false);
  }

  handlePan(event) {
    this._panning = true;

    let offsetX = event.clientX - this._offset.x;
    let offsetY = event.clientY - this._offset.y;

    const onMouseMove = (event) => {
      if (!this._panning) return;

      event.preventDefault();

      let newX = event.clientX - offsetX;
      let newY = event.clientY - offsetY;

      this._offset.x = newX;
      this._offset.y = newY;

      this.render();
      this.saveState();
    }

    const onMouseUp = () => {
      if (!this._panning) return;

      this._panning = false;

      this.saveState();

      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  onMouseDown(event) {
    if (this._dragging || this._panning) return;

    if (event.target == document.querySelector(".notespace")) {
      this.handlePan(event);
    } else {
      let target = event.target.closest("div.note");

      if (!target) return;

      this.handleDrag(event);
    }
  }

  onWheelMove(event) {
  
    this._zoom = parseInt(this._zoom + event.deltaY / 10);

    this._zoom = Math.min(Math.max(1, this._zoom), 250);

    this.saveState();
    this.render();
  }

}

document.addEventListener('DOMContentLoaded', function () {
  const n = new Notes(".notespace");
}, false);