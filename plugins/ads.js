/**
\file ads.js
Plugin to check wether ads are blocked (i.e. adblock is active) or not
You have to provide an image for this test to work
*/
// w is the window object
(function(w) {

var d = w.document;

BOOMR = BOOMR || {};
BOOMR.plugins = BOOMR.plugins || {};

var impl = {
  ads_src: false,
  complete: false,
  ad_is_loaded: undefined,
  running: false,
  aborted: false,
  timeout: 1000,

  do_test: function() {
    BOOMR.debug('called do_test', 'ads');
    BOOMR.debug(this.ads_src, 'ads');
    if (!this.ads_src) {
      return this;
    }
    this.load_img(this.ads_src);
  },

  load_img: function(src) {
    BOOMR.debug('called load_img', 'ads');
    var img = new Image(),
        timer,
        that = this;

    img.onload = function() {
      BOOMR.debug('onload called', 'ads');
      img.onload = img.onerror = null;
      img = null;
      clearTimeout(timer);
      BOOMR.debug('ads are loaded it seems', 'ads');
      that.ad_is_loaded = true;
      that.running = false;
      that.finish();
      that = null;
    };

    img.onerror= function() {
      BOOMR.debug('onerror called', 'ads');
      img.onload = img.onerror = null;
      img = null;
      clearTimeout(timer);
      BOOMR.debug('adblocking in action', 'ads');
      that.ad_is_loaded = false;
      that.running = false;
      that.finish();
      that = null;
    };

    timer = setTimeout(function() {
      BOOMR.debug('image timer called', 'ads');
      that.aborted = true;
      that.finish();
    }, this.timeout);

    img.src = this.ads_src;
  },

  finish: function() {
    BOOMR.debug('finish called', 'ads');
    if (!this.aborted) {
      BOOMR.addVar("ads", this.ad_is_loaded ? 1 : 0);
    }
    this.complete = true;
    BOOMR.sendBeacon();
    this.running = false;
  }
};

BOOMR.plugins.ads = {
  init: function(config) {
    var properties = ["ads_src"];

    BOOMR.utils.pluginConfig(impl, config, "ads", properties);

    BOOMR.subscribe("page_ready", this.run, null, impl);

    return this;
  },

  run: function () {
    if (impl.running || impl.complete) {
      return this;
    }

    impl.running = true;
    impl.aborted = false;

    impl.do_test();

    return this;
  },

  is_complete: function() {
    return impl.complete;
  }
};

}(window));
