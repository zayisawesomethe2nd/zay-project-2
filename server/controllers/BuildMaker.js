// https://axios-http.com/docs/api_intro
// using axios for external API calls! some above and beyond i think
const axios = require('axios');

const models = require('../models');

const { Build } = models;

const makerPage = async (req, res) => {
  res.render('buildMaker');
};

const makeBuild = async (req, res) => {
  if (!req.body.name || !req.body.champion) {
    return res.status(400).json({ error: 'Both name and champion are required!' });
  }

  if (!req.body.desc) {
    req.body.desc = 'A custom build.';
  }

  const buildData = {
    name: req.body.name,
    champion: req.body.champion,
    desc: req.body.desc,
    skillPoints: req.body.skillPoints,
    runes: req.body.runes,
    items: req.body.items,
    publicBuild: req.body.publicBuild,
    owner: req.session.account._id,
  };

  try {
    const newBuild = new Build(buildData);
    await newBuild.save();
    return res.status(201).json({
      name: newBuild.name,
      champion: newBuild.champion,
      desc: newBuild.desc,
      skillPoints: newBuild.skillPoints,
      runes: newBuild.runes,
      items: newBuild.items,
      publicBuild: newBuild.publicBuild,
      redirect: '/viewer',
    });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Build already exists!' });
    }
    return res.status(500).json({ error: 'An error occured making build!' });
  }
};

// the first API call to the league server. retrieves all of the champions for the
// dropdown menu when creating a build for a specific champion.
const getChampionList = async (req, res) => {
  try {
    // the url that contains all champions. current patch.
    // gonna look for a way to keep it up to date in the future.
    const url = 'https://ddragon.leagueoflegends.com/cdn/15.23.1/data/en_US/champion.json';
    const response = await axios.get(url);

    const championData = response.data.data;
    const champions = [];

    // adding all names to the array.
    Object.keys(championData).forEach((championID) => {
      champions.push({
        // champ id for getting images, descriptions, etc
        id: championID,
        // their actual name
        name: championData[championID].name,
      });
    });
    res.json({ champions });
  } catch (err) {
    return res.status(500).json({ error: 'An error occured fetching champions!' });
  }
};

// Our second call to the DataDragon API, this will be for retrieving the different
// runes.
const getRunesList = async (req, res) => {
  try {
    // Data Dragon URL for runes
    const url = 'https://ddragon.leagueoflegends.com/cdn/15.23.1/data/en_US/runesReforged.json';
    const response = await axios.get(url);

    const runesData = response.data;

    // A whole thing. Let's go step by step here...
    const runes = runesData.map((path) => ({
      // Here is the path, which determines which keystones become available.
      pathName: path.name,
      key: path.key,

      // here we store the keystones.
      keystones: path.slots[0].runes.map((rune) => ({
        name: rune.name,
        icon: rune.icon,
        key: rune.key,
      })),
      // and here we store the minor runes. each row has a different rune triplet.
      minorRunes: [
        path.slots[1].runes.map((rune) => ({
          name: rune.name,
          icon: rune.icon,
          key: rune.key,
        })),
        path.slots[2].runes.map((rune) => ({
          name: rune.name,
          icon: rune.icon,
          key: rune.key,
        })),
        path.slots[3].runes.map((rune) => ({
          name: rune.name,
          icon: rune.icon,
          key: rune.key,
        })),
      ],
    }));
    res.json({ runes });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occured fetching runes!' });
  }
};

// Our third call to the Data Dragon API, this retrieves the data of items we need for the client.
const getItemsList = async (req, res) => {
  try {
    // Data Dragon URL for items. Will be a tad bit complex
    const url = 'https://ddragon.leagueoflegends.com/cdn/15.23.1/data/en_US/item.json';
    const response = await axios.get(url);

    const itemsData = response.data.data;
    const items = [];

    Object.keys(itemsData).forEach((itemID) => {
      const item = itemsData[itemID];
      // retrieving id, name, and icon of the image. only items that are final components.
      if (item.from && !item.into) {
        items.push({
          id: itemID,
          name: item.name,
          icon: item.image.full,
        });
      }
    });

    res.json({ items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred fetching items!' });
  }
};

module.exports = {
  makerPage,
  makeBuild,
  getChampionList,
  getRunesList,
  getItemsList,
};
