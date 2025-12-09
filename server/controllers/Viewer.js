const models = require('../models');

const { Build } = models;

const viewerPage = (req, res) => res.render('app');

const viewerPagePublic = (req, res) => res.render('app');

const getBuilds = async (req, res) => {
  try {
    const query = { owner: req.session.account._id };
    const docs = await Build.find(query).select('name champion desc runes items skillPoints').lean().exec();
    docs.forEach(build => {
      build.spriteURL = `https://ddragon.leagueoflegends.com/cdn/15.23.1/img/champion/${build.champion}.png`;
    });
    return res.json({ builds: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving builds!' });
  }
};

const getPublicBuilds = async (req, res) => {
  try {
    // locate all of our publicly accessible builds
    const docs = await Build.find({ publicBuild: true }).select('name champion desc runes items skillPoints').lean().exec();

    // Add sprite URLs for champion images
    docs.forEach(build => {
      build.spriteURL = `https://ddragon.leagueoflegends.com/cdn/15.23.1/img/champion/${build.champion}.png`;
    });
    return res.json({ builds: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving public builds!' });
  }
};


const deleteBuild = async (req, res) => {
  try {
    const { id } = req.body;
    // deletes build from existence
    await Build.deleteOne({ _id: id, owner: req.session.account._id });
    return res.json({ message: 'Deleted Build successfully' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'An error occured deleting build!' });
  }
};

module.exports = {
  viewerPage,
  getBuilds,
  deleteBuild,
  viewerPagePublic,
  getPublicBuilds,
};
