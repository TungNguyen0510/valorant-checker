CREATE TABLE "user_preferences" (
	"user_id" text PRIMARY KEY NOT NULL,
	"active_account_id" text
);
--> statement-breakpoint
CREATE TABLE "valorant_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"tag" text NOT NULL,
	"access_token" text NOT NULL,
	"id_token" text NOT NULL,
	"last_updated" bigint NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_active_account_id_valorant_accounts_id_fk" FOREIGN KEY ("active_account_id") REFERENCES "public"."valorant_accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_user_id" ON "valorant_accounts" USING btree ("user_id");