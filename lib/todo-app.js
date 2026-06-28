/**
 * Этот блок нужен для работы тестов в Node.js.
 * Если код запущен в Node.js (не в браузере), мы подключаем необходимые модули.
 * `istanbul ignore next` — для корректного подсчёта покрытия тестами.
 */

if (typeof require !== 'undefined' && this.window !== this) {
  var { li, div, input, label, button, text, section, ul, span, strong, footer, a, h1, header } = require('./elmish.js');
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
        done: false,     // новая задача всегда не выполнена
        createdAt: new Date().toISOString() // ← Добавляем дату в формате ISO
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
    
    case 'ROUTE': // Изменение маршрута (фильтрация)
      // Обновляем hash в модели из адресной строки
      new_model.hash = (window && window.location && window.location.hash) ?
        window.location.hash : '#/';
     break;

     case 'DELETE':
    // Фильтруем массив, оставляя только те задачи, чей id не совпадает с data
    new_model.todos = new_model.todos.filter(function (item) {
      return item.id !== data;
    });
    break;

    case 'CLEAR_COMPLETED':
    new_model.todos = new_model.todos.filter(function (item) {
      return !item.done;
    });
    break;

    default: // Если действие не распознано, возвращаем модель без изменений
      return model;
  }

  // Возвращаем новое состояние
  return new_model;
}


/**
 * Функция `render_item` создаёт DOM-элемент для одной задачи.
 * Она использует вспомогательные функции из elmish.js (будут подключены позже).
 *
 * @param {Object} item — объект задачи (с полями id, title, done)
 * @param {Object} model — текущее состояние приложения (для проверки режима редактирования)
 * @param {Function} signal — функция для отправки действий (будет подключена позже)
 * @return {Object} — DOM-элемент <li> с задачей
 */
function render_item (item, model, signal) {
  var liAttrs = [
    "data-id=" + item.id,
    "id=" + item.id,
    item.done ? "class=completed" : "",
    model && model.editing && model.editing === item.id ? "class=editing" : ""
  ];

  // Форматируем дату для отображения
  // Форматируем дату для отображения
  var dateDisplay = '';
  if (item.createdAt) {
    var date = new Date(item.createdAt);
   // Проверяем, что дата валидна
    if (!isNaN(date.getTime())) {
      dateDisplay = date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  return (
    li(liAttrs, [
      div(["class=view"], [
        input([
          item.done ? "checked=true" : "",
          "class=toggle",
          "type=checkbox",
          typeof signal === 'function' ? signal('TOGGLE', item.id) : ''
        ], []),
        label([
          typeof signal === 'function' ? signal('EDIT', item.id) : ''
        ], [
          text(item.title),
          // Добавляем span с датой
          span(["class=created-at"], [
            text(" (" + dateDisplay + ")")
          ])
        ]),
        button([
          "class=destroy",
          typeof signal === 'function' ? signal('DELETE', item.id) : ''
        ])
      ])
    ].concat(model && model.editing && model.editing === item.id ? [
      input(["class=edit", "id=" + item.id, "value=" + item.title, "autofocus"])
    ] : []))
  );
}

/**
 * Функция `render_main` создаёт основную часть интерфейса:
 * - чекбокс "Отметить всё"
 * - список задач
 *
 * @param {Object} model — текущее состояние приложения
 * @param {Function} signal — функция для отправки действий
 * @return {Object} — DOM-элемент <section> с основной частью
 */
function render_main (model, signal) {
  var display = "style=display:" + (model.todos && model.todos.length > 0 ? "block" : "none");

  var filteredTodos = (model.todos && model.todos.length > 0) ?
    model.todos
      .filter(function (item) {
        switch(model.hash) {
          case '#/active':
            return !item.done;
          case '#/completed':
            return item.done;
          default:
            return true;
        }
      })
      .sort(function (a, b) {
        // Безопасная сортировка по дате
        var dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        var dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        
        // Если дата невалидна, используем 1970 год
        if (isNaN(dateA.getTime())) dateA = new Date(0);
        if (isNaN(dateB.getTime())) dateB = new Date(0);
        
        return dateB - dateA; // от новых к старым
      }) :
    [];

  return (
    section(["class=main", "id=main", display], [
      input([
        "id=toggle-all",
        "type=checkbox",
        typeof signal === 'function' ? signal('TOGGLE_ALL') : '',
        (model.all_done ? "checked=checked" : ""),
        "class=toggle-all"
      ], []),
      label(["for=toggle-all"], [text("Отметить всё как выполненное")]),
      ul(["class=todo-list"],
        filteredTodos.map(function (item) {
          return render_item(item, model, signal);
        })
      )
    ])
  );
}

/**
 * Функция `render_footer` создаёт нижнюю часть интерфейса:
 * - счётчик оставшихся задач
 * - фильтры (All/Active/Completed)
 * - кнопка "Очистить выполненные"
 *
 * @param {Object} model — текущее состояние приложения
 * @param {Function} signal — функция для отправки действий
 * @return {Object} — DOM-элемент <footer>
 */
function render_footer (model, signal) {
  // Считаем количество активных (не выполненных) задач
  var count = (model.todos && model.todos.length > 0) ?
    model.todos.filter(function (i) { return !i.done; }).length : 0;
  
  // Считаем количество выполненных задач
  var done = (model.todos && model.todos.length > 0) ?
    model.todos.filter(function (i) { return i.done; }).length : 0;

  // Если задач нет – скрываем футер
  var display = (count > 0 || done > 0) ? "block" : "none";
  var display_clear = (done > 0) ? "block;" : "none;";

  // Склоняем слово "задача" в зависимости от количества
  var left = (" задача" + (count > 1 || count === 0 ? 'и' : 'а') + " осталось");

  return (
    footer(["class=footer", "id=footer", "style=display:" + display], [
      span(["class=todo-count", "id=count"], [
        strong(count),
        text(left)
      ]),
      ul(["class=filters"], [
        li([], [
          a([
            "href=#/", "id=all", "class=" + (model.hash === '#/' ? "selected" : '')
          ], [text("Все")])
        ]),
        li([], [
          a([
            "href=#/active", "id=active", "class=" + (model.hash === '#/active' ? "selected" : '')
          ], [text("Активные")])
        ]),
        li([], [
          a([
            "href=#/completed", "id=completed", "class=" + (model.hash === '#/completed' ? "selected" : '')
          ], [text("Выполненные")])
        ])
      ]),
      button([
        "class=clear-completed",
        "style=display:" + display_clear,
        typeof signal === 'function' ? signal('CLEAR_COMPLETED') : ''
      ], [
        text("Очистить выполненные ["),
        span(["id=completed-count"], [text(done)]),
        text("]")
      ])
    ])
  );
}


// ... (предыдущий код: функции render_item, render_main, render_footer) ...

/**
 * Функция `view` собирает всё приложение вместе.
 * Она использует `render_main` и `render_footer` для создания полного интерфейса.
 *
 * @param {Object} model — текущее состояние приложения
 * @param {Function} signal — функция для отправки действий
 * @return {Object} — DOM-элемент <section> с полным приложением
 */
function view (model, signal) {
  return (
    section(["class=todoapp"], [
      header(["class=header"], [
        h1([], [text("todos")]),
        input([
          "id=new-todo",
          "class=new-todo",
          "placeholder=Что нужно сделать?",
          "autofocus"
        ], [])
      ]),
      render_main(model, signal),
      render_footer(model, signal)
    ])
  );
}

/**
 * Функция `subscriptions` подписывается на события (клавиатура, изменение URL).
 * Она связывает действия пользователя с функциями обновления.
 *
 * @param {Function} signal — функция для отправки действий
 */
function subscriptions (signal) {
  var ENTER_KEY = 13;   // код клавиши Enter
  var ESCAPE_KEY = 27;  // код клавиши Escape

  // Слушаем нажатия клавиш
  document.addEventListener('keyup', function handler (e) {
    switch(e.keyCode) {
      case ENTER_KEY:
        // Если мы в режиме редактирования — сохраняем изменения
        var editing = document.getElementsByClassName('editing');
        if (editing && editing.length > 0) {
          signal('SAVE')();
        }

        // Иначе добавляем новую задачу
        var new_todo = document.getElementById('new-todo');
        if (new_todo.value.length > 0) {
          signal('ADD', new_todo.value.trim())();
          new_todo.value = '';  // очищаем поле ввода
          document.getElementById('new-todo').focus();
        }
        break;

      case ESCAPE_KEY:
        // Отменяем редактирование
        signal('CANCEL')();
        break;
    }
  });

  // Слушаем изменение URL (для фильтрации задач)
  window.onhashchange = function route () {
    signal('ROUTE')();
  };
}
/**
 * Экспортируем функции и данные для тестов.
 * Этот блок выполняется только в Node.js (при запуске тестов).
 */
/* istanbul ignore next */

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    model: initial_model,
    update: update,
    render_item: render_item,
    render_main: render_main,
    render_footer: render_footer,
    view: view,                
    subscriptions: subscriptions 
  };
}