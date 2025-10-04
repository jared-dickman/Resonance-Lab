<!--
Sync Impact Report:
- Version change: none → 1.0.0
- List of modified principles:
  - [PRINCIPLE_1_NAME] → I. Song Library Management
  - [PRINCIPLE_2_NAME] → II. Song Display (Ultimate Guitar Style)
  - [PRINCIPLE_3_NAME] → III. Song Management
  - [PRINCIPLE_4_NAME] → IV. Mobile-First Design
  - [PRINCIPLE_5_NAME] → V. Data Storage
- Added sections: none
- Removed sections: none
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md
  - ✅ .specify/templates/spec-template.md
  - ✅ .specify/templates/tasks-template.md
- Follow-up TODOs: none
-->
# Key Change Constitution

## Core Principles

### I. Song Library Management
The application must provide robust song library management features, including browsing, searching, and advanced filtering. The library view should be a scrollable card-based layout, displaying essential song information at a glance. Search must be real-time, and users should be able to filter by musical key and tempo.

### II. Song Display (Ultimate Guitar Style)
The song display must be reminiscent of Ultimate Guitar, with a control bar for autoscroll, speed control, and transposition. The view must display song information like tuning, key, and capo position. Content should be tabbed for Lyrics/Chords, Staff Notation, Guitar Tabs, and personal Notes.

### III. Song Management
Users must be able to add new songs through a dedicated "Add Song" floating action button. The form for adding songs should be comprehensive, with sections for basic information, musical details, and content.

### IV. Mobile-First Design
The application must be designed with a mobile-first approach, optimized for smartphone and tablet screens. It should feature a dark mode interface by default to reduce eye strain.

### V. Data Storage
The application will use Supabase PostgreSQL for reliable cloud storage. All data entries must have automatic timestamps for creation and updates. The database should be indexed for full-text search to ensure fast queries.

## Governance

All development must adhere to the principles outlined in this constitution. Any amendments to this constitution require a proposal, review, and approval process. All pull requests must be reviewed for compliance with these principles.

**Version**: 1.0.0 | **Ratified**: 2025-10-04 | **Last Amended**: 2025-10-04
