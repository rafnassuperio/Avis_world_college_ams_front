import test from "node:test";
import assert from "node:assert/strict";
import { ApiError, getFriendlyUserMessage } from "../src/services/api/apiError.ts";

test("API Error: correctly handles standard HTTP status codes with user-friendly messages", () => {
  const err400 = new ApiError("Bad request", { status: 400 });
  assert.strictEqual(err400.status, 400);
  assert.ok(err400.userMessage.includes("Invalid request"));

  const err401 = new ApiError("Unauthorized", { status: 401 });
  assert.strictEqual(err401.status, 401);
  assert.ok(err401.userMessage.includes("session has expired"));

  const err403 = new ApiError("Forbidden", { status: 403 });
  assert.strictEqual(err403.status, 403);
  assert.ok(err403.userMessage.includes("Access denied"));

  const err404 = new ApiError("Not found", { status: 404 });
  assert.strictEqual(err404.status, 404);
  assert.ok(err404.userMessage.includes("could not be found"));

  const err422 = new ApiError("Unprocessable", { status: 422 });
  assert.strictEqual(err422.status, 422);
  assert.ok(err422.userMessage.includes("Validation failed"));

  const err429 = new ApiError("Rate limited", { status: 429 });
  assert.strictEqual(err429.status, 429);
  assert.ok(err429.userMessage.includes("Too many requests"));

  const err500 = new ApiError("Internal error", { status: 500 });
  assert.strictEqual(err500.status, 500);
  assert.ok(err500.userMessage.includes("server error"));
  // Never leak technical stack in userMessage
  assert.ok(!err500.userMessage.includes("Internal error"));

  const err502 = new ApiError("Bad gateway", { status: 502 });
  assert.strictEqual(err502.status, 502);
  assert.ok(err502.userMessage.includes("gateway is temporarily unreachable"));

  const err503 = new ApiError("Service unavailable", { status: 503 });
  assert.strictEqual(err503.status, 503);
  assert.ok(err503.userMessage.includes("maintenance"));
});

test("API Error: handles network disconnection and timeouts", () => {
  const networkErr = new ApiError("Offline", { status: 0, isNetworkError: true });
  assert.strictEqual(networkErr.isNetworkError, true);
  assert.ok(networkErr.userMessage.includes("connectivity lost"));

  const timeoutErr = new ApiError("Timeout", { status: 408, isTimeout: true });
  assert.strictEqual(timeoutErr.isTimeout, true);
  assert.ok(timeoutErr.userMessage.includes("too long to complete"));
});
