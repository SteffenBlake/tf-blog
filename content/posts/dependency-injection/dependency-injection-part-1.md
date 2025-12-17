+++
author = "Steffen Blake"
title = "Dependency Injection Part 1"
date = "2021-09-04"
description = "Bootstrapping"
tags = [
    "csharp",
    "dotnet",
    "DependencyInjection"
]
categories = [
    "DependencyInjection"
]
series = ["DependencyInjection"]
aliases = ["DI-Part-1"]
+++

[Part 0: What's the deal?](/posts/dependency-injection/dependency-injection-part-0)

Part 1: Bootstrapping <-- (You are here!)

[Part 2: Extensions](/posts/dependency-injection/dependency-injection-part-2)

### Note: This project will be done entirely in C#, if you want to follow alone in your own language like Java, you will probably need to do some googling on how to perform specific parts where I reference .Net specific libraries. Ill try to only do this when absolutely necessary.

To start, ensure you have Visual Studio 2017 installed, you can get a free copy of the Community Edition [here](https://www.visualstudio.com/).

Next, use whatever your preferred Git tool is and download a copy of the starter repo.

[Github](https://github.com/SteffenBlake/TStore/tree/Dependency-Injection-Part-1)

[Direct Link](https://github.com/SteffenBlake/TStore.git)

You should be able to follow along with my Commits to the repo as we go, just take a look at the commits to master to get an idea for it. It should be noted you *will not be able to push anything to these branches, of course. If you want to use source control you will of course need to fork the repo in order to actually commit.

This, of course, won’t be necessary, but I am still expecting to see dozens of forks of the project without any commits anyways because such is GitHub. Anyways.

## Step 1: Organization

I like to use the following organization for my projects, my main project just has the usual name and houses all the standard logic, classes, etc. The ‘Tests’ project will have all of our Unit tests (we’ll get to that later) and the Example project is for people to look at to get a feel for how to use the project.

To begin, lets make some folders in the main ‘TStore’ project to start out organized. It should look something like this

![Organization](/images/dependency-injection-part-1/organization.jpg)

* Extensions: This will be the folder we put any static class extensions of interfaces/classes
* Implementations: We will put our classes in here
* Interfaces: As the name implies, all interfaces go in here
* Utilities: This last folder will just hold the various other stuff that doesnt fit anywhere particular. Constants, Enums, etc.

This is how I like to organize myself in C# but you are more than welcome to do it your own way, whatever works for you!

So to start let’s start by breaking down the usual DI Container flow.

Step 1: Instantiate a new DI Container with some form of Configure class system, which is used to start setting everything up.
Step 2: Call some form of `Get` method on the container, passing in a type, and it will try and find something registered to that type based on prexisting config

And that’s really all there is to it! It’s really simple actually, so let’s start by defining our interfaces and implementing them. We probably also want a means to check if something is registered already and the ability to unregister an object from a type as well!

```csharp {linenos=table}
public interface ITStore
{
    bool IsRegistered(Type type);
    void Register(Type key, Type value);
    void UnRegister(Type type);
    object Fetch(Type type);
}
```

```csharp {linenos=table}
public class TStore : ITStore
{
    public virtual void Register(Type type, object entity)
    {
        throw new NotImplementedException();
    }
    
    public virtual void UnRegister(Type type, object entity)
    {
        throw new NotImplementedException();
    }

    public virtual bool IsRegistered(Type type, object entity)
    {
        throw new NotImplementedException();
    }

    public virtual object Fetch(Type type)
    {
        throw new NotImplementedException();
    }
}
```

Easy enough. The `Register` methods for the `Store` are all pretty straightforward. We want to use a dictionary which holds a list of mapped types really, and thats about it.

```csharp {linenos=table}
private readonly Dictionary<Type, Type> Entities = new Dictionary<Type, Type>();

public virtual void Register(Type key, Type value)
{
    Entities[key] = value;
}

public virtual void UnRegister(Type type)
{
    Entities.Remove(type);
}

public virtual bool IsRegistered(Type type)
{
    return Entities.ContainsKey(type);
}
```

Now for the tricky part, the `Fetch` method. The key to this will be two .Net system methods (This part in particular you will have to look up how to do in other languages since they will probably be very different from C#)

First, `Type.GetConstructors`, which gets us a list of `ConstructorInfo` objects, which contains a list of `ParameterInfo` objects, which we can fetch those types from, and recursively call Fetch on those ones once we find the best match.

Second, `System.Activator`, which is the global machine that builds instances of all objects in your program, we’re going very low level here and calling it directly. You can pass in a list of params you know and it will find the best constructor matching those params, but we’ll do a bit of pre-caching here to help that speed up.

It sounds like a bit much but this is basically the entire DI container and after this step, our DI system will be completely functional already!

```csharp {linenos=table}
// Our Cache of pre-compiled Entities
private readonly Dictionary<Type, object> CompiledEntities = new Dictionary<Type, object>();
public virtual object Fetch(Type type)
{
    // Short circuit out if we've already cached this type
    if (CompiledEntities.ContainsKey(type))
        return CompiledEntities[type];

    if (!Entities.ContainsKey(type))
        throw new KeyNotFoundException($"No Registered key for {type.Name} found.");

    // Actual type we mapped to that we will now construct
    var targetType = Entities[type];

    // Type[][] Matrix
    var constructors = targetType
        .GetConstructors()
        .Select(c => 
            c.GetParameters()
            .Select(p => 
                p.ParameterType
            ).ToArray()
        ).ToArray();

    // Our best match Type[] Array
    var bestConstructor = constructors
        // Grab constructors we have every param known in our Entities
        .Where(c => c.All(p => Entities.ContainsKey(p)))
        // Grab the first one with the biggest constructor
        .OrderByDescending(c => c.Length).FirstOrDefault();

    if (bestConstructor == null)
        throw new KeyNotFoundException($"No valid constructor found for {type.Name}");

    // Fetch all the entities for those params Recursively
    // Compiling Type[] into object[]
    var constructorParams = bestConstructor.Select(Fetch).ToArray();

    // Use System to build an instance of our type(s) from scratch
    var entity = Activator.CreateInstance(targetType, constructorParams);

    // Cache this for later ease of access
    CompiledEntities[type] = entity;

    return entity;
}
```

## Step 2: Try it out!
At this point we have a functional DI Container, you can test this out by creating the following services Implementations + Interfaces in your Example project (Make sure you’re Example project has a reference to the Core Project!):

```csharp {linenos=table}
public interface IConsoleService
{
    void PrintHelloWorld();
}

public interface IHelloWorldService
{
    string GetHelloWorld();
}

public class ConsoleService : IConsoleService
{
    private IHelloWorldService HelloWorldService { get; }
    public ConsoleService(IHelloWorldService helloWorldService)
    {
        HelloWorldService = helloWorldService;
    }

    public void PrintHelloWorld()
    {
        var message = HelloWorldService.GetHelloWorld();

        Console.WriteLine(message);
    }
}

public class HelloWorldService : IHelloWorldService
{
    public string GetHelloWorld() => "Hello World!";
}
```

And finally we will `Register` these two services in our Main method and use them, and if all worked well we should see ‘Hello World!’ on our console!

```csharp {linenos=table}
static void Main(string[] args)
{
    var store = new TStore.Implementations.TStore();
    store.Register(typeof(IConsoleService), typeof(ConsoleService));
    store.Register(typeof(IHelloWorldService), typeof(HelloWorldService));

    var consoleService = (IConsoleService) store.Fetch(typeof(IConsoleService));

    consoleService.PrintHelloWorld();

    Console.ReadKey();
}
```

Thanks for reading and check out [Part 2](/post/dependency-injection/dependency-injection-part-2) where we build a bunch of handy extension methods for our interface to make life a lot easier (and make our example look a lot less messy!)
