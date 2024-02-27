import { ParamsDictionary } from 'express-serve-static-core';
import { Request, Response } from 'express'
import { TweetRequestBody } from '~/models/requests/Tweet.requests'
import tweetService from '~/services/tweets.services';
import { TokenPayload } from '~/models/requests/User.requests';

export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  const {user_id} = req.decode_authorization as TokenPayload
  const result = await tweetService.createTweet(req.body, user_id)
  return res.json({
    message: 'Tweet created successfully',
    data: result
  })
}