# Current Roadmap

Phase 1: Structural hardening 🗿
- Phase 1A (complete): externalizing JS helpers into categorized files. Simultaneous with this is:
    - rewriting and modularizing the validator, and
    - cleanup of duplicated and transitional logic, and other issues that need cleaning up.
- Phase 1B (ongoing): data/model stabilization:
    - structured names
    - index layer hardening (includes auto-indexing caches so we no longer need to manually maintain person.unions and person.parent_child indices)
    - auto-normalization completion
    - entity lifecycle consistency
- Simultaneous with these subphases:
    - prepare archttectural context documents

Phase 2: Real data readiness 🏗 (Currently the data is still toy data, for testing.) To include:
- Phase 2A - Editing/import/export infrastructure
    - Generation of IDs (not sequential integers)
    - CRUD for persons
    - CRUD for unions
    - CRUD for parent_child relationships
    - CRUD for events/documents/FAN/notes
    - Validation-on-edit
    - Edit undo/redo/history
- Phase 2B - Additional editing infrastructure (deduplication)
    - merging entities of same type
    - converting `fan_entity` into `person` (in the event a FAN turns out to be a relative after all)
- Phase 2C - UX/navigation improvements
    - Expand family details shown in section C
    - Expand data shown by tooltip to include vital info
    - Improving search capabilities
    - Graph jumping between related nodes
- Phase 2D - Research workflow layer
    - Research priorities panel (for documents being sought, etc; links to persons/unions/FAN/(in due course) events; with vertical scrollbar)
    - Completeness dashboard (using `d_status`)
- Finally, transition to real-world datasets

Phase 3: Reaching for the stars (?) 🌠
- Making this into a portable Electron (or equivalent) app (so I can carry it on a flash drive next time I want to visit the local Family History Centre!) - after architecture stabilizes
- Layer with certain therapeutic/genogram features (exact contours and display structure TBD, but I definitely want to deal with hereditary health concerns, addiction patterns, trauma lines, and behaviours like neglect or abuse that affect households and may appear in generational patterns)
- *(Beyond this is still fuzzy)*

Undecided whether to include in roadmap:
- research log (this would probably be implemented as a new first-class canonical entity), or whether it would link to/from genealogical first-class entities
- support for calendars other than Gregorian and Julian
- place normalization
- Ahnentafel numbering (I need reasons to implement it first)

Not in roadmap:
- gender identity (which is not a valid thing)
- imports from FamilySearch trees (I despise OneTree and how careless many of its contributors are)

Suggestions of more things to include, that might be helpful, are welcome, though the final decision on whether to include them rests with me.

## Revision History

- v. 0.1.0: original basic structure, with `person`, `family`, `document` and `ahnentafel` entities and sections A, B and C
    - v. 0.1.1: added `d_status` field for descendancy, ordering kids in families
    - v. 0.1.2: added expand/collapse in section B, breadcrumb trail in section B, on-hover popup tooltips; transitioned from push/pop logic to branch-aware state-based for expand/collapse
    - v. 0.1.3: added `d_status` colour coding, expand/collapse in section A
    - v. 0.1.4: added section C code with hierarchy of families
- v. 0.2.0: changed sections A & B from vertical list to grid container/horizontal expansion, leading to dual-tree navigation; added highlight to active column
    - v. 0.2.1: added button to select ancestor in A, first helpers, ordering for notes and documents in section C
    - v. 0.2.2: added new section D with navigation to/from (original model only had A-C)
    - v. 0.2.3: added navigation stack/navigation history and single navigation function; partial transition from `innerHTML` to DOM building; polishing state
    - v. 0.2.4: added highlighting for selected ancestor/family group/document; updated navigation stack to store full states and cap its length
    - v. 0.2.5: added structured vital data for persons, structured relationship data for families, and `meta` entity to JSON schema
- v. 0.3.0: added basic search feature
    - v. 0.3.1: added horizontal scrolling in sections A & B
    - v. 0.3.2: refactored navigation to rely on reducer-based system; added section for navigation history breadcrumb, and moved `Back` button here; polished render cycle
    - v. 0.3.3: added section E, together with rendering of FAN data; unified linked entity rendering
    - v. 0.3.4: refactored to treat relationships as first class entities, separate identity from relationships
    - v. 0.3.5: added `sex` and structured `occupations` and `religions` fields for `persons`, `citations` for documents
    - v. 0.3.6: added `Go to Root` button
    - v. 0.3.7: added debug panel
- v. 0.4.0: big refactor - migrated to external JSON, then from `family` entities to the two types of `relationship` entities and relationship-driven grouping; deleted breadcrumb trail in section B; added labeling for non-biological kids/parents; implemented data validator, also unions without specified parents
    - v. 0.4.1: added maximum height with scrolling to sections C-E; added sections F, G and H (panels for individuals, events, notes) and added events as first-class entities; `anhentafel` stored entities removed; modularized validator; moved JS to external file and externalized helpers; strictly separated `data` (canonical), `indices` (derived lookup) and `state` (navigation state); drafts of architectural context documents; substantial indexing