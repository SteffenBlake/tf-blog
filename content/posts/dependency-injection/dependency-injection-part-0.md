+++
author = "Steffen Blake"
title = "Dependency Injection Part 0"
date = "2021-08-28"
description = "Whats the Deal?"
tags = [
    "csharp",
    "dotnet",
    "DependencyInjection"
]
categories = [
    "DependencyInjection"
]
series = ["DependencyInjection"]
aliases = ["DI-Part-0"]
+++

Part 0: What's the deal? <-- (You are here!)

[Part 1: Bootstrapping](/posts/dependency-injection/dependency-injection-part-1)

[Part 2: Extensions](/posts/dependency-injection/dependency-injection-part-2)

So, you’ve heard your coworkers, peers, or anonymous internet friends mention Dependency Injection. Sometimes off the cuff as part of a sentence filled with other magic tech mumbo jumbo.

It sound’s pretty cool though, right? ’Dependency Injection', you’re veritable key to the programmer’s castle. It must be important to your code, right?

Well, not really. In fact, for a large quantity of code architecures, especially Functional Programming, Dependency Injection is out of the question since it goes against the very principle of your language.

But if you’re using an Object Oriented Architecture like C# or Java, well, now we are talking.

Let’s start by seeing what the internet has to say about DI (what we will refer to Dependency Injection by from now on because, well, we programmers love our Achronyms.

> “In software engineering, dependency injection is a technique whereby one object (or static method) supplies the dependencies of another object. A dependency is an object that can be used (a service). An injection is the passing of a dependency to a dependent object (a client) that would use it.” - Wikipedia

Well alright thats pretty straightforward. Except probably not, right? So what does all of that mean?

Well, to start, hopefully if you’re here reading this you’re at least familiar with things like classes, constructors, 'new’ing up something, instantiation, etc.

If not, go learn all those things first and come back please.

So I’ll assume you’ve got the basics and you’re ready for taking on some real programming architectures.

To start, consider you’re making a videogame, and you have the following `Character` class representing a character, and a static class called `AttackService` you use for, stuff or whatever:

```csharp {linenos=table}
public class Character {
    ...
     public int PerformAttack(Enemy enemy) {
        var damage = AttackService.CalculateDamage(this, enemy);
        return damage;
     }
     ...
}
```

Well, an experienced programmer will quickly alert you to the fact that simply using Static classes with Static methods is cumborsome, hard to maintain, requires loading things up front even if you don’t need it, hard to unit test properly… It’s a headache. Ok so you move to having `AttackService` as a non static class, your `Character` class probably looks like this now…

```csharp {linenos=table}
public class Character {
    private AttackService AttackService { get; } = new AttackService();
    ...
     public int PerformAttack(Enemy enemy) {
        var damage = AttackService.CalculateDamage(this, enemy);
        return damage;
     }
     ...
}
```

Better, right? Well sure maybe, if you’re okay with the fact that if someone accidently breaks `AttackService`.`CalculateDamage`, any unit tests for methods that call `AttackService.CalculateDamage` will also false flag as broken too, making it hard for you to zero in on where the real problem was.

Ok, so how do you get around this? How could you possibly have a class use another class, without breaking when that class breaks? Enter dependency injection (and hand in hand with it, Mocking Unit Test architecture!)

## How To Inject
So step one is, chances are your Object Oriented language of choice has something along the line of interfaces, which are effectively contracts you sign your classes up for that say “My class will have these publically exposed things at minimum”

So lets start by making the `IAttackService` interface, which has that public method on it, and bind it to our `AttackService` implimentation.

```csharp {linenos=table}
public interface IAttackService {
    int CalculateDamage(Enemy enemy, Character character);
}

public class AttackService : IAttackService {
    public int CalculateDamage(Enemy enemy, Character character) {
        // Magic logic goes here or whatever, not important!
    }
}
```

Ok cool, that doesn’t look like it changed anything, right? Wrong! See the thing about `IAttackService`, is it has no idea what `CalculateDamage` actually does, nor does it care what `CalculateDamage` does. Which might start giving you the hint about what we are going to do next… One little tweak to our `Character` class and…

```csharp {linenos=table}
public class Character {
    private IAttackService AttackService { get; }
    public Character(IAttackService attackService) {
        // Always do null checks with DI!
        if (attackService = null) throw new NullReferenceException(nameof(attackService));
        
        AttackService = attackService;
    }
    
    ...
     public int PerformAttack(Enemy enemy) {
        var damage = AttackService.CalculateDamage(this, enemy);
        return damage;
     }
     ...
}
```

Now you’ll probably notice, when you need to ‘new’ up a Character you’ll have to do it like this now:

```csharp {linenos=table}
    var steve = new Character(new AttackService());
```

And that, my dear reader, is `Dependency Injection`. Character class is Dependant on `IAttackService`, but you have `Injected` it through the `Constructor`

This type of Dependency Injection is called `Constructor` Dependency Injection.

If you wanted the Dependency to be optional, perhaps with a default, you also could do Property Injection like so:

```csharp {linenos=table}
public class Character {
    private IAttackService AttackService { get; private set; }
    ...
     public int PerformAttack(Enemy enemy) {
        if (AttackService == null) throw new NullReferenceException(nameof(AttackService));
        var damage = AttackService.CalculateDamage(this, enemy);
        return damage;
     }
     ...
}
...
    var steve = new Character { AttackService = new AttackService() };
...
```

Which also works fine. But we’ll just stick with Constructor Injection for now because, in my opinion, it’s cleaner and easier to maintain.

Congratulations, you now understand the basic of DI!

## But why?
Ok fair question, so consider now you want to unit test `Character` class without fear that your unit tests will fail. Well, rather than just injecting the usual `AttackService`, what if you constructed a dummy ‘fake’ one that just did everything in a simple, predictable way? And that fake service only existed inside of your unit test scope, so no one outside of it could accidently use it?

Welcome dear reader, to the wonderful world of Mocking! You would do it in our example as simple as this:

```csharp {linenos=table}
[TestFixture]
public class CharacterTests {

    internal class MockAttackService : IAttackService {
        public int CalculateDamage(Enemy enemy) { return 42; }
    }

    [Test]
    public void PerformAttackTests() {
        var mockAttackService = new MockAttackService();
        
        var testSteve = new Character(mockAttackService);
        var enemy = new Enemy();
        
        Assert.That(testSteve.PerformAttack(enemy), Is.EqualTo(42));
    }
}
```

Boom, easy as that! You could even do something fancy like, perhaps add the following to your MockAttackService…

```csharp {linenos=table}
internal class MockAttackService : IAttackService {
    public int CalculateDamageCalls { get; set; } = 0;

    public int CalculateDamage(Enemy enemy) { 
        CalculateDamageCalls++;
        return 42; 
    }
}
```

And take your Unit test to the next level by validating your Dependency usage!

```csharp {linenos=table}
public void PerformAttackTests() {
    var mockAttackService = new MockAttackService();
        
    var testSteve = new Character(mockAttackService);
    var enemy = new Enemy();
        
    Assert.That(testSteve.PerformAttack(enemy), Is.EqualTo(42));
    
    // Dependency Usage Validation whoo!
    Assert.That(mockAttackService.CalculateDamageCalls, Is.EqualTo(1));
}
```

## Muh News!
Ok so this all seems pretty awesome so far, but now let me show you the big ugly truth to dependency injection, and how modern programming has solved it. Imagine you have a rather large program with many many lines of code, hundreds of classes, and lots of nested dependencies.

Suddenly, simply naively 'new’ing up a new class with deep nested dependencies could look as nasty as this:

```csharp {linenos=table}
var myFooService = new FooService(new barService(new phiService(), new phiLogger()), new derpService(new herpService()));
```

Oh geez! This is really starting to get out of hand now. But you probably are noticing that, hey, all of this dependency injection just looks the same all the way down. What if there was an easy way to just automatically construct all these things? Like some kind of magical `Service Container` that had everything we could ever use setup in it, and when we asked for one it automatically injected everything for us all the way down the chain…

Maybe our magical code then would just become:

```csharp {linenos=table}
var myFooService = ServiceContainer.Get<IFooService>();
```

Well, this exists, in many different versions. `Autofac`, `Ninject`, `ServiceCollection`, the list goes on and on.

This is called a Dependency Injection `Container`, and you generally set it up by first registering all the classes it should know about at the start of your program, and once those are ‘logged’ into it, you can just summon them back out at will later.

Pretty neat, huh?

Lets make one.

Which will lead us on to [Part 1!](/post/dependency-injection/dependency-injection-part-1)
