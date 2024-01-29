import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterReqBody, UpdateMeReqBody } from '~/models/requests/User.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'

class UsersService {
  private signAccessToken(user_id: string, verify: UserVerifyStatus) {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken, verify },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
    })
  }

  private signRefreshToken(user_id: string, verify: UserVerifyStatus) {
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken, verify },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
    })
  }

  private signAccessAndRefreshToken(user_id: string, verify: UserVerifyStatus) {
    return Promise.all([this.signAccessToken(user_id, verify), this.signRefreshToken(user_id, verify)])
  }

  private signEmailVerifyToken(user_id: string, verify: UserVerifyStatus) {
    return signToken({
      payload: { user_id, token_type: TokenType.EmailVerifyToken, verify },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN_EMAIL_VERIFY_TOKEN as string,
      options: { expiresIn: process.env.EMAIL_VERIFY_EXPIRE_IN }
    })
  }

  private signForgotPasswordToken(user_id: string, verify: UserVerifyStatus) {
    return signToken({
      payload: { user_id, token_type: TokenType.EmailVerifyToken, verify },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: { expiresIn: process.env.FORGOT_PASSWORD_EXPIRE_IN }
    })
  }

  private decodeRefreshToken(refreshToken: string) {
    return verifyToken({
      token: refreshToken,
      secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
    })
  }

  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    const emailVerifyToken = await this.signEmailVerifyToken(user_id.toString(), UserVerifyStatus.Unverified)
    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        date_of_birth: new Date(payload.date_of_birth),
        email_verify_token: emailVerifyToken,
        password: hashPassword(payload.password)
      })
    )
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(
      user_id.toString(),
      UserVerifyStatus.Unverified
    )
    // const { iat = 0, exp = 0 } = await this.decodeRefreshToken(refresh_token)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )

    // await sendVerifyRegisterEmail(payload.email, emailVerifyToken)
    console.log(emailVerifyToken)
    return {
      access_token,
      refresh_token
    }
  }

  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email })
    return Boolean(user)
  }

  async login(user_id: string, verify: UserVerifyStatus) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id, verify)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )
    return {
      access_token,
      refresh_token
    }
  }

  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
  }

  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([
      this.signAccessAndRefreshToken(user_id, UserVerifyStatus.Verified),
      databaseService.users.updateOne(
        { _id: new ObjectId(user_id) },
        {
          $set: { is_email_verified: '', verify: UserVerifyStatus.Verified },
          $currentDate: { updated_at: true }
        }
      )
    ])
    const [access_token, refresh_token] = token
    return {
      access_token,
      refresh_token
    }
  }

  async resendVerifyEmail(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken(user_id, UserVerifyStatus.Unverified)
    console.log(email_verify_token)
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: { email_verify_token },
        $currentDate: { updated_at: true }
      }
    )
    return {
      message: USERS_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS
    }
  }

  async forgotPassword(user_id: string, verify: UserVerifyStatus) {
    const forgot_password_token = await this.signForgotPasswordToken(user_id, verify)
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: { forgot_password_token },
        $currentDate: { updated_at: true }
      }
    )
    console.log('forgot password token: ', forgot_password_token)
    return {
      message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
    }
  }

  async resetPassword(user_id: string, password: string) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: { password: hashPassword(password), forgot_password_token: '' },
        $currentDate: { updated_at: true }
      }
    )
    return {
      message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS
    }
  }

  async changePassword(user_id: string, password: string) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: { password: hashPassword(password) },
        $currentDate: { updated_at: true }
      }
    )
    return {
      message: USERS_MESSAGES.CHANGE_PASSWORD_SUCCESS
    }
  }

  async getMe(user_id: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      { projection: { password: 0, email_verify_token: 0, forgot_password_token: 0 } }
    )
    return user
  }

  async updateMe(user_id: string, payload: UpdateMeReqBody) {
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload
    const result = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      { $set: { ...(_payload as UpdateMeReqBody & { date_of_birth: Date }) }, $currentDate: { updated_at: true } },
      { returnDocument: 'after', projection: { password: 0, email_verify_token: 0, forgot_password_token: 0 } }
    )
    return result
  }
}

const usersService = new UsersService()
export default usersService
