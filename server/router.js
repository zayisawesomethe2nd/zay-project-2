const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  // Personal build viewer
  app.get('/getBuilds', mid.requiresLogin, controllers.Viewer.getBuilds);
  app.get('/viewer', mid.requiresLogin, controllers.Viewer.viewerPage);

  // Public build viewer
  app.get('/getPublicBuilds', controllers.Viewer.getPublicBuilds);
  app.get('/publicViewer', controllers.Viewer.viewerPagePublic);

  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

  app.get('/logout', mid.requiresLogin, controllers.Account.logout);

  app.get('/buildMaker', mid.requiresLogin, controllers.BuildMaker.makerPage);
  app.post('/buildMaker', mid.requiresLogin, controllers.BuildMaker.makeBuild);
  app.delete('/unmaker', mid.requiresLogin, controllers.Viewer.deleteBuild);

  // for retrieving data from the data dragon API
  app.get('/api/champions', mid.requiresLogin, controllers.BuildMaker.getChampionList);
  app.get('/api/runes', mid.requiresLogin, controllers.BuildMaker.getRunesList);
  app.get('/api/items', mid.requiresLogin, controllers.BuildMaker.getItemsList);

  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;
