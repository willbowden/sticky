class Notes {

  constructor(containerClass) {
    this._containerClass = containerClass;
    this.notes = {
      "1": {
        content: "This is a test note",
        x: 150,
        y: 50,
      }
    };
    this._dragging = false;

    let container = document.querySelector(this._containerClass);
    container.addEventListener("mousedown", this.handleDrag.bind(this));

    this.populateNotes();
  }

  populateNotes() {
    let container = document.querySelector(this._containerClass);

    console.log(container);

    for (let [, note] of Object.entries(this.notes)) {
      let noteElem = document.createElement("div");
      noteElem.classList.add("note");
      noteElem.innerHTML = `${note.content}`;
      noteElem.style.left = note.x + "px";
      noteElem.style.top = note.y + "px";

      container.append(noteElem);
    }
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

      target.style.left = event.clientX - offsetX + "px";
      target.style.top = event.clientY - offsetY + "px";

    }

    const onMouseUp = () => {
      if (!this._dragging) return;

      this._dragging = false;

      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

}

document.addEventListener('DOMContentLoaded', function () {
  const n = new Notes(".notespace");
}, false);