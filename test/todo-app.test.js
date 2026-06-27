const test = require('tape');
const app = require('../lib/todo-app.js');

test('todo `model` (Object) has desired keys', function (t) {
    const keys = Object.keys(app.model);
    t.deepEqual(keys, ['todos', 'hash'], "`todos` and `hash` keys are present.");
    t.true(Array.isArray(app.model.todos), "model.todos is an Array");
    t.end();
});

// ... (существующий тест для модели) ...

/**
 * Тест проверяет, что функция `update` возвращает модель без изменений,
 * если передано неизвестное действие.
 */
test('todo `update` default case should return model unmodified', function (t) {
  const model = JSON.parse(JSON.stringify(app.model));
  const unmodified_model = app.update('UNKNOWN_ACTION', model);
  t.deepEqual(model, unmodified_model, "модель возвращена без изменений");
  t.end();
});

/**
 * Тест проверяет, что действие 'ADD' добавляет новую задачу в массив.
 */
test('`ADD` a new todo item to model.todos Array via `update`', function (t) {
  const model = JSON.parse(JSON.stringify(app.model)); // начальное состояние
  t.equal(model.todos.length, 0, "изначально массив todos пуст");
  
  const updated_model = app.update('ADD', model, "Изучить TDD");
  const expected = { id: 1, title: "Изучить TDD", done: false };
  
  t.equal(updated_model.todos.length, 1, "в массиве todos теперь один элемент");
  t.deepEqual(updated_model.todos[0], expected, "задача добавлена корректно");
  t.end();
});

/**
 * Тест проверяет, что действие 'TOGGLE' переключает статус задачи.
 */
test('`TOGGLE` a todo item from done=false to done=true', function (t) {
  // Сначала добавляем задачу
  const model = JSON.parse(JSON.stringify(app.model));
  const model_with_todo = app.update('ADD', model, "Переключить статус");
  const item = model_with_todo.todos[0];
  
  // Теперь переключаем её статус
  const model_todo_done = app.update('TOGGLE', model_with_todo, item.id);
  const expected = { id: 1, title: "Переключить статус", done: true };
  
  t.deepEqual(model_todo_done.todos[0], expected, "статус задачи переключён");
  t.end();
});

/**
 * Дополнительный тест: проверяем, что TOGGLE работает в обе стороны.
 * Сначала включаем, потом выключаем.
 */
test('`TOGGLE` (undo) a todo item from done=true to done=false', function (t) {
  const model = JSON.parse(JSON.stringify(app.model));
  const model_with_todo = app.update('ADD', model, "Переключить статус");
  const item = model_with_todo.todos[0];
  
  // Включаем (done: true)
  const model_todo_done = app.update('TOGGLE', model_with_todo, item.id);
  const expected_true = { id: 1, title: "Переключить статус", done: true };
  t.deepEqual(model_todo_done.todos[0], expected_true, "задача отмечена как выполненная");
  
  // Выключаем обратно (done: false)
  const model_todo_undone = app.update('TOGGLE', model_todo_done, item.id);
  const expected_false = { id: 1, title: "Переключить статус", done: false };
  t.deepEqual(model_todo_undone.todos[0], expected_false, "задача снова активна");
  t.end();
});