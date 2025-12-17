+++
author = "Steffen Blake"
title = "Async Event Stream for IoT Devices in .Net Core"
date = "2021-07-12"
description = "Building async subscription based event architecture for IoT devices in dotnet!"
tags = [
    "csharp",
    "dotnet",
    "IoT",
    "guides"
]
categories = [
    "IoT"
]
series = ["IoT"]
aliases = ["async-events-IoT"]
+++

Building applications for IoT Devices has it’s challenges, and as I checked out several options presented by various libraries on various platforms, the consistent challenge I found was handling a variety of events across numerous board pins I wanted to listen on.

# The Challenge
Every library I checked out involved a fair bit of boilerplate work I had to sort out in order to utilize multithreading on something like a Raspberry Pi’s multicore processor. What I really wanted was a way to easily describe subscriptions to pin events, spin up a listener, and then handle an incoming stream of events on the fly without blocking any threads.

# Async Streams
As a C# developer, back in September 2019 Microsoft announced the new `IAsyncEnumerable` interface which allowed you to yield return indefinitely on an async method, effectively allowing you to design a “subscription” to an async pipeline using the familiar foreach loop, with an async twist.

Documentation on this change is best checked out here: https://docs.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-8#asynchronous-streams

Async streams were powerful and the moment I learned about them, I was hungry for the opportunity to leverage this incredibly powerful new interface for my own use cases.

Now, a year and a half later, I realized that this was exactly “the time to use that item.”

# Official dotnet IoT Support
Earlier Microsoft also officially supported the Nuget package `IoT.Device.Bindings` which can be checked out on their repo here:
https://github.com/dotnet/iot

This package enables one to compile dotnet core applications targeting an arm architecture, hooking into the GPIO pins and other logical controllers of a wide variety of supported boards. Including, to my excitement, Raspberry Pis and Arduinos!

Now I found the same challenge was still present, but luckily on the GpioController the handy method `WaitForEventAsync` which returns a `ValueTask<WaitForEventResult>`

This was enough for me to develop a powerful wrapper that extends this functionality in a broader way, utilizing dotnet’s powerful Task system for inherent async and multithreaded applications.

The goal was simple, what I wanted was to define a series of `Subscription`s inside of a `SubscriptionCollection` of sorts, then compile it into an immutable SubscriptionService which could be run, returning an `IAsyncEnumerable` to be listened in on as a stream of constant async data.

# Announcing Iot.Device.Subscriptions
I created this package and pushed it up to nuget, so I am proud to announce that my first Nuget packages, `Iot.Device.Subscriptions`, is now officially up and ready to be used!
Nuget: https://www.nuget.org/packages/Iot.Device.Subscriptions/
Github: https://github.com/SteffenBlake/Iot.Device.Subscriptions

The Github `Readme.md` provides a handy guide showing how to use the project, but I’ll go a bit more into detail here in terms of design choices and how I built the example project, `StopwatchExample`, which can be looked at here if you wish to follow along:
https://github.com/SteffenBlake/Iot.Device.Subscriptions/tree/main/Source/Iot.Device.Subscriptions.StopwatchExample

# Architecting the Example Project
To start, there were a few boilerplate basics I wanted to ensure were implemented. I love utilizing dotnet’s `IConfiguration` libraries. Being able to configure the applications behavior at runtime using any combination of cmdline args, `AppSettings.json`, Environment Vars, and Secrets is exceptionally powerful in my opinion.

This gets particularly highlighted when building an IoT app, as it can be a tad bit on the slow side to deploy the latest compiled version of your app to your device over SSH/rsync/etc each time, so you really want to avoid having to re-deploy the app every single time you make a slight tweak to a configuration value.

So to start I brought in all of the Configuration nuget packages, created `AppSettings.json` in the project (and set it to Always Output in Visual Studio)

Then made a simple static method to compile the `IConfiguration` into the strongly typed `Configuration` class I had built in `Configuration.cs`

```csharp {linenos=table}
private static Configuration BuildConfiguration(string[] args)
{
    return new ConfigurationBuilder()
        .SetBasePath(Directory.GetParent(AppContext.BaseDirectory).FullName)
        .AddEnvironmentVariables()
        .AddJsonFile("AppSettings.json", true)
        .AddUserSecrets<Program>(true)
        .AddCommandLine(args)
        .Build()
        .Get<Configuration>();
}
```

Now that the Configuration was bootstrapped up, the next step was to build a simple wrapper class for housing all the `IDisposable` controllers/drivers/etc you need to bootstrap up to interact with the IoT architecture.

I designed the `Configuration` to be flexible for a wide variety of devices, since this is an example project meant to be run by anyone with the hardware on hand, so I had to add in a fair bit of extra code you typically wouldn’t be utilizing when writing a program for a specific set of hardware yourself.

The reason I had to wrap all the `IDisposable`s in their own class, is due to their disposable nature. I wanted a static factory method that assembles all these IoT pieces together, however when passing Disposables up a layer, you need the layer above to be in charge of the Disposing pattern.

You currently cannot declare a Disposable Tuple, nor declare a using pattern on it’s contents in any way. Manually Disposing at the end of a method is also considered poor form, so in this case the right call is to instead use the `Decorator Pattern` and wrap all your Disposables up in a “Container” class which also implements `IDisposable`, such that when it gets disposed, it triggers off the disposal of all its contents.

This can be checked out over on `StopwatchController.cs`

Now that we have all our bootstrapping done, all that remains is actually setting up the logic for the State Machine, which when utilizing my newly minted Subscriptions package, is quite easy!

I decided I wanted to have three buttons on this program, as I feel three and more event listeners is when the gap between the traditional `WaitForEventAsync` method starts to get difficult to monitor.

