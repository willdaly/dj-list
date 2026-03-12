DJ List - Music Catalog Management Tool

A web application for cataloging and searching vinyl records with metadata optimized for DJ harmonic mixing. Built to manage a personal collection of 6,926 records with searchable BPM, musical key, genre, and artist information.

Background

As a hip-hop DJ focused on harmonic mixing (blending tracks in compatible keys), I needed a way to search my vinyl collection by BPM and key. No existing database had this metadata for 90s hip-hop, so I spent years hand-cataloging records - counting quarter notes for BPM and using a piano to identify key signatures. This app was built to make that data searchable and useful during DJ sets.

Features:

Advanced Search: Filter records by BPM range, musical key, genre, and artist
Harmonic Mixing Support: Find tracks in compatible keys for seamless DJ transitions
Catalog Management: Full CRUD operations for managing music metadata
User Authentication: Secure login with bcrypt password hashing
Playlist Creation: Build and save custom playlists
Transpose Calculator: Calculate key/BPM when pitch-shifting records

Technical Stack

Backend:

Node.js with Express framework
MongoDB for document storage
Bcrypt for password hashing
Session-based authentication

Frontend:

Jade/Pug templates
jQuery and jQuery UI
Bootstrap 3
Custom CSS

Build Tools:

Grunt task runner
Native ES6 (no transpilation step required)
LESS CSS preprocessing

Data Model
Each record entry includes:

Artist, Album, Song Title
BPM (beats per minute)
Musical Key (using Camelot notation)
Genre
Custom metadata fields

Installation & Setup
Prerequisites

Node.js (v18 or higher recommended)
MongoDB (v3.7 or higher)

Installation
bash# Clone the repository
git clone https://github.com/willdaly/dj-list.git
cd dj-list

# Install dependencies
npm install

# Start MongoDB (if not running)
mongod

# Initialize the database
mongo dj-list
db.createCollection("songs")
db.createCollection("users")
exit

# Run the application
DBNAME=dj-list npm start
The app will be available at http://localhost:4000
Creating a User
To create a user with a hashed password, use the MongoDB shell:
javascript// In mongo shell:
use dj-list

// Generate a password hash using bcrypt with the app running:
// Then insert user:
db.users.insertOne({
  email: "your@email.com",
  password: "$2b$08$YOUR_BCRYPT_HASH_HERE",
  isValid: true,
  joinedOn: new Date()
})
Recent Updates (October 2025)
Updated the codebase to work with modern Node.js and MongoDB:

Fixed MongoDB initialization timing and connection handling
Updated deprecated util.log to console.log
Fixed Mongo.ObjectID → Mongo.ObjectId API changes
Downgraded MongoDB driver to v3.7.4 for callback compatibility
Fixed route middleware configuration
Updated user authentication and bcrypt implementation
Added error handling for database queries

Project History
Originally built in 2014 at Nashville Software School as a capstone project.
Use Case: Music Publishing
While originally built for DJing, this project demonstrates core concepts relevant to music publishing catalog management:

Accurate metadata organization
Searchable music databases
User authentication and access control
Data hygiene and quality control
Building tools for music industry workflows

The same principles that make this useful for finding compatible DJ mixes apply to managing publishing catalogs - clean data, smart search functionality, and domain-specific metadata structure.

License
MIT