import { ObjectId } from 'mongodb'
import { TweetAudience, TweetType } from '~/constants/enum'
import { Media } from '../Other'

interface TweetConstructor {
  _id?: ObjectId
  user_id: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: string | null
  media: Media[]
  hashtags: ObjectId[]
  mentions: string[]
  guest_views?: number
  user_views?: number
  creted_at?: Date
  updated_at?: Date
}

export default class Tweet {
  _id?: ObjectId
  user_id: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: ObjectId | null
  media: Media[]
  hashtags: ObjectId[]
  mentions: ObjectId[]
  guest_views: number
  user_views: number
  creted_at?: Date
  updated_at?: Date
  constructor({
    _id,
    user_id,
    type,
    audience,
    content,
    parent_id,
    media,
    hashtags,
    mentions,
    guest_views,
    user_views,
    creted_at,
    updated_at
  }: TweetConstructor) {
    const date = new Date()
    this._id = _id
    this.user_id = user_id
    this.type = type
    this.audience = audience
    this.content = content
    this.parent_id = parent_id ? new ObjectId(parent_id) : null
    this.media = media
    this.hashtags = hashtags
    this.mentions = mentions.map((mention) => new ObjectId(mention))
    this.guest_views = guest_views || 0
    this.user_views = user_views || 0
    this.creted_at = creted_at || date
    this.updated_at = updated_at || date
  }
}
