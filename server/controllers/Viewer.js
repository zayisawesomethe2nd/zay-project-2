const models = require('../models');
const { Build } = models;

const viewerPage = (req, res) => res.render('app');

const getBuilds = async (req, res) => {
  try {
    const query = { owner: req.session.account._id };
    const docs = await Build.find(query).select('name champion desc').lean().exec();
    for (let i = 0; i < docs.length; i++) {
      docs[i].spriteURL = `https://ddragon.leagueoflegends.com/cdn/15.23.1/img/champion/${docs[i].champion}.png`;
    }
    return res.json({ builds: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving builds!' });
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
};
