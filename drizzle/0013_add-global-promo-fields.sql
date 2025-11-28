ALTER TABLE "promo_codes" ADD COLUMN "is_global" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "promo_codes" ADD COLUMN "applied_by" varchar(10) DEFAULT 'user' NOT NULL;