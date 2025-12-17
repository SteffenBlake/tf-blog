+++
author = "Steffen Blake"
title = "Covariance vs Contravariance within Function Scopes"
date = "2021-08-11"
description = "A fancy little trick..."
tags = [
    "Coding",
    "dotnet",
    "csharp"
]
categories = [
    "NeatoBurritos"
]
series = ["NeatoBurritos"]
aliases = ["covariance-vs-contravariance"]
+++

This is a topic I find a lot of C(ish) developers mention offhand. They know it has to do with Generics, inheritance in some way, and In vs Out variables.

But to really dig deep into this topic, we will first need to step into the land of Math. To begin, let’s define two different functions:

```csharp {linenos=table}
string MakeString<T>(T obj) {
    ...
}

T2 MakeT2<T1, T2>(T1 obj) {
    ...
}
```

The first function, `MakeString` displays `Contravariance` in its Generic `T` variable. The reason for this is it has a `T` defined as one of its parameters.

If you were to call it like so in a function:

```csharp {linenos=table}
var myStringExcplicit = MakeString<int>(5);
var myStringImplicit = MakeString(5);
```

Both calls would compile, and if you are using a linting tool, it may even suggest to remove that `<int>` call on the first explicit generic. This is because, implicitly speaking, 5 is an integer by default, so the compiler is smart enough to discern that `T` is actually int specifically here.

Now, lets try and do the same thing but with the second function, MakeT2

```csharp {linenos=table}
var myStringExcplicit = MakeT2<int, string>(5);
var myStringImplicit = MakeT2(5);    // This won't compile
string myStringImplicit = MakeT2(5); // Not even this will either!
```

In this function, we have the `T2` variable declared as `Covarient`, which means modifying the parameters passed into the function has no implicit effect on its return value.

This can further be demonstrated with our `MakeString` function simply by the following code:

```csharp {linenos=table}
MakeString(5);
```

This will even compile, because of the inherent contract all Functions have in C(ish) languages (and pretty much all other languages too), and that is that a `Function` cannot see outside of its own scope. Now I know, in C# you can use `Reflection` and a few tricks to enable seeing outside of a `Function`, (like if, for example, you wanted to get the name of the class or method the function was called within, you can indeed. But such things should be avoided unless its for logging or whatnot.)

This means `Function`s have no concept of whether their return was assigned to anything, what it was assigned to, how it was used, etc. This would require knowledge outside the scope of the function, which breaks a core paradigm of logical coding.

However, this has a very annoying side effect, consider the following function:

```csharp {linenos=table}
TOut DoTheThing<TIn1, TIn2, TIn3, TIn4, TIn5, TIn6, TOut>
    (TIn1 in1, TIn2 in2, TIn3 in3, TIn4 in4, TIn5 in5, TIn6 in6) { .... }
```

Okay first I will say, please avoid making functions like this in the first place, put all those variables in a single class. But lets say that’s not possible here for some crazy reason.

Well the thing about C# (and many other generic based languages) is as soon as you have even one `Covarient` variable in the scope of your function, you have to declare all of the generics of your function explicitly, even all your Contravarient ones!

In other words, you’d have to call it like this:

```csharp {linenos=table}
int myThing = DoTheThing<int, int, int, int, int, int, int>(1, 2, 3, 4, 5, 6);
Console.WriteLine($"{myThing}"");
```

Even though in this case the compiler should know that `T1` through `T6` are ints, because its not sure about that seventh `Covarient` return variable, you have to declare them all.

But fear not, for in times like these, we have one Hail Mary to call upon in many of these same languages, the powerful `out` variable!

If we were to declare the signature of our function like so instead:

```csharp {linenos=table}
void DoTheThing<TIn1, TIn2, TIn3, TIn4, TIn5, TIn6, TOut>
    (TIn1 in1, TIn2 in2, TIn3 in3, TIn4 in4, TIn5 in5, TIn6 in6, out TOut out1) { .... }
```

Then we will in fact be able to safely call it like so, both ways assuming you are post C#7:

```csharp {linenos=table}
// Pre C#7 inline out vars:
int out1;
DoTheThing(1, 2, 3, 4, 5, 6, out out1);
Console.WriteLine($"{out1}"");

// Post C#7 shortcut (very handy here)
DoTheThing(1, 2, 3, 4, 5, 6, out int out2);
Console.WriteLine($"{out2}"");
```

This is because unlike the return value of the function, `out` vars are explicitly `Contravarient`, in fact if you have used them before, the compiler requires you to assign something to the variable (thus initializing it explicitly as the type defined, even if generic) before the function exits.

Notice above that these out var functions don’t have their generics explicitly defined anymore

This is because they no longer have any `Covarient` variables, which allows this.

A very powerful and handy tool, if you ask me, especially when combined with guard cases.