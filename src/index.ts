import express from 'express'
const app = express()
const port = 3000
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use('/user', usersRouter)
app.use('/media', mediasRouter)

databaseService.connect()

app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
