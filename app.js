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
        return `
            <li class="todo-item ${doneClass}" data-id="${t.id}" >
                <span class="todo-text">${escapeHtml(t.text)}</span>
                <button class="todo-delete" type="button">削除</button>
            </li>
        `;
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
    if (!(e.target instanceof Element)) {
        return;
    }
    const li = e.target.closest('li.todo-item');
    if (!li) return;
    const id = Number(li.dataset.id);
    if (Number.isNaN(id)) return;

    if (e.target.closest('button.todo-delete')) {
        todos = todos.filter(x => x.id !== id);
        render();
        return;
    }

    if (e.target.closest('.todo-text')) {
        const t = todos.find(x => x.id === id);

    
        if(!t) return;
        t.done = !t.done;
        render();
    }
    
    render();
});

render();

