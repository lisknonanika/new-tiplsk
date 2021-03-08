const { Application, HTTPAPIPlugin, utils } = require('lisk-sdk');
const { genesisBlock, appConfig } = require('./conf');
const { RegistrationModule } = require('./module');

genesisBlock.header.asset.accounts = genesisBlock.header.asset.accounts.map(
	(a) =>
		utils.objects.mergeDeep({}, a, {
			tiplsk: {
				link: [],
				tx: []
			}
		})
);

const app = Application.defaultApplication(genesisBlock, appConfig);
app.registerModule(RegistrationModule);
app.registerPlugin(HTTPAPIPlugin);
app
	.run()
	.then(() => app.logger.info('App started...'))
	.catch((error) => {
		console.error('Faced error in application', error);
		process.exit(1);
	});
