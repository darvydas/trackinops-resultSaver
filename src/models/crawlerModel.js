const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const ObjectId = Schema.ObjectId;

const subSchemaParser = new Schema(
  {
    path: String,
    name: String,
    sku: String,
    productId: String,
    categoryId: String,
    priceCurrent: String,
    currency: String,
    image: String,
    description: String
  }, { _id: false });

const subSchemaCrawlMatches = new Schema({
  pageType: String,
  urlRegEx: String,  // required
  waitForSelector: String,
  parser: subSchemaParser
}, { _id: false });

const subSchemaFollowLinks = new Schema({
  elementSelector: String,
  crawlerUrlRegex: String, // skip URL's that are not needed to crawl
  parserUrlRegex: String,
  action: String // ['getHref']
}, { _id: false });

const crawlerSchema = new Schema({
  crawlerCustomId: { type: String, unique: true },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: { type: Date },
  tags: { type: [String], index: true },
  startingLinks: [String],
  crawlMatches: [subSchemaCrawlMatches],
  requestBlockList: [String],
  followLinks: subSchemaFollowLinks,
  urlConstructor: {
    urlIncludeFragment: { type: Boolean, default: false },
    remove: {
      pathname: [String],
      query: [String],
      fragment: [String]
    }
  },
  loadImages: { type: Boolean, default: false },
  loadCss: { type: Boolean, default: true },
  maxCrawledPages: { type: Number, default: 50 },
  maxInfiniteScrollHeight: { type: Number, default: 2000 },
  maxParallelRequests: { type: Number, default: 3 },
  finishWebhookUrl: String
});

module.exports = mongoose.model('crawlers', crawlerSchema);
