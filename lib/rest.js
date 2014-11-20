"use strict";

var RestProxy = require('./rest-proxy');

var legacyProxy = new RestProxy({
	removeHeaders: [
		'access-control-allow-origin'
		, 'access-control-allow-methods'
		, 'access-control-allow-headers'
	]
	, urlModifier: function( req ) {
		return req.url;
	}
	, authorization: function( req ) {
		return 'Oauth oauth_token=' + req.session.fuel.legacyToken;
	}
	, host: function( req ) {
		return req.fuelConfig.legacyRestHost;
	}
	, port: 443
	, isSSL: true
});

var fuelapiProxy = new RestProxy({
	removeHeaders: [
		'access-control-allow-origin'
		, 'access-control-allow-methods'
		, 'access-control-allow-headers'
	],
	addHeaders: {
		'X-FUELDATA-VERSION': '1.1'
	}
	, urlModifier: function( req ) {
		return req.url.replace( /^\/fuelapi\//, '/' );
	}
	, authorization: function( req ) {
		return 'Bearer ' + req.session.fuel.token;
	}
	, host: function( req ) {
		return req.fuelConfig.fuelapiRestHost;
	}
	, port: 443
	, isSSL: true
});

module.exports = {
	registerProxyHandlers: function( app ) {
		// setup rest proxies
		app.all( '/rest/*', legacyProxy.proxyHandler() );
		app.all( '/fuelapi/*', fuelapiProxy.proxyHandler() );

		// token handler for client side token management
		app.get( '/update-token.json', function( req, res ) {
			res.setHeader( 'content-type', 'application/json' );
			res.send( JSON.stringify( {
				token: req.session.fuel.token
				, legacyToken: req.session.fuel.legacyToken
			} ) );
		} );
	}
	, registerProxyBuffers: function( app ) {
		app.use( '/rest', legacyProxy.proxyBufferMiddleware() );
		app.use( '/fuelapi', fuelapiProxy.proxyBufferMiddleware() );
	}
};
