# API Documentation

Complete API reference for the BigPlans backend.

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Authentication Routes](#authentication-routes)
4. [Tasks Routes](#tasks-routes)
5. [KISS Reflections Routes](#kiss-reflections-routes)
6. [Comments Routes](#comments-routes)
7. [Groups Routes](#groups-routes)
8. [Error Handling](#error-handling)
9. [Rate Limiting](#rate-limiting)
10. [Examples](#examples)

---

## Overview

### Base URL

**Development:**
```
http://localhost:3000/api
```

**Production:**
```
https://your-worker.workers.dev/api
```

### Request Format

- **Content-Type:** `application/json`
- **Date Format:** ISO 8601 (`YYYY-MM-DD`)
- **Timestamps:** ISO 8601 datetime strings

### Response Format

All responses return JSON with the following structure:

**Success Response:**
```json
{
  "data": { ... },
  "message": "Success message"
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

---

## Authentication

### JWT Token Authentication

Most endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Token Lifecycle

1. **Obtain token:** Login or register
2. **Token validity:** 7 days from issuance
3. **Token storage:** Store in localStorage
4. **Token refresh:** Re-login when expired (401 response)

### Security Notes

- Tokens are signed with `JWT_SECRET`
- Passwords are hashed with bcrypt (10 salt rounds)
- HTTPS recommended in production
- No refresh tokens (use re-authentication)

---

## Authentication Routes

### POST /api/auth/register

Register a new user account.

**Authentication:** Not required

**Request Body:**
```json
{
  "username": "string (3-20 chars, required)",
  "password": "string (6+ chars, required)"
}
```

**Success Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "avatar_url": null,
    "created_at": "2025-01-11T10:30:00Z"
  }
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Username and password are required | Missing fields |
| 400 | Username must be 3-20 characters | Invalid username length |
| 400 | Password must be at least 6 characters | Password too short |
| 409 | Username already exists | Duplicate username |
| 500 | Internal server error | Server error |

**Example:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securepass123"
  }'
```

---

### POST /api/auth/login

Authenticate and receive JWT token.

**Authentication:** Not required

**Request Body:**
```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "avatar_url": "https://example.com/avatar.jpg",
    "created_at": "2025-01-11T10:30:00Z"
  }
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Username and password are required | Missing fields |
| 401 | Invalid credentials | Wrong username/password |
| 500 | Internal server error | Server error |

**Example:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securepass123"
  }'
```

---

### GET /api/auth/me

Get current authenticated user information.

**Authentication:** Required

**Request Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "avatar_url": "https://example.com/avatar.jpg",
    "created_at": "2025-01-11T10:30:00Z"
  }
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Unauthorized | Missing or invalid token |
| 404 | User not found | User deleted |
| 500 | Internal server error | Server error |

**Example:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Tasks Routes

### GET /api/tasks

Get all tasks for a specific date.

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | Yes | Date in YYYY-MM-DD format |

**Success Response (200):**
```json
{
  "tasks": [
    {
      "id": 1,
      "user_id": 1,
      "title": "Complete project documentation",
      "description": "Write comprehensive API docs",
      "date": "2025-01-11",
      "progress_type": "boolean",
      "progress_value": 0,
      "max_progress": null,
      "is_recurring": false,
      "recurrence_pattern": null,
      "created_at": "2025-01-11T10:30:00Z",
      "updated_at": "2025-01-11T10:30:00Z"
    },
    {
      "id": 2,
      "title": "Read book",
      "progress_type": "numeric",
      "progress_value": 50,
      "max_progress": 200,
      "date": "2025-01-11",
      ...
    }
  ]
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Date parameter is required | Missing date |
| 401 | Unauthorized | Invalid token |

**Example:**
```bash
curl -X GET "http://localhost:3000/api/tasks?date=2025-01-11" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### POST /api/tasks

Create a new task.

**Authentication:** Required

**Request Body:**
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "date": "string YYYY-MM-DD (required)",
  "progress_type": "boolean | numeric | percentage (default: boolean)",
  "max_progress": "number (required if numeric/percentage)",
  "is_recurring": "boolean (default: false)",
  "recurrence_pattern": {
    "frequency": "daily | weekly | monthly",
    "interval": 1
  }
}
```

**Success Response (201):**
```json
{
  "task": {
    "id": 3,
    "user_id": 1,
    "title": "Morning exercise",
    "description": "30 minutes cardio",
    "date": "2025-01-11",
    "progress_type": "boolean",
    "progress_value": 0,
    "max_progress": null,
    "is_recurring": true,
    "recurrence_pattern": "{\"frequency\":\"daily\",\"interval\":1}",
    "created_at": "2025-01-11T11:00:00Z",
    "updated_at": "2025-01-11T11:00:00Z"
  }
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Title and date are required | Missing fields |
| 400 | max_progress required for numeric/percentage | Missing max value |
| 401 | Unauthorized | Invalid token |

**Example:**
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete documentation",
    "description": "API reference",
    "date": "2025-01-11",
    "progress_type": "percentage",
    "max_progress": 100
  }'
```

---

### PUT /api/tasks/:id

Update an existing task.

**Authentication:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Task ID |

**Request Body:**
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "progress_value": "number (optional)",
  "progress_type": "string (optional)",
  "max_progress": "number (optional)"
}
```

**Success Response (200):**
```json
{
  "task": {
    "id": 3,
    "title": "Morning exercise - Updated",
    "progress_value": 1,
    "updated_at": "2025-01-11T14:00:00Z",
    ...
  }
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Invalid task ID | Non-numeric ID |
| 403 | Forbidden | Not task owner |
| 404 | Task not found | Task doesn't exist |
| 401 | Unauthorized | Invalid token |

**Example:**
```bash
curl -X PUT http://localhost:3000/api/tasks/3 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "progress_value": 1,
    "title": "Morning exercise - Completed"
  }'
```

---

### DELETE /api/tasks/:id

Delete a task.

**Authentication:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Task ID |

**Success Response (200):**
```json
{
  "message": "Task deleted successfully"
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Invalid task ID | Non-numeric ID |
| 403 | Forbidden | Not task owner |
| 404 | Task not found | Task doesn't exist |
| 401 | Unauthorized | Invalid token |

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/tasks/3 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### GET /api/tasks/recurring

Get all recurring tasks for the authenticated user.

**Authentication:** Required

**Success Response (200):**
```json
{
  "recurring_tasks": [
    {
      "id": 5,
      "title": "Daily standup",
      "is_recurring": true,
      "recurrence_pattern": "{\"frequency\":\"daily\",\"interval\":1}",
      ...
    }
  ]
}
```

---

### POST /api/tasks/generate-recurring

Generate task instances for recurring tasks.

**Authentication:** Required

**Request Body:**
```json
{
  "start_date": "string YYYY-MM-DD (required)",
  "end_date": "string YYYY-MM-DD (required)"
}
```

**Success Response (200):**
```json
{
  "message": "Recurring tasks generated",
  "generated_count": 15
}
```

---

## KISS Reflections Routes

### GET /api/kiss

Get KISS reflection for a specific date.

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | Yes | Date in YYYY-MM-DD format |

**Success Response (200):**
```json
{
  "reflection": {
    "id": 1,
    "user_id": 1,
    "date": "2025-01-11",
    "keep": "Completed all tasks on time",
    "improve": "Better time management",
    "start": "Morning meditation",
    "stop": "Late night snacking",
    "created_at": "2025-01-11T20:00:00Z"
  }
}
```

**Response when no reflection exists (200):**
```json
{
  "reflection": null
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Date parameter is required | Missing date |
| 401 | Unauthorized | Invalid token |

---

### POST /api/kiss

Create a KISS reflection.

**Authentication:** Required

**Request Body:**
```json
{
  "date": "string YYYY-MM-DD (required)",
  "keep": "string (optional)",
  "improve": "string (optional)",
  "start": "string (optional)",
  "stop": "string (optional)"
}
```

**Success Response (201):**
```json
{
  "reflection": {
    "id": 2,
    "user_id": 1,
    "date": "2025-01-12",
    "keep": "Great team collaboration",
    "improve": "Code documentation",
    "start": "Daily code reviews",
    "stop": "Multitasking during meetings",
    "created_at": "2025-01-12T21:00:00Z"
  }
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Date is required | Missing date |
| 409 | Reflection for this date already exists | Duplicate |
| 401 | Unauthorized | Invalid token |

---

### PUT /api/kiss/:id

Update a KISS reflection.

**Authentication:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Reflection ID |

**Request Body:**
```json
{
  "keep": "string (optional)",
  "improve": "string (optional)",
  "start": "string (optional)",
  "stop": "string (optional)"
}
```

**Success Response (200):**
```json
{
  "reflection": {
    "id": 2,
    "keep": "Updated content",
    ...
  }
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 403 | Forbidden | Not reflection owner |
| 404 | Reflection not found | Invalid ID |
| 401 | Unauthorized | Invalid token |

---

### GET /api/kiss/unlock-status

Check if user can view others' KISS reflections for a date.

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | Yes | Date in YYYY-MM-DD format |

**Success Response (200):**
```json
{
  "unlocked": true,
  "reason": "User has completed their own reflection"
}
```

---

## Comments Routes

### GET /api/comments

Get comments with filters.

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `targetUserId` | integer | Yes | User being commented on |
| `date` | string | Yes | Date in YYYY-MM-DD format |
| `type` | string | No | `task` or `daily` |
| `taskId` | integer | No | Specific task ID (if type=task) |

**Success Response (200):**
```json
{
  "comments": [
    {
      "id": 1,
      "user_id": 2,
      "target_user_id": 1,
      "task_id": 5,
      "date": "2025-01-11",
      "content": "Great work on this task!",
      "is_daily_comment": false,
      "created_at": "2025-01-11T15:30:00Z",
      "user": {
        "id": 2,
        "username": "teammate",
        "avatar_url": null
      }
    }
  ]
}
```

---

### POST /api/comments

Create a comment.

**Authentication:** Required

**Request Body:**
```json
{
  "target_user_id": "integer (required)",
  "date": "string YYYY-MM-DD (required)",
  "content": "string (required)",
  "task_id": "integer (optional, for task comments)",
  "is_daily_comment": "boolean (default: false)"
}
```

**Success Response (201):**
```json
{
  "comment": {
    "id": 2,
    "user_id": 1,
    "target_user_id": 3,
    "task_id": null,
    "date": "2025-01-11",
    "content": "Keep up the great work!",
    "is_daily_comment": true,
    "created_at": "2025-01-11T16:00:00Z"
  }
}
```

---

### PUT /api/comments/:id

Update a comment (own comments only).

**Authentication:** Required

**Request Body:**
```json
{
  "content": "string (required)"
}
```

**Success Response (200):**
```json
{
  "comment": {
    "id": 2,
    "content": "Updated comment text",
    "created_at": "2025-01-11T16:00:00Z"
  }
}
```

---

### DELETE /api/comments/:id

Delete a comment (own comments only).

**Authentication:** Required

**Success Response (200):**
```json
{
  "message": "Comment deleted successfully"
}
```

---

## Groups Routes

### GET /api/groups

Get all groups the user is a member of.

**Authentication:** Required

**Success Response (200):**
```json
{
  "groups": [
    {
      "id": 1,
      "name": "Development Team",
      "invite_code": "ABC12XYZ",
      "created_at": "2025-01-10T10:00:00Z",
      "member_count": 5
    }
  ]
}
```

---

### POST /api/groups

Create a new group.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "string (required)"
}
```

**Success Response (201):**
```json
{
  "group": {
    "id": 2,
    "name": "Marketing Team",
    "invite_code": "MKT789XY",
    "created_at": "2025-01-11T12:00:00Z"
  }
}
```

---

### POST /api/groups/join

Join a group using invite code.

**Authentication:** Required

**Request Body:**
```json
{
  "invite_code": "string (required, 8 chars)"
}
```

**Success Response (200):**
```json
{
  "group": {
    "id": 1,
    "name": "Development Team",
    "invite_code": "ABC12XYZ"
  },
  "message": "Successfully joined group"
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Invite code is required | Missing code |
| 404 | Group not found | Invalid code |
| 409 | Already a member | Duplicate join |

---

### GET /api/groups/:id/members

Get all members of a group.

**Authentication:** Required

**Success Response (200):**
```json
{
  "members": [
    {
      "id": 1,
      "user_id": 1,
      "username": "johndoe",
      "avatar_url": null,
      "joined_at": "2025-01-10T10:00:00Z",
      "show_kiss": true
    },
    {
      "id": 2,
      "user_id": 2,
      "username": "janedoe",
      "avatar_url": "https://example.com/avatar.jpg",
      "joined_at": "2025-01-11T09:00:00Z",
      "show_kiss": false
    }
  ]
}
```

---

### PUT /api/groups/:id/settings

Update user's group settings.

**Authentication:** Required

**Request Body:**
```json
{
  "show_kiss": "boolean (optional)"
}
```

**Success Response (200):**
```json
{
  "message": "Settings updated",
  "settings": {
    "show_kiss": false
  }
}
```

---

### GET /api/groups/:groupId/member/:userId/tasks

Get a group member's tasks for a date.

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | Yes | Date in YYYY-MM-DD format |

**Success Response (200):**
```json
{
  "tasks": [
    {
      "id": 10,
      "title": "Team meeting",
      "progress_type": "boolean",
      "progress_value": 1,
      "date": "2025-01-11",
      ...
    }
  ],
  "user": {
    "id": 2,
    "username": "janedoe"
  }
}
```

---

## Error Handling

### Standard Error Response

```json
{
  "error": "Error message",
  "details": "Additional context (optional)"
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid auth token |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource (e.g., username) |
| 500 | Internal Server Error | Server error |

### Common Errors

**401 Unauthorized:**
```json
{
  "error": "Unauthorized",
  "details": "Invalid or expired token"
}
```

**Validation Error:**
```json
{
  "error": "Validation failed",
  "details": "Username must be 3-20 characters"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding in production:

- Authentication endpoints: 5 requests/minute
- Data endpoints: 100 requests/minute
- Use Cloudflare Workers rate limiting or middleware

---

## Examples

### Complete Authentication Flow

```bash
# 1. Register
RESPONSE=$(curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}')

# Extract token
TOKEN=$(echo $RESPONSE | jq -r '.token')

# 2. Use token for authenticated request
curl -X GET "http://localhost:3000/api/tasks?date=2025-01-11" \
  -H "Authorization: Bearer $TOKEN"
```

### Create Task and Add Comment

```bash
# Create task
TASK=$(curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Review PRs",
    "date": "2025-01-11",
    "progress_type": "numeric",
    "max_progress": 5
  }')

TASK_ID=$(echo $TASK | jq -r '.task.id')

# Update progress
curl -X PUT http://localhost:3000/api/tasks/$TASK_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"progress_value": 3}'
```

### Group Collaboration

```bash
# Create group
GROUP=$(curl -X POST http://localhost:3000/api/groups \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Dev Team"}')

INVITE_CODE=$(echo $GROUP | jq -r '.group.invite_code')

# Share invite code with teammate
# Teammate joins:
curl -X POST http://localhost:3000/api/groups/join \
  -H "Authorization: Bearer $TEAMMATE_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"invite_code\":\"$INVITE_CODE\"}"
```

---

## Postman Collection

Import this JSON into Postman for easy API testing:

```json
{
  "info": {
    "name": "BigPlans API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

---

**API Version:** 1.0
**Last Updated:** 2025-01-11
