-- Create OTP codes table for email verification
CREATE TABLE public.otp_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('signup', 'password_reset')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for quick lookups
CREATE INDEX idx_otp_codes_email_type ON public.otp_codes(email, type);
CREATE INDEX idx_otp_codes_expires_at ON public.otp_codes(expires_at);

-- Enable RLS
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- No direct access from client - only edge functions can manage OTPs
-- Using service role key in edge functions bypasses RLS