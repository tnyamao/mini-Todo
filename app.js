'use strict;'
console.log("app.js loaded");

const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');

let nextId = 1;
/** @type {{id:number, text:string, done:boolean} []} **/
let todos = [];

function escapeHtml(str) {
    return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function render() {
    list.innerHTML = todos.map(t => {
        const doneClass = t.done ? 'is-done' : '';
        return `<li class="${doneClass}" data-id="${t.id}">${escapeHtml(t.text)}</li>`;
    }).join('');
};

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    todos.push({ id: nextId++, text, done: false});
    input.value = '';
    input.focus();
    render();
});

list.addEventListener('click', (e) => {
    const li = e.target.closest('li');

    if (!(e.target instanceof Element)) {
        return;
    }

    const id = Number(li.dataset.id);

    const t = todos.find(x => x.id === id);

    if (!li) return;

    t.done = !t.done;
    render();
});

render();

