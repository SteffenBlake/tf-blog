+++
author = "Steffen Blake"
title = "Inheritance vs Composition"
date = "2021-08-20"
description = "'Composition over Inheritance'"
tags = [
    "ButThatsJustMyOpinionMan",
    "Coding"
]
categories = [
    "Opinions",
]
series = ["Opinions"]
aliases = ["inheritance-vs-composition"]
+++

This is a phrase you will eventually hear at your workplace while coding away. Perhaps during lunch break or maybe in the comments of your code review. What exactly does this mean?

Well, in Object Oriented Programming, there really are two ways to relate two types to each other. ‘Is a’ vs ‘Has a’ is often the colloquial.

‘Is a’ implies inheritance. For example:

```csharp {linenos=table}
public class Warrior : Player {
```

Implies `Warrior` ‘Is a’ `Player`. Which is fine and all. But lets say now that we want to have rigorous unit testing, and our `Player` Class has a lot of stuff going on already, perhaps a multitude of overridable methods and properties, and Warrior overrides a few.

Well, that is fine, but we will run into a problem. Take this for example:

```csharp {linenos=table}
public class Warrior : Player {
    public override void Attack(Target target) {
        var attack = CalculateAttack();
        var fMod = CalculateFMod(target.Defense, attack);
        target.TakeDamage(attack * Constants.A_MOD + fMod * Constants.F2);
    }
    ...
}
```

At first glance, this method looks fine enough, perhaps it could be structured a bit better, but nothing seems to be terribly wrong with it. But we run our unit tests and, oh no! `WarriorTests_AttackUndead` is failing after our changes earlier today!

Actually wait hold on, so is `RogueTests_AttackUndead`, `PriestTests_AttackLizard` and `BarbarianTests_AttackFlying`, but other similar tests aren’t breaking on other character types, it seems kind of random and sporadic. What happened?

Well turns out it was this line of code: 

```csharp {linenos=table}
var attack = CalculateAttack();
``` 

See, `CalculateAttack` is a method inherited from the `Player` base class, and it had a weird bug in it.

But you were not able to instantly tell the source of the bug, because instead of a `PlayerTests_Attack` test, you had a dozen various implementations with their own logic. Owch! Because you ended up making `Player` an abstract class to be inherited from, you couldn’t easily unit test it, not without doing some extra boilerplate. Which is sub optimal…

So, what if instead, your `Character` classes did this instead?

```csharp {linenos=table}
public class Warrior {
    
    private ICharacter Character { get; }
    
    public Warrior(ICharacter character) {
        Character = character;
    }

    public override void Attack(Target target) {
        var attack = Character.CalculateAttack();
        var fMod = Character.CalculateFMod(target.Defense, attack);
        target.TakeDamage(attack * Constants.A_MOD + fMod * Constants.F2);
    }
}
```

This is Composition vs Inheritance. And now what you have done is made `Character` a normal class, and much easier to unit test.

And furthermore, now you can Mock an `ICharacter` in your `WarriorTests`, so even if `Character` methods break, your `WarriorTests` (and all others for that matter) will not throw up extra flags.

Instead only `CharacterTests` will start breaking, making it very clear and concise exactly what broke and where, significantly decreasing debugging time.

# Inheritance Isn’t all Bad Though

Because as it turns out, there is a clear cut time when you definitely want to inherit. The primary use case is `Serialization`. Whether you have a RESTful interface serializing from JSON, Protobuff handling packets over sockets, or an ORM connected to a SQL DB manipulating entities, Inheritance is probably the right call for any `Data` classes you are handling on these systems when needed.

Let’s consider the following class:

```csharp {linenos=table}
public class Packet {
    IPayload Payload { get; }
    public Packet(IPayload payload) {
        Payload = payload;
    }
    ...
}
```

Sure, at first glance, this looks like an easy to unit test class that is loosely coupled to its `Payload`. That’s all fine and dandy, until you try and `Serialize` the darn thing! Since your trying to handle things via `Injection`, many serializing libraries will scoff at your class and inform you it must have a parameterless constructor before they will even entertain the thought of working with the class. Doh!

In this case here, I would just use `Inheritance`.

There are other examples of course, but realistically speaking this is the most common one I see. Too many people are far too willing to go all the way one direction or the other, claiming Inheritance vs Composition always does and will have a better choice.

But I disagree. There are times when one shines over the other and, like most things in programming, its all about using the right tool for the job.