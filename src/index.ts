import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import { initFoler } from './utils/file'
import argv from 'minimist'
import { config } from 'dotenv'
import path from 'path'
import { UPLOAD_IMAGE_DIR } from './constants/dir'
import staticRouter from './routes/static.routes'
config()

const app = express()
const port = process.env.PORT || 4000

// app.use('/static', express.static(path.resolve(UPLOAD_IMAGE_DIR)))

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use('/user', usersRouter)
app.use('/media', mediasRouter)
app.use('/static', staticRouter)

initFoler()

databaseService.connect()

app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
