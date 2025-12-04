const mongoose = require('mongoose');
const _ = require('underscore');

const setName = (name) => _.escape(name).trim();

// The schema for a player's build.
const buildSchema = new mongoose.Schema({
  // the actual build name, custom entered
  name: {
    type: String,
    required: true,
    trim: true,
    set: setName,
  },
  // the champion name, for retrieving any basic information on them
  champion: {
    type: String,
    required: true,
    trim: true,
  },
  // a user created description for what the build's purpose is
  desc: {
    type: String,
    required: false,
    trim: true,
  },
  // list of items. Not required.
  items: {
    type: [Number],
    default: [],
  },
  // the order of abilities 
  skillpoints: {
    type: [String],
    default: [],
  },
  // this is for the rune selection. as of milestone 1, this isn't really used yet.
  runes: {
    primaryPath: { type: String, required: false },
    primarySlots: [{ type: String, required: false }],
    secondaryPath: { type: String, required: false },
    secondarySlots: [{ type: String, required: false }],
  },
  // whether or not the build is publicly accessible
  publicBuild: {
    type: Boolean,
    required: true,
  },
  // owner for what account it belongs to
  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  // when it was created
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

buildSchema.statics.toAPI = (doc) => ({
  name: doc.name,
  champion: doc.champion,
  desc: doc.desc,
  items: doc.items,
  skillpoints: doc.skillpoints,
  id: doc._id, // need this to delete it later
});

const BuildModel = mongoose.model('Build', buildSchema);
module.exports = BuildModel;
