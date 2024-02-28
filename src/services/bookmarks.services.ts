import { TweetRequestBody } from '~/models/requests/Tweet.requests'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import Hashtag from '~/models/schemas/Hashtags.schema'
import Bookmark from '~/models/schemas/Bookmarks.schema'

class BookmarkService {
  async bookmarkTweet(user_id: string, tweetId: string) {
    const result = await databaseService.bookmarks.findOneAndUpdate(
      { user_id: new ObjectId(user_id), tweet_id: new ObjectId(tweetId) },
      { $setOnInsert: new Bookmark({ user_id: new ObjectId(user_id), tweet_id: new ObjectId(tweetId) }) },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
    return result
  }
}

const bookmarkService = new BookmarkService()
export default bookmarkService
