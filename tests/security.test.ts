import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeInput, sanitizeUrl, validateFileUpload } from "../src/lib/security.ts";

test("Security: sanitizeInput strips script tags and malicious HTML", () => {
  const xssPayload = '<script>alert("XSS")</script>Hello <b>World</b>';
  const sanitized = sanitizeInput(xssPayload);
  assert.strictEqual(sanitized, "Hello World");
  assert.ok(!sanitized.includes("<script>"));
  assert.ok(!sanitized.includes("alert"));
});

test("Security: sanitizeInput strips javascript: and inline event handlers", () => {
  const dangerousPayload = '<img src="x" onerror="alert(1)" /> Click <a href="javascript:steal()">here</a>';
  const sanitized = sanitizeInput(dangerousPayload);
  assert.ok(!sanitized.includes("javascript:"));
  assert.ok(!sanitized.includes("onerror"));
  assert.ok(!sanitized.includes("alert"));
});

test("Security: sanitizeUrl validates protocols and prevents javascript: schemes", () => {
  assert.strictEqual(sanitizeUrl("https://aviscollege.edu"), "https://aviscollege.edu");
  assert.strictEqual(sanitizeUrl("/college/students"), "/college/students");
  assert.strictEqual(sanitizeUrl("#profile"), "#profile");

  // Malicious protocols should fallback to "#"
  assert.strictEqual(sanitizeUrl("javascript:alert(1)"), "#");
  assert.strictEqual(sanitizeUrl("data:text/html,<script>alert(1)</script>"), "#");
  assert.strictEqual(sanitizeUrl("//malicious-site.com"), "#");
});

test("Security: validateFileUpload enforces size limits and MIME types", () => {
  const mockFile = {
    name: "test.jpg",
    size: 1024 * 1024, // 1MB
    type: "image/jpeg",
  } as unknown as File;

  const validResult = validateFileUpload(mockFile);
  assert.strictEqual(validResult.isValid, true);

  const oversizedFile = {
    name: "large.jpg",
    size: 5 * 1024 * 1024, // 5MB > 2MB limit
    type: "image/jpeg",
  } as unknown as File;

  const invalidSizeResult = validateFileUpload(oversizedFile);
  assert.strictEqual(invalidSizeResult.isValid, false);
  assert.ok(invalidSizeResult.error?.includes("exceeds"));

  const maliciousExeFile = {
    name: "trojan.exe",
    size: 500,
    type: "application/x-msdownload",
  } as unknown as File;

  const invalidTypeResult = validateFileUpload(maliciousExeFile);
  assert.strictEqual(invalidTypeResult.isValid, false);
});
