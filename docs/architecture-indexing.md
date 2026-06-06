# Indexing

Canonical data, extracted from the external JSON file, is stored in the `data` array. But for fast lookup and graph access, all information is extracted into indexed lookups in the `indices` array.

This document is a work in progress.

## Entity Lookups

The root person from `meta` is extracted into its own `meta` lookup within `indices`. All other entities are extracted into Maps in (id, entity) form (also within `indices`), one Map for each type:
- `personsById` for persons;
- `relationshipsById` for relationships (unions and parent-child both);
- `documentsById` for source documents;
- `eventsById` for events;
- `fanById` for FAN; and
- `notesById` for research notes.

## Traversal Indices

`indices` contains several indices for traversing the graph:

- `unionsByPersonId` in descendant/family rendering, for the unions a person is in
- `childrenByUnionId` in the same place, for children of a union
- `parentChildByChildId` for ancestor traversal
- `parentChildByParentId` for descendant traversal

## Other Indices

One further index cas been created so far - `personsByDstatus`, for all persons with a given value of `person.d_status` for descendancy research. (This will ultimately be used in the Research Completion panel, to (for instance) list all people with a `d_status` of "needmore", indicating more research is needed for their spouses and kids.)

A similar index is planned for the Research Priorities panel, listing and keeping track of all things of *any* entity I'm looking to find or determine.