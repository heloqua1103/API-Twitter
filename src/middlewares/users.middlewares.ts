import { validate } from './../utils/validation'
import { Request, Response, NextFunction } from 'express'
import { ParamSchema, check, checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/User.requests'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'

const passwordSchema: ParamSchema = {
  isString: {
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
  },
  notEmpty: {
    errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
  },
  isLength: {
    options: {
      min: 6,
      max: 20
    },
    errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_FROM_6_TO_20
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
  }
}

const forgotPasswordTokenSchema: ParamSchema = {
  trim: true,
  custom: {
    options: async (value: string, { req }: any) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
          status: HTTP_STATUS.UNAUTHORIZED
        })
      }
      try {
        const decode_forgot_password_token = await verifyToken({
          token: value,
          secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
        })
        const { user_id } = decode_forgot_password_token
        const user = await databaseService.users.findOne({
          _id: new ObjectId(user_id)
        })

        if (user === null)
          throw new ErrorWithStatus({
            message: USERS_MESSAGES.USER_NOT_FOUND,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        if (user.forgot_password_token !== value)
          throw new ErrorWithStatus({
            message: USERS_MESSAGES.INVALID_FORGOT_PASSWORD_TOKEN,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        req.decode_forgot_password_token = decode_forgot_password_token
      } catch (error) {
        if (error instanceof JsonWebTokenError) {
          throw new ErrorWithStatus({
            message: USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        throw error
      }
      return true
    }
  }
}

const confirmPasswordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
  },
  isLength: {
    options: {
      min: 6,
      max: 255
    },
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_BETWEEN_6_AND_255
  },
  isString: {
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRING
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
  },
  custom: {
    options: (value: any, { req }: any) => {
      if (value !== req.body.password) {
        throw new Error(USERS_MESSAGES.CONFIRM_PASSWORD_DO_NOT_EQUAL_TO_PASSWORD)
      }
      return true
    }
  }
}

const nameSchema: ParamSchema = {
  isString: {
    errorMessage: USERS_MESSAGES.NAME_MUST_BE_STRING
  },
  notEmpty: {
    errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED
  },
  isLength: {
    options: { min: 1, max: 255 },
    errorMessage: USERS_MESSAGES.NAME_LENGTH_MUST_BE_BETWEEN_1_AND_255
  },
  trim: true
}

const dateOfBirthSchema: ParamSchema = {
  isISO8601: {
    options: { strict: true, strictSeparator: true },
    errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_IS_ISO8601
  }
}

const followedUserIdSchema: ParamSchema = {
  custom: {
    options: async (value: string, { req }) => {
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.INVALID_FOLLOWED_USER_ID,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      const user = await databaseService.users.findOne({ _id: new ObjectId(value) })
      if (!user) {
        throw new ErrorWithStatus({ message: USERS_MESSAGES.USER_NOT_FOUND, status: HTTP_STATUS.NOT_FOUND })
      }
    }
  }
}

const imageSchema: ParamSchema = {
  optional: true,
  trim: true,
  isString: {
    errorMessage: USERS_MESSAGES.IMAGE_MUST_BE_STRING
  },
  isLength: {
    options: { min: 0, max: 400 },
    errorMessage: USERS_MESSAGES.IMAGE_LENGTH_MUST_BE_BETWEEN_1_AND_400
  }
}

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_VALID
        },
        normalizeEmail: true,
        trim: true,
        custom: {
          options: async (value: any, { req }) => {
            const user = await databaseService.users.findOne({
              email: value,
              password: hashPassword(req.body.password)
            })
            if (user === null) throw new Error(USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT)
            req.user = user
            return true
          }
        }
      },
      password: passwordSchema
    },
    ['body']
  )
)

