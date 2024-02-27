import { TweetRequestBody } from "~/models/requests/Tweet.requests"
import databaseService from "./database.services"
import Tweet from "~/models/schemas/Tweet.schema"
import { ObjectId } from "mongodb"

class TweetService {
  async createTweet(body: TweetRequestBody, user_id: string) {
    const result = await databaseService.tweets.insertOne(new Tweet({
      audience: body.audience,
      content: body.content,
      media: body.medias,
      hashtags: [],
      mentions: body.mentions,
      type: body.type,
      user_id: new ObjectId(user_id),
      parent_id: body.parent_id,
    }))
    const tweet = await databaseService.tweets.findOne({ _id: result.insertedId })
    return tweet
  }
}

const tweetService = new TweetService()
export default tweetService