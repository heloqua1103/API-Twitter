import { wrapRequestHandler } from './../utils/handlers'
import { accessTokenValidator, emailVerifyTokenValidator, refreshTokenValidator, registerValidator } from './../middlewares/users.middlewares'
import { Router } from 'express'
import { loginController, logoutController, registerController, emailVerifyController } from '~/controllers/users.controllers'
import { loginValidator } from '~/middlewares/users.middlewares'
const usersRouter = Router()

usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(emailVerifyController))

export default usersRouter
