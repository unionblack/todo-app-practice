const test = require('tape');
const app = require('../lib/todo-app.js');

// Вспомогательная функция для тестов: имитирует signal
function mockSignal() {
  return function() { return function() {}; };
}

// ===== ТЕСТЫ ДЛЯ МОДЕЛИ =====
test('todo `model` (Object) has desired keys', function (t) {
  const keys = Object.keys(app.model);
  t.deepEqual(keys, ['todos', 'hash'], "`todos` and `hash` keys are present.");
  t.true(Array.isArray(app.model.todos), "model.todos is an Array");
  t.end();
});

// ===== ТЕСТЫ ДЛЯ UPDATE =====
test('todo `update` default case should return model unmodified', function (t) {
  const model = JSON.parse(JSON.stringify(app.model));
  const unmodified_model = app.update('UNKNOWN_ACTION', model);
  t.deepEqual(model, unmodified_model, "model returned unmodified");
  t.end();
});

test('`ADD` a new todo item to model.todos Array via `update`', function (t) {
  const model = JSON.parse(JSON.stringify(app.model));
  t.equal(model.todos.length, 0, "initial model.todos.length is 0");
  
  const updated_model = app.update('ADD', model, "Изучить TDD");
  
  t.equal(updated_model.todos.length, 1, "updated_model.todos.length is 1");
  t.ok(updated_model.todos[0].createdAt, 'поле createdAt существует');
  t.equal(updated_model.todos[0].title, "Изучить TDD", "задача добавлена корректно");
  t.equal(updated_model.todos[0].done, false, "новая задача не выполнена");
  t.end();
});

test('`TOGGLE` a todo item from done=false to done=true', function (t) {
  const model = JSON.parse(JSON.stringify(app.model));
  const model_with_todo = app.update('ADD', model, "Переключить статус");
  const item = model_with_todo.todos[0];
  
  const model_todo_done = app.update('TOGGLE', model_with_todo, item.id);
  
  t.equal(model_todo_done.todos[0].done, true, "статус задачи переключён на true");
  t.ok(model_todo_done.todos[0].createdAt, 'поле createdAt сохранено');
  t.end();
});

test('`TOGGLE` (undo) a todo item from done=true to done=false', function (t) {
  const model = JSON.parse(JSON.stringify(app.model));
  const model_with_todo = app.update('ADD', model, "Переключить статус");
  const item = model_with_todo.todos[0];
  
  // Включаем (done: true)
  const model_todo_done = app.update('TOGGLE', model_with_todo, item.id);
  t.equal(model_todo_done.todos[0].done, true, "задача отмечена как выполненная");
  
  // Выключаем обратно (done: false)
  const model_todo_undone = app.update('TOGGLE', model_todo_done, item.id);
  t.equal(model_todo_undone.todos[0].done, false, "задача снова активна");
  t.ok(model_todo_undone.todos[0].createdAt, 'поле createdAt сохранено');
  t.end();
});

// ===== ТЕСТЫ ДЛЯ RENDER =====
test('render_item HTML for a single Todo Item', function (t) {
  const model = {
    todos: [
      { id: 1, title: "Изучить TDD", done: true, createdAt: new Date().toISOString() }
    ],
    hash: '#/'
  };

  const root = document.getElementById('test-app');
  root.innerHTML = '';
  root.appendChild(app.render_item(model.todos[0], model, mockSignal()));

  // Проверяем, что задача отображается с правильным текстом
  const label = document.querySelector('label');
  t.ok(label.textContent.includes('Изучить TDD'), 'текст задачи отображается');

  // Проверяем, что чекбокс отмечен (done: true)
  const checkbox = document.querySelector('input[type="checkbox"]');
  t.equal(checkbox.checked, true, 'задача отмечена как выполненная');

  t.end();
});

