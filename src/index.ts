import express from 'express'
const app = express()
const port = 3000
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use('/user', usersRouter)

databaseService.connect()
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
