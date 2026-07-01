# Capability: Real AdSense Integration

## ADDED Requirements

### Requirement: Dual-Mode AdSense Configuration
The system SHALL support two modes of operation: test mode (for development) and real mode (for production). The mode is determined by the NEXT_PUBLIC_ADSENSE_MODE environment variable.

#### Scenario: Test mode uses simulated ad
- **WHEN** NEXT_PUBLIC_ADSENSE_MODE=test (or not set)
- **THEN** the ad gate displays a simulated ad that completes after 3 seconds (current behavior)

#### Scenario: Real mode uses Google AdSense
- **WHEN** NEXT_PUBLIC_ADSENSE_MODE=real
- **THEN** the ad gate uses Google IMA SDK to load and display actual AdSense video ads

### Requirement: Google IMA SDK Integration
The system SHALL properly integrate Google IMA SDK for video ad playback. When real mode is enabled, the system SHALL use IMA callbacks to validate ad completion.

#### Scenario: Ad starts playing
- **WHEN** user clicks "Watch Ad" in real mode
- **THEN** Google IMA SDK loads the ad configured in NEXT_PUBLIC_ADSENSE_UNIT_ID
- **THEN** ad begins playing in the ad container
- **THEN** onAdStart callback is triggered

#### Scenario: Ad completes successfully
- **WHEN** the video ad finishes playing completely
- **THEN** Google IMA SDK fires the COMPLETE event
- **THEN** onAdComplete callback is triggered
- **THEN** browser automatically downloads the SVG file

#### Scenario: Ad is skipped (if skippable)
- **WHEN** user skips the ad (if allowed by ad network)
- **THEN** onAdSkip callback is triggered
- **THEN** ad gate shows error message "Ad was skipped. Please watch the full ad to download."

### Requirement: Strict Error Handling
The system SHALL NOT allow downloads if AdSense fails or times out. Users must watch the complete ad or manually dismiss without downloading.

#### Scenario: AdSense fails to load
- **WHEN** Google IMA SDK fails to load the ad (network error, blocked, etc)
- **THEN** ad container shows error message
- **THEN** "Download SVG" button remains disabled
- **THEN** user can only click "No, thanks" to return to result

#### Scenario: Ad doesn't complete within timeout
- **WHEN** ad doesn't fire completion callback within 60 seconds
- **THEN** user sees message "Ad is taking longer than expected"
- **THEN** "Download Now" fallback button appears (optional manual override)
- **THEN** clicking fallback still requires ad to have been marked as completed by IMA SDK

#### Scenario: Ad blocker prevents ad loading
- **WHEN** ad blocker (uBlock Origin, etc) prevents AdSense script
- **THEN** IMA SDK fails to initialize
- **THEN** error message displayed: "Ad blocker detected. Please disable to continue."
- **THEN** download button remains disabled

### Requirement: No Breaking Changes to UX
The user-facing flow remains identical between test and real modes. Only the ad content and behavior change.

#### Scenario: Same modal flow in both modes
- **WHEN** user clicks "Download SVG"
- **THEN** modal appears with message "Watch an Ad to Download"
- **THEN** two buttons visible: [Watch Ad] and [No, thanks]
- **THEN** same flow regardless of NEXT_PUBLIC_ADSENSE_MODE setting

#### Scenario: Environment-based configuration only
- **WHEN** code is deployed
- **THEN** ad behavior is determined only by environment variable
- **THEN** NO code changes needed when switching from test to real mode
