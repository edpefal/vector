# Capability: Analytics Logging

## ADDED Requirements

### Requirement: Log Vectorization Events
The system SHALL log each vectorization attempt to track usage patterns.

#### Scenario: Vectorization logged on success
- **WHEN** an image is successfully vectorized
- **THEN** the system logs: timestamp, filename, file size, vectorization duration, success status

#### Scenario: Vectorization logged on failure
- **WHEN** an image fails to vectorize
- **THEN** the system logs: timestamp, filename, error message, failure reason

### Requirement: Log Download Attempts
The system SHALL log each time a user clicks the Download button to measure conversion funnel.

#### Scenario: Download attempt logged
- **WHEN** user clicks the "Download SVG" button
- **THEN** the system logs: timestamp, session ID (or IP), vectorized file info

### Requirement: Log Ad Events
The system SHALL log all ad-related events to track monetization performance and user behavior.

#### Scenario: Ad view logged
- **WHEN** the ad gate modal opens and ad begins playing
- **THEN** the system logs: timestamp, ad ID (from AdSense), ad start time

#### Scenario: Ad completion logged
- **WHEN** the AdSense callback confirms ad completion
- **THEN** the system logs: timestamp, ad ID, completion time, duration watched

#### Scenario: Ad rejection logged
- **WHEN** user clicks [No, thanks] to reject the ad
- **THEN** the system logs: timestamp, rejection time, time spent in modal before rejection

### Requirement: Conversion Metrics
The system SHALL provide basic conversion metrics combining vectorization, download, and ad events.

#### Scenario: Calculate download intent rate
- **WHEN** analytics are compiled
- **THEN** the system can calculate: % of vectorizations that led to download attempts

#### Scenario: Calculate ad completion rate
- **WHEN** analytics are compiled
- **THEN** the system can calculate: % of download attempts that resulted in successful ad completion and download

#### Scenario: Calculate ad rejection rate
- **WHEN** analytics are compiled
- **THEN** the system can calculate: % of users who rejected ads without downloading

### Requirement: Server-Side Logging
The system SHALL store all logs server-side for analysis. Initial implementation uses application logs (no database required).

#### Scenario: Logs are structured
- **WHEN** events are logged
- **THEN** each log entry includes: ISO timestamp, event type, user session info (IP or session ID), relevant metadata

#### Scenario: Logs are retrievable
- **WHEN** an operator needs analytics
- **THEN** they can access logs through standard server log files with filtering by event type and date range
