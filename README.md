# Master Genealogical Research File (v. 0.4.0)

This is a genealogical project, designed in HTML/CSS/JS/JSON.

Its purpose has expanded since its inception. Originally, I wanted it to have certain functionality I couldn't readily find in common genealogical apps - a master inventory of source documents/photos/artefacts accessible in one place, a vessel to handle FAN club data, and (in descendancy research) a readily-visible way to mark whether I needed to do more research on the spouses/children of an individual or whether that individual was a genealogical dead end. It has since grown beyond a simple pedigree view or document tracker to become a generalized relationship graph engine specialized for genealogy.

This project remains incomplete. The current roadmap and revision history are below.

## Features

### Overall Architectural Features

One key feature is the separation of identity from relationship semantics:
- Personal identity is defined by `person` entities. Fields include name, biological sex, structured birth/baptism/death/burial vitals (with structuerd dates), occupation and religion; also included is the `d_status` indicator (marking individuals needing more research on spouses/kids and those who are dead ends).
- Structural kin groups are defined by the `union` type of `relationship` entities. `Union` entities, centred around a list of partners, are broader than "father + mother" couples; they can handle cases of one unknown parent, cases where neither parent is known but siblings are, gay couples, adoptive or foster parents, social parenting, and even polycules. `Unions`' fields include `subtype` (whether it's a marriage, commonlaw union, casual tryst or something else), and also start and end dates. `Person` entities can have more than one `union`, even with the same person (in divorce-and-reconciliation cases, for instance).
- Relationship semantics are defined by the `parent_child` type of `relationship` entities. Fields include `subtype`, defining type of relationship (biological, surrogate, adoptive, guardian, etc.), and `status`, allowing for dealing with the likes of estrangement or abuse.
- Evidence and context are defined by several types of entity - `documents`, `fan_entities` (for FAN club), and `notes`.
- UI is defined by graph traversal.
- There are two miscellaneous data entities, `meta` (currently only identifying the primary root) and `ahnentafel` (a - possibly vestigial - category for identifying ancestors of the root).

This separation avoids the traps arising from hardcoding "family" as nuclear families of "father + mother + their children", traps that quite a few genealogical programs fall into.

Another key feature is that the UI is state-driven graph traversal - to a significant extent bidirectional - rather than record-driven rendering.

### Structure

The main sections are:
- A top layer for dual-tree navigation and selecting people and family groups, containing section A (which selects an ancestor of a root person) and section B (for selecting a relationship - and family group built around it - of a descendant of the selected ancestor);
- A middle layer for personal and relationship details, containing section F (currently non-functional, to be developed in phase 2 - see below - but will display details of a selected person, with links to attached unions/family groups, documents and FAN club) and section C (displays details of a selected union and its family group, with links to attached documents and FAN club); and
- a bottom layer for details on evidence and context, containing section D (displays details of a selected document, with links to attached persons, unions/family groups and FAN club) and section E (displays details of a selected FAN, with links to attached documents, persons and unions/family groups).

Other features include:
- a basic search bar (above the top layer)
- a button for toggling visibility of non-biological parents and kids (beside search bar)
- navigation history (below bottom layer)
- a debug panel (below navigation history)

## Current Roadmap

Phase 1: Structural hardening 🗿
- Phase 1A (currently ongoing): externalizing JS helpers into categorized files. Simultaneous with this is:
    - rewriting and modularizing the validator, and
    - cleanup of duplicated and transitional logic, and other issues that need cleaning up.
- Phase 1B: data/model stabilization:
    - structured names
    - index layer hardening (includes auto-indexing caches so we no longer need to manually maintain person.unions and person.parent_child indices)
    - auto-normalization completion
    - entity lifecycle consistency
- Simultaneous with these subphases:
    - prepare archttectural context document

Phase 2: Real data readiness 🏗 (Currently the data is still toy data, for testing, derived from Œdipus' story in Greek mythology.) To include:
- Phase 2A - Editing/import/export infrastructure
    - Generation of IDs (not sequential integers)
    - CRUD for persons
    - CRUD for unions
    - CRUD for parent_child relationships
    - CRUD for documents/FAN/notes
    - Validation-on-edit
    - Undo/redo/history
- Phase 2B - Additional editing infrastructure
    - merging entities of same type
    - converting `fan_entity` into `person`
- Phase 2C - UX/navigation improvements
    - Section F (identity-centric, for deeper details on individual, with links)
    - Expand family details shown in section C
    - Expand data shown by tooltip to include vital info
    - Improving search capabilities
    - Graph jumping between related nodes
- Phase 2D - Research workflow layer
    - Research priorities panel (for documents being sought, etc; links to persons/unions/FAN/(in due course) events; with vertical scrollbar)
    - Completeness dashboard (using `d_status`)
    - Event/timeline layer (section G, with `event` entities)
- Finally, transition to real-world datasets

Phase 3: Reaching for the stars (?) 🌠
- Making this into a portable Electron (or equivalent) app (so I can carry it on a flash drive next time I want to visit the local Family History Centre!) - after architecture stabilizes
- Layer with certain therapeutic/genogram features (exact contours and display structure TBD, but I definitely want to deal with hereditary health concerns, addiction patterns, trauma lines, and behaviours like neglect or abuse that affect households and may appear in generational patterns)
- *(Beyond this is still fuzzy)*

Not in roadmap:
- gender identity (which I don't believe in)
- FamilySearch imports (I despise OneTree and how careless many of its contributors are)

Suggestions of more things to include, that might be helpful, are welcome, though the final decision on whether to include them rests with me.

## Revision History

- v. 0.1.0: original basic structure, with `person`, `family`, `document` and `ahnentafel` entities
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
    - v. 0.4.1: (so far completed) added maximum height with scrolling to sections C-E; (in progress) moved JS to external files; externalized helpers; modularized validator
