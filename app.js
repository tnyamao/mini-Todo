'use strict';

// DOM要素の取得
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const errorEl = document.getElementById('todo-error');
const filterButtons = document.querySelectorAll('.filter-button');

// 登録用日付入力欄
const todoDateInput = document.getElementById('todo-date');

// 表示用日付入力欄
const filterDateInput = document.getElementById('filter-date');
const prevDateButton = document.getElementById('prev-date-button');
const nextDateButton = document.getElementById('next-date-button');

// 現在の状態フィルタ
let currentFilter = 'all';

// エラーメッセージを表示
function setError(message) {
    if (!errorEl) return;
    errorEl.textContent = message;
}

// エラーメッセーのクリア
function clearError() {
    setError('');
}

let nextId = 1;

/** @type {{id:number, text:string, done:boolean, date:string}[]} */
let todos = [];

// LocalStorageに保存するときのキー
const STORAGE_KEY = 'miniTodo.v1';

// 状態をLocalStorageへ保存
function saveState() {
    const state = { nextId, todos };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// 保存して再描画
function updateApp() {
    saveState();
    render();
}

// LocalStorageから状態読み込み
function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
        const state = JSON.parse(raw);

        if (typeof state?.nextId === 'number' && Array.isArray(state?.todos)) {
            nextId = state.nextId;
            todos = state.todos;
        }
    } catch (error) {
        console.error('状態の読み込みに失敗しました。', error);
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

// 現在の条件でTodoを絞り込む
function getFilteredTodos() {
    let filtered = todos;

    // 表示用日付で絞り込む
    const selectedDate = filterDateInput.value;
    if (selectedDate) {
        filtered = filtered.filter((t) => t.date === selectedDate);
    }

    // 状態で絞り込む
    if (currentFilter === 'active') {
        filtered = filtered.filter((t) => !t.done);
    } else if (currentFilter === 'done') {
        filtered = filtered.filter((t) => t.done);
    }

    return filtered;
}

// タスクの表示処理(Todo一覧を描画)
function render() {
    list.innerHTML = getFilteredTodos()
        .map((t) => {
            const doneClass = t.done ? 'is-done' : '';

            return `
                <li class="todo-item ${doneClass}" data-id="${t.id}">
                    <span class="todo-text">${escapeHtml(t.text)}</span>
                    <span class="todo-date">${escapeHtml(t.date)}</span>
                    <button class="todo-delete" type="button">削除</button>
                </li>
            `;
        })
        .join('');
}

// 今日の日付を yyyy-mm-dd 形式で返す
function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 指定した日付文字列を1日ずらして返す
function moveDate(dateString, diffDays) {
    const date = new Date(dateString);
    date.setDate(date.getDate() + diffDays);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


// フォーム送信時の処理
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const text = input.value.trim();

    // 未入力ならエラー
    if (!text) {
        setError('タスクを入力してください。');
        input.focus();
        return;
    }

    clearError();

    // Todoを追加
    todos.push({
        id: nextId++,
        text,
        done: false,
        date: todoDateInput.value || getTodayString(),
    });

    // 入力欄をクリア
    input.value = '';
    input.focus();

    updateApp();
});

// Todo一覧クリック時の処理
list.addEventListener('click', (e) => {
    if (!(e.target instanceof Element)) return;

    const li = e.target.closest('li.todo-item');
    if (!li) return;

    const id = Number(li.dataset.id);
    if (Number.isNaN(id)) return;

    // 削除ボタンが押された場合
    if (e.target.closest('button.todo-delete')) {
        todos = todos.filter((x) => x.id !== id);
        updateApp();
        return;
    }

    // タスク文字を押したら完了切替
    if (e.target.closest('.todo-text')) {
        const todo = todos.find((x) => x.id === id);
        if (!todo) return;

        todo.done = !todo.done;
        updateApp();
    }
});

// 状態フィルタボタンの処理
filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
        currentFilter = button.dataset.filter || 'all';

        filterButtons.forEach((btn) => {
            btn.classList.remove('is-active');
        });

        button.classList.add('is-active');
        render();
    });
});

// 表示用日付を変更したら再描画
filterDateInput.addEventListener('change', () => {
    render();
});

// 前日ボタンを押したら表示を1日戻す
prevDateButton.addEventListener('click', () => {
    const currentDate = filterDateInput.value || getTodayString();
    filterDateInput.value = moveDate(currentDate, -1);
    render();
});

// 翌日ボタンを押したら表示日を1日進める
nextDateButton.addEventListener('click', () => {
    const currentDate = filterDateInput.value || getTodayString();
    filterDateInput.value = moveDate(currentDate, 1);
    render();  
});




// 保存済みデータを読み込む
loadState();

// 初期値として今日の日付を入れる
const today = getTodayString();
todoDateInput.value = today;
filterDateInput.value = today;

// 初回描画
render();