# Todo App (Practice Project)

Простое и удобное приложение для управления задачами (Todo-список). Проект создан в рамках учебной практики для демонстрации навыков веб-разработки на чистом JavaScript.


![Демонстрация работы приложения](https://raw.githubusercontent.com/unionblack/todo-app-practice/demo/demo.gif)

## Деплой

Живая демонстрация проекта: [Перейти на сайт](https://unionblack-todo-app.netlify.app/)

## Стек технологий

- Язык: JavaScript (Vanilla JS)
- Стили: HTML5, CSS3
- Тестирование: Tape, JSDOM
- Архитектура: The Elm Architecture (TEA)
- Хранилище: LocalStorage
- Деплой: Netlify

## Основной функционал

- Добавление новых задач
- Отметка задач как выполненных / невыполненных
- Удаление задач
- Редактирование текста задачи (двойной клик)
- Фильтрация задач: Все / Активные / Выполненные
- Массовое удаление выполненных задач
- Автоматическое сохранение в LocalStorage
- Дата и время создания каждой задачи (сортировка от новых к старым)

## Как запустить локально

1. Клонируйте репозиторий:
   git clone https://github.com/unionblack/todo-app-practice.git
   cd todo-app-practice

2. Установите зависимости:
   npm install

3. Запустите локальный сервер:
   npx serve .

4. Откройте в браузере: http://localhost:3000

## Запуск тестов

Для проверки работы приложения выполните:

npm test

## Качество кода

Бейдж Code Climate [![Maintainability](https://qlty.sh/gh/unionblack/projects/todo-app-practice/maintainability.svg)](https://qlty.sh/gh/unionblack/projects/todo-app-practice)


## Исходный проект

Данный проект разработан на основе туториала:
Building a Todo List App from Scratch in JavaScript
https://github.com/dwyl/javascript-todo-list-tutorial

## Лицензия

MIT