'use strict;'
console.log("app.js loaded");

const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');

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
    list.innerHTML = todos
        .map(t => `<li>${escapeHtml(t)}</li>`)
        .join('');
}

form.addEventListener('submit', (e) => {
    console.log("submit fired");
    e.preventDefault();

    const text = input.value.trim();
    if (!text) return;

    todos.push(text);
    input.value = '';
    input.focus();
    render();
});

render();

