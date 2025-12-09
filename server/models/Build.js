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
    type: [String],
    default: [],
  },
  // the order of abilities. not required.
  skillPoints: {
    type: [String],
    default: [],
  },
  // this is for the rune selection. not required
  runes: {
    type: Object,
    default: {},
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
  skillPoints: doc.skillPoints,
  runes: doc.runes,
  items: doc.items,
  id: doc._id, // need this to delete it later
});

const BuildModel = mongoose.model('Build', buildSchema);
module.exports = BuildModel;
