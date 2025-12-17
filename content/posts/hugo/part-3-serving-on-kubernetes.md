+++
author = "Steffen Blake"
title = "Making Of this Blog - Part 3"
date = "2022-11-01"
description = "Serving Hugo on Kubernetes"
tags = [
    "blog",
    "docker",
    "kubernetes"
]
categories = [
    "hugo"
]
series = ["Hugo"]
aliases = ["making-blog-part-2"]
+++

[Part 1 - Statically Served, High availability](/posts/hugo/part-1-making-of-this-blog)

[Part 2 - Building a CI/CD Markdown Blog](/posts/hugo/part-2-building-a-blog)

Part 3 - Serving Hugo on Kubernetes <-- (You are here!)


# Requirements

For this next stage of this blog, you will need primarily one thing installed: Kubernetes

See this handy guide here on how to install minikube (a handy local test enviro for kubernetes) and get it running: https://minikube.sigs.k8s.io/docs/start/

Furthermore you will want to have on hand the following from the prior parts of this guide:

* Your functional Hugo blog that is currently stored in your Git repo of choice (GitHub, Gogs, Bitbucket, etc)

* Your Public IP address

* Your Git webhook "Secret" from step twelve of Part 2

