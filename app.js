'use strict';


// 定数宣言
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const errorEl = document.getElementById('todo-error');
const filterButtons = document.querySelectorAll('.filter-button');
let currentFilter = 'all';

// エラーメッセージ出力
function setError(message) {
    if (!errorEl) return;
    errorEl.textContent = message;
}

// エラーメッセーのクリア
function clearError() {
    setError('');
}


let nextId = 1;
/** @type {{id:number, text:string, done:boolean} []} */
let todos = [];

//  ??? 
const STORAGE_KEY = 'miniTodo.v1';

// 状態の保持
function saveState() {
    const state = { nextId, todos };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}


// 状態の読み込み
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

// タスク名の入力に対するエスケープ処理 
function escapeHtml(str) {
    return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// 登録したタスクをフィルターする
function getFilteredTodos() {
    if (currentFilter === 'active') {
        return todos.filter(t => !t.done);
    }
    if (currentFilter === 'done') {
        return todos.filter(t => t.done);
    }
    return todos;
}

// タスクの表示処理
function render() {
    list.innerHTML = getFilteredTodos().map(t => {
        const doneClass = t.done ? 'is-done' : '';
        return `
            <li class="todo-item ${doneClass}" data-id="${t.id}">
                <span class="todo-text">${escapeHtml(t.text)}</span>
                <button class="todo-delete" type="button">削除</button>
            </li>
        `;
    }).join('');
}

// 画面表示処理
// index.htmlを開いた際に最初に表示させる
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const text = input.value.trim();
    if (!text) {
        setError('タスクを入力してください。');
        input.focus();
        return;
    }

    clearError();

    todos.push({ id: nextId++, text, done: false });
    input.value = '';
    input.focus();
    saveState();
    render();
});

// クリックイベント発生時の処理
// 追加ボタン押下なら、タスクの追加
// 削除ボタン押下なら、タスクの削除
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

// フィルタ機能
// 全選択、全解除、単体選択
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        currentFilter = button.dataset.filter || 'all';

        filterButtons.forEach(btn => {
            btn.classList.remove('is-active');
        });

        button.classList.add('is-active');
        render();
    });
});

loadState();
render();