# Master Genealogical Research File (v. 0.4.1)

## Why this Program?

Genealogists like me have quite a few apps at our disposal, for organizing and displaying our data. So we might ask, quite justifiably, whether we actually need another one.

If we were only considering products aimed at beginners or casual amateurs, I'd probably say "no", that another would be redundant. Lots of programs can create a family tree; lots can make a chart out of data (Chronoplex Software's *My Family Tree* is probably the best I've seen, one I personally use and like using - check out its descendant fan chart); a number allow one to include and display media (not always well); a number allow interfacing with common repositories like Ancestry.

But I try to take genealogical research more seriously; and in my research I've noticed there are certain bits of functionality a professional or serious amateur researcher might need, that I simply couldn't readily find or could only find handled in a cumbersome and awkward way. These include:
- for cluster research, the ability to handle FAN club data;
- for descendancy research, a readily-visible way to gauge whether more information on a person's spouses and/or children is needed;
- a master inventory of source documents/media/artefacts accessible in one place;
- the ability to handle non-traditional family structures of various sorts, including non-monogamous ones; and
- the ability to spot issues in family dynamics and address them, akin to what genograms do.

Not being able to find this functionality, I decided I had to design it myself. Hence this app.

## Requirements

This app is designed to run via a web browser (being designed in HTML/CSS/JS). Any sufficiently modern browser should be able to run it; I'm not aware of issues with its functioning on any particular browser (I designed it using Firefox).

This app depends on an external JSON file to store data. Because of this, it currently has to be run with the JSON file hosted on a server. A good workaround, at present, is to open the folder in VS Code and go live. Ultimately, the plan is to port this app to Electron or something similar so it can be run standalone. (Note that for privacy reasons, no JSON file is provided with this project. The ability to create one for one's own research will be added in due course.)

As this app runs via a browser, its functionality does not depend on any particular operating system, provided it's sufficiently modern.

## How to Use It

Currently, when the app is loaded, it goes straight to display/navigation. (In due course, it will on load give you the choice of either opening an existing project or opening a new one, before going to the display.)

Once display/navigation is available, there are a handful of ways to interact with it.
- There's the search bar, which lets you go to any entity you search for. (Right not this is limited to persons, documents and FAN.)
- There's the navigation block right under the search block. This breaks into to parts: the upper one, an expandable ancestor tree, for selecting an ancestor of a root person; the lower one, an expandable descendant tree, for selecting descendants of a selected ancestor. Selecting an ancestor in the upper part displays that person's information in a panel in the details block; selecting a family group does likewise in a different panel. (In due course one will be able to create, edit or remove individuals directly from here too.)
- Once an individual, family group, source document, FAN, event or research note has been selected and displayed in the appropriate panel, one may jump to any entity (person, document or otherwise) linekd to that entity by clicking the appropriate button. (In due course one will also be able to create, edit, merge or delete these entities from the display.)
- There's also a navigation history panel near the bottom, showing the navigation history chain. One may revert to an earlier point in the navigation chain by clicking on the appropriate state.

## Further Documentation

See these files for more in-depth documentation:
- [System Overview](./docs/architecture-system-overview.md)
- [Entity Model](./docs/architecture-entity-model.md)
- [Graph Philosophy](./docs/architecture-graph-philosophy.md)
- [Indexing](./docs/architecture-indexing.md)
- [Normalization](./docs/architecture-normalization.md)
- [Rendering Philosophy](./docs/architecture-rendering-philosophy.md)
- [Roadmap and Revision History](./docs/architecture-roadmap.md)

## Current Status

This app is a work in progress. The current phase I'm working on includes auto-normalization, adding/editing/merging/deleting entities through the UI, and firming up indexing.

I welcome with gratitude:
- constructive feedback on this app or its documentation; and
- suggestions of additional features you might find useful (that aren't already noted in the Roadmap document).

The final decision on what is or isn't ultimately included in this app, of course, rests with me.
