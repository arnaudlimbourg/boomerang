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
  ad_is_loaded: false,
  running: false,
  aborted: false,
  timeout: 1000,

  do_test: function() {
    BOOMR.debug('ads: called do_test');
    BOOMR.debug(this.ads_src);
    if (!this.ads_src) {
      return this;
    }
    this.load_img(this.ads_src);
  },

  load_img: function(src) {
    BOOMR.debug('ads: called load_img');
    var img = new Image(),
        timer,
        that = this;

    img.onload = function() {
      img.onload = img.onerror = null;
      img = null;
      clearTimeout(timer);
      BOOMR.debug('ads are loaded it seems');
      that.ad_is_loaded = true;
      that.running = false;
      that.finish();
      that = null;
    };

    img.onerror= function() {
      img.onload = img.onerror = null;
      img = null;
      clearTimeout(timer);
      if (this.aborted) {
        return false;
      }
      BOOMR.debug('adblocking in action');
      that.ad_is_loaded = false;
      that.running = false;
      that.finish();
      that = null;
    };

    timer = setTimeout(function() {
      return false;
    }, this.timeout);

    img.src = this.ads_src;
  },

  finish: function() {
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

    setTimeout(this.abort, impl.timeout);

    impl.do_test();

    return this;
  },

  abort: function() {
    BOOMR.debug('abort called');
    impl.aborted = true;
    if (impl.running) {
      impl.finish();
    }
    return this;
  },

  is_complete: function() {
    return impl.complete;
  }
};

}(window));
