# Capability: Ad-Gating for Downloads

## ADDED Requirements

### Requirement: Download Modal with Ad Gate
The system SHALL present a modal dialog when a user clicks the "Download SVG" button. The modal SHALL ask the user to watch an ad to download the file.

#### Scenario: Download button opens modal
- **WHEN** user clicks the "Download SVG" button on the result panel
- **THEN** a modal appears with the message "Watch an ad to download" with two buttons: [Watch Ad] and [No, thanks]

#### Scenario: Modal has clear actions
- **WHEN** the modal is displayed
- **THEN** the [Watch Ad] button is clearly visible and interactive, and the [No, thanks] button allows dismissal

### Requirement: Google AdSense Video Ad Integration
The system SHALL integrate Google AdSense video ads. When a user chooses to watch an ad, the system SHALL display a Google AdSense video ad that must be watched in full before the download can proceed.

#### Scenario: Ad plays after user accepts
- **WHEN** user clicks [Watch Ad] in the modal
- **THEN** the modal displays the Google AdSense video player and begins playing the ad

#### Scenario: Ad cannot be skipped
- **WHEN** the ad is playing
- **THEN** the user cannot skip or close the ad until it completes naturally

#### Scenario: Ad completion callback validates finish
- **WHEN** the Google AdSense ad finishes playing
- **THEN** the system receives a callback from AdSense confirming ad completion

### Requirement: Automatic Download on Ad Completion
The system SHALL automatically start the SVG download immediately after the AdSense callback confirms the ad was completed in full.

#### Scenario: Download triggers on callback
- **WHEN** the AdSense callback indicates the ad completed successfully
- **THEN** the browser automatically downloads the SVG file with the original filename + ".svg" extension

#### Scenario: Download happens client-side
- **WHEN** the download is triggered
- **THEN** the file is downloaded via the browser's standard download mechanism (not server-side file serving)

### Requirement: Rejection Returns to Result View
The system SHALL return the user to the result view (showing original + vectorized SVG, no modal) when they click [No, thanks].

#### Scenario: Rejection closes modal
- **WHEN** user clicks [No, thanks]
- **THEN** the modal closes and the user sees the result view with the original and vectorized images

#### Scenario: User can attempt download again
- **WHEN** the modal is closed via rejection
- **THEN** the "Download SVG" button remains enabled and clickable for another attempt

### Requirement: Infinite Download Attempts with New Ads
The system SHALL require a new ad to be watched for each download attempt. There is no limit on download attempts per user or session.

#### Scenario: Each download requires new ad
- **WHEN** a user downloads a file, then clicks "Vectorize another", re-uploads the same (or different) image, and clicks Download again
- **THEN** the ad gate modal appears again with a new Google AdSense ad to watch

#### Scenario: No rate limiting
- **WHEN** a user downloads multiple times in quick succession
- **THEN** each download request is honored with a new ad gate (no rate limiting or cooldown)

### Requirement: Modal State in State Machine
The system SHALL extend the app's state machine to include an ad-gate phase between "done" (result shown) and "downloading".

#### Scenario: State transitions on download
- **WHEN** user is in "done" state and clicks Download
- **THEN** state transitions to "ad-gate" and the modal is displayed

#### Scenario: State returns to done on rejection
- **WHEN** user rejects the ad (clicks [No, thanks])
- **THEN** state returns to "done" and the modal closes

#### Scenario: Download completes transition
- **WHEN** the ad completes and download triggers
- **THEN** state transitions briefly to "downloading" (or returns to "done" after triggering client-side download)
