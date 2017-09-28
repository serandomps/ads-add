var dust = require('dust')();
var serand = require('serand');
var autils = require('autos-utils');
var utils = require('utils');
var Vehicle = require('vehicles-service');
var Advertisement = require('advertisements-service');
var list = require('advertisements-find');

var ADVERTISING_API = utils.resolve('advertising://apis/v/advertisements');

var upload = function (data, files, next, elem) {
    $('.fileupload', elem).fileupload('send', {
        files: files,
        formData: {
            data: JSON.stringify(data)
        }
    }).success(function (data, status, xhr) {
        next();
    }).error(function (xhr, status, err) {
        next(err);
    }).complete(function (data, status, xhr) {
    });
};

var send = function (data, done, update) {
    $.ajax({
        url: ADVERTISING_API + (update ? '/' + data.id : ''),
        type: update ? 'PUT' : 'POST',
        contentType: 'multipart/form-data',
        dataType: 'json',
        data: {
            data: JSON.stringify(data)
        },
        success: function (data) {
            done();
        },
        error: function (xhr, status, err) {
            done(err);
        }
    });
};

var remove = function (id, done) {
    $.ajax({
        url: ADVERTISING_API + '/' + id,
        type: 'DELETE',
        success: function (data) {
            done();
        },
        error: function (xhr, status, err) {
            done(err);
        }
    });
};

var select = function (el, val) {
    el = $('select', el);
    return val ? el.val(val) : el;
};

dust.loadSource(dust.compile(require('./template'), 'advertisements-create'));
dust.loadSource(dust.compile(require('./list'), 'advertisements-create-list'));
dust.loadSource(dust.compile(require('./details'), 'advertisements-create-details'));

var renderList = function (sandbox, fn, options) {
    dust.render('advertisements-create', {}, function (err, out) {
        if (err) {
            return;
        }
        var elem = sandbox.append(out);
        Vehicle.find({
            query: options,
            images: '288x162'
        }, function (err, vehicles) {
            if (err) {
                return;
            }
            dust.render('advertisements-create-list', {
                content: vehicles,
                size: 3
            }, function (err, out) {
                if (err) {
                    return;
                }
                $('.content', elem).html(out);
            });
        });
        fn(false, function () {
            $('.advertisements-create', sandbox).remove();
        });
    });
};

var renderDetails = function (id, sandbox, fn, options) {
    dust.render('advertisements-create', {}, function (err, out) {
        if (err) {
            return;
        }
        var elem = sandbox.append(out);
        Vehicle.findOne({id: id, images: '800x450'}, function (err, vehicle) {
            if (err) {
                return;
            }
            dust.render('advertisements-create-details', vehicle, function (err, out) {
                if (err) {
                    return;
                }
                $('.content', elem).html(out);
                fn(false, {
                    clean: function () {
                        $('.advertisements-create', sandbox).remove();
                    },
                    done: function () {
                        var i;
                        var o = [];
                        var photos = vehicle.photos;
                        var length = photos.length;
                        var photo;
                        for (i = 0; i < length; i++) {
                            photo = photos[i];
                            console.log(photo.url)
                            o.push({
                                href: photo.url,
                                thumbnail: 'https://farm6.static.flickr.com/5587/30453547284_436620c829_b.jpg'
                            });
                        }
                        blueimp.Gallery(o, {
                            container: $('.blueimp-gallery-carousel', sandbox),
                            carousel: true,
                            thumbnailIndicators: true,
                            stretchImages: true
                        });
                    }
                })
            });
        });
    });
};

module.exports = function (sandbox, fn, options) {
    options = options || {};
    var id = options.id;
    id ? renderDetails(id, sandbox, fn, options) : renderList(sandbox, fn, options);
};
