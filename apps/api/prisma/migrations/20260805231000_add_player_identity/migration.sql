CREATE TYPE "PlayerGender" AS ENUM ('man', 'woman');

ALTER TABLE "players"
ADD COLUMN "name" VARCHAR(24) NOT NULL DEFAULT 'Nameless',
ADD COLUMN "gender" "PlayerGender" NOT NULL DEFAULT 'woman';

ALTER TABLE "players"
ALTER COLUMN "name" DROP DEFAULT,
ALTER COLUMN "gender" DROP DEFAULT;
