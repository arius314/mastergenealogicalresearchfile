# Graph Philosophy

The essence of this app is that a genealogy is conceived of as a graph (in mathematical terms - a collection of nodes and edges connecting nodes), rather than as nested nuclear families.

## Nodes and Edges

The nodes in this graph are first-class entities: `persons` defining personal identity, `union` relationships defining structural kin groups, `parent_child` relationships defining relationship semantics, `events` defining the temporal context, `documents` defining evidence, `fan_entities` defining individuals in the social context, and `notes` defining research notes and comments. See the [Entity Model](./architecture-entity-model.md) document for more information on these.

The edges are not relationships between people; relationships are among the first-class entities that are nodes. Rather, edges are links between first-level entities. Thus for instance, a person may
- be married - that's a `union` they're involved in;
- have married on a particular date and enlisted in the army on another - two `events`;
- be mentioned in an obituary - a `document`; and
- appear mentioned with a good friend - a `fan_entity` he's linked to.
Every one of these entities is connected to the `person` by a linking edge.

Links between first-class/canonical entities are allowed in the following ways:
- Within the data, a canonical entity may link to entities of another type, but never of the same type. (Thus a `person` may link to a `union`, `parent_child` or `document`, but never another `person`.) This is even the case for a `person`'s spouses, parents or children; a `person` may only connect to these via a `union` or `parent_child` intermediary.
- With the exception below, the number of potential links to other entity types is potentially arbitrary.
- The exception is the `parent_child` entity, which links to exactly two `persons` - one as parent and the other as child. It has no other linked entities. Only the parent and child entities link to it; and while they're noted' in `unions`, they only appear as a subheading under a child of the union whom the `parent_child` links to.

## Traversing the Graph

The principle at work is that, from the information on any entity displayed on screen, one should be able to navigate to *any* of the entities linked to it by clicking a linking button to display that linked entity's data. `parent_child` relationships are a partial exception, because what they define is relationship semantics.

The rules for traversing links are related to those for links between entities, but slightly different. (See the [Render Philosophy Document](architecture-render-philosophy.md) for explanations on what I mean by various sections of the UI.)
- `parent_child` entities are mostly invisible to the user. They may be traversed only within the "Person/Family Selection and Navigation" block (sections A and B). Further, traversal goes *through* the parent-child entity in each case, from child to parent or *vice versa*. This is the only place where traversal from `person` to `person` is possible, and this for the purpose of selecting a person or relationship from an ancestor or descendant.
- Traversal from one type of entity (other than `parent_child`) to another of a different type is always possible, with the results rendered in the "Evidence and Context Details" and "Evidence and Context Details" blocks (sections C-H).

Navigation between two entities is understood to be bidirectional - if one can traverse from entity A to entity B, one should be able to traverse in the reverse direction.

One must, of course, be able to reach the entities within the graph in order to navigate it and traverse the links. This may be done either:
- by traversing from nodes already in the graph; or
- by entering the graph from outside.

### Entering and Managing the Graph from Outside

One may enter this graph from outside and begin traversing its links by:
- selecting an entity (other than `parent_child`) via the search bar
    - this populates the relevant panels displaying graph info
    - currently working for persons, documents and FAN
- clicking "Go to Root"
    - this selects the root person for individual detail display and ancestor chain
- selecting an ancestor and/or descendant union in the 'selection and navigation' block.
    - from here, one may either follow a chain of links in sections C-H, and/or enter afresh.
- or, selecting an ancestor and/or descendant union in the 'selection and navigation' block.
- In due course one will also be able to enter the graph by clicking links from the Research Completeness and Reseawrch Priorities panels.

There is no restriction on the number of times one may enter the graph from outside.

One may also return to a previously displayed entity via the navigation history. The length of this history is capped at 75 steps, beyond which the oldest steps in the history are removed.

Finally, clearing the graph resets the navigation history and allows fresh entry to the graph.

## Union Semantics

The heart of a `union` is a list of the participating partners. Children (though not `parent_child` entities) may be attached to a union as well. The type of relationship (whether 'marriage', 'engagement', 'commonlaw', 'poly', 'casual', etc.) is defined by the `subtype` field.

Every `union` entity must contain at least one partner or one child; however, beyond this, the number of parents and children attached to a union is arbitrary.

### Unkknown Parents

In cases where siblings are known but parents are not, one may create a `union` entity whose `children` are identified but whose `partners` field is an empty list. Parents, when discovered, may be added to the `partners` list when identified.

One may also have `union` entities with one identified parent in the `partners` list.

### Non-monogamous Family Units

The norm in society remains unions of two people. However, three or more people may exist in a union, in some sort of polyamorous setting. To this end, a `union` entity is allowed to have more than two `persons` listed among its `partners`.

The complication is that a polycule always has an internal structure. With a monogamous union this structure is obvious; however, it's not so obvious with three or more people. Even with three people, the simplest networks larger than a couple, we still have to distinguish between a vee and a triad; these are quite different dynamics and should not be treated the same.

Thus *only* for three or more people in a `union`, there's an additional (optional) field `internal_structure`, containing 'edges' linking two persons within the union. It is not traversible, and its contents will (in due course) be displayed in section C.

## Parent-Child Semantics

A `parent_child` relationship is between ONE parent and ONE child. The type of relationship - biological, adoptive, foster or something else - is governed by the `subtype` and `role` fields.

### Adoptive Relationships

Here a balance needs to be struck.

On one hand, biological parent-child kinship matters:
- because these is the sort of kinship responsible for bringing each of us into the world;
- because that's what DNA evidence addresses;
- because of lineage organizations and other links to the blood past;
- possibly other reasons too.

OTOH we have to take into account, not just the reality of other forms of kinship (eg. adoptive, surrogate, chosen), but the reality of estrangement and the fact that biological ties are not as overwhelmingly important as some might like to think.

The balance reflected in this project is: Non-biological parent-child relationship are recognized; however, the type of parent-child relationship is recorded (using both the `subtype` and `role` labels), and the user can toggle whether non-biological parents and children are displayed and their relationships traversed (the default is that they're hidden and not traversible). There's a button for this purpose, alongside the scroll bar.