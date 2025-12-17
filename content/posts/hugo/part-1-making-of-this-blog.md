+++
author = "Steffen Blake"
title = "Making Of this Blog - Part 1"
date = "2021-09-24"
description = "Statically Served, High availability"
tags = [
    "blog",
    "docker",
    "kubernetes"
]
categories = [
    "hugo"
]
series = ["Hugo"]
aliases = ["making-blog-part-1"]
+++

Part 1 - Statically Served, High availability <-- (You are here!)

[Part 2: Building a CI/CD Markdown Blog](/posts/hugo/part-2-building-a-blog)

[Part 2: Serve Hugo on Kubernetes](/posts/hugo/part-3-serving-on-kubernetes)

## Pre-amble

I wanted to take some time to write up a guide on some handy docker images I created recently in my process of building this very blog. I personally serve everything off of a Kubernetes cluster, but you could very well use this system much the same way on something like Docker Swarm or really any Docker management system.

## Goals

There were a couple primary goals when designing my blog architecture that had to be met.

1. All blog posts are written in markdown and automatically converted to HTML

2. Statically served pages for the fastest load times possible

3. Host on any git repository and utilize Webhooks for automatic push and build to this website

4. As small of a footprint as possible for the entire setup.

After a fair bit of research I came to the conclusion that the following applications were ideally what I needed

## Repository: Gogs

Gitea has more features and it actually was my first pick, but unfortunately I spent well over a week trying to get it working and just couldn't get it to be consistent. I had some weird http errors with redirection loops.

So instead I went with Gogs (the app it is a fork of) which has less features. However, still enough features.

For those of you following along though I will preface this with the fact that `any` repository server (Github, GitLab, Bitbucket, Gitea, Gogs, etc. etc.) `should` be compatible. Theoretically.

The only feature that is needed from the repo is the ability to setup Webhooks for Push events with a Secret, which basically every git server nowadays supports.

## Static File Host: `flashspys/docker-nginx-static` (with a twist)

This is an awesome docker image that was created by [Felix Wehnert (flashspys)](https://github.com/flashspys) that I made my own fork of, `docker-nginx-static-ha` which can be found [here](https://github.com/SteffenBlake/docker-nginx-static-ha)

What particularly caught my eye and has proven excellent:

### The image can only be used for static file serving but is less than 4 MB (roughly 1/10 the size of the official nginx image). The running container needs ~1 MB RAM.

#### So what's the difference?

Primarily how the files are cached. Specifically, `docker-nginx-static` simply just serves a mounted directory `directly`. This means once it is running, any changes you make to the directory will be reflected instantly.

I actually didn't want this, because when I run a build of the blog I don't want pages to be breaking if someone accesses the website mid-build.

So I made a minor tweak and created `docker-nginx-static-ha` (the ha is for High availability).

Now when the docker image is spun up it `copies` all of the mounted files that it will serve to its own internal directory, and then serves `that` directory instead.

This small tweak now makes a big difference. Once the docker image is spun up it internally "caches" all the files over, and if you modify the original mounted directory, `no changes are reflected on the served pages`

So now you can modify the original directory to your hearts content without making any impact on the website!

#### Okay so how do I actually make it update?

Simple, you just turn it off and back on again. When it spins back up again it will re-cache all the files

### Wait so... wouldn't that take the website down...?

If you only have a single docker container running, yes. But that's where the `HA` part comes in. We will dig into it farther below but what you would ideally want to have happen is use a docker management system like Swarm or Kubernetes which has `multiple` containers running in parallel, a load balancer to direct traffic across them, and then when you roll out an update you take the containers down `one at a time` so you always have some running, thus the website `smoothly` transitions over without any downtime or breaking issues.

## Blog compiler: Hugo

Honestly there's a few good options but I really have been enjoying Hugo. Its popular, its slick, its written in Go and thus works on my Raspberry Pi 4s, it compiles my blog wicked fast, and it has a pretty small footprint.

Being able to also manage what theme I use simply by what git repo I set as a submodule is also quite choice. This made the next part below also pretty easy since I could just import the theme along with the actual blog by just using the `--recurse-submodules` flag on `git clone`

## Blog CI/CD: adnanh/webhook

[Link here](https://github.com/adnanh/webhook)

This is another extremely lightweight and brutally simple application built by [Adnan Hajdarević](https://github.com/adnanh), once again built on go and thus compatible with basically everything.

It simply lets me write a "listener" for a webhook event and then fires off a bash script on trigger. I couldn't really ask for much else. Well. Actually there is one thing I could ask for, and that is support for referring to env variables inside of the webhook triggers and whatnot. Unfortunately I had to use a custom solution with `sed` to manually (oof) replace 'variables' in my webhook json, since I wanted those to be a configurable value.

## Putting them together: webhook-hugo

The next step was to combine webhook + hugo together into a single docker image, since both were compiled with go and could run in alpine this was actually pretty trivial. I found two solid and working hugo and webhook docker images and effectively just put them together. Then I prebuilt the webhook json file to be mounted in and a bit more bash work and, viola!

[docker-webhook-hugo](https://github.com/SteffenBlake/docker-webhook-hugo) now exists!

I detailed how to use it on its Github page but I will dig into how to actually consume and use these tools on the next blog post, so look forward to that!

[Part 2: Building a CI/CD Markdown Blog](/posts/hugo/part-2-building-a-blog)
