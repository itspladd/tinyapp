# TinyApp

A full-stack web application built with Node and Express. It allows users to shorten long urls (similar to TinyURL and bit.ly).

## Final Product

### Users can create and view their short URLs, with handy buttons to launch the URL, edit it, or delete it.

!["Screenshot of a user's list of short URLs"](https://github.com/itspladd/tinyapp/blob/main/docs/urls_page.png)
*Should you visit these websites? Yes.*

### Creating a shortened URL is as easy as pasting the long URL into a field and hitting "Submit!"

!["Screenshot of the page where a user creates a new URL"](https://github.com/itspladd/tinyapp/blob/main/docs/create_url.png)
*Although it should really say 'Create'...*

### What happens if someone tries to access a URL that isn't registered in the TinyApp database? They get a friendly page alerting them to the error, and a tip about proper URL creation.

!["Screenshot of the result if you try to access a nonexistent URL"](https://github.com/itspladd/tinyapp/blob/main/docs/bad_url.png)
*This isn't the URL you're looking for.*

### Users have to be logged in to create URLs. No free radical URLs cluttering up the database!

!["Screenshot of the message displayed if you try to create a new URL without being logged in"](https://github.com/itspladd/tinyapp/blob/main/docs/must_login.png)
*Users only.*

### Similarly, only the URL's creator can delete or modify a TinyApp URL. Nobody else except you can delete the link to your third cousin's best friend's grandma's legendary peach cobbler recipe that's gathering cobwebs on their ancient Geocities page. (Although you *really* should consider moving that recipe somewhere more reliable.)

!["Screenshot of the result if you try to access a URL created by a nother user"](https://github.com/itspladd/tinyapp/blob/main/docs/no_access.png)
*Hands off.*

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `npm start` command.

## Notable Extras

I wanted a way to pass messages into each new page, and ended up diving in to the concept of **middleware** in Express. I ended up building a custom error-messaging module called **`MessageHandler`**. In doing so, I reinforced a lot of what I had learned about middleware, function binding, the `this` keyword in JavaScript, and object-oriented design!

There's definitely more I could do to polish up a couple of rough spots (I opened a couple of issues on GitHub to help me keep track), but it mostly functions as I need it to!