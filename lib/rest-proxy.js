"use strict";

var _         = require( 'underscore' );
var httpProxy = require( 'http-proxy' );

function RestProxy( options ) {
		var self = this;

		this.options = {
			removeHeaders: []
		};

		_.extend( this.options, options );

		this.proxy = new httpProxy.RoutingProxy();

		// Strip CORS headers from proxy responses so that other sites
		// cannot make requests to our proxy
		this.proxy.on( 'proxyResponse' , function(req, res, response) {
			_.each( self.options.removeHeaders, function( header ) {
				delete response.headers[ header ];
			} );
		});
}

RestProxy.prototype.proxyBufferMiddleware = function() {
	return function( req, res, next ) {
		req.proxyBuffer = new httpProxy.buffer( req );
		next();
	};
};

RestProxy.prototype.proxyHandler = function() {
	var self = this;

	return function( req, res ) {
		var proxyOptions = {};

		if ( _.isFunction( self.options.urlModifier ) ) {
			req.url = self.options.urlModifier( req, res );
		}

		if ( _.isFunction( self.options.authorization ) ) {
			req.headers.authorization = self.options.authorization( req, res );
		} else if ( self.options.authorization !== undefined ) {
			req.headers.authorization = self.options.authorization;
		}

		if ( _.isFunction( self.options.host ) ) {
			req.headers.host = self.options.host( req, res );
		} else if ( self.options.host !== undefined ) {
			req.headers.host = self.options.host;
		}

		if ( _.isFunction( self.options.port ) ) {
			proxyOptions.port = self.options.port( req, res );
		} else if ( self.options.port !== undefined ) {
			proxyOptions.port = self.options.port;
		}

		if ( _.isFunction( self.options.isSSL ) ) {
			proxyOptions.target = proxyOptions.target || {};
			proxyOptions.target.https = self.options.isSSL( req, res );
		} else if ( self.options.isSSL !== undefined ) {
			proxyOptions.target = proxyOptions.target || {};
			proxyOptions.target.https = Boolean( self.options.isSSL );
		}

		if ( req.proxyBuffer ) {
			proxyOptions.buffer = req.proxyBuffer;
		}

		// remove any port from the host for the proxyOptions.host
		proxyOptions.host = req.headers.host.split( ':' )[0];

		// always delete origin for CORS purposes
		delete req.headers.origin;

		_.each( self.options.removeHeaders, function( header ) {
			delete req.headers[ header ];
		} );

		if (self.options.addHeaders) {
			var header;
			for (header in self.options.addHeaders) {
				req.headers[header] = self.options.addHeaders[header];
			}
		}

		self.proxy.proxyRequest( req, res, proxyOptions );
	};
};

module.exports = RestProxy;
