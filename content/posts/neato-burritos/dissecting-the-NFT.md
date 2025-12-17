+++
author = "Steffen Blake"
title = "Dissecting the NFT"
date = "2022-01-09"
description = "What is an NFT?"
tags = [
    "ButThatsJustMyOpinionMan",
    "crypto",
    "blog"
]
categories = [
    "neato-burritos",
]
series = ["Opinions"]
aliases = ["dissecting-the-NFT"]
+++

TEST

The concept of "what" an NFT is to the average individual, is primarily built on top of a lot of misconceptions, inaccuracies and over-simplifications. Every day I see people arguing back and forth over whether or not the ability to sell each other pictures is valuable or not.

The issue is this entire discussion is reductive. NFTs are a whole lot more than simply just pictures of monkeys. I would even go so far as to say that selling a piece of digital art with an NFT contract is the simplest most bare bone example and, though valid and it works, it also is extremely rudimentary and is only using a fraction of the potential of an NFT contract.

Before we dig into discussing all the powerful capabilities NFT contracts have that are way fancier than just selling a digital file, I want to address a lot of the misinformation and misconceptions I commonly see regarding even these simple "Image NFT Contracts".

I strongly suggest going over the below bullet points, as chances are if you have been linked to this article by someone out there, its because any of the below misconceptions apply.

# Misconception 1: NFT Images are stored on centralized servers

"If their server goes down, you lose your files! Its just a URL!"

This is actually usually incorrect. Most (I won't say all because I haven't checked every single service, only the big ones) support what are called IFPS URLs. These work the same way torrent URLs do. They are also decentralized and anyone can put the file up for you to download from. In other words, even if the service provider's website goes down, as long as someone (which could be you, the owner!) is running an IFPS node, your file continues to exist at the URI and is perfectly fine and intact.

This works the same way in that once a torrent magnet URI has been posted, anyone in the world can seed the torrent. Actually it works a LOT like that, the IFPS system and torrent magnet URIs basically go hand in hand. In other words, all the picture URIs that individuals own via NFT contracts will continue to persist and function even if the business that handled the transactions goes down.

# Misconception 2: I can just screenshot your million dollar NFT!

Well, yeah, you absolutely can!

You also can take a screenshot of a still frame from the latest billion dollar Marvel Studios movie.

The thing is, though technically screenshotting an NFT is "pirating" it, no one should really care. That is not the use case. This is effectively the equivalent of taking a picture of the Mona Lisa and claiming you "stole" the Mona Lisa, or screen capping a frame of Captain America's ass and claiming you "stole" it.

This is not the use case or target domain of NFT ownership. Someone who mints an NFT, owns the rights to it. This works exactly the same as how a music artist would own the rights to a song they made, or how a software developer owns the rights to their code...

Up until any of the above have released said digital good under an open license like MIT or Fair Use.

Chances are, most music artists don't care if you "steal" their music to listen to it. If you download their song they probably don't even notice. (In fact most places you can pay artists for their music let you listen to it for free, and then ask if you wish to tip them for it after the fact.)

Where this ownership actually matters is for large corporations. For example if I design a logo and own it, and you screenshot that logo, that doesn't hurt me. But if a big company like Disney or Warner Bros steals my logo I own and uses it in a blockbuster movie, well now I care and will probably take legal action.

That is the domain space of Owning an NFT.

To add onto this, the "use case" for image NFTs is as art pieces. So as an example one may hang it up on their wall in their home, or since it is digital they may hang it up in a digital home they create for themselves. You know, Metaverse style. We already have examples of folks creating their own personalized digital homes in games like Second Life, Final Fantasy XIV, VR Chat, etc. etc.

The more customizable games where you can add in your own assets make it trivial for you to hang such an art piece up. A simple QR code beside the "digital" art and viola! People can look and see "hey, this person actually owns this"

Note: I personally wouldn't claim this says good or bad things about you. I will say there is a very large crowd out there that would think very negatively of you for putting up such a thing in your home. But hey, if you wanna flex, you have that right.

# Misconception 3: It holds no legal weight!

This one is ambiguous. At it's core, there simply haven't been any serious court cases yet to actually settle this. At this time though lawyers are leaning towards the understanding that most main stream NFT platforms do not also confer a sale of Copyright alongside the NFT itself.

In laymen's terms, at the moment buying the picture of Mona Lisa doesn't also give you the right to sell your own pictures of the Mona Lisa, and in fact the original artists could proceed to go on and make more copies of that Mona Lisa and sell them.

However!

### This is not an issue with NFTs as a whole, but is an issue with the mainstream NFT platforms not supporting this functionality yet

In other words, this is a problem that can be fixed. Keep an eye out because I strongly expect soon we will see major platforms (and new) start supporting the inclusion of Copyright sales along with the NFT itself (presumably for a marked up price)

I don't doubt that the larger platforms are already working on this solution and investigating the best way to go about it.

You absolutely can create an NFT contract that also includes the Copyright as part of the sale. It just happens to be that currently larger platforms "pre-built" NFT templates you fill out don't support this. Yet.

# Misconception 4: The environment!

This is absolutely a current issue and you are right, the Ethereum Virtual Machine right now, as is, has a lot of environmental impact.

