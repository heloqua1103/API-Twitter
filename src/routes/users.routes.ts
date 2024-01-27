import { wrapRequestHandler } from './../utils/handlers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  refreshTokenValidator,
  registerValidator
} from './../middlewares/users.middlewares'
import { Router } from 'express'
import {
  loginController,
  logoutController,
  registerController,
  verifyEmailController,
  resendVerifyEmailController,
  forgotPasswordController
} from '~/controllers/users.controllers'
import { loginValidator } from '~/middlewares/users.middlewares'
const usersRouter = Router()

usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(verifyEmailController))
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))

export default usersRouter
