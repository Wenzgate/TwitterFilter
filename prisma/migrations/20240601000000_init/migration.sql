CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT,
    "email" TEXT UNIQUE,
    "emailVerified" TIMESTAMP,
    "image" TEXT,
    "username" TEXT UNIQUE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Account" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_provider_providerAccountId_key" UNIQUE ("provider", "providerAccountId")
);

CREATE TABLE "Session" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "sessionToken" TEXT NOT NULL UNIQUE,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "expires" TIMESTAMP NOT NULL
);

CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "expires" TIMESTAMP NOT NULL,
    CONSTRAINT "VerificationToken_identifier_token_key" UNIQUE ("identifier", "token")
);

CREATE TABLE "Author" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL UNIQUE,
    "profileImageUrl" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Tweet" (
    "id" TEXT PRIMARY KEY,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL,
    "likeCount" INTEGER NOT NULL,
    "retweetCount" INTEGER NOT NULL,
    "replyCount" INTEGER NOT NULL,
    "quoteCount" INTEGER NOT NULL,
    "authorId" TEXT NOT NULL REFERENCES "Author"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "permalink" TEXT NOT NULL,
    "hashtags" TEXT[] NOT NULL,
    "mentions" TEXT[] NOT NULL
);

CREATE INDEX "tweet_created_at_idx" ON "Tweet"("createdAt");
CREATE INDEX "tweet_like_idx" ON "Tweet"("likeCount");
CREATE INDEX "tweet_retweet_idx" ON "Tweet"("retweetCount");
CREATE INDEX "tweet_author_idx" ON "Tweet"("authorId");

CREATE TABLE "Media" (
    "id" TEXT PRIMARY KEY,
    "type" TEXT NOT NULL,
    "url" TEXT,
    "previewUrl" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "durationMs" INTEGER,
    "tweetId" TEXT NOT NULL REFERENCES "Tweet"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "Media_type_idx" ON "Media"("type");

CREATE TABLE "SyncState" (
    "userId" TEXT PRIMARY KEY,
    "nextToken" TEXT,
    "sinceId" TEXT,
    "syncedAt" TIMESTAMP NOT NULL
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER user_updated_at
BEFORE UPDATE ON "User"
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();

CREATE TRIGGER author_updated_at
BEFORE UPDATE ON "Author"
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();
