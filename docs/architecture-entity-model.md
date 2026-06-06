# Entity Model

All canonical data used by the project is stored in an external JSON file. The canonical schema used is contained in this document. (The schema may be updated if a need appears.)

## General Comments

The philosophy behind the entity model is similar to that of many other genealogical apps, but also somewhat different in critical ways.

Many other apps - especially those relying on the GEDCOM format - are conceived of as linking between types of entities. According to [Ancestris' entry for 'Entities' in its user guide](https://docs.ancestris.org/books/user-guide/page/entities), GEDCOM (which Ancestris itself relies on) uses seven types of genealogical entity: *individuals* (human persons), *families* (couples, often with children), *media*, *notes* (text information), *sources*, *submitters* (those who collected info to contribute to thie file's construction), and *repositories* (places where repositories can be found). It also has a header entity (meta-information).

The basic idea of separating information types into first-class entities is good; however, the exact breakdown of entities has, in my view, proven problematic. The 'family' entity is particularly unsatisfactory, because it hardcodes the nuclear family model. It can be tweaked to deal with same-sex couples and people being children to both birth and adoptive parents, but becomes quite clumsy when dealing with, say, blended families or non-monogamous family units. If one tries applying this model of family groups to, say, Brigham Young's household, the Oneida commune, or a typical polycule today (which I have to deal with), one finds this model becomes cumbersome very quickly, and that one cannot represent one of these families in a way that does justice to the reality on the ground.

This app tries to avoid this trap by not hardcoding the assumption of nuclear family at all. Rather, the 'family' entity, as understood by GEDCOM, jumbles together two different types of relationship entity - the union between partners (be it a monogamous marriage or something else) and the parent-child relationship between parent and child (biological or otherwise). Thus relationship semantics, identity and family structure are all separated.

This leads to the following list of recognized (first-class canonical) entities:
- Individual, notes and header entities carry over directly as `persons`, `notes` and `meta` respectively.
- Families are replaced by `relationships`, which are of two types: `union` (for couple relationships) and `parent_child`. `union` and `parent_child` are effectively first-class entities, with `union` defining household/family group structure and `parent_child` defining reproductive/relationship semantics.
- `documents` covers both 'sources' and 'media' in the GEDCOM structure. This, as I treat media as a type of source. (At present I don't see a need to separate media out from source documents, but I'm open to being persuaded otherwise.)
- `fan_entities` and `events` are new first-class entities not covered by GEDCOM. `fan_entities` handles FAN club members for cluster research - treating them as social context rather than family entities - while `events` is promoted from being a mere field in `person` or `family` entities.
- I do not, at present, see a need for 'submitters' or 'repository' as separate entity types. (I think 'submitters' fits best as an optional field of `meta`, and 'repository' as an optional field of `document` - but neither as more than that.) I'm open to arguments to the contrary, though.

## `meta` Entity

The `meta` entity contains a handful of basic data points governing the ownership, loading and operation of the data file. Structure:

```
    "schema_version": ""
    "project_name": "",
    "root_person": "",
    "data_owner": {"name": "", "contact_info": ""},
    "submitters": [{"name": "", "contact_info": ""}],
    "designated_successor": {"name": "", "contact_info": ""}
```

- Required fields: `schema_version`, `project_name`, `root_person`, `data_owner.name`. If `designated_successor` or `submitters` are non-empty, then every person's entry requires `name`.

Comments:
- `schema_version` is to be automatically assigned at JSON file creation. Its value is currently "0.4.1". It is not invariant - if migration transforms for upgrading a database to a new schema version are ever included, changing the `schema_version` automatically will be part of it. However, the user should never touch this value.
- `project_name`  will (as of phase 2A) chosen by the user at project creation. JSON filename will be algorithmically derived from this when initially chosen; this field is not invariant, but changes to it will not change the JSON file's name.
- `root_person` is the ID of the root person and the default person populating section A, to be (as of phase 2A) chosen by the user at project creation. In due course, an option to change the root person via UI may be provided.
- `data_owner` is the person creating and managing the file and its data. `submitters` is anyone who has provided information for the file. `designated_successor` is the person the owner designates to become the new owner of their research/data files, in the event of the owner's death or quitting genealogy.

## Fields Common to All Genealogical Entities (i.e. those other than `meta`)

