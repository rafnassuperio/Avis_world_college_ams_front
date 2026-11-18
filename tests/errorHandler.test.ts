import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeErrorMessage } from "../src/lib/errorHandler.ts";

test("Error Sanitizer: redacts bearer tokens, query tokens, and passwords", () => {
  const rawMessage = "Request failed: bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.t-IDN incorporated token=secret123&password=supersecret";
  const sanitized = sanitizeErrorMessage(rawMessage);

  assert.ok(!sanitized.includes("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"));
  assert.ok(!sanitized.includes("secret123"));
  assert.ok(!sanitized.includes("supersecret"));
  assert.ok(sanitized.includes("[REDACTED]") || sanitized.includes("[JWT_REDACTED]"));
});

test("Error Sanitizer: redacts internal filesystem paths", () => {
  const rawMessage = "Failed at D:\\Projects\\Avis World College\\AMS\\AMS_Frontend\\src\\app\\router.tsx:42";
  const sanitized = sanitizeErrorMessage(rawMessage);

  assert.ok(!sanitized.includes("D:\\Projects"));
  assert.ok(sanitized.includes("[PATH_REDACTED]"));
});

test("Error Sanitizer: redacts database connection strings", () => {
  const rawMessage = "Database error: postgres://admin:secretPass@localhost:5432/ams_db connection refused";
  const sanitized = sanitizeErrorMessage(rawMessage);

  assert.ok(!sanitized.includes("secretPass"));
  assert.ok(!sanitized.includes("localhost:5432"));
  assert.ok(sanitized.includes("postgres://[REDACTED]"));
});
