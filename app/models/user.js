var ObjectId = require('mongodb').ObjectId;
var _ = require('lodash');
var db = require(__dirname + '/../lib/db.js');

var getUserCollection = function() {
  return db.getCollection('users');
};

class User {
  static async findOrCreateFromSpotify(profile){
    var spotifyId = profile.id;
    if (!spotifyId) {
      throw new Error('spotify profile missing id');
    }

    var existing = await getUserCollection().findOne({spotifyId: spotifyId});
    if (existing) {
      return _.create(User.prototype, existing);
    }

    if (profile.email) {
      var emailMatch = await getUserCollection().findOne({email: profile.email});
      if (emailMatch) {
        await getUserCollection().updateOne(
          {_id: emailMatch._id},
          {$set: {spotifyId: spotifyId, displayName: profile.display_name || emailMatch.displayName || null, isValid: true}}
        );
        emailMatch.spotifyId = spotifyId;
        emailMatch.displayName = profile.display_name || emailMatch.displayName || null;
        emailMatch.isValid = true;
        return _.create(User.prototype, emailMatch);
      }
    }

    var user = new User();
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
    var user = await getUserCollection().findOne({_id: new ObjectId(id)});
    if (!user) {
      return null;
    }
    return _.create(User.prototype, user);
  }

} //end of user

module.exports = User;
