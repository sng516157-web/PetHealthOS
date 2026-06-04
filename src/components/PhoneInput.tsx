"use client";

import * as React from "react";
import type { CountryCode } from "libphonenumber-js";
import { formatPhoneAsYouType, DEFAULT_PHONE_REGION } from "@/lib/validation";

type Props = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type"
> & {
  value: string;
  onChange: (formatted: string) => void;
  region?: CountryCode;
};

// Controlled phone input that auto-formats to the region's grouping standard as
// the user types (China by default; a leading "+" switches to international).
// The value it holds is the human-formatted string; the server canonicalizes to
// E.164 on submit.
export function PhoneInput({
  value,
  onChange,
  region = DEFAULT_PHONE_REGION,
  ...props
}: Props) {
  return (
    <input
      {...props}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      value={value}
      onChange={(e) => onChange(formatPhoneAsYouType(e.target.value, region))}
    />
  );
}
