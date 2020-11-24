# PianoGraph
PianoGraph - Find Piano Scales Quickly and Easily!

# Developer
Jeremy Penning

# What is PianoGraph
PianoGraph was created for an entry project into Code Fellows "Code 401: Advanced Software Development in Full-Stack JavaScript" class. While trying to think about an idea for an app a friend gave me inspiration. He asked why there wasn't a tool on the internet that allowed someone to just click on a note on a piano and see every scale and chord associated with that note.

I looked around and, sure enough, nothing really seemed to work the way he described it. I'm not a musician at all. In fact, the only class I've ever failed was "Music" class in 3rd grand. Ouch. After patiently describing how everything should work I started on some UI sketches on paper.

Once that was done I started thinking about how to represent any combination of 24 notes using a single piece of data that also stored their positions (without resorting to storing every single key's pressed/unpressed status in a database). That's where the idea for using binary numbers came in. After patiently describing how that worked to my friend I got down to the hard work of creating the app that you see before you.

All in all, I think it may have just been a sneaky way for us to teach each other about something we knew, but had always made the other person's eyes gloss over.

# Version
1.0.0 - Initial version of app.

# Prerequsites
PianoGraph requires a PostgreSQL database (preferrably version 12.5+) for data storage. Node.JS version 14.15+ and Sequelize  will also need to be installed. All other dependencies are included in the package.json file.

# Getting Started
You will need to create a .env file in the app's base folder that contains the following information:

    DATABASE_URL=<your database URL string>
    PGSSLMODE=no-verify
    
Note: For database providers (other than Heroku) the PGSSLMODE line may not be necessary.
  
When the database information has been entered you can create the initial tables and columns by using Sequelize's Migrate functionality:

    sequelize db:migrate
    
To use locally you can start the project with:

    npm run local-start
    
Then should be able to view the site at http://localhost:3000/

# Database Schema
PianoGraph uses two tables root_notes and scales. If you don't want to use the Migrations files (highly recommended) you can create the tables manually:

![rootnotes](https://user-images.githubusercontent.com/4085868/100029042-2e9fa400-2da5-11eb-8f6a-742fcc84921d.jpg)

# API Endpoints

Coming soon!