So I decided on doing a “Stopwatch” program, which simply just feeds out a running time to the LCD panel, with a Reset Button, a Pause Button, and a Stop button to end the program.

I went with Board Pins `29`, `33`, and `40` respectively, as on the Raspberry Pi all three of these GPIO pins sit nicely right beside Ground pins, making it simple to wire up.

Reset Button was wired to pins `29+30`, Pause Button to pins `33+34`, and Stop button to pins 39+40

Finally I hooked up my LCD screens backpack to the standard I2C pins as usual, Pins `3/4/5/6`. See the following picture for reference, the green circles being the GPIO pins.

![Raspberry Pi GPIO Pins](/images/RPI-GPIO.png)

Now that was done, I could setup the Subscription service, which is pretty simple. Because I wanted Clock Events to work on the board (for incrementing the stopwatch in real time), I had to also enable Clock Events and set the `ClockRate` off the Configuration.

```csharp {linenos=table}
private static ISubscriptionService BuildSubscriptions(Configuration config)
{
    var collection = new SubscriptionCollection
    {
        ClockEnabled = true,
        ClockRate = config.ClockRate
    };
    if (config.ResetBtnEnabled)
    {
        collection.Subscribe(config.ResetBtnPin, config.BtnPinMode, PinEventTypes.Rising);
    }
    if (config.PauseBtnEnabled)
    {
        collection.Subscribe(config.PauseBtnPin, config.BtnPinMode, PinEventTypes.Rising);
    }
    if (config.StopBtnEnabled)
    {
        collection.Subscribe(config.StopBtnPin, config.BtnPinMode, PinEventTypes.Rising);
    }

    return collection.Build();
}
```

Furthermore, because I wanted to support individuals who may not have three buttons on hand to use, I added a boolean config toggle for enabling/disabling each of the button listeners. Once again a fair bit of this logic could be trimmed out when designing a program for more concrete specific hardware!

Now that all that is done, we can actually consume the methods and spin up the listener. We also need to set our three state machine values, which is as simple as just pre-emptively declaring them outside of the `async foreach` loop

```csharp {linenos=table}
var clock = 0L;
var buttonDelay = config.BtnSensitivityTicks;
var paused = false;
await foreach (var subEvent in subscriptionService.Run(stopwatch.Board, CancellationToken.None))
{
   ...
}
```

And thats it! Everything that happens inside of the foreach loop is now during any of our fired events. the `subEvent` object we get informs us about the current event that has occurred, and we can process that information and update the state machine.

In this case, I went with as follows:

```csharp {linenos=table}
buttonDelay += subEvent.Delta;

if (!paused)
{
    clock += subEvent.Delta;
}

if (subEvent.PinNumber == config.ResetBtnPin && buttonDelay > config.BtnSensitivityTicks)
{
    clock = 0L;
    stopwatch.Lcd.Clear();
    buttonDelay = 0L;
}

if (subEvent.PinNumber == config.PauseBtnPin && buttonDelay > config.BtnSensitivityTicks)
{
    paused = !paused;
    stopwatch.Lcd.Clear();
    buttonDelay = 0L;
}

if (subEvent.PinNumber == config.StopBtnPin && buttonDelay > config.BtnSensitivityTicks)
{
    break;
}

stopwatch.Lcd.SetCursorPosition(0, 0);
stopwatch.Lcd.Write($"{TimeSpan.FromTicks(clock):g}");
```

There are several parts here, and lets dig into each one in detail, starting from the top.

```csharp {linenos=table}
buttonDelay += subEvent.Delta;
```

Upon testing with my (extremely cheap) buttons I purchased, I found the program was running so extremely fast that when I clicked a button, it fired off several trigger events from one click. Whew! So to handle that I added a simple `buttonDelay` value which simply represented a “cooldown” between accepted button press events.

### A note about the Delta value
So what is this thing? The `Delta` value represents a precise number of ticks that have transpired since the prior clock event triggered. Handily, for non-click events (GPIO triggers), this value will always be zero, so when handling tracking time you can simply just add this value onto any running totals.

#### “But I specified my clock rate in the config! Can’t I use that?”

The `Clockrate` in the config specifies the minimum time for Clock events to fire, but does not necessarily ensure its maximum time. Once the Clock event fires, there can be a miniscule amount of time after to process it on the queue and push it up to the main listener.

However, the `Delta` value is constant and is calculated based on the prior event moment of fire. This ensures not a single tick is missed and time is accurately tracked.

For example, if you were to do:

```csharp {linenos=table}
Console.WriteLine($"{subEvent.Delta}");
await Task.Delay(1000);
Console.WriteLine($"{subEvent.Delta}");
```

You would get the same number out twice in the Console, each individual subEvent’s `Delta` value is fixed and immutable once pushed up.

# State Machine Logic
Moving on, because Task architecture is inherently thread safe, we can perform the following code quite easily and, despite leveraging multithreading, dont have to think too hard at all about locks or thread safe variable management. Updating the State Machine is a breeze!

```csharp {linenos=table}
if (subEvent.PinNumber == config.PauseBtnPin && buttonDelay > config.BtnSensitivityTicks)
{
    paused = !paused;
    stopwatch.Lcd.Clear();
    buttonDelay = 0L;
}
```

As you can see, we simply just need to check if the current fired event’s `PinNumber` matches any given button, and then perform logic as such.

Finally, once all buttons are checked, we finish off by updating the LCD screen to display this new information:

```csharp {linenos=table}
stopwatch.Lcd.SetCursorPosition(0, 0);
stopwatch.Lcd.Write($"{TimeSpan.FromTicks(clock):g}");
```

And thats it! A smidge of cleanup code outside the loop to clear the screen and log the program’s end, and we have a fully functioning, Async Streamed, Subscription based program!

Thanks for joining me on this little adventure, and feel free to try it out for yourself!