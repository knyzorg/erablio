# Etudie CA!

Etudie CA is blah blah, insert generic project description here...

# Specs!

This is the fun part - the technical breakdown of the project file by file.

`/cache`: The cache holds an encrypted cache of user logins in order to accelerate post-intial connections.

`/css` and `/js`: Holds the css/js files. Statically served.

`/questions` and `/img`: No legit documentation yet.

`/routes`: Every single file in this folder is `require`'d by the engine on startup. Everything that handles any path, goes here.

`/userconfig`: A bloody mess

`/util`: Utility functions