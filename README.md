## Obsidian Journey Plugin
### Discover the story between your notes!

![Map](https://raw.githubusercontent.com/akaalias/obsidian-journey-plugin/master/map.png)

## How to use this plugin - Walkthrough

- Video TBD!

## Main Discussion

https://forum.obsidian.md/t/new-plugin-journey-find-the-story-between-your-notes/12153

## Feature Backlog is Here!

https://trello.com/b/ICKWjoBu/obsidian-journey-plugin-backlog

## My Background
Hey there, Alexis here! 

I’ve put together this new plugin and I would like to share with you. 

Basically it helps me find the stories between my notes and bootstrap the outline for a new text much faster.

Overall, I’ve noticed that my actual creative output hasn’t been as prolific as I would like it to be. I’ve created hundreds of atomic notes, connected them etc. 

And yet I felt really stuck and didn’t know how to extract a linear story from my ‘hairball’ vault.

To me, the upfront work of creating that outline is still really hard. 

Plus: I KNOW it’s in there (my vault)! I just want to get to a first draft faster. 

I want to spend my energy writing and editing the story. 

So that’s what this is about. Find the connection between two notes in my vault to discover new ideas and help write that first draft.

Here’s a quick video with a demo if you’re interested:

Cheers and let me know what you think!

[![](https://github.com/akaalias/obsidian-journey-plugin/blob/master/journey-thumbnail.png?raw=true)](https://www.youtube.com/watch?v=iRydNlinRlc)

## Deep-Dive into the individual settings
### What features are included:

Based on the [amazing community feedback and comments](https://forum.obsidian.md/t/new-plugin-journey-find-the-story-between-your-notes/12153), I realized that there are many different ways to go on that journey and so I've created a bunch of features you can toggle on or of to your liking. 

These features are like preferences you can give your navigation-system in your car. Maybe today, all you care about is getting from A to B quickly. Maybe tomorrow, you have more time to "take the scenic route." I want you to be as flexible as possible.

- Feature 1: Use "Forward-Links" (Enabled by default)
- Feature 2: Use "Back-Links" (Enabled by default)
- Feature 3: Using Tags (Disabled by default)
- Feature 4: "Take the scenic route" aka Avoid MOCs (Disabled by default)

Because each feature has an impact to whether the plugin CAN FIND or CANNOT FIND a path between your two notes, I want to demonstrate what each does as simply as possible. 

So, let's start by imagining this very basic vault with 4 notes. "Note A", "Note B", "Note C" and "Note D"

- A links to B
- B links to C
- C shares the same tag as D

![Vault](https://user-images.githubusercontent.com/111555/106387223-0f427a00-63d9-11eb-86b3-5a2ae53a1950.png)

#### Feature 1: Use "Forward-Links" (Enabled by default)
Links are basically one-way streets from one note to the next. That means the plugin will show you only a path IF a forward-linked path exists but it won't show you a path that goes "against" the one-way street. 

![forwardlink](https://user-images.githubusercontent.com/111555/106387228-136e9780-63d9-11eb-84a4-208b308f1b07.png)

With the example and this feature turned ON, the plugin will...

* Successfully find you a path from A to C (Via B) 
* NOT find you a path from C to A because that would be against the one-way street

#### Feature 2: Use "Back-Links" (Enabled by default)
This is basically the inverse of using "forward-links". With this feature, you navigation system will find ONLY paths that are based on going against the one-way streets. 

![backlink](https://user-images.githubusercontent.com/111555/106387232-19fd0f00-63d9-11eb-8510-df474ff130d6.png)


With the example and this feature turned ON, the plugin will...

* NOT find a path from A to C because there are no back-links to follow
* Successfully find you the path from C to A (Via B) because the back-links point that direction

#### Feature 3: Using Tags (Disabled by default)
Thank you [alltagsverstand](https://forum.obsidian.md/u/alltagsverstand/summary) for the idea which I had not thought of and which resonated with many of you.

As the name suggests, Tags can now also be paths between notes. 

![tag](https://user-images.githubusercontent.com/111555/106387241-1ff2f000-63d9-11eb-94e2-d62c0995ca17.png)


With the example and this feature turned ON, the plugin will...

- Successfully find the path from C to D (C -> #tag -> D) and from D to C (D -> #tag -> C)

If I now have Back-Links and Forward-Links enabled as well, I can now find the path from:

- A to D (A -> B -> C -> #tag -> D)
- D to A (D -> #tag -> C -> B -> A)

Note that this feature is disabled by default.

#### Feature 4: "Take the scenic route" aka Avoid MOCs (Disabled by default)
One of [thoresson](https://forum.obsidian.md/u/thoresson/summary)'s many ideas that turned out to be really, really useful when I started to pressure-test finding cool paths.

> Avoid Y (perhaps a tag used for MOC and other structured notes so that only atomic notes are included in the journey)

If turned on, this feature will exclude finding a path via MOC notes and help you "take the scenic route" instead. With this feature, you avoid passing through the "big city" (aka MOC) and instead find a path less traveled. 

In the following example, with this feature turned ON, the path from A to C would be: 

- A -> Foo -> Bar -> C (instead of A -> MOC -> C)

![MOC](https://user-images.githubusercontent.com/111555/106387246-26816780-63d9-11eb-9407-a76c078b8e6c.png)

##### "How many links make an MOC?"
A sub-feature for "taking the scenic route" where you can define at what amount of links inside a note makes it an MOC to avoid. 

A huge shout-out to [thoresson](https://forum.obsidian.md/u/thoresson), [alltagsverstand](https://forum.obsidian.md/u/alltagsverstand), [Thecookiemomma](https://forum.obsidian.md/u/Thecookiemomma), [cestvrai](https://forum.obsidian.md/u/cestvrai), [matteor](https://forum.obsidian.md/u/matteor), [Danashafir](https://forum.obsidian.md/u/Danashafir), [EhuddRomero](https://forum.obsidian.md/u/EhuddRomero), [I-d-as](https://forum.obsidian.md/u/I-d-as), [osgav](https://forum.obsidian.md/u/osgav), [Erick_James_Dodge](https://forum.obsidian.md/u/Erick_James_Dodge), [3mbry0](https://forum.obsidian.md/u/3mbry0), [Klaas](https://forum.obsidian.md/u/Klaas), [ryanjamurphy](https://forum.obsidian.md/u/ryanjamurphy), [EdElgar](https://forum.obsidian.md/u/EdElgar) and [Daveb08](https://forum.obsidian.md/u/Daveb08) for helping making this awesome for everyone!

