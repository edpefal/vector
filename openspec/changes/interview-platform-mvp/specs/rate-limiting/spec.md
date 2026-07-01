# Rate Limiting Specification

## ADDED Requirements

### Requirement: Enforce 1 session per IP per hour
The system SHALL track active sessions by client IP address and reject new sessions from the same IP if one was started in the past 60 minutes.

#### Scenario: First session from new IP
- **WHEN** client from IP 192.168.1.100 opens WebSocket
- **THEN** backend checks rate_limiter dict for 192.168.1.100
- **THEN** no entry found, session is allowed
- **THEN** backend records timestamp: rate_limiter["192.168.1.100"] = now()

#### Scenario: Second session from same IP within 1 hour
- **WHEN** client from 192.168.1.100 opens WebSocket again after 30 minutes
- **THEN** backend checks rate_limiter and finds entry
- **THEN** elapsed time = 30 minutes < 3600 seconds
- **THEN** backend rejects WebSocket with code 1008
- **THEN** client receives error message: "Rate limited: 1 session/hour"

#### Scenario: Second session from same IP after 1 hour
- **WHEN** client from 192.168.1.100 opens WebSocket after 65 minutes
- **THEN** backend checks rate_limiter
- **THEN** elapsed time = 65 minutes > 3600 seconds
- **THEN** session is allowed
- **THEN** backend updates timestamp to new now()

---

### Requirement: Store rate limit state in memory
The system SHALL maintain rate limit state in a simple in-memory dict (no external service).

#### Scenario: Rate limiter initialization
- **WHEN** backend starts
- **THEN** rate_limiter = {} (empty dict)

#### Scenario: Rate limiter cleanup on server restart
- **WHEN** backend process restarts
- **THEN** rate_limiter is reset to empty dict
- **THEN** all IPs can start new sessions (acceptable for POC)

---

### Requirement: Provide clear error message on rate limit
The system SHALL inform users why their session was rejected and when they can retry.

#### Scenario: Rate limit error displayed to user
- **WHEN** client is rate limited
- **THEN** frontend displays message: "You've already started a session in the past hour. Please try again later."
