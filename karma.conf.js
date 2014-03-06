module.exports = function(config) {

  config.set({
    basePath: 'src/js/src',
    frameworks: [ 'mocha', 'chai', 'sinon' ],
    files: [
      '*.js',
      'test/*.js',
      'test/mocks/*.js'
    ],
    preprocessors: {
      '*.js': 'coverage'
    },
    exclude: [ ],
    reporters: [ 'progress', 'osx', 'coverage' ],
    coverageReporter: {
      type : 'html',
      dir : '../coverage/'
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: [ 'Chrome' ],
    captureTimeout: 60000,
    singleRun: false
  });

};
