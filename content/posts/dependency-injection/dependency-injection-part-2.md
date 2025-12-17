+++
author = "Steffen Blake"
title = "Dependency Injection Part 2"
date = "2021-09-10"
description = "Extensions"
tags = [
    "csharp",
    "dotnet",
    "DependencyInjection"
]
categories = [
    "DependencyInjection"
]
series = ["DependencyInjection"]
aliases = ["DI-Part-2"]
+++

[Part 0: What's the deal?](/post/dependency-injection/dependency-injection-part-0)

[Part 1: Bootstrapping](/post/dependency-injection/dependency-injection-part-1)

Part 2: Extensions <-- (You are here!)

If you would like to catch up to where we are at now, you can checkout the git and start on the branch ‘Dependency-Injection-Part-2’, which is where we left off on the end of Part 1

[Github](https://github.com/SteffenBlake/TStore/tree/Dependency-Injection-Part-2)

[Direct Link](https://github.com/SteffenBlake/TStore.git)

## Interface Extension Practices
Before we begin, I’ll go into the basics of why we are about to do the following coding choices below. What our end goal is is to have the following methods on our `ITStore` object that make life much easier for us, since the current methods are very low level and granular. Also a pain to use.

```csharp {linenos=table}
void Register(Type type);
void Register<TKey, TValue>();
void Register<T>();

T Fetch<T>();
```

Now, you’re first instinct will be to add these directly to your `ITStore` interface and implement them on your `TStore` class, and albiet its not a necessarily bad approach, if we want anyone to ever be able to extend or make their own versions of our logic, we can do much better.

To start, take a look at probably what happens when you logically work through these new methods what you end up with, based on our original function on `TStore(Register(Type, Type))`

```csharp {linenos=table}
public void Register(Type type) => Register(type, type);
public void Register<TKey, TValue>() => Register(typeof(TKey), typeof(TValue));
public void Register<T>() => Register<T,T>();

public T Fetch<T>() => (T)Fetch(typeof(T));
```

Notice how all these new methods just do a tiny bit of work and delegate the real work back off to our original methods? Anytime you see this pattern emerge you can pretty safely go with the Extension Pattern instead.

Then, when someone else wants to extend functionality of `TStore`, or make their own version of it as a middleware, instead of having 5 methods to fill out, they just need to fill out the original 2 and the Static Extensions we make will keep working for them.

## Step 1: Simple Extensions
So to start, we basically just want to apply the same code we had above, except as a static class with static extension methods, which is easy. Make sure you refer to the `ITStore` interface when extending, and not the `TStore` class!

```csharp {linenos=table}
public static class ITStoreExtensions {
    public static void Register(this ITStore store, Type type) => store.Register(type, type);
    public static void Register<TKey, TValue>(this ITStore store) => store.Register(typeof(TKey), typeof(TValue));
    public static void Register<T>(this ITStore store) => store.Register<T,T>();
    
    public static T Fetch<T>(this ITStore store) => (T)store.Fetch(typeof(T));
}
```

## Step 2: Update the Example code
Now you should be able to modify your code in the example to be much cleaner looking!

```csharp {linenos=table}
var store = new TStore.Implementations.TStore();
store.Register<IConsoleService, ConsoleService>();
store.Register<IHelloWorldService, HelloWorldService>();
var consoleService = store.Fetch<IConsoleService>();
consoleService.PrintHelloWorld();
Console.ReadKey();
```

And running it should still produce your expected output!

## Step 3: Fixing your type checking
You may notice however one minor glitch in existing code due to our generics, which we can readily fix however. The following code will, in our architecture’s current state, compile and not warn us we did something wrong:

```csharp {linenos=table}
store.Register<IConsoleService, HelloWorldService>(); // This should warn us we did something wrong!
```

Using Generics, we can handle this pretty easily, we just need some minor typechecking validation for our generic methods!

```csharp {linenos=table}
public static void Register<TKey, TValue>(this ITStore store)
    where TValue : class, TKey
    => store.Register(typeof(TKey), typeof(TValue));
    
public static void Register<T>(this ITStore store) 
    where T: class
    => store.Register<T, T>();
```

This code addition is pretty straightforward and has 2 parts really.

First off, the class modifer asserts that this generic must be a class, not an interface. You shouldn’t be able to map an interface to an interface, only an interface to a class or a class to a class.

Second, the TKey constraint basically just says ‘Our value must inherit from our key’

Now if you try and do that same broken code from before, the compiler will error and inform you your types don’t match, ~viola`!

## Step 4: Fancy Namespace Registering
A fancy method lots of DI containers use is registering by namespace. This portion of the work has been easy so far, so I think it’s time for a challenge. Let’s try it out!

This will take some reflection, so our first method we need to use is `GetCallingAssembly().ExportedTypes`, as well as the `IsClass` and `Namespace` property on those types.

`GetCallingAssembly` will load up everything in the assembly of wherever the method was called from, and `ExportedTypes` will whittle us down to only public types. `IsClass` will whittle that further down to specifically, well, classes, and finally we can do pattern matching on the `Namespace` to get the ones we care about.

We also are going to need a way to wildcard match strings, and unfortunately somehow `C#` still doesn’t have such a tool so we’ll need to convert to Regex and use that, so we’ll need the following extension to start (Can be found in multiple varients on StackOverflow from multiple authors):

```csharp {linenos=table}
public static class StringExtensions
{
    public static string WildCardToRegex(this string value)
    {
        return "^" + Regex.Escape(value).Replace("\\*", ".*") + "$";
    }
}
```

And we can then use these pieces of the puzzle together to automatically register everything in a namespace with wildcard and regex support:

```csharp {linenos=table}
public static void RegisterNamespace(this ITStore store, string namespacePattern)
{
    // Create our RegexMatch function
    var regexPattern = namespacePattern.WildCardToRegex();
    bool NamespaceMatch(string nSpace) => Regex.IsMatch(nSpace, regexPattern);

    // Get all public non-abstract classes that match namespace
    var targetClasses = Assembly.GetCallingAssembly().ExportedTypes
        .Where(type => type.IsClass && !type.IsAbstract && NamespaceMatch(type.Namespace))
        .ToArray();

    // Iterate over each class in these namespaces
    foreach (var target in targetClasses)
    {
        // Direct register
        store.Register(target);

        // Also register any inheritted public interfaces on that class to it
        foreach (var interfaceType in target.GetInterfaces().Where(i => i.IsPublic))
        {
            store.Register(interfaceType, target);
        }
    }
}
```

If all went according to plan, we can further simplify the example code now as well.

```csharp {linenos=table}
var store = new TStore.Implementations.TStore();
store.RegisterNamespace("TStore.Example.Implementations*");

var consoleService = store.Fetch<IConsoleService>();

consoleService.PrintHelloWorld();

Console.ReadKey();
```

And that concludes this section for today! Stay tuned for the next part where we delve into multi-registering and injecting arrays and enumerables!
