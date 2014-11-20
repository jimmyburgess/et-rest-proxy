/* global before, after, describe, it */
'use strict';

var express = require('express');
var origFn = express.session.Session.prototype.save;

var should				= require( 'chai' ).should();
var expect				= require( 'chai' ).expect;
var restProxy = require('../lib/rest-proxy');


describe( 'rest proxy', function() {

	it( 'should exist', function( done ) {
		should.exist( restProxy );
		done();
	});

});