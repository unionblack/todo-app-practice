/**
 * Этот блок нужен для работы тестов в Node.js.
 * Если код запущен в Node.js (не в браузере), мы подключаем необходимые модули.
 * `istanbul ignore next` — для корректного подсчёта покрытия тестами.
 */
/* istanbul ignore next */
if (typeof require !== 'undefined' && this.window !== this) {
}

/**
 * initial_model — это начальное состояние нашего приложения.
 * Это объект с двумя ключами:
 *   - todos: массив задач (пока пустой)
 *   - hash: строка для маршрутизации (показывает, какие задачи отображать)
 */
var initial_model = {
  todos: [],
  hash: "#/"
}

/**
 * Функция `update` — это "мозг" приложения.
 * Она принимает действие (action), текущее состояние (model) и данные (data),
 * и возвращает новое состояние (new_model).
 *
 * @param {String} action — что нужно сделать (например, 'ADD' или 'TOGGLE')
 * @param {Object} model — текущее состояние приложения
 * @param {String} data — данные, которые нужны для действия (например, текст задачи)
 * @return {Object} new_model — новое состояние приложения
 */
function update(action, model, data) {
  // Создаём глубокую копию модели, чтобы не изменять оригинал напрямую
  // Это важный принцип: состояние неизменяемо (immutable)
  var new_model = JSON.parse(JSON.stringify(model))

  // Оператор switch выбирает, что делать в зависимости от действия
  switch(action) {
    case 'ADD': // Добавление новой задачи
      // Определяем ID для новой задачи:
      // если есть последняя задача, берём её ID и увеличиваем на 1
      // иначе начинаем с 1
      var last = (typeof model.todos !== 'undefined' && model.todos.length > 0)
        ? model.todos[model.todos.length - 1] : null;
      var id = last ? last.id + 1 : 1;

      // Убеждаемся, что массив todos существует
      new_model.todos = (new_model.todos && new_model.todos.length > 0)
        ? new_model.todos : [];

      // Добавляем новую задачу в массив
      new_model.todos.push({
        id: id,
        title: data,    // текст задачи, переданный в data
        done: false     // новая задача всегда не выполнена
      });
      break;

    case 'TOGGLE': // Переключение статуса задачи (выполнена/не выполнена)
      // Проходим по всем задачам и ищем ту, у которой id совпадает с data
      new_model.todos.forEach(function (item) {
        if(item.id === data) {
          // Инвертируем статус: если было false, станет true, и наоборот
          item.done = !item.done;
        }
      });

      // Проверяем, все ли задачи выполнены
      // Если все задачи имеют done: false, значит all_done = true
      var all_done = new_model.todos.filter(function(item) {
        return item.done === false;
      }).length;
      new_model.all_done = all_done === 0 ? true : false;
      break;

    default: // Если действие не распознано, возвращаем модель без изменений
      return model;
  }

  // Возвращаем новое состояние
  return new_model;
}

/**
 * Экспортируем функции и данные для тестов.
 * Этот блок выполняется только в Node.js (при запуске тестов).
 */
/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    model: initial_model,
    update: update
  }
}