However, Ethereum is currently in the latter steps of its massive overhaul and upgrade to Ethereum 2.0, which will introduce the migration from Proof of Work to Proof of Stake, which will mean shifting from GPU mining (which is where all that energy gets burnt and used), to Staking (which uses a sliver of the energy)

Since I don't know when you are reading this article, I will recommend you take the time to read up on your own how far along this upgrade is. At the time of writing this, Ethereum has just completed setting up and testing the Beacon Chain (which enables Staking on a separate chain), and is predicting The Merge (which will bring the Beacon Chain into the MainNet and support Staking at the mainstream layer) within the next couple months of Q1/Q2 of 2022.

After that process is complete the next challenge is to enable Sharding, which will further enhance staking abilities by enabling the Ethereum chain to fork out into "sub chains" that can then merge into the main chain. At its core this will make the blockchain Asynchronous and enable even faster transaction speeds at even cheaper prices and lower energy consumption. Basically speaking, Sharding is the streamlining phase of Staking which makes it faster, cheaper, and better.

Once The Merge is complete, the "burning down the amazon forest" issue will be for all intents and purposes solved, and Sharding will further capstone that issue and put it down truly to rest.

### Personally, I am in favor of holding off on any NFT transactions until post Merge, I do consider that the morally correct choice for the environment. But that's just my opinion, man.

# The True Power of NFTs - Automation

An NFT contract merely refers to a logical contract the conveys ownership of anything that isn't currency. That means you can create an NFT contract that can handle sale of anything!

For example, individuals are already performing Ethereum Smart Contract sales of housing all over the world! This too is, by definition, an NFT.

But let's dig into the real powerhouse for NFTs. By existing on a digital blockchain that is publicly accessible and fully transparent, you could quite easily create an automated method for validating if, or if not, some given state is or isn't true.

An example may make this easier. My favorite go-to is YouTube Music Copyright claims. Specifically, let's say you want to use a famous artists song in one of your YouTube videos you put up. Right now the only way to convey whether you have the rights to do this involves a lot of lawyer paperwork and bureaucracy. You will have to start by contacting the artists representatives, sign a bunch of papers, get the rights, and then prove to YouTube you possess those rights too!

It's a huge pain, and even after all of that you may still get DMCA'd incorrectly!

What if we built a system to automate all these issues away and in turn make paying artists for using their music much easier? The result would be fantastic, because music artists could remove a monstrous amount of bloated middlemen between them and the consumer, and in turn could sell rights to use their songs on a larger and cheaper scale.

Right now the main reason using an artists song is horrifically expensive is because both sides need to pay a bunch of lawyers. If you take that out 99% of the costs vaporize and suddenly it becomes affordable.

NFT Contracts can do that, if YouTube/Google decide to support it, that is. Lets sort of dig into what that could look like at a high level.

# Step one: Artists registers their song and templates up the NFT Contract

They would be asked what variety of sales they wish to support and at what price points. For example they could support any of:

* Lifetime use License (expensive)
* Single use License (cheap, you can only use it in one video)
* N uses License (same as above but you get N videos you can use it in)
* Royalty License (no upfront cost, but the Artist automatically gets a cut of your monetization per click)
* And probably many more!

Then they upload their song and metrics can be pulled from it to create a digital thumbprint.

# Step two: Consumers register themselves on the same platform and link their YouTube account

This step is straightforward. Using their signature they can validate between YouTube <-> NFT Platform "I am this person I say I am", which is just a form of OAuth.

Once that is done they can head over to the NFT Platform and start purchasing rights to use Artists songs.

# Step three: Consuming the Contract

Any individual who now has the rights to use a song can make their YouTube videos as usual. However now when YouTube detects "Hey I know this song, an Artist owns it" they can go double check against the NFT Platform and go "Oh, okay it has an NFT contract. And I also can see based on that contract, the user who uploaded this video paid for 3 uses of the song. Okay, I will notify the contract one of the three uses has been consumed!"

And viola! Your video doesn't get taken down and instead YouTube could auto-generate a link between your video and the song's NFT contract so others can easily see "What song is this? I like it!"

And since no lawyers were involved here chances are you paid a fraction of the price you usually would have. What used to take thousands of dollars to negotiate now likely only takes pocket change.

# Closing remarks

I think the majority of people who demonstrate intense vitriol of NFTs need to take a big step back and look at the bigger picture.

Sure, you may consider buying and selling of digital pictures online to be bizarre, but fundamentally all this is is the Beta version of functionality that has much bigger and widespread impact on the very way we think about transactions.

When the internet was first becoming widespread there was very similar vitriol, because very similar "rudimentary and pointless" websites [were constantly being stood up.](http://www.milliondollarhomepage.com/)

To many folks, simply bringing up the concept of a website was often scoffed at and considered nothing but a bunch of scams. Many similar arguments were made, "Can't someone just copy your website?" and the like.

Today however we now understand that the internet as they used it back then was merely a drop in the bucket compared to its potential today.

NFT contracts are much the same. Ten years from now people will look back on NFT image contracts and laugh, "That was considered the main use case for NFTs back then? Its crazy they used it for something so basic, compared to now when basically everything uses them"

If you told someone in the early 2000s you could literally buy anything and everything on the internet and have it delivered to your doorstep, they would likely respond with "The internet? You mean like, websites? My uncle says he bought a website, seems stupid, I don't get it"

Just keep that in mind next time your gut instinct is to respond with extreme negativity the moment NFTs are brought up.