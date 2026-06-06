# Render Philosophy

This document is a work in progress.

## UI Structure (Review)

The app's UI falls into the following six blocks, arranged vertically from top to bottom.

The only initially populated sections are section A and the debug panel (though the Research Completion and Research Priorities panels will also be initially populated upon implementation - see below for explanations of these terms).

### Search Block

The top block. It contains a search bar, and results appear under it when search happens. (Currently it's only a basic search for persons, documents or FAN - this will be improved in due course.)

Also in this block, beside the search bar, is a button for toggling the visibility and reachability of non-biological parents and children. The default is that non-bio kin are hidden.

### Person/Family Selection and Navigation Block

Immediately below the search block. It contains a dual-tree navigation for selecting individuals and family groups. (Or rather, what's display is not trees with multiple branches, but single lineages with context.) All individuals displayed in this block are colour-coded based on `d_status`, to indicate in descendancy resarch if more work on their spouses/kids is needed or if they're a genealogical dead end.
- One tree, on top (known as Section A), is for expanding and finding a person's ancestors. Its default root is the root person. Given any person in it, one can "expand" (putting their parents in a new column to the right, with the same options as the child in the previous column), "collapse" (hiding all that person's ancestors of not displayed), or "select" a person to display their details in section F and make them the root of section B.
- The other tree, below the other (known as Section B), is for expanding and finding a person's descendants. It works similarly to Section A. Individuals's children are displayed by union; only those children who had `unions` of their own can be expanded; and one can "select" either an individual to see details in section F, or a union to see its details in section C.

### Personal/Family Group Details Block

The third block. It's a row of two panels; and in each panel, buttons for traversing to linked entities are provided.

One panel (Section F) shows details of individuals; the other (Section C) those of unions/family groups.

### Evidence/Context Details Block

The fourth block. It's a row of four panels, each of which displays details and buttons, to open linked entities, for a specific entity type.

The four panels show details of events (Section G), source documents (Section D), FAN club (Section E) and research notes (Segtion H)

### Navigation History Block

The second-lowest block. It allows viewing of navigation history, returning to earlier points in it by clicking links to earlier states, going back one step by clicking a button.

## Meta-Workflow Details Block

The lowest block, it's a row of three panels:
    - The Debug: State panel, showing the current values of every field in the `state` array;
    - A Research Completeness panel, which (once implemented) will show - for descendancy research - the list of people with a certain value of `d_status`; and
    - A Research Priorities panel, which (once implemented) will show documents/goals to be searched for in one location.

## The `state` Array

This app deals with data in several layers. The first and foundational one, of canonical data, is the only one that's stored in the external JSON file and loaded therefrom. Found in the `data` array, this is the layer of immutable truth (at least as the app sees it).

The second layer is that of traversal. This is governed by `indices`, derived from `data` for fast lookup and traversal.

And then the third us that of the runtime/UI display in the state. It's governed by the array called `state`. There is a fourth after that, `ctx = {data, indices, state}`, an app context layer transporting objects between render and controller systems.

`state` has the following fields:
- Three dynamic state paths, whose values are always lists:
    - `ancestorPath`. This governs the displayed ancestor chain in section A.
    - `descendantPath`. This governs the displayed descendant chain in section B.
    - `navigationStack`. This governs the navigation history shown in the relevant block.
- Seven persistent entity selections, whose values are always strings which are either `null` or entity IDs:
    - `selectedAncestor`. The root person in section B (descendant tree).
    - `selectedPerson`. The person whose information is actively displayed in section F.
    - `selectedUnion`. The relationship/family group whose information is actively displayed in section C (family group details).
    - `selectedEvent`. The event whose details are actively displayed in section G (event details).
    - `selectedDocument`. The source document whose details are actively displayed in section D (document details).
    - `selectedFan`. The FAN club entity whose details are actively displayed in section E (FAN details).
    - `sekectedNote`. The research note whose details are actively displayed in section H (note details).
- Two labels that are useful for history labelling
    - `currentView`. This is the active panel, containing the most recently updated panel in either the Evidence and Context Details block or the Personal and Family Details block (whichever is more recent). Its default is "person".
    - `currentId`. This is the ID of the most recently selected entity, details of which are displayed in the active panel defined by `currentView`. Its default is `null`.
- Finally, `showNonBiological`. Its value is Boolean and determines whether non-biological parents and kids are displayed alongside biological ones. Its default is `false`, that they're hidden.
