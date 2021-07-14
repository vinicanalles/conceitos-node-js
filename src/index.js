const express = require("express");
const { v4: uuid } = require("uuid");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

//Middleware responsável por verificar se o usuário já existe
function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({
      error: "User Not Found!",
    });
  }

  request.user = user;

  return next();
}

function getUserTodo(id, response, user) {
  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({
      error: "Todo does not Exists!",
    });
  }

  return todo;
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  //Verifica se o usuário já existe
  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({
      error: "User Already Exists!",
    });
  }

  //Cria o objeto user com as variáveis que vieram na requisição
  const user = {
    id: uuid(),
    name,
    username,
    todos: [],
  };

  //Insere usuário criado na lista de usuários
  users.push(user);

  //Loga as informações do usuário que foi criado
  console.log(user);

  //Retorno com as informações do usuário criado
  return response.status(201).json(user);
});

app.get("/users", (request, response) => {
  return response.status(200).json(users);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuid(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const id = request.params.id;
  const { user } = request;

  const todo = getUserTodo(id, response, user);

  todo.title = title;
  todo.deadline = deadline;

  return response.status(201).json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const id = request.params.id;

  const todo = getUserTodo(id, response, user);

  todo.done = true;

  return response.status(201).json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const id = request.params.id;

  const todo = getUserTodo(id, response, user);

  user.todos.splice(todo, 1);

  return response.status(204).send();
});

module.exports = app;
