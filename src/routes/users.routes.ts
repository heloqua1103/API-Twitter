import { wrapRequestHandler } from './../utils/handlers'
import {
  accessTokenValidator,
  changePasswordValidator,
  emailVerifyTokenValidator,
  followValidator,
  forgotPasswordValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotPasswordValidator
} from './../middlewares/users.middlewares'
import { Router } from 'express'
import {
  loginController,
  logoutController,
  registerController,
  verifyEmailController,
  resendVerifyEmailController,
  forgotPasswordController,
  verifyForgotPasswordController,
  resetPasswordController,
  changePasswordController,
  getMeController,
  updateMeController,
  followController
} from '~/controllers/users.controllers'
import { loginValidator } from '~/middlewares/users.middlewares'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { UpdateMeReqBody } from '~/models/requests/User.requests'
const usersRouter = Router()

usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))
usersRouter.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))
usersRouter.post(
  '/change-password',
  accessTokenValidator,
  verifiedUserValidator,
  changePasswordValidator,
  wrapRequestHandler(changePasswordController)
)
usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordValidator,
  wrapRequestHandler(verifyForgotPasswordController)
)
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(verifyEmailController))
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))
usersRouter.get('/get-me', accessTokenValidator, wrapRequestHandler(getMeController))
usersRouter.patch(
  '/update-me',
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  filterMiddleware<UpdateMeReqBody>([
    'name',
    'date_of_birth',
    'location',
    'avatar',
    'bio',
    'username',
    'cover_photo',
    'website'
  ]),
  wrapRequestHandler(updateMeController)
)
usersRouter.post(
  '/follow',
  accessTokenValidator,
  verifiedUserValidator,
  followValidator,
  wrapRequestHandler(followController)
)

export default usersRouter
