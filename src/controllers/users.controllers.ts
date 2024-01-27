import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import { LogoutReqBody, RegisterReqBody, TokenPayload, VerifyEmailRequestBody } from '~/models/requests/User.requests'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'

export const loginController = async (req: Request, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const result = await usersService.login(user_id.toString())
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

export const emailVerifyController = async (req: Request<ParamsDictionary, any, VerifyEmailRequestBody>, res: Response) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  // if(user.email_verify_token === '') {
  //   return res.json({ message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED })
  // }
  const result = await usersService.verifyEmail(user_id)
  return res.json({ message: USERS_MESSAGES.VERIFY_EMAIL_SUCCESS, result })
}
