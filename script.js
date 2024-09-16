class Notes {

  constructor(containerClass) {
    this._containerClass = containerClass;

    this._dragging = false;

    let container = document.querySelector(this._containerClass);
    container.addEventListener("mousedown", this.handleDrag.bind(this));

    this.loadState();
    this.populateNotes();
  }

  populateNotes() {
    for (let [id, note] of Object.entries(this.notes)) {
      this.createNote(id, note);
    }
  }

  createNote(id, note) {
    let container = document.querySelector(this._containerClass);

    let noteElem = document.createElement("div");

    noteElem.classList.add("note");
    noteElem.innerHTML = `
      <textarea class="note-text" id="${id}" name="Note ${id}" placeholder="Type something...">${note.content}</textarea>`;

    noteElem.id = id;

    noteElem.style.left = note.x + "px";
    noteElem.style.top = note.y + "px";

    let timer;

    noteElem.oninput = (event) => {
      clearTimeout(timer);
      this.notes[id].content = event.target.value;
      timer = setTimeout(this.saveState.bind(this), 1000);
    }

    container.append(noteElem);
  }

  loadState() {
    const notes = JSON.parse(localStorage.getItem("notes"));
    this.notes = notes;
  }

  saveState() {
    localStorage.setItem("notes", JSON.stringify(this.notes));
  }

  handleDrag(event) {
    if (this._dragging) return;

    let target = event.target.closest("div.note");

    if (!target) return;

    this._dragging = true;

    let offsetX = event.clientX - target.offsetLeft;
    let offsetY = event.clientY - target.offsetTop;

    const onMouseMove = (event) => {
      if (!this._dragging) return;

      event.preventDefault();

      target.style.left = event.clientX - offsetX + "px";
      target.style.top = event.clientY - offsetY + "px";

    }

    const onMouseUp = () => {
      if (!this._dragging) return;

      this._dragging = false;

      this.notes[target.id].x = parseInt(target.style.left);
      this.notes[target.id].y = parseInt(target.style.top);

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