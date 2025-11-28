CREATE TABLE "user_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"feature" varchar(50) NOT NULL,
	"period" varchar(20) NOT NULL,
	"period_date" date,
	"count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_usage" ADD CONSTRAINT "user_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_usage_user_feature_idx" ON "user_usage" USING btree ("user_id","feature");--> statement-breakpoint
CREATE UNIQUE INDEX "user_usage_unique_idx" ON "user_usage" USING btree ("user_id","feature","period","period_date");