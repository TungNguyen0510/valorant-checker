CREATE TABLE "shop_listings" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"seller_id" text NOT NULL,
	"price" bigint NOT NULL,
	"description" text,
	"contact_info" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "valorant_accounts" ADD COLUMN "match_data" jsonb;--> statement-breakpoint
ALTER TABLE "shop_listings" ADD CONSTRAINT "shop_listings_account_id_valorant_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."valorant_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_listing_seller_id" ON "shop_listings" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "idx_listing_status" ON "shop_listings" USING btree ("status");--> statement-breakpoint
UPDATE "valorant_accounts"
SET 
  "match_data" = jsonb_build_object(
    'matchHistory', data->'matchHistory',
    'competitiveUpdates', data->'competitiveUpdates',
    'matchDetails', data->'matchDetails'
  ),
  "data" = data - 'matchHistory' - 'competitiveUpdates' - 'matchDetails'
WHERE "match_data" IS NULL;