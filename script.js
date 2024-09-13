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
}

document.addEventListener('DOMContentLoaded', function() {
  const n = new Notes(".notespace");
}, false);