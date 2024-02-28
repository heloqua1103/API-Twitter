import { Router } from 'express'
import { likeTweetController, unLikeTweetController } from '~/controllers/likes.controllers'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'

import { wrapRequestHandler } from '~/utils/handlers'

const likesRouter = Router()

likesRouter.post('/', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(likeTweetController))
likesRouter.delete(
  '/tweets/:tweedId',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(unLikeTweetController)
)

export default likesRouter
