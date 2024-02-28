import { Router } from 'express'
import { bookmarkTweetController } from '~/controllers/bookmarks.controllers'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'

import { wrapRequestHandler } from '~/utils/handlers'

const bookmarksRouter = Router()

bookmarksRouter.post('/', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(bookmarkTweetController))

export default bookmarksRouter
