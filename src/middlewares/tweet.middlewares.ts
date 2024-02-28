import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType } from '~/constants/enum'
import { TWEET_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import Tweet from '~/models/schemas/Tweet.schema'
import databaseService from '~/services/database.services'
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
              isEmpty(mentions) &&
              !value
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
            if (value.some((item: string) => typeof item !== 'string')) {
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
            if (value.some((item: any) => !ObjectId.isValid(item))) {
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
            if (
              value.some((item: any) => {
                return typeof item.url !== 'string' || !mediasTypes.includes(item.type)
              })
            ) {
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

// export const tweetIDValidator = validate(
//   checkSchema(
//     {
//       tweet_id: {
//         custom: {
//           options: async (value, { req }) => {
//             if (!ObjectId.isValid(value)) {
//               throw new ErrorWithStatus({
//                 status: 400,
//                 message: 'Tweet id must be a valid object id'
//               })
//             }
//             const [tweet] = await databaseService.tweets
//               .aggregate<Tweet>([
//                 {
//                   $match: {
//                     _id: new ObjectId(value)
//                   }
//                 },
//                 {
//                   $lookup: {
//                     from: 'hashtags',
//                     localField: 'hashtags',
//                     foreignField: '_id',
//                     as: 'hashtags'
//                   }
//                 },
//                 {
//                   $lookup: {
//                     from: 'users',
//                     localField: 'mentions',
//                     foreignField: '_id',
//                     as: 'mentions'
//                   }
//                 },
//                 {
//                   $addFields: {
//                     mentions: {
//                       $map: {
//                         input: '$mentions',
//                         as: 'mention',
//                         in: {
//                           _id: '$$mention._id',
//                           name: '$$mention.name',
//                           username: '$$mention.username',
//                           email: '$$mention.email'
//                         }
//                       }
//                     }
//                   }
//                 },
//                 {
//                   $lookup: {
//                     from: 'bookmarks',
//                     localField: '_id',
//                     foreignField: 'tweet_id',
//                     as: 'bookmarks'
//                   }
//                 },
//                 {
//                   $lookup: {
//                     from: 'tweets',
//                     localField: '_id',
//                     foreignField: 'parent_id',
//                     as: 'tweet_children'
//                   }
//                 },
//                 {
//                   $addFields: {
//                     retweet_count: {
//                       $size: {
//                         $filter: {
//                           input: '$tweet_children',
//                           as: 'item',
//                           cond: { $eq: ['$$item.type', 1] }
//                         }
//                       }
//                     },
//                     commnet_count: {
//                       $size: {
//                         $filter: {
//                           input: '$tweet_children',
//                           as: 'item',
//                           cond: { $eq: ['$$item.type', 2] }
//                         }
//                       }
//                     },
//                     quote_count: {
//                       $size: {
//                         $filter: {
//                           input: '$tweet_children',
//                           as: 'item',
//                           cond: { $eq: ['$$item.type', 3] }
//                         }
//                       }
//                     },
//                     bookmarks: { $size: '$bookmarks' },
//                     views: {
//                       $add: ['$user_views', '$guest_views']
//                     }
//                   }
//                 }
//               ])
//               .toArray()
//             if (!tweet) {
//               throw new ErrorWithStatus({
//                 status: 404,
//                 message: 'Tweet not found'
//               })
//             }
//             ;(req as Request).tweet = tweet
//             return true
//           }
//         }
//       }
//     },
//     ['params', 'body']
//   )
// )
