const API_URL = "https://jsonplaceholder.typicode.com/posts";
const MAX_TITLE = 100;

const loadBtn = document.getElementById("load-btn");
const form = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitBtn = document.getElementById("submit-btn");
const statusEl = document.getElementById("status");
const listEl = document.getElementById("notes-list");

/*
 * JSONPlaceholder fakes writes: POST returns a new id (always 101) and DELETE
 * returns 200, but nothing is stored and a later GET never shows our changes.
 * Approach: the server response is used to confirm success, and the page keeps
 * its own in-memory array `notes` as the source of truth for what is displayed.
 * Because the fake API returns id 101 every time, each note also gets a unique
 * client-side `uid` so several created notes can be told apart and removed.
 * Deleting still sends DELETE /posts/{id}; on success we remove the note locally.
 */
let notes = [];
let uidCounter = 0;
let busy = false;

function setStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = type || "";
}

function setBusy(value) {
  busy = value;
  loadBtn.disabled = value;
  submitBtn.disabled = value;
  listEl.querySelectorAll("button").forEach((b) => (b.disabled = value));
}

// Reusable request helper: fetch, check response.ok, throw on errors.
async function request(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function getNotes() {
  const data = await request(`${API_URL}?_limit=10`);
  return data.map((n) => ({ uid: ++uidCounter, id: n.id, title: n.title, body: n.body }));
}

async function createNote(title, body) {
  const created = await request(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify({ title, body, userId: 1 }),
  });
  return { uid: ++uidCounter, id: created.id, title, body };
}

async function deleteNote(id) {
  await request(`${API_URL}/${id}`, { method: "DELETE" });
}

function render() {
  listEl.replaceChildren();
  if (notes.length === 0) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "No notes yet. Load notes or add one.";
    listEl.append(li);
    return;
  }
  for (const note of notes) {
    const li = document.createElement("li");
    const text = document.createElement("div");
    const h3 = document.createElement("h3");
    const p = document.createElement("p");
    h3.textContent = note.title; // user text: textContent only
    p.textContent = note.body;
    text.append(h3, p);

    const del = document.createElement("button");
    del.type = "button";
    del.className = "delete-btn";
    del.textContent = "Delete";
    del.addEventListener("click", () => handleDelete(note));
    li.append(text, del);
    listEl.append(li);
  }
}

async function handleLoad() {
  if (busy) return;
  setBusy(true);
  setStatus("Loading notes...", "loading");
  try {
    notes = await getNotes();
    render();
    setStatus(notes.length ? `Loaded ${notes.length} notes.` : "No notes found.", "success");
  } catch (err) {
    setStatus(`Could not load notes. ${err.message}`, "error");
  } finally {
    setBusy(false);
  }
}

async function handleSubmit(event) {
  event.preventDefault();
  if (busy) return;
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();
  if (!title) return setStatus("A title is required.", "error");
  if (title.length > MAX_TITLE) {
    return setStatus(`Title must be at most ${MAX_TITLE} characters.`, "error");
  }
  setBusy(true);
  setStatus("Saving note...", "loading");
  try {
    const note = await createNote(title, body);
    notes.unshift(note);
    render();
    form.reset();
    setStatus("Note created. (JSONPlaceholder does not store it, so it lives on this page only.)", "success");
  } catch (err) {
    setStatus(`Could not create note. ${err.message}`, "error");
  } finally {
    setBusy(false);
  }
}

async function handleDelete(note) {
  if (busy) return;
  setBusy(true);
  setStatus("Deleting note...", "loading");
  try {
    await deleteNote(note.id);
    notes = notes.filter((n) => n.uid !== note.uid);
    render();
    setStatus("Note deleted.", "success");
  } catch (err) {
    setStatus(`Could not delete note. ${err.message}`, "error");
  } finally {
    setBusy(false);
  }
}

loadBtn.addEventListener("click", handleLoad);
form.addEventListener("submit", handleSubmit);
render();
