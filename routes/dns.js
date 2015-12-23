var express = require('express');
var dns = require('dns');
var async = require('async');
var _ = require('lodash');

var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('dns', {links: []});
});

router.get('/:domain?', function(req, res, next) {
  var domain = req.params.domain.replace(/www./ig, '');
  var mxEnabled = parseInt(req.query.enable_mx) == 1;
  var links = [];

  var rrTypes = {
    'A': {'name': 'A', weight: 100},
    'NS': {'name': 'NS', weight: 100}
  };

  if (mxEnabled) {
    rrTypes['MX'] = {'name': 'MX', weight: 100};
  }

  var addLink = function(source, target, rrtype, weight) {
    /* Adds a link in the graph */
    links.push({
      'source': source,
      'target': target,
      'type': rrtype.toLowerCase(),
      'weight': weight
    });
  };

  var findRecords = function(parent, rrTypes, callback) {
    /* For each rrType, link the resolved records of that rrType and link to the parent node */
    async.forEachOf(rrTypes, function(rrType, key, eachCallback) {
      dns.resolve(parent, rrType.name, function(err, records) {
        _.each(records, function(record) {

          var recordName = rrType.name == 'MX'
                            ? record.exchange /* mx records return objects */
                            : record;

          addLink(parent, rrType.name + ': ' + recordName, rrType.name, record.weight);
        });
        eachCallback(null);
      });
    }, function(err) {
      callback(err);
    });
  };

  async.waterfall([

    function (callback) {
      findRecords(domain, rrTypes, function(err) {
        callback(err);
      });
    }

  ], function(err) {
    if (err) {
      res.send({domain: domain, links: [], error: true})
    } else {
      res.send({domain: domain, links: links});
    }
  });

});

module.exports = router;
