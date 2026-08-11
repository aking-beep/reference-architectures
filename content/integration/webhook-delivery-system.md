---
title: Reliable Webhook Delivery
category: Integration
difficulty: intermediate
tags: [webhooks, integration, retries, signing]
updated: 2026-08-11
origin: "ARC Labs catalog seed"
scenario: "Customer endpoint down three hours. Signed retries, then replay."
image: /scenarios/webhook-delivery-system.jpg
---

# Reliable Webhook Delivery

Deliver outbound webhooks with retries, signatures, ordering guarantees, and a consumer-visible delivery log.

_Harvested from:_ ARC Labs catalog seed

## Scenario
Customer endpoint down three hours. Signed retries, then replay.

![Customer endpoint down three hours. Signed retries, then replay.](/scenarios/webhook-delivery-system.jpg)

## When not to use
Internal, in-process notifications in a single app. Don't HTTP yourself.

## Problem
You need to notify customer endpoints of events reliably, even though those endpoints are flaky, slow, or occasionally down — without hammering them or losing events.

## Shape
Events are enqueued for delivery. A **delivery worker** POSTs to the customer URL, **signs** the payload (HMAC) so the receiver can verify authenticity, and records the attempt. Failures **retry with exponential backoff** over hours. Each customer sees a **delivery log** and can replay failed events. Payloads carry a monotonic **event ID** so consumers can dedupe and order.

## Key decisions
- **At-least-once** delivery + consumer-side dedupe on event ID.
- **HMAC signing** with a per-customer secret and a timestamp to prevent replay.
- **Backoff schedule** (e.g. seconds → minutes → hours) with a cutoff, then mark failed.
- Expose a **replay** endpoint rather than silently dropping after the cutoff.

## Failure modes
A slow consumer ties up workers — use per-endpoint timeouts and concurrency caps. Retrying a non-idempotent consumer double-processes — that's why you sign and number events. Delivering out of order confuses stateful consumers; include a sequence number.

## Scaling path
Shard delivery workers by customer so one bad endpoint can't starve others. Add per-endpoint circuit breakers. Offer a pull-based feed (or queue) as an alternative for high-volume consumers.
