const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'todoApplication.db')
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('Server is Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error is ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

//Home API
app.get('/', (req, res) => {
  res.send('Home Route')
})

const hasPriorityAndStatusProperties = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}

const hasPriorityProperty = requestQuery => {
  return requestQuery.priority !== undefined
}

const hasStatusProperty = requestQuery => {
  return requestQuery.status !== undefined
}

//GET TODOS API 1
app.get('/todos/', async (request, response) => {
  let data = null
  let getTodosQuery = ''
  const {search_q = '', priority, status} = request.query

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}'
        AND priority = '${priority}';`
      break
    case hasPriorityProperty(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND priority = '${priority}';`
      break
    case hasStatusProperty(request.query):
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%'
        AND status = '${status}';`
      break
    default:
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%';`
  }

  data = await db.all(getTodosQuery)
  response.send(data)
})

//GET Todo API 2
app.get('/todos/:todoId/', async (req, res) => {
  const {todoId} = req.params
  const getTodoQuery = `
    SELECT
        *
    FROM
        todo
    WHERE
        id = ${todoId};
    `

  const todoData = await db.get(getTodoQuery)
  res.send(todoData)
})

//POST TODOs API 3
app.post('/todos/', async (req, res) => {
  const {id, todo, priority, status} = req.body
  const postTodosQuery = `
    INSERT INTO
        todo (
            id,
            todo,
            priority,
            status
        )
    VALUES (
        ${id},
        '${todo}',
        '${priority}',
        '${status}'
    );
    `

  await db.run(postTodosQuery)
  res.send('Todo Successfully Added')
})

const hasTodo = requestQ => {
  return requestQ.todo !== undefined
}

//PUT TODOS API 4
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  let dic = request.body
  let getTodosQuery = ''

  switch (true) {
    case hasTodo(request.body):
      getTodosQuery = `
      UPDATE 
        todo 
      SET 
        todo = '${dic.todo}' 
      WHERE 
        id = '${todoId}';
      `
      await db.run(getTodosQuery)
      response.send('Todo Updated')
      break

    case hasPriorityProperty(request.body):
      getTodosQuery = `
      UPDATE 
        todo 
      SET 
        priority = '${dic.priority}' 
      WHERE 
        id = '${todoId}';
      `
      await db.run(getTodosQuery)
      response.send('Priority Updated')
      break

    case hasStatusProperty(request.body):
      getTodosQuery = `
      UPDATE 
        todo 
      SET 
        status = '${dic.status}' 
      WHERE 
        id = '${todoId}';
      `
      await db.run(getTodosQuery)
      response.send('Status Updated')
      break

    default:
      getTodosQuery = ``
  }
})

//DELETE TODO API 5
app.delete('/todos/:todoId/', async (req, res) => {
  const {todoId} = req.params
  const deleteTodoQuery = `
    DELETE 
    FROM
        todo
    WHERE
        id = ${todoId};
    `

  await db.run(deleteTodoQuery)
  res.send('Todo Deleted')
})

module.exports = app
