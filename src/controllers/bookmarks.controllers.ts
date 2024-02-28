import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import tweetService from '~/services/tweets.services'
import { TokenPayload } from '~/models/requests/User.requests'
import { BookmarkRequestBody } from '~/models/requests/Bookmark.requests'
import bookmarkService from '~/services/bookmarks.services'
import { BOOKMARK_MESSAGES } from '~/constants/messages'

export const bookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkRequestBody>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await bookmarkService.bookmarkTweet(user_id, req.body.tweet_id)
  return res.json({
    message: BOOKMARK_MESSAGES.BOOKMARK_SUCCESS,
    data: result
  })
}
