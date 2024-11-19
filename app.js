const headerContainer = document.querySelector("#Title-container");
const mainContainer = document.querySelector(".Main-Container");
const reader = document.querySelector("#Reader");

// Drag reader element with mouse interaction
let positionX = 0;
let positionY = 0;
let startPositionX = 0;
let startPositionY = 0;

mainContainer.addEventListener("mousedown", (e) => {
  startPositionX = e.clientX;
  startPositionY = e.clientY;

  mainContainer.addEventListener("mousemove", mouseMove);
  mainContainer.addEventListener("mouseup", mouseUp);
});

function mouseMove(e) {
  positionX = startPositionX - e.clientX;
  positionY = startPositionY - e.clientY;

  startPositionX = e.clientX;
  startPositionY = e.clientY;

  reader.style.top = `${reader.offsetTop - positionY}px`;
  reader.style.left = `${reader.offsetLeft - positionX}px`;
}

function mouseUp() {
  mainContainer.removeEventListener("mousemove", mouseMove);
}

function buildHeader() {
  // Make a title
  const title = document.createElement("h1");
  title.classList.add("title");
  title.textContent = "Book Truck";
  const underTitle = document.createElement("p");
  underTitle.classList.add("under-title");
  underTitle.textContent = "Smoothly track your favorite books!";
  // make a image with music
  const image = document.createElement("img");
  image.src = "/Images/Book5.jpg";
  image.classList.add("image");
  // make new object with Audio
  const audio = new Audio("/Audio/Chopin.mp3");
  image.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  });
  // Appending all to header
  headerContainer.append(title, underTitle, image);
}

buildHeader();

const booksForm = document.querySelector("#books-form");
const userInput = document.querySelector("#user-input");
const listContainer = document.querySelector("#List-Container");
const booksRead = document.querySelector("#books-read");
const sortBy = document.querySelector("#sort-by");

let books = [];

// Load data from localStorage
booksRead.checked = localStorage.getItem("booksRead");
sortBy.value = localStorage.getItem("sortBy");
const storedBooks = localStorage.getItem("books");
if (storedBooks) {
  books = JSON.parse(storedBooks);
  renderList(books);
}

booksForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(booksForm);

  if (!formData.get("user-input")) {
    showError("You can't go in");
    return;
  }
  books.push({
    timeStamp: new Date().toLocaleString("en-UK"),
    description: formData.get("user-input"),
    completed: false,
  });
  renderList(books);
});

booksRead.addEventListener("change", () => {
  renderList(books);
});

sortBy.addEventListener("change", () => {
  renderList(books);
});

function renderList(book) {
  // Clear local storage if books array is empty
  if (book.length === 0) {
    localStorage.removeItem("books");
    localStorage.removeItem("booksRead");
    localStorage.removeItem("sortBy");
  }
  buildList(filterAndSort(book));
  saveStateToLocalStorage();
}

function filterAndSort(arr) {
  return arr
    .filter((e) => (!booksRead.checked ? !e.completed : e))
    .sort((a, b) => {
      if (sortBy.value === "time-asc") {
        return new Date(a.timeStamp) - new Date(b.timeStamp);
      } else if (sortBy.value === "time-desc") {
        return new Date(b.timeStamp) - new Date(a.timeStamp);
      } else if (sortBy.value === "alpha-asc") {
        return b.description.localeCompare(a.description);
      } else if (sortBy.value === "alpha-desc") {
        return a.description.localeCompare(b.description);
      }
    });
}

function buildList(book) {
  // Empty list
  while (listContainer.firstChild) {
    listContainer.firstChild.remove();
  }
  book.forEach((read, i) => {
    // make the book list container
    const booksContainer = document.createElement("div");
    booksContainer.classList.add("books-container");
    // Make the timestamp
    const timeElem = document.createElement("p");
    timeElem.classList.add("timestamp");
    timeElem.textContent = read.timeStamp;
    // Make the book desription
    const descriptionElem = document.createElement("input");
    descriptionElem.classList.add("description");
    descriptionElem.value = read.description;
    descriptionElem.readOnly = true;
    // Add read-completed checkbox
    const completedElem = document.createElement("input");
    completedElem.type = "checkbox";
    completedElem.checked = read.completed;
    if (read.completed) {
      booksContainer.classList.add("completed");
    }

    // Update the books array and add/remove the completed CSS
    completedElem.addEventListener("change", () => {
      books[i].completed = completedElem.checked;
      saveStateToLocalStorage();
      if (read.completed) {
        booksContainer.classList.add("completed");
      } else {
        booksContainer.classList.remove("completed");
      }
    });

    // Add edit-button
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.classList.add("edit-button");
    editButton.addEventListener("click", () => {
      books[i].description = descriptionElem.value;
      descriptionElem.readOnly = !descriptionElem.readOnly;
      editButton.textContent = descriptionElem.readOnly ? "Edit" : " Save";
      if (!descriptionElem.readOnly) descriptionElem.focus();
      saveStateToLocalStorage();
    });
    // Add delete-button
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("delete-button");
    deleteButton.addEventListener("click", () => {
      books.splice(i, 1);
      renderList(books);
    });

    // Appending
    booksContainer.append(
      timeElem,
      descriptionElem,
      completedElem,
      editButton,
      deleteButton
    );
    listContainer.prepend(booksContainer);
  });
}

function saveStateToLocalStorage() {
  // Serialize books" array to JSON before storing to local storage
  localStorage.setItem("books", JSON.stringify(books));
  // Store boolean value of booksRead
  localStorage.setItem("booksRead", booksRead.checked);
  // Store boolean value of sortby
  localStorage.setItem("sortBy", sortBy.value);
}
