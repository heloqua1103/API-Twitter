import express from 'express'
const app = express()
const port = 3000
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use('/user', usersRouter)

databaseService.connect()

app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