- Every entity has an `id`. It is unique and invariant - a prefix indicating the type of entity, followed by a code generated by randomly generated number. The prefix is `p_` for a `person`, `u_` for a `union`, `pc_` for a `parent_child`, `e_` for an `event`, `d_` for a `document`, `f_` for a `fan_entity`, and `n_` for a `note`. See the [Normalization](./architecture-normalization.md) documentation for more on this.
- Every entity has an optional field `research_priorities` (most likely to be used for persons or unions, but available for any entity). It contains things the user wants to research about the entity (say, a document the user wants to search for). This will drive the `Research Priorities` panel in due course.

## Identity: `persons` Entities

`persons` is a list of entities which define personal identity. Structure:

```
{
    "id": "X",
    "display_name": "X",
    "names": [{"type": "X", "title_prefix": "", "given": "", "surname": "", "title_suffix": ""}],
    "sex": "",
    "parent_child": [],
    "union": [{"id": "", "order": X}],
    "birth": {"event": "", "qualifiers": []},
    "baptism": {"event": "", "qualifiers": []},
    "death": {"event": "", "qualifiers": []},
    "burial": {"event": "", "qualifiers": []},
    "citizenship_residency": [{"place": "", "status": ""}]
    "occupations: [{"name": "", "start": "", "end": ""}],
    "religions: [{"name": "", "start": "", "end": ""}],
    "other_events": [{"id": "", "order": X}],
    "fan_club": [{"id": "", "order": X}],
    "documents": [{"id": "", "order": X}],
    "notes": [{"id": "", "order": X}],
    "d_status": {"state": "", "certainty": ""},
    "research_priorities": [""]
}
```

- Invariants: `id`
- Required: `id`, `diaplay_name`, `sex`, `d_status`. If `union`, `fan_club`, `documents`, `other_events` and/or `notes` are non-empty lists, for every linked entity both `id` and `order` are required. (The use of phantom persons is strongly discouraged.) If there are any alternate names, that alternate name's `type` and at least one other field thereof are required.
- Fields with set list of allowed values: `sex` may be "M", "F" or "U" (for Unknown). `d_status` may be "complete", "needmore", "deadend" or "unknown". `citizenship_residency.status` may be "citizen", "citizen of dependency", "denizen", "non-citizen aboriginal", "resident alien", "non-resident alien", "illegal alien", or "slave". I'm undecided whether to use a list of allowed values for `type` of alternate names.

Comments:
- Names: `display_name` is what is displayed as the standardized name. However, `names` (an optional field) is there to allow for the likes of preferred names, nicknames, Anglicized immigrants' names, legally changed names, aliases, adoptive names, dit names, married names, religious names, and titles.
- `sex` is biological sex only (gender identity will NOT be considered for inclusion). `occupations` and `religions` are lists of structures (people change both). So is `citizenship_residency`; the `place` subfield is left general enough to accommodate national citizenship, town-based citizenship (as in Switzerland and pre-1871 Germany), and tribal citizenship (as under Canada's Indian Act); some values of `status` requiring comments are "citizen" (may refer to subjects too), "resident alien" (permanent residents and those intending to domicile indefinitely), "citizen of dependency" (for citizens of imperial dependencies that never got full citizenship in the empire), "non-resident alien" (those not intending to domicile in country). `d_status` is an indicator for descendancy research, marking whether an individual needs more research on their spouses/kids and whether they're a dead end.
- Links: The `parent_child` field lists the IDs of the `parent_child` entities this `person` is the *child* in - these relationships may be biological, or adoptive, or something else. `union` lists the IDs of the `union` entities this person is one of the partners in; more than one `union` is allowed, even with someone the person already has another union with (for the likes of divorce-and-reconciliation cases). `other_events`, `fan_club`, `document` and `notes` contain IDs of note, document, FAN end event entities (other than vital statistic data), and area all ordered (so that they can be arranged chronologically, among other possibilities.)
- Vital data (birth/baptism/death/burial): `event` fields contain IDs of the appropriate `event` entities. `qualifiers` fields contain comments about the nature of the vital event - the likes of 'illegitimate', 'twin' or 'stillborn' for births, 'killed in action' or 'accident' for deaths, 'adult baptism' or 'private baptism' for christenings, or 'cremated' for burials. (This `qualifiers` field is the reason vital events are not lumped in with other events.)

## Relationships: `relationships`

`relationships` is a list of entities of two types: `union` entities define structural kin groups, while `parent_child` entities define relationship semantics.

### Structure: `union` Entities

The unions defining kinship are not restricted to "father + mother" couples, or even more general monogamous couples. They're generalized into the following structure:
```
    "id": "",
    "type": "union",
    "subtype": "",
    "partners": [],
    "internal_structure": [],
    "children": [{"id": "", "order": X, "parent_child": []}],
    "start": "",
    "end": "",
    "status": "",
    "other_events": [{"id": "", "order": X}],
    "fan_club": [{"id": "", "order": X}],
    "documents": [{"id": "", "order": X}],
    "notes": [{"id": "", "order": X}],
    "research_priorities": [""]
```

- Invariants: `id`, `type` = `union`
- Required: `id`, `type`, at least one of `partners` or `children`. If `children` is non-empty, then all fields for any attached child - `id`, `order` and `parent_child` ID - are required. For any linked other_event, FAN entity, document or note, both the `id` and `order` of the linked entity are required.
- Only allowed with prerequisite: `internal_structure` (requires `subtype = "poly"`). For `end` to be something other than `null` requires `status` to be something other than "active" or `null`.
- Fields with set list of allowed values: `subtype` may be "marriage", "engagement", "partnership", "poly", "casual", "donor" or "coercive". `status` may be "active", "separated", "divorced", "annulled" or "void".

Comments:
' `subtype` is the type of relationship. (Value "partnership" refers to committed monogamous partners - commonlaw or otherwise - whose relationship is not an officially recognized marriage; "poly" is a committed non-monogamous arrangement; "casual" allows both trysts and FWB; "donor" is used for the likes of sperm donors, where the partners may have never even met; "coercive" handles cases where a child is conceived through non-partner rape.)
- `partners` - the heart of this entity - lists the people involved in the union by `person` ID. The norm is two people; however, it may contain one person (if one partner's name is unknown), or be empty (in cases of known siblings and unknown parents), or more than two (for polycules). `internal_structure` is used ONLY for polycules (ie. when `subtype` = 'poly'), and is a list of lists (each of the internal lists being a pair of people that is an 'edge' in the polycule). `children` lists the IDs of the children of that union (biological or otherwise); the list is ordered, and the `children.parent_child` subfield lists the IDs of the `parent_child` entities in which that `union`'s partners are the *parents* and the child, well, the child. (Children by a prior spouse are listed under the union with that spouse.)
- The use of phantom individuals, as partners or children, is strongly discouraged.
- `status` marks the status of the union - 'active' if currently ongoing or ended by the death of one of the partners, something else otherwise. `start` and `end` are event IDs marking the start and end of the union (`end` for the likes of divorce and annulment - it is `null` when `status` is 'active' or `null`).
- `other_events`, `fan_club`, `documents` and `notes` are IDs of the appropriate events (other than those initiating or terminating a union), FANs, documents and notes (all with order).

### Reproductive Semantics: `parent_child` Entities

`parent_child` entities, defining relationship semantics, have this structure:
```
    "id": "",
    "type": "parent_child",
    "subtype": "",
    "role": "",
    "parent": "",
    "child": "",
    "status": [],
    "research_priorities": [""]
```

- Invariants: `id`, `type` = `parent_child`
- Required: `id`, `type`, `subtype`, `role`, `parent`, `child`
- Matching requirements: the values of `subtype` and `role` always match, unless `subtype === "biological"`, in which case `role` must be either `biological_mother` or `biological_father`.

Comments:
- `subtype` defines the type of relationship - this could be 'biological', 'surrogate', 'adoptive', 'foster', 'guardian', or perhaps something else. `role` is very similar - may be either 'biological_father' or 'biological mother' if the `subtype` is 'biological', otherwise `role` and `subtype` have the same value. `status` allows for dealing with the likes of estrangement or abuse.
- `parent` and `child` are the person IDs of the parent and child. There is always of ONE parent and ONE child. (If a couple has a child, that's two parent-child relationships - one between child and mother, one between child and father.) The use of phantom individuals, as parent or child, is strongly discouraged.

## Timeline, Evidence and Context

Four types of entities are govern different aspects of this: `event` (governing the temporal layer of events people and families participate in), `fan_entity` (governing social context), `document` (governing sources - sources being understood to include media) and `note` (governing research notes and comments).

Unlike with `persons`, `unions` and `parent_child` entities, these types of entities do not have ordering for any linked entities.

### Time: `events` Entities

Structure:
```
    "id": "",
    "type": "",
    "subtype": "",
    "name": "",
    "description": "",
    "date": {"original": "", "normalized": "", "time_modifier": "", "second_normalized": "", "calendar": ""},
    "place": "",
    "linked_persons": [],
    "linked_unions": [],
    "linked_documents": [],
    "linked_fan"" [],
    "linked_notes": [],
    "research_priorities": [""]
```

- Invariant: `id`
- Required: `id`, `type`, `date.normalized`, `data.time_modifier`, `name`
- Only allowed with prerequisite: `date.second_normalized` (requires `date.time_modifier = "between"`, but is required if so).
- Fields with set list of allowed values: `type` may be "vital_person" (for birth/baptism/death/burial), "vital_union" (for engagement/marriage/divorce/etc), "census", "military" (enlistment, discharge, etc), "probate", "migration", "citizenship" (for naturalization, first papers, etc), "education_occupation" (graduation, promotion, ordination, etc), or "other". `date.time_modifier` may be "exact", "approximate", "before", "after", "between" or "floruit". `date.calendar` may be `null`, "Gregorian" or "Julian" (I'm undecided on whether support for alternate calendars will eventually be provided).

Comments:
- `type` is the type of event - census, enlistment, or something else. `subtype` allows the user to specify more precisely; its value is user-defined. `description` is, I think, self-explanatory; it's also what's listed in display/search.
- Dates are structured, and are discussed more in the [Normalization](./architecture-normalization.md) document.
The `normalized` field is what is to be displayed and (potentially) calculted with, normalized to format DD MMM YYYY (or, if relevant, MMM YYYY or just YYYY). However, one can specify the calendar usage by the `calendar` field (as things stand limited to Gregorian or Julian); `type` marks whether the date is exact or something else; and `original` is how the date is origianlly expressed.
- linked persons, unions, documents, FAN entities and notes are linked through stating their IDs.

### Social Context: `fan_entities` Entities

Structure:
```
    "id": "",
    "name": "",
    "type": "",
    "type_comments": ""
    "linked_persons": [],
    "linked_unions": [],
    "linked_events": [],
    "linked_documents: [],
    "linked_notes": [],
    "research_priorities": [""]
```

- Invariant: `id`.
- Required: `id`, `name`, at least one of {`linked_persons`, `linked_events`, `linked_events`, `linked_documents`}.

Comments:
- `name` is the FAN individual's display name (don't worry about aliases here except through notes). `type` is the type of entity relationship - such as friend, associate, neighbour, slave, etc; specifics can be noted in `type_comments`.
- In due course, there will be an option to convert a `fan_entity` into a `person`, in the event a FAN turns out to be a relative after all.

### Evidence: `documents` Entities

Structure:
```
    "id": "",
    "title": ""
    "type": "",
    "description": "",
    "date": {"original": "", "normalized": "", "time_modifier": "", "second_normalized": "", "calendar": ""},
    "place": "",
    "linked_persons": [],
    "linked_unions": [],
    "linked_events": [],
    "linked_fan": [],
    "repository": {"name": "", "call_number": "", "url": ""},
    "research_priorities": [""]
```

- Invariant: `id`
- Required: `id`, `title`, `description`

Comments:
- `date` is structured in the same way it is for `event` entities.
- `repository` is where the document comes from. Its exact contents depend on whether the source if from a library, a physical archives, an online repository, etc. (This field may need some cleaning up.)

### Commentary: `notes` Entities

Structure:
```
    "id": "",
    "display_name": "",
    "text": "",
    "linked_persons": [],
    "linked_unions": [],
    "linked_events": [],
    "linked_documents": [],
    "linked_fan": [],
    "research_priorities": [""]
```

- Invariant: `id`
- Required: `id`, `display_name`, `text`, at least one of {`linked_persons`, `linked_unions`, `linked_events`, `linked_documents`, `linked_fan`}

Comments:
- `display_name` is the short name displayed in the UI, while `text` is a (potentially) longer, more detailed comment.

## Canonical Data and Derived Structures

The above entities are the canonical data recognized by this app. It is persistent, stored in the JSON file, and represents genealogical assertions directly entered by the user.

There are also derived data structures, which are generated dynamically from canonical data at runtime and not persisted. Examples of derived structures include:
- traversal indices
- Ahnentafel numbering (undecided about this)
- render trees
- navigation state
- graph caches