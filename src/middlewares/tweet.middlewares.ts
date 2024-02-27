import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType } from '~/constants/enum'
import { TWEET_MESSAGES } from '~/constants/messages'
import { numberEnumToArray } from '~/utils/common'
import { validate } from '~/utils/validation'

const tweetTypes = numberEnumToArray(TweetType)
const audienceTypes = numberEnumToArray(TweetAudience)
const mediasTypes = numberEnumToArray(MediaType)
export const createTweetValidator = validate(
  checkSchema(
    {
      type: {
        isIn: {
          options: [tweetTypes],
          errorMessage: TWEET_MESSAGES.INVALID_TWEET_TYPE
        }
      },
      audience: {
        isIn: {
          options: [audienceTypes],
          errorMessage: TWEET_MESSAGES.INVALID_TWEET_AUDIENCE
        }
      },
      parent_id: {
        custom: {
          options: (value, { req }) => {
            const type = req.body.type as TweetType
            if (
              [TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) &&
              !ObjectId.isValid(value)
            ) {
              throw new Error(TWEET_MESSAGES.PARENT_ID_MUST_BE_A_VALID_OBJECT_ID)
            }
            if (type === TweetType.Tweet && value) {
              throw new Error(TWEET_MESSAGES.PARENT_ID_MUST_BE_NULL)
            }
            return true
          }
        }
      },
      content: {
        isString: true,
        custom: {
          options: (value, { req }) => {
            const type = req.body.type as TweetType
            const hashtags = req.body.hashtags as string[]
            const mentions = req.body.mentions as string[]
            if (
              [TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) &&
              isEmpty(hashtags) &&
              isEmpty(mentions) && !value
            ) {
              throw new Error(TWEET_MESSAGES.CONTENT_MUST_NOT_BE_EMPTY)
            }
            if (type === TweetType.Retweet && value) {
              throw new Error(TWEET_MESSAGES.CONTENT_MUST_BE_EMPTY)
            }
            return true
          }
        }
      },
      hashtags: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            if(value.some((item: string) => typeof item !== 'string')) {
              throw new Error(TWEET_MESSAGES.HASHTAGS_MUST_BE_STRING_ARRAY)
            }
            return true
          }
          
        }
      },
      mentions: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            if(value.some((item: any) => !ObjectId.isValid(item))) {
              throw new Error(TWEET_MESSAGES.MENTIONS_MUST_BE_STRING_ARRAY)
            }
            return true
          }
        }
      },
      medias: {
        isArray: true,
        custom: {
          options: (value, { req }) => {
            if(value.some((item: any) => {
              return typeof item.url !== 'string' || !mediasTypes.includes(item.type)
            })) {
              throw new Error(TWEET_MESSAGES.MEDIAS_MUST_BE_ARRAY_OF_OBJECTS_WITH_URL_AND_TYPE)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)
