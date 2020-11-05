const { log, table, clear } = console

require('./scripts/load')
require('./scripts/startServer')


const w = global.app


w.use('*', (req, res) => {
	res.render('default')
})