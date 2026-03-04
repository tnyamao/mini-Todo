'use strict;'

const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');

let nextId = 1;
/** @type {{id:number, text:string, done:boolean} []} **/
let todos = [];

const STORAGE_KEY = 'miniTodo.v1';

function saveState() {
    const state = { nextId, todos };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
        const state = JSON.parse(raw);

        if (typeof state?.nextId === 'number' && Array.isArray(state?.todos)) {
            nextId = state.nextId;
            todos = state.todos;
        }
    } catch {

    }
}

function escapeHtml(str) {
    return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function render() {
    list.innerHTML = todos.map(t => {
        const doneClass = t.done ? 'is-done' : '';
        return `
            <li class="todo-item ${doneClass}" data-id="${t.id}">
                <span class="todo-text">${escapeHtml(t.text)}</span>
                <button class="todo-delete" type="button">削除</button>
            </li>
        `;
    }).join('');
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    todos.push({ id: nextId++, text, done: false });

    saveState();
    render();

    input.value = '';
    input.focus();

});

list.addEventListener('click', (e) => {
    if (!(e.target instanceof Element)) {
        return;
    }
    const li = e.target.closest('li.todo-item');
    if (!li) return;
    const id = Number(li.dataset.id);
    if (Number.isNaN(id)) return;

    if (e.target.closest('button.todo-delete')) {
        todos = todos.filter(x => x.id !== id);

        saveState();
        render();
        return;
    }

    if (e.target.closest('.todo-text')) {
        const t = todos.find(x => x.id === id);
        if (!t) return;
        t.done = !t.done;

        saveState();
        render();
    }
});

loadState();
render();