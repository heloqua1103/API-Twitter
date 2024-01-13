import { wrapRequestHandler } from './../utils/handlers'
import { accessTokenValidator, refreshTokenValidator, registerValidator } from './../middlewares/users.middlewares'
import { Router } from 'express'
import { loginController, logoutController, registerController } from '~/controllers/users.controllers'
import { loginValidator } from '~/middlewares/users.middlewares'
const usersRouter = Router()

usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

export default usersRouter
