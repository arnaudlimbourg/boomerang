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
        that = this;

    img.onload = function() {
      BOOMR.debug('ads are loaded it seems');
      that.ad_is_loaded = true;
      that.running = false;
      that.finish();
    };

    img.onerror= function() {
      BOOMR.debug('adblocking in action');
      that.ad_is_loaded = false;
      that.running = false;
      that.finish();
    };

    img.src = this.ads_src;
  },

  finish: function() {
    BOOMR.addVar("ads", this.ad_is_loaded ? 1 : 0);
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

    impl.do_test();

    return this;
  },

	is_complete: function() {
    return impl.complete;
	}
};

}(window));
