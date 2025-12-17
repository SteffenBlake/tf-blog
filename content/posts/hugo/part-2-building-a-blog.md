+++
author = "Steffen Blake"
title = "Making Of this Blog - Part 2"
date = "2021-10-01"
description = "Building a CI/CD Markdown Blog"
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

Part 2 - Building a CI/CD Markdown Blog <-- (You are here!)

[Part 2: Serve Hugo on Kubernetes](/posts/hugo/part-3-serving-on-kubernetes)


# Requirements

To start off if you want to follow this guide, you will need the following:

1. A machine with Docker installed on it. [See here for the docker install guide](https://docs.docker.com/get-docker/)

2. Hugo installed as well. [See here for the hugo install guide](https://gohugo.io/getting-started/installing/)

3. Git installed. [See here for the git install guide](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

4. A browser

Thats basically it!

# Step one - Create the output folder

### Windows

Create a folder named `www` in your C drive, such that you now have `C:/www/` as a directory that exists

### Linux

```bash

sudo mkdir /www
sudo chown nobody:nogroup /www

```

# Step two - Create the index file

### Windows

1. Create a file named `index.html` in the new `www` folder

2. Edit it with notepad and just enter this text in and save, `Hello World!`

### Linux

```bash

touch /www/index.html
echo "Hello World!" > /www/index.html

```

# Step three - Spin up nginx-static-ha

Same command for both operating systems:

```bash

docker run -D -v /www:/static -p 8080:80 --name my-site-0 steffenblake/nginx-static-ha

```

This will spin up the docker container. You can then verify its running via:

```bash

docker container ls

```

And you should see `my-site-0` on the list.

# Step four - Check its output

### Browser

Open up the following url: [http://localhost:8080](http://localhost:8080)

You should be greeted with "Hello World!" in your browser

### Headless CLI

If you dont have a browser to work with you can also just do:

```bash

curl http://localhost:8080

```

Which should output "Hello World!" to your terminal

# Step five: Verify the High Availability 

With the docker container still actively running lets modify `index.html` and see what happens.

### Windows

Open `index.html` again and change its text to something else and save it

### Linux

```bash

echo "Hello world, again!" > /www/index.html

```

And then to verify it stuck (Should output "Hello World, again!"):

```bash

cat /www/index.html

```

### Now test it

After doing either of the above steps, now refresh your browser (or `curl` it again)... Hey! The text didnt change! Thats right, the original text for `index.html` was cached and your changes to the original files has had zero impact on the actual running site. This is good, we only want changes to happen when we trigger them on purpose

# Trigger a redeploy

One simple command to restart the container:

```bash

docker restart my-site-0

```

Give it a few seconds to restart, and then once again refresh your browser or `curl`, and lo and behold now "Hello world, again!" should show up. Congrats we now have the static file serving working great!

# Step six - Create our git repo

Choose your github server of choice (Github, Gitlab, Gitea, Gogs, whatever) and create a public repo on it. Lets call it `MyBlog` for now.

Then follow [this guide here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) to create an Access Token (assuming you are using Github) if you havent already, and make sure it has `Push` and `Pull` privileges.

For our case we probably dont want this token to ever expire, so set `none` or `never` for the expiry.

Save this somewhere safe.

# Step seven - Bootstrap the hugo site

Now we need to setup our website template, which is actually quite simple.

First off make yourself a folder you want to keep your work in, on your desktop is fine for now. Lets call the folder Blogs for now.

Open up your terminal inside of that folder via whatever means works in your operating system. (On windows you can `shift+right click` > `Open Powershell Window here`)

And then run the following command:

```bash

hugo new site website

```

After it runs you should now have the folder `website` inside of `Blogs` on your desktop.

Next up we will use git to pull down our website to a different folder. On your git server of choice (I will use Github in this case) you will want to copy the `https` clone url.

With your terminal still opened up in that `Blogs` folder, run this command:

```bash

git clone <your url your copied from above>
git init

```

This should now create a folder called `MyBlog` (Assuming thats what you named the repo) inside of `Blogs`

Inside of it should probably be an empty folder with perhaps the `.git` folder, maybe the `README.md` and/or the `LICENSE` file.

Next we will copy all the files and folders Hugo made from that `website` folder to the `MyBlog` folder 1:1

#### Don't copy the website folder itself in, if you do it right the file `config.toml` should exist now at `<Your Desktop>/Blogs/MyBlog/config.toml`

# Step eight - Pick a theme!

Alright! Nearly done, now for one more step, navigate over to https://themes.gohugo.io/ and pick out a theme you like.

On the themes page hit the Download button which *usually* takes you to a git server (often Github)

We need to take note of two things. First off that same clone HTTPS Url again. Second the name of the theme.

Lets use the hugo-PaperMod theme as an example. The two things we want can be seen here in this pic below.

![Github Example](/images/part-2-building-a-blog/github-example.png)

The green box is that HTTPS Url we need which I will call `<Clone Url>` and the red is the `<Repo Name>`

In our case for hugo-PaperMod this is `https://github.com/adityatelange/hugo-PaperMod.git` and `hugo-PaperMod` respectively.

We now need to move our terminal into the `MyBlog` folder that git made us. Assuming your terminal is still pointing at `Blogs` you simple just execute:

```bash

cd MyBlog

```

And you should now be pointing at `Blogs/MyBlog`

Excellent, now we can add the theme. Execute this command:

```bash

git submodule add <Clone Url> themes/<Repo Name>

```

Or in the case of paperMod this would become

```bash

git submodule add https://github.com/adityatelange/hugo-PaperMod.git themes/hugo-PaperMod

```

Now we can verify this worked by simple checking and verifying that the folder `hugo-PaperMod` (or whatever your repo name is) exists inside of the `themes` folder

So for papermod's example, the following file should now exist:

`<Desktop>/Blogs/MyBlog/themes/hugo-PaperMod/config.toml`

Finally we need to add this theme to our root `config.toml`, which is not the one mentioned above, but instead this one:

`<Desktop>/Blogs/MyBlog/config.toml`

Which is as simple as just adding this entry to the very bottom of the file:

```

theme = "<Repo Name>"

```

Or in our case

```

theme = "hugo-PaperMod"

```

# Step nine: Run the site locally to test

With our terminal pointing at the `MyBlog` directory we want to now run this command:

```

hugo server -D -F

```

There are two params we are passing in here.

* -D - Publish Drafts
    * This command will still host up files tags as `draft = true`
* -F - Publish Future
    * This command will still host up files set to publish in the future

Don't worry too much about this, but, this is the command you will want to run to be able to preview your posts on the fly when editing them locally, before you commit them.

Once you run this command you should see something like this in your terminal:

```

Web Server is available at http://localhost:1313/ (bind address 127.0.0.1)

```

Open that link up in your browser and, viola! Your website exists!

You can hit Ctrl+C in the terminal now to turn the site off.

# Step ten: Push up the site

We will first make one last little tweak to make our lives easier in the future.

Create a file called `.gitignore` (note the period at the start) in the `MyBlog` folder (if one doesnt exist yet). Edit this file with a text editor and add this line of text to it:

```

/public

```

And save it.

Then back in your terminal, run these commands:

```

git add -A
git commit -m "Initial Commit"
git push

```

The last command will prompt your for your username and password. In Github's case, this is your email for the username, and the password is that Access Token you generated back in step Six.

You should now be able to go to your actual git repo on Github.com or etc and see that all your website's files are now pushed up online.

# Step eleven: Port forwarding

Now here's the fancy part, we can semi automate the process of building the website everytime we make changes and automatically push them into that `www` folder we made back in Step One, for consumption by our `nginx-static-ha` docker image we set up in Steps three to five

First off check out your public ip by just googling "Whats my ip?", it should show up for you. This is the public IP people can go to which then sends traffic to our router.

But to then get traffic to go from your router to your PC, we have to specify further. This is called port forwarding.

To start you will need to expose port 9000 to the internet for triggering webhooks. All this means is when Github detects changes to your repo, it will trigger a rebuild on your computer.

Follow [this guide here](https://www.hellotech.com/guide/for/how-to-port-forward). You will want to port forward port 9000 to 9000, on TCP, to the local IP of the machine you are wanting to run `nginx-static-ha` on.

This will now make it so when someone types in `<Your.Public.Ip.Address>:9000` it directs traffic all the way through your router and to `<your.local.device.ip>:9000`

# Step twelve: webhook-hugo

Now we are going to snag the second tool I have built for this process, [docker-webhook-hugo](https://github.com/SteffenBlake/docker-webhook-hugo)

All this tool does is listen on port 9000 and, when triggered, pulls the repo that triggered it, assumes it has a hugo website on it and tries to build it, then outputs the hugo website to a specified folder.

Take a moment on your github to note the branch name your repo has, it might be `master` or `main`, this is `<HUGO_BRANCH>` for the below command.

Also once again we will be needing the Repository clone url, `<HUGO_REPOSITORY>`

You also will need to come up with some kind of Secret Password (henceforth called `<HUGO_SECRET>`)

You can find it here

![Github Branch](/images/part-2-building-a-blog/github-branch.png)

### Windows

```

docker run -d -v C:/www:/www -p 9000:9000 -e HUGO_BRANCH=<HUGO_BRANCH> -e HUGO_SECRET=<HUGO_SECRET> -e HUGO_REPOSITORY=<HUGO_REPOSITORY> --name build-server steffenblake/webhook-hugo

```

### Linux

```

docker run -d -v /www:/www -p 9000:9000 -e HUGO_BRANCH=<HUGO_BRANCH> -e HUGO_SECRET=<HUGO_SECRET> -e HUGO_REPOSITORY=<HUGO_REPOSITORY> --name build-server steffenblake/webhook-hugo

```

### Example
So if my branch is `master` and I want my secret to be `PaSsWoRd123` and my repo is at `https://github.com/someone/somerepo.git` then I would execute something like:

```


docker run -d -v C:/www:/www -p 9000:9000 -e HUGO_BRANCH=master -e HUGO_SECRET=PaSsWoRd123 -e HUGO_REPOSITORY=https://github.com/someone/somerepo.git --name build-server steffenblake/webhook-hugo

```

We can test if its working by executing the following:

```

curl -L -X POST 'localhost:9000/hooks/build' \
-H 'Content-Type: application/json' \
-H "X-Gitlab-Token: <HUGO_SECRET>" \
--insecure \
-d "{
    \"ref\" : \"<HUGO_BRANCH>\"
}"

```

After executing that, wait a few seconds and then check out your `www` folder. If all went well your hugo files should all be statically served there!

If you encounter issues you can run the following command to inspect what may have caused a problem:

```

docker logs build-server

```

# Step thirteen, Bind it!

Now that it is running and our port forwarding is functional we can do the final step. We want to trigger the build server using Github automatically whenever we make a change, instead of having to do it manually.

On your Github repo, navigate as such (which will prompt you for your password)

![Github Branch](/images/part-2-building-a-blog/github-webhook-menu.png)

On the subsequent page, enter the values like so, where Your.Public.Ip.Address is the address you got back in eleven

![Github Branch](/images/part-2-building-a-blog/github-webhook-example.png)

And then hit `Add webhook`

# Test it!

Now lets make a small change to see if it works.

On your github repo modify something simple like a value in the `config.toml` in `MyBlog`, like perhaps your repositories author, or maybe a link. Something that is easy to verify "It changed"!

You can check what it theoretically should look like by running the hugo server locally again as you did in Step Nine, to preview the change before you push it up live.

Once satisfied, run the same command you did in step ten to commit and push

```

git add -A
git commit -m "Testing webhook"
git push

```

Wait a few seconds and then try out

```

docker logs build-server

``` 

To verify if the webhook got through.

Then finally to actually see the changes, run the following command again to restart your static file server

```

docker restart my-site-0

```

And once again open up [http://localhost:8080](http://localhost:8080) and, if everything worked, your hugo site should be live here.

Now all you need to do to update this hosted site is:

1. Modify files to your hearts content in your repo

2. Commit and push your changes

3. Restart your site's docker image to reload the changes


But we can do even better. The next guide will go over how, using Kubernetes, we can automate even step 3 and *truly* make it High Availability. To prep, please check out my guides as they go up on running kubernetes on bare metal!

[Part 2: Serve Hugo on Kubernetes](/posts/hugo/part-3-serving-on-kubernetes)

