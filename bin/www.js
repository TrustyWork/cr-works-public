#!/usr/bin/env node
/*!
 * Creative Works Project
 * Copyright 2015 Alexander Litvinenko <lenDesakura@gmail.com>
 * Released under the MIT license
 * Version 1.0
 */
var log				= require( 'libs/log')( module)

require( 'app');

//memory usage
var memoryUsage = process.memoryUsage()
    ,increaseMemory = { rss: 0, heapTotal: 0, heapUsed: 0}

var timer = setInterval( function(){

    var left = { rss: 0, heapTotal: 0, heapUsed: 0}
        ,memoryUsageNow = process.memoryUsage()
        ,message = 'memory usage: '
        ,messageItems = []

    for( var idx in left) {

        left[ idx] = memoryUsageNow[ idx] - memoryUsage[ idx];
        increaseMemory[ idx]+= left[ idx];

        //create message item
        var messageItem = idx + ': ';
        if( left[ idx] > 0) {
            messageItem+= '+';
        }
        messageItem+= left[ idx] + '(';

        if( increaseMemory[ idx] > 0) {
            messageItem+= '+'
        }
        messageItem+= increaseMemory[ idx] + ')';
        messageItems.push( messageItem);
    }

    memoryUsage = memoryUsageNow;
    message+= messageItems.join( ', ');

    log.info( message);
}, 1000 * 60 * 60 * 0.5);

timer.unref();