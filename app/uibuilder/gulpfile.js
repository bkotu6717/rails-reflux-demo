'use strict';

var gulp = require('gulp');
var del = require('del');
var argv = require('yargs').argv;
var browserSync = require('browser-sync');
var reload      = browserSync.reload;
var gutil = require('gulp-util');
var path = require('path');
var shell = require('gulp-shell');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gulpIf = require('gulp-if');
var jshint = require('gulp-jshint');
// var sourcemaps = require('gulp-sourcemaps');

var FEATURES = {
    agenda: 'Agenda',
    user: 'User',
    profile: 'profile',
    event: 'Event',
    mascal: 'MasterCalendar',
    alert: 'Alert',
    analytics: 'Analytics',
    register: 'Register',
    userevents: 'UserEvents',
    eh: 'EventHome',
    es: 'EventSetup',
    ms: 'MeetingSummary',
    EventSetting: 'EventSetting',
    book: 'Book',
    room: 'Room',
    meeting: 'Meeting',
    demandreport: 'Report/onDemand',
    standardreport: 'Report/standard',
    login: 'Login',
    password: 'Password',
    forgot_password: 'ForgotPassword',
    create: 'CreateEvent',
    checkin: 'Checkin',
    comp_conf: 'CompanyConfig',
    tag: 'Tag',
    tag_edit: "TagEdit",
    ext_wid: 'ExternalWidget',
    survey: 'SurveyForm',
    session: 'Session',
    ext_meet:'ExternalMeeting',
    mapping: 'MappingModule',
    company: 'Company',
    track: 'Track',
    track_edit: 'TrackEdit',
    mapping_list: "Mapping",
    topic_upload: 'TopicUpload'
}

// Load plugins
var $ = require('gulp-load-plugins')();
var browserify = require('browserify');
var transform = require('vinyl-transform');
var port = (argv.app && argv.app === 'portal') ? 3001 : 3000;
var isSFEnv = (argv.env && argv.env === 'sfdc');
var environment = isSFEnv ? 'sfdc' : 'jiffle';

var buildJS = function(feature, shouldUglify) {
    console.log("Building  ",feature);
    var entryFile = './app/scripts/'+ feature +'/app.js';
    var makeUgly = (shouldUglify) ? true : false;
    var bundler = browserify({
        entries: entryFile,
        insertGlobals: true,
        transform: ['reactify'],
        ignore: ['lodash','moment','reflux','i18next-client','jquery', 'jQuery']
    });
    var jsFilter = require('gulp-filter')([ '*.js.map', ], { restore: true, });
    bundler.require('./app/scripts/commons/' + environment + '/api', {expose: 'common_api'});
    return bundler.bundle()
            .pipe(source(feature+'.app.js'))
            .pipe(buffer())
            .pipe($.concat(feature+'.app.js'))
            .pipe(gulpIf(makeUgly, $.uglify()))
            .pipe(gulp.dest(function(){
                return '../assets/javascripts'+ (isSFEnv? '/sfdc': '');
            }))
            .pipe($.size())
            .on('error',swallowError);

}
var padLeft = function(name, size) {
    while(size != name.length) {
        name = ' ' + name;
    }
    return name;
}

function swallowError (error) {

    //If you want details of the error in the console
    console.log(error.toString());

    this.emit('end');
}

gulp.task('list-features', function() {

});
// Styles
gulp.task('styles', function () {
    return gulp.src(['app/styles/'+ FEATURES[argv.feature] +'/*'])
        .pipe($.rubySass({
            style: 'expanded',
            precision: 10,
            'sourcemap=none': true,
            loadPath: ['./bower_components']
        }))
        .pipe($.autoprefixer('last 1 version'))
        .pipe($.concat(FEATURES[argv.feature]+'.app.css'))
        .pipe(gulp.dest('dist/'+ FEATURES[argv.feature] +'/styles'))
        .pipe($.size());
});

gulp.task('rails-styles', function () {
    return gulp.src(['app/styles/'+ FEATURES[argv.feature] +'/*'])
        .pipe($.rubySass({
            style: 'expanded',
            precision: 10,
            'sourcemap=none': true,
            loadPath: ['./bower_components']
        }))
        .pipe($.autoprefixer('last 1 version'))
        .pipe($.concat(FEATURES[argv.feature]+'.app.css'))
        .pipe(gulp.dest('../assets/stylesheets/'))
        .pipe($.size());
});

// Scripts
gulp.task('scripts', function () {
    return gulp.src(['./app/scripts/'+ FEATURES[argv.feature] +'/app.js'])
            .pipe($.browserify({
                insertGlobals: true,
                transform: ['reactify']
            }))
            .pipe($.concat(FEATURES[argv.feature]+'.app.js'))
            .pipe(gulp.dest('dist/'+ FEATURES[argv.feature] +'/scripts'))
            .pipe(reload({stream:true}));
});


gulp.task('rails-scripts', function () {
    return buildJS(FEATURES[argv.feature], false)
            .pipe(reload({stream:true}))
});

gulp.task('vendor-scripts', function () {
    return gulp.src(['./app/scripts/Vendor/app.js'])
            .pipe($.browserify({
                insertGlobals: true,
                transform: ['reactify']
            }))
            .pipe($.concat('vendor.app.js'))
            .pipe(gulp.dest('../assets/javascripts'))
            .pipe($.size())
            .on('error',swallowError);
});

gulp.task('show-scripts', function () {
    console.log('\n');
    var keys = Object.keys(FEATURES).sort();
    keys.forEach(function(feature) {
        console.log(padLeft(FEATURES[feature], 20), ' => ', feature);
    });
    console.log('\n');
});


gulp.task('bundle-scripts',['vendor-scripts'], function () {
    var keys = Object.keys(FEATURES)
    keys.forEach(function(feature){
        buildJS(FEATURES[feature], true)
    });
});


gulp.task('bundle-script', function () {
    buildJS(FEATURES[argv.feature], true);
});

gulp.task('bundle', function () {
    argv.feature.split('..').forEach(function(module) {
        module = module.trim();
        if (FEATURES[module]) {
            buildJS(FEATURES[module], true);
        }
    })
});

gulp.task('jshint', function(){
   return gulp.src(['app/scripts/' + FEATURES[argv.feature] + '/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

// HTML
gulp.task('html', function () {
    return gulp.src(['app/'+ FEATURES[argv.feature] +'/*.html'])
        .pipe($.useref())
        .pipe(gulp.dest('dist/'+ FEATURES[argv.feature] +'/'))
        .pipe($.size());
});

// Images
gulp.task('images', function () {
    return gulp.src(['app/images/'+ FEATURES[argv.feature] +'/*'])
        .pipe(gulp.dest('dist/'+ FEATURES[argv.feature] +'/images'))
        .pipe($.size());
});


gulp.task('rails-images', function () {
    return gulp.src(['app/images/'+ FEATURES[argv.feature] +'/*'])
        .pipe(gulp.dest('../app/assets/images/'+ FEATURES[argv.feature] +''))
        .pipe($.size());
});




gulp.task('jest', function () {
    var nodeModules = path.resolve('./node_modules');
    return gulp.src('app/scripts/'+ FEATURES[argv.feature] +'/**/__tests__')
        .pipe($.jest({
            scriptPreprocessor: nodeModules + '/gulp-jest/preprocessor.js',
            unmockedModulePathPatterns: [nodeModules + '/react']
        }));
});



// Clean
gulp.task('clean', function (cb) {
    del(['dist/'+ FEATURES[argv.feature] +'/styles', 'dist/'+ FEATURES[argv.feature] +'/scripts', 'dist/'+ FEATURES[argv.feature] +'/images'], cb);
});


gulp.task('build-rails', ['rails-scripts', 'rails-styles', 'rails-images']);

// Default task
gulp.task('default', ['clean', 'build', 'jest' ]);


// Bower helper
gulp.task('bower', function() {
    gulp.src('app/'+ FEATURES[argv.feature] +'/bower_components/**/*.js', {base: './bower_components'})
        .pipe(gulp.dest('dist/'+ FEATURES[argv.feature] +'/bower_components/'));

});

gulp.task('json', function() {
    gulp.src('app/'+ FEATURES[argv.feature] +'/scripts/json/**/*.json', {base: 'app/scripts'})
        .pipe(gulp.dest('dist/'+ FEATURES[argv.feature] +'/scripts/'));
});


gulp.task('browser-sync', function() {
    browserSync({
        proxy: 'developer.jifflenow.com:'+port,
        logLevel: "debug",
        port: (port == 3001) ? 4000 : 4001
    });
});

gulp.task('rails-start', shell.task([
    ])
);
// Watch
gulp.task('default', ['rails-start','browser-sync','rails-scripts'], function () {
    // Watch .js files
    gulp.watch('app/scripts/'+ FEATURES[argv.feature] +'/**/*.js', ['rails-scripts' ]);
    gulp.watch('app/styles/'+ FEATURES[argv.feature] +'/**/*.scss', ['rails-styles' ]);
});
