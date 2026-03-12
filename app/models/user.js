const path = require('path');
const ObjectId = require('mongodb').ObjectId;
const db = require(path.join(__dirname, '..', 'lib', 'db.js'));

function getUserCollection() {
  return db.getCollection('users');
}

class User {
  static async findOrCreateFromSpotify(profile){
    const spotifyId = profile.id;
    if (!spotifyId) {
      throw new Error('spotify profile missing id');
    }

    const existing = await getUserCollection().findOne({ spotifyId });
    if (existing) {
      return Object.assign(Object.create(User.prototype), existing);
    }

    if (profile.email) {
      const emailMatch = await getUserCollection().findOne({email: profile.email});
      if (emailMatch) {
        await getUserCollection().updateOne(
          {_id: emailMatch._id},
          {$set: {spotifyId: spotifyId, displayName: profile.display_name || emailMatch.displayName || null, isValid: true}}
        );
        emailMatch.spotifyId = spotifyId;
        emailMatch.displayName = profile.display_name || emailMatch.displayName || null;
        emailMatch.isValid = true;
        return Object.assign(Object.create(User.prototype), emailMatch);
      }
    }

    const user = new User();
    user._id = new ObjectId();
    user.spotifyId = spotifyId;
    user.email = profile.email || null;
    user.displayName = profile.display_name || null;
    user.joinedOn = new Date();
    user.isValid = true;

    await getUserCollection().insertOne(user);
    return user;
  }

  static async findById (id) {
    const user = await getUserCollection().findOne({_id: new ObjectId(id)});
    if (!user) {
      return null;
    }
    return Object.assign(Object.create(User.prototype), user);
  }

}

module.exports = User;
