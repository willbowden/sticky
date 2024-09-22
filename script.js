class Notes {

  constructor(containerClass) {
    this._containerClass = containerClass;
    this._dragging = false;
    this._saveTimer = undefined;


    let container = document.querySelector(this._containerClass);
    container.addEventListener("mousedown", this.handleDrag.bind(this));

    document.querySelector(".add-button").addEventListener("click", this.createNote.bind(this));

    this.loadState();
    this.populateNotes();
  }

  populateNotes() {
    if (this._drawingOrder && this._drawingOrder.length > 0) {
      for (let id of this._drawingOrder) {
        this.renderNote(id, this._notes[id])
      }
    } else {
      for (let [id, note] of Object.entries(this._notes)) {
        this.renderNote(id, note);
      }
    }
  }

  renderNote(id, note) {
    let container = document.querySelector(this._containerClass);

    let noteElem = document.createElement("div");

    noteElem.classList.add("note");
    noteElem.innerHTML = `
      <textarea class="note-text" id="${id}" name="Note ${id}" placeholder="Type something...">${note.content}</textarea>`;

    noteElem.id = id;

    noteElem.style.left = note.x + "px";
    noteElem.style.top = note.y + "px";

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

    const noteWidth = parseInt(getComputedStyle(document.body)["font-size"]) * 20;
    
    let note = {
      content: "",
      x: parseInt(Math.random() * (document.documentElement.clientWidth - noteWidth)),
      y: parseInt(Math.random() * (document.documentElement.clientHeight - noteWidth)),
    }

    this._notes[id] = note;
    this.moveToTop(id);

    this.saveState();

    this.renderNote(id, note);
  }

  loadState() {
    const notes = JSON.parse(localStorage.getItem("notes"));
    const drawingOrder = JSON.parse(localStorage.getItem("drawingOrder"));
    this._notes = notes || {};
    this._drawingOrder = drawingOrder || (notes && Object.keys(notes)) || [];
  }

  saveState() {
    // Only run the save op once in a while to prevent issues
    clearTimeout(this._saveTimer);
    setTimeout(() => {
      localStorage.setItem("notes", JSON.stringify(this._notes));
      localStorage.setItem("drawingOrder", JSON.stringify(this._drawingOrder));
    }, 50);
  }

  moveToTop(id) {
    id = id.toString();
    const newOrder = [...this._drawingOrder.filter((item) => item !== id), id];
    this._drawingOrder = newOrder;
  }

  handleDrag(event) {
    if (this._dragging) return;

    let target = event.target.closest("div.note");

    if (!target) return;

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

}

document.addEventListener('DOMContentLoaded', function () {
  const n = new Notes(".notespace");
}, false);