const models = require('../models');
const { Build } = models;

// https://axios-http.com/docs/api_intro
// using axios for external API calls! some above and beyond i think
const axios = require('axios');


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
    publicBuild: req.body.publicBuild,
    owner: req.session.account._id,
  };

  console.log(buildData);

  try {
    const newBuild = new Build(buildData);
    await newBuild.save();
    return res.status(201).json({ name: newBuild.name, champion: newBuild.champion, desc: newBuild.desc, publicBuild: newBuild.publicBuild });
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
    for (const championID in championData) {
      champions.push({
        // id is for getting images and more data about the champ
        id: championID,
        // name is for display on client side
        name: championData[championID].name
      });    
    }
    res.json({ champions });
  } catch (err) {
    return res.status(500).json({ error: 'An error occured fetching champions!' });
  }
}


module.exports = {
  makerPage,
  makeBuild,
  getChampionList,
};