export const registerValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      email: {
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_VALID
        },
        normalizeEmail: true,
        trim: true,
        custom: {
          options: async (value: any) => {
            const isExistEmail = await usersService.checkEmailExist(value)
            if (isExistEmail) throw new Error(USERS_MESSAGES.EMAIL_ALREADY_EXISTS)
            return true
          }
        }
      },
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      date_of_birth: dateOfBirthSchema
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      authorization: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value: string, { req }: any) => {
            const accessToken = value.split(' ')[1]
            if (!accessToken) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decode_authorization = await verifyToken({ token: accessToken })
              ;(req as Request).decode_authorization = decode_authorization
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.ACCESS_TOKEN_IS_INVALID,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              throw error
            }
            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value: string, { req }: any) => {
            try {
              const [decode_refresh_token, refresh_token] = await Promise.all([
                verifyToken({ token: value, secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string }),
                databaseService.refreshTokens.findOne({ token: value })
              ])
              if (refresh_token === null)
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.USED_REFRESH_TOKEN_OR_NOT_FOUND,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              ;(req as Request).decode_refresh_token = decode_refresh_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const emailVerifyTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            const decoded_email_verify_token = await verifyToken({
              token: value,
              secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN_EMAIL_VERIFY_TOKEN as string
            })
            req.decoded_email_verify_token = decoded_email_verify_token
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_VALID
        },
        normalizeEmail: true,
        trim: true,
        custom: {
          options: async (value: any, { req }) => {
            const user = await databaseService.users.findOne({ email: value })
            if (!user) throw new Error(USERS_MESSAGES.USER_NOT_FOUND)
            req.user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)
export const resetPasswordValidator = validate(
  checkSchema(
    {
      forgot_password_token: forgotPasswordTokenSchema,
      password: passwordSchema,
      confirm_password: confirmPasswordSchema
    },
    ['body']
  )
)

export const verifyForgotPasswordValidator = validate(
  checkSchema(
    {
      forgot_password_token: forgotPasswordTokenSchema
    },
    ['body']
  )
)

export const verifiedUserValidator = async (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decode_authorization as TokenPayload
  if (verify !== UserVerifyStatus.Verified) {
    return next(
      new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_VERIFIED,
        status: HTTP_STATUS.FORBIDDEN
      })
    )
  }
  next()
}

export const changePasswordValidator = validate(
  checkSchema(
    {
      old_password: {
        ...passwordSchema,
        custom: {
          options: async (value: any, { req }) => {
            const { user_id } = req.decode_authorization as TokenPayload
            const user = await databaseService.users.findOne({
              _id: new ObjectId(user_id)
            })
            if (!user) throw new Error(USERS_MESSAGES.USER_NOT_FOUND)
            const { password } = user
            if (password !== hashPassword(value)) throw new Error(USERS_MESSAGES.OLD_PASSWORD_NOT_CORRECT)
            return true
          }
        }
      },
      password: passwordSchema
    },
    ['body']
  )
)

export const updateMeValidator = validate(
  checkSchema(
    {
      name: {
        ...nameSchema,
        optional: true,
        notEmpty: undefined
      },
      date_of_birth: {
        ...dateOfBirthSchema,
        optional: true
      },
      bio: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.BIO_MUST_BE_STRING
        },
        trim: true,
        isLength: {
          options: { min: 0, max: 200 },
          errorMessage: USERS_MESSAGES.BIO_LENGTH_MUST_BE_BETWEEN_1_AND_200
        }
      },
      location: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.LOCATION_MUST_BE_STRING
        },
        trim: true,
        isLength: {
          options: { min: 0, max: 200 },
          errorMessage: USERS_MESSAGES.LOCATION_LENGTH_MUST_BE_BETWEEN_1_AND_200
        }
      },
      website: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.WEBSITE_MUST_BE_STRING
        },
        trim: true,
        isLength: {
          options: { min: 0, max: 200 },
          errorMessage: USERS_MESSAGES.WEBSITE_LENGTH_MUST_BE_BETWEEN_1_AND_200
        }
      },
      username: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.USERNAME_MUST_BE_STRING
        },
        trim: true,
        isLength: {
          options: { min: 0, max: 200 },
          errorMessage: USERS_MESSAGES.USERNAME_LENGTH_MUST_BE_BETWEEN_1_AND_200
        }
      },
      avatar: imageSchema,
      cover_photo: imageSchema
    },
    ['body']
  )
)

export const followValidator = validate(
  checkSchema(
    {
      followed_user_id: followedUserIdSchema
    },
    ['body']
  )
)

export const unFollowValidator = validate(
  checkSchema(
    {
      followed_user_id: followedUserIdSchema
    },
    ['body']
  )
)
