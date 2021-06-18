const { Application, HTTPAPIPlugin, utils } = require('lisk-sdk');
const { DashboardPlugin } = require('@liskhq/lisk-framework-dashboard-plugin');
const { genesisBlock, appConfig } = require('./conf');
const { TipLskModule } = require('./module');

genesisBlock.header.asset.accounts = genesisBlock.header.asset.accounts.map(
	(a) =>
		utils.objects.mergeDeep({}, a, {
			tiplsk: {
				link: []
			}
		})
);

const app = Application.defaultApplication(genesisBlock, appConfig);
app.registerModule(TipLskModule);
app.registerPlugin(HTTPAPIPlugin);
app.registerPlugin(DashboardPlugin);
app
	.run()
	.then(() => app.logger.info('App started...'))
	.catch((error) => {
		console.error('Faced error in application', error);
		process.exit(1);
	});
