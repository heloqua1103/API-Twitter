import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import { initFoler } from './utils/file'
import argv from 'minimist'
import { config } from 'dotenv'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from './constants/dir'
import staticRouter from './routes/static.routes'
import cors from 'cors'
import tweetsRouter from './routes/tweets.routes'
import bookmarksRouter from './routes/bookmarks.routes'
import likesRouter from './routes/likes.routes'
config()

const app = express()
const port = process.env.PORT || 4000

// app.use('/static', express.static(path.resolve(UPLOAD_IMAGE_DIR)))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use('/user', usersRouter)
app.use('/media', mediasRouter)
app.use('/tweet', tweetsRouter)
app.use('/bookmark', bookmarksRouter)
app.use('/like', likesRouter)
app.use('/static', staticRouter)
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))

initFoler()

databaseService.connect().then(() => {
  databaseService.indexUsers()
  databaseService.indexRefreshTokens()
  databaseService.indexVideoStatus()
  databaseService.indexFollowers()
})

app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