test('render "main" view using (elmish) HTML DOM functions', function (t) {
  const model = {
    todos: [
      { id: 1, title: "Изучить TDD", done: true, createdAt: new Date().toISOString() },
      { id: 2, title: "Собрать проект", done: false, createdAt: new Date().toISOString() },
      { id: 3, title: "Написать отчёт", done: false, createdAt: new Date().toISOString() }
    ],
    hash: '#/'
  };

  const root = document.getElementById('test-app');
  root.innerHTML = '';
  root.appendChild(app.render_main(model, mockSignal()));

  // Проверяем, что все три задачи отображаются
  const items = document.querySelectorAll('.view');
  t.equal(items.length, 3, 'отображаются все три задачи');

  // Проверяем текст каждой задачи
  const labels = document.querySelectorAll('.view label');
  t.ok(labels[0].textContent.includes('Изучить TDD'), 'первая задача');
  t.ok(labels[1].textContent.includes('Собрать проект'), 'вторая задача');
  t.ok(labels[2].textContent.includes('Написать отчёт'), 'третья задача');

  t.end();
});

test('render_footer view using (elmish) HTML DOM functions', function (t) {
  const model = {
    todos: [
      { id: 1, title: "Изучить TDD", done: true, createdAt: new Date().toISOString() },
      { id: 2, title: "Собрать проект", done: false, createdAt: new Date().toISOString() },
      { id: 3, title: "Написать отчёт", done: false, createdAt: new Date().toISOString() }
    ],
    hash: '#/'
  };

  const root = document.getElementById('test-app');
  root.innerHTML = '';
  root.appendChild(app.render_footer(model, mockSignal()));

  // Проверяем, что счётчик показывает 2 активные задачи
  const count = document.getElementById('count');
  t.ok(count, 'счётчик существует');
  t.ok(count.textContent.includes('2'), 'правильное количество задач');

  // Проверяем, что есть три ссылки-фильтра
  const filters = document.querySelectorAll('.filters a');
  t.equal(filters.length, 3, 'три фильтра: Все, Активные, Выполненные');

  t.end();
});

test('view renders the whole todo app using "partials"', function (t) {
  const model = {
    todos: [
      { id: 1, title: "Изучить TDD", done: true, createdAt: new Date().toISOString() },
      { id: 2, title: "Собрать проект", done: false, createdAt: new Date().toISOString() },
      { id: 3, title: "Написать отчёт", done: false, createdAt: new Date().toISOString() }
    ],
    hash: '#/'
  };

  const root = document.getElementById('test-app');
  root.innerHTML = '';
  root.appendChild(app.view(model, mockSignal()));

  // Проверяем заголовок
  const h1 = document.querySelector('h1');
  t.equal(h1.textContent, 'todos', 'заголовок "todos" отображается');

  // Проверяем поле ввода
  const input = document.getElementById('new-todo');
  t.ok(input, 'поле ввода существует');
  t.equal(input.getAttribute('placeholder'), 'Что нужно сделать?', 'плейсхолдер правильный');

  // Проверяем, что все задачи отображаются
  const items = document.querySelectorAll('.view');
  t.equal(items.length, 3, 'отображаются все три задачи');

  // Проверяем счётчик
  const count = document.getElementById('count');
  t.ok(count, 'счётчик существует');
  t.ok(count.textContent.includes('2'), 'правильное количество задач');

  t.end();
});

test('app should handle empty todo list', function (t) {
  const emptyModel = {
    todos: [],
    hash: '#/'
  };

  const root = document.getElementById('test-app');
  root.innerHTML = '';
  root.appendChild(app.view(emptyModel, mockSignal()));

  // Проверяем, что основная часть скрыта
  const main = document.getElementById('main');
  t.ok(main, 'секция main существует');
  t.equal(main.style.display, 'none', 'main скрыта при пустом списке');

  // Проверяем, что футер скрыт
  const footer = document.getElementById('footer');
  t.ok(footer, 'футер существует');
  t.equal(footer.style.display, 'none', 'футер скрыт при пустом списке');

  t.end();
});