import { config } from 'dotenv'
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { pick } from 'lodash'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enum'
import { USERS_MESSAGES } from '~/constants/messages'
import {
  FollowReqBody,
  ForgotPasswordReqBody,
  LoginReqBody,
  LogoutReqBody,
  RefreshTokenReqBody,
  RegisterReqBody,
  TokenPayload,
  UnFollowReqBody,
  UpdateMeReqBody,
  VerifyEmailRequestBody,
  VerifyForgotPasswordReqBody
} from '~/models/requests/User.requests'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
config()

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const verify = user.verify as UserVerifyStatus
  const result = await usersService.login(user_id.toString(), verify)
  return res.json({ message: USERS_MESSAGES.LOGIN_SUCCESS, result })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await usersService.register(req.body)
  return res.json({ message: USERS_MESSAGES.REGISTER_SUCCESS, result })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.body
  const result = await usersService.logout(refresh_token)
  return res.json({ message: USERS_MESSAGES.LOGOUT_SUCCESS, result })
}

export const verifyEmailController = async (
  req: Request<ParamsDictionary, any, VerifyEmailRequestBody>,
  res: Response
) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    return res.json({ message: USERS_MESSAGES.USER_NOT_FOUND })
  }
  if (user.email_verify_token === '') {
    return res.json({ message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED })
  }
  const result = await usersService.verifyEmail(user_id)
  return res.json({ message: USERS_MESSAGES.VERIFY_EMAIL_SUCCESS, result })
}

export const resendVerifyEmailController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    return res.json({ message: USERS_MESSAGES.USER_NOT_FOUND })
  }
  if (user.verify === UserVerifyStatus.Verified) {
    return res.json({ message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED })
  }

  const result = await usersService.resendVerifyEmail(user_id)
  return res.json(result)
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response
) => {
  const { _id, verify } = req.user as User
  const result = await usersService.forgotPassword((_id as ObjectId).toString(), verify)
  return res.json(result)
}

export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordReqBody>,
  res: Response
) => {
  return res.json({ message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_SUCCESS })
}

export const resetPasswordController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_forgot_password_token as TokenPayload
  const { password } = req.body
  const result = await usersService.resetPassword(user_id, password)
  return res.json(result)
}

export const changePasswordController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { password } = req.body
  const result = await usersService.changePassword(user_id, password)
  return res.json(result)
}

export const getMeController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await usersService.getMe(user_id)
  return res.json({ message: USERS_MESSAGES.GET_ME_SUCCESS, result })
}

export const updateMeController = async (req: Request<ParamsDictionary, any, UpdateMeReqBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const body = req.body
  const result = await usersService.updateMe(user_id, body)
  res.json({ message: USERS_MESSAGES.UPDATE_ME_SUCCESS, result })
}

export const followController = async (req: Request<ParamsDictionary, any, FollowReqBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { followed_user_id } = req.body
  const result = await usersService.follow(user_id, followed_user_id)
  return res.json(result)
}

export const unFollowController = async (req: Request<ParamsDictionary, any, UnFollowReqBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { followed_user_id } = req.params
  const result = await usersService.unFollow(user_id, followed_user_id)
  return res.json(result)
}

export const oauthController = async (req: Request, res: Response) => {
  const { code } = req.query
  const result = await usersService.oauthGoogle(code as string)
  const urlRedirect = `${process.env.CLIENT_REDIRECT_URI as string}?access_token=${result.access_token}&refresh_token=${
    result.refresh_token
  }&new_user=${result.newUser}&verify=${result.verify}
  }`
  return res.redirect(urlRedirect)
}

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
  res: Response
) => {
  const refresh_token = req.body.refresh_token
  const { user_id, verify, exp } = req.decode_refresh_token as TokenPayload
  const result = await usersService.refreshToken({ user_id, verify, refresh_token, exp })
  return res.json({
    message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS,
    result
  })
}
