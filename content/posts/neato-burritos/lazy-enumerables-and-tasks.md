+++
author = "Steffen Blake"
title = "The Dangers of Lazy Enumerables and Task Handling"
date = "2023-02-26"
description = "Possibly the worst Gotcha I have encountered in awhile..."
tags = [
    "Coding",
    "dotnet",
    "csharp"
]
categories = [
    "NeatoBurritos"
]
series = ["NeatoBurritos"]
aliases = ["lazy-enumerables-and-tasks"]
+++


So I just spent well over an hour and a bit (maybe more but who's counting) digging into this extremely frustrating behavior of Tasks, and I wanted to write down my solution since I didn't see anything related to it online.


To begin with, I wanted a variant of `Task.WhenAll(...)` that did not wait for all tasks to complete before throwing an Exception. Consider this following code:


```csharp {linenos=table}
async function FailsAsync() {
    await Task.Yield();
    throw new Exception
}


try
{
    await Task.WhenAll(FailsAsync(), FailsAsync(), Task.Delay(10000));
} catch { ... }
```


What you will find is though the catch block gets hit, it isn't until after 10 seconds when that last Delay task completes.


So, I wrote this following code of my own. The goal of this method is to work almost the exact same way `Task.WhenAll(...)` works, but if any of the tasks throws of the group, all execution ceases *immediately* and the encapsulating Task also throws ASAP.


```csharp {linenos=table}
public static async Task HandleAll(IEnumerable<Task> tasks)
{
    var tasksInternal = tasks.ToList();
    while (tasksInternal.Any(t => !t.IsCompletedSuccessfully) && !tasksInternal.Any(t => t.IsFaulted))
    {
        var next = await Task.WhenAny(tasksInternal);
        _ = tasksInternal.Remove(next);
    }


    var exceptions = tasks.Where(t => t.IsFaulted).SelectMany(t => t.Exception!.InnerExceptions).ToList();
    if (exceptions.Count == 1)
    {
        throw exceptions[0];
    }
    else if (exceptions.Count > 1)
    {
        throw new AggregateException(exceptions);
    }
}
```


I won't go too deep into detail here but the core of this method is you pass the Tasks in the same way as `.WhenAll(...)` and internally it uses `WhenAny` instead, which allows it to keep checking "has anyone failed yet?" anytime *any* Task finishes, rather than only bothering to check when all have finished.


If you now run this with that earlier example code like so:


```csharp {linenos=table}
async function FailsAsync() {
    await Task.Yield();
    throw new Exception
}


try
{
    await HandleAll(FailsAsync(), FailsAsync(), Task.Delay(10000));
} catch { ... }
```


The catch block is hit effectively immediately, rather than 10s later. This is crucial for when you want to run multiple parallel tasks and some of them may *never* complete, as they just go on forever.




However, this is when I encountered a big "gotcha" in C# that really took me far too long to realize what my issue was.


So to begin, consider now instead if you have a `Class` which has an async method on it, and a parent class that has multiple copies of these, and you wan't to aggregate all those Tasks together into a single awaitable. You would, like I did, assume that a simple Linq `.Select(...)` call to make an Enumerable of child tasks, and then that handy method we built above would do the trick? right?


... right?


```csharp {linenos=table}
class ChildClass
{
    async Task RunAsync() {....}
}


class ParentClass
{
    // These children are populated by something else, its not important
    List<ChildClass> Children { get; }
    async Task RunAsync()
    {
        var childTasks = Children.Select(c => c.RunAsync());
        await HandleAll(childTasks);
    }
}


try
{
    await myParentInstance.RunAsync();
} catch { ... }
```


And you'd be mind boggling surprised to see that when one of your Child Tasks throws an exception, it shows up in your debugger logs but the `catch` never gets hit, and the Task returned from the parent reports it is `.CompletedSuccessfully` without an error in sight.


What? Hold on, where'd that exception go? How did it get dropped?


Aight, if you want, feel free to fiddle with this and see if you can spot it...


# The Solution


Turns out the problem was right here:


```csharp {linenos=table}
.Select(c => c.RunAsync())
```


How? Well, `.Select` returns a "lazy loaded" Enumerable that only *actually* iterates once something hydrates it, basically when you actually force it to be loaded into memory. Until you do that the code inside of `.Select` never actually gets called. And with a `foreach` loop it will only load one at a time.


So what ends up happening is the `foreach` loop hydrates the Tasks one at a time, which defers the execution because of Task async weirdness. This then for some reason causes the exception throwing to... not work? Or at least it throws, but then doesn't throw, because I guess the `foreach` loop only cares about the last task, so it becomes a race condition or something?


It honestly became hard to fully grok wtf was even happening at the higher task engine level, but what I *can* tell you is the solution it turns out was simple and made me feel very dumb, all you have to do is change the code to this:


```
var childTasks = Children.Select(c => c.RunAsync()).ToList();
await HandleAll(childTasks);
```


When you call `.ToList()` it forces instant greedy loading / hydration of the Enumerable, right away. This forces all the Tasks to spin up right away, rather than being deferred. This now ensures that the `foreach` loop is operating on a "real" and not "partially loaded" list of Tasks, which ensures there isn’t any sort of "I’m running but not *actually* running" weirdness going on.


So, here's hoping this post helps someone out, out there, in case you run into something similar as I did.


Cheers!


