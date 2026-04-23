CREATE TYPE "public"."job_status" AS ENUM('saved', 'applied', 'interview', 'rejected', 'offer');--> statement-breakpoint
CREATE TYPE "public"."processing_status" AS ENUM('idle', 'queued', 'processing', 'done', 'failed');--> statement-breakpoint
CREATE TYPE "public"."tier" AS ENUM('free', 'paid');--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"company" text NOT NULL,
	"description" text NOT NULL,
	"status" "job_status" DEFAULT 'saved' NOT NULL,
	"ats_status" "processing_status" DEFAULT 'idle' NOT NULL,
	"ats_score" integer,
	"ats_explanation" text,
	"cv_generation_status" "processing_status" DEFAULT 'idle' NOT NULL,
	"cv_generation_error" text,
	"cv_r2_key" text,
	"bullmq_job_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"tier" "tier" DEFAULT 'free' NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"cv_r2_key" text,
	"cv_file_name" text,
	"generations_used_this_month" integer DEFAULT 0 NOT NULL,
	"generations_reset_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;