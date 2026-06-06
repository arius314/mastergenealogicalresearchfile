# System Overview

## Project Goals

This app was designed to address the needs of more serious genealogists, professional or advanced amateur, needs that I haven't found to be readily met elsewhere.
- Serious research often uses cluster analysis, which depends on FAN club data. I'm not aware of any forms, or apps, that enable one to handle this; and the only methods to handle FANs I've seen to date are external spreadsheets and the creation of floating trees. Neither is fully satisfactory; but GEDCOM-based programs don't give us another ready option.
- Serious research often does descendancy research. In this, I need a readily-visible way to gauge whether I need more information on some person's spouses and/or children, or whether they're a genealogical dead end (and thus don't need more descendancy attention in the absence of surprises). But I couldn't find this. Those apps I see that use colour-coding apply it only to things other than descendancy; and those I see that use tagging require me to explicitly search for a tag instead of a ready visibility (or even the ability to toggle visibility).
- For source documents/media/artefacts - paper and electronic - I found I needed not just lists, but a master inventory accessible in one place. There's a degree of this in common apps already, but I'm dissatisfied with the extent of inventorying and linking to individuals I've seen. For one, Ancestry's limitations on who one can link a document to are frustrating; it's unusual to be able to link an obituary, for instance, to a subject's grandchildren. I want to be able to link to relatives and FAN club as far as logically possible.
- I see the need to handle, not just nuclear families/lineage units, but also non-traditional family structures of various sorts, as I believe genealogy's job is to describe the reality of relationships on the ground, not to paper it over to updhold some moral agenda or what we may wish that reality were. This includes not just same-sex couples and blended families, but non-monogamous households of various sorts - and the ability to handle these in genealogy apps and forms is, from my vantage point, pretty much nonexistent.
- I see genealogy, not just as a record of history (and *certainly* not a hagiography), but a tool to understand the people and families we study, see the importance of friends and chosen family in people's lives, and also spot problems in family dynamics and address them. That points to a need to work with the sort of data one sees in genograms - including but not necessarily limited to hereditary health concerns, addiction patterns, trauma lines, and behaviours like neglect or abuse that affect households and may appear in generational patterns. This is of value in genealogy; but I see little overlap, if any, between genealogy and genogram programs - perhaps because they usually target different markets, perhaps because of the limiting structure of GEDCOM data.

These were the original goals, and they remain core; but the project has expanded beyond this.

## Architectural Principles

This app is fundamentally an interactive, state-driven UI with hierarchical expansion and dynamic display. As web apps excel at this, the choice was made to prepare it in HTML/CSS/JavaScript.

### What is a Family?

> "While (Jesus) yet talked to the people, behold, his mother and his brethren stood without, desiring to speak with him. Then one said unto him, Behold, thy mother and thy brethren stand without, desiring to speak with thee. But he answered and said unto him that told him, Who is my mother? and who are my brethren? And he stretched forth his hand toward his disciples, and said, Behold my mother and my brethren! For whosoever shall do the will of my Father which is in heaven, the same is my brother, and sister, and mother." - Gospel of Matthew

What is a family? The answer of relevance is twofold.

First: Family is defined, not by blood ties or certain predefined formal classes of relationship, but by who fills the functions of family. This is not to deny that blood connections matter - at least when it comes to medical history or lineage organizations - but instead to affirm the reality and importance of other forms of kinship bonds (adoptive, chosen or something else) in people's lives, and that blood ties (especially where there's estrangement or abuse) may not be nearly as important (or healthy) as their advocates might like to think.

The best balance between blood-only and more general understandings of family, then, is in allowing both - putting biological and non-bio relations together in the same database, and toggling visibility of non-bio kin.

Second: The "family" or "family group" commonly used by genealogists is actually two types of structure, regularly found conjoined and therefore often conflated. One is that between romantic/sexual partners or spouses; the other between parent and child. Further, romantic/sexual unions are not limited to heterosexual, monogamous pairings; and whatever software we use should be able to handle more general relationship structures.

It is deemed best to divide the romantic and parent-child relationship types into separate first-class entities called `union` and `parent_child` - both as their semantics are different, and as that makes it easier to generalize relationship structure and specify type of parent-child relationship.

### Layer Separation

It is also deemed best to separate into separate layers:
- canonical data, the source of immutable truth - stored in the `data` array - used for loading, serialization, validation passes, and iteration over all entities; 
- the traversal/read model - stored in `indices` - indices used for fast lookup, graph traversal, helper functions, rendering and UI interaction;
- the UI/runtime state, the current condition for navigation/UI - stored in the `state` array - used for selections, paths, toggles, and navigation history; and
- an app context layer - for transporting objects between render and controller systems - stored in `ctx = {data, indices, state}`.

### Graph Orientation

My specs led to these observations:
- Not only are people and families linked to each other and to documents, but conversely, documents are also linked to people and families. The linking is bidirectional. The same is true for other genealogical entities.
- Even if relatives or family groups are what hook us into genealogy, documents and FAN club members eed to be treated on the same level - display-wise - as individuals and family groups. All entities need to be displayable, with themselves as the focus and with links to whatever else they're linked to.

Thus the best design for this app was not as nested family groups, but as a generalized relationship graph - a bidirectional graph in which we should be able to traverse any link from one entity to another.

### Multiple Panels

Further, we should be able to display multiple different entities at the same time. Hence this app is designed as multiple panels on the same screen simultaneously and on the same level, where one does not have to change the display view to get new information. This is different from Ancestry or other apps I've seen, where there's a primary view at all times, which one has to leave to see other types of entity in more depth.

## Future Direction

The next big step is UI-based CRUD for all entities, with all that comes with it - saving to JSON, allowing creation or loading of project on page load, auto-linking, and allowing conversion of a FAN to a relative, among other things.

The overall end point remains unclear. Once CRUD and merging are in place, research dashboards are added, the app is made portable via Electron or something similar, and a genogram layer is in place, my initial goals will essentially be met. I would be happy to hear ideas of ways the project can be expanded beyond this, to increase its value to those doing careful, serious research.