import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import { TokenPayload } from '~/models/requests/User.requests'
import bookmarkService from '~/services/bookmarks.services'
import { LIKE_MESSAGES } from '~/constants/messages'
import { LikeRequestBody } from '~/models/requests/Like.requests'
import likeService from '~/services/likes.services'

export const likeTweetController = async (req: Request<ParamsDictionary, any, LikeRequestBody>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await likeService.likeTweet(user_id, req.body.tweet_id)
  return res.json({
    message: LIKE_MESSAGES.LIKE_SUCCESS,
    data: result
  })
}

export const unLikeTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  await bookmarkService.unBookmarkTweet(user_id, req.params.tweetId)
  return res.json({
    message: LIKE_MESSAGES.UNLIKE_SUCCESS
  })
}
