-- CreateTable
CREATE TABLE "funnel" (
    "funnel_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "website_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "funnel_pkey" PRIMARY KEY ("funnel_id")
);

-- CreateTable
CREATE TABLE "funnel_step" (
    "funnel_step_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "website_id" UUID NOT NULL,
    "funnel_id" UUID NOT NULL,
    "type" VARCHAR(200) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "step" INTEGER NOT NULL DEFAULT 1,
    "settings" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "funnel_step_pkey" PRIMARY KEY ("funnel_step_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "funnel_funnel_id_key" ON "funnel"("funnel_id");

-- CreateIndex
CREATE INDEX "funnel_user_id_idx" ON "funnel"("user_id");

-- CreateIndex
CREATE INDEX "funnel_website_id_idx" ON "funnel"("website_id");

-- CreateIndex
CREATE INDEX "funnel_name_idx" ON "funnel"("name");

-- CreateIndex
CREATE UNIQUE INDEX "funnel_step_funnel_step_id_key" ON "funnel_step"("funnel_step_id");

-- CreateIndex
CREATE INDEX "funnel_step_user_id_idx" ON "funnel_step"("user_id");

-- CreateIndex
CREATE INDEX "funnel_step_website_id_idx" ON "funnel_step"("website_id");

-- CreateIndex
CREATE INDEX "funnel_step_funnel_id_idx" ON "funnel_step"("funnel_id");

-- CreateIndex
CREATE INDEX "funnel_step_name_idx" ON "funnel_step"("name");

-- CreateIndex
CREATE INDEX "funnel_step_type_idx" ON "funnel_step"("type");
