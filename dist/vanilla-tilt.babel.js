var VanillaTilt = (function () {
'use strict';

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

/**
 * Created by micku7zu on 1/27/2017.
 * Original idea: http://gijsroge.github.io/tilt.js/
 * MIT License.
 * Version 1.0.0
 */

var VanillaTilt = function () {
  function VanillaTilt(element) {
    var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    classCallCheck(this, VanillaTilt);

    if (!(element instanceof Node)) {
      throw "Can't initialize VanillaTilt because " + element + " is not a Node.";
    }

    this.width = null;
    this.height = null;
    this.left = null;
    this.top = null;
    this.transitionTimeout = null;
    this.updateCall = null;

    this.updateBind = this.update.bind(this);

    this.element = element;
    this.settings = this.extendSettings(settings);

    this.addEventListeners();
  }

  VanillaTilt.prototype.addEventListeners = function addEventListeners() {
    this.onMouseEnterBind = this.onMouseEnter.bind(this);
    this.onMouseMoveBind = this.onMouseMove.bind(this);
    this.onMouseLeaveBind = this.onMouseLeave.bind(this);

    this.element.addEventListener("mouseenter", this.onMouseEnterBind);
    this.element.addEventListener("mousemove", this.onMouseMoveBind);
    this.element.addEventListener("mouseleave", this.onMouseLeaveBind);
  };

  VanillaTilt.prototype.removeEventListeners = function removeEventListeners() {
    this.element.removeEventListener("mouseenter", this.onMouseEnterBind);
    this.element.removeEventListener("mousemove", this.onMouseMoveBind);
    this.element.removeEventListener("mouseleave", this.onMouseLeaveBind);
  };

  VanillaTilt.prototype.destroy = function destroy() {
    this.removeEventListeners();
    this.element.vanillaTilt = null;
    delete this.element.vanillaTilt;

    this.element = null;
  };

  VanillaTilt.prototype.onMouseEnter = function onMouseEnter(event) {
    this.width = this.element.offsetWidth;
    this.height = this.element.offsetHeight;
    this.left = this.element.offsetLeft;
    this.top = this.element.offsetTop;

    this.element.style.willChange = "transform";
    this.setTransition();
  };

  VanillaTilt.prototype.onMouseMove = function onMouseMove(event) {
    if (this.updateCall !== null) {
      cancelAnimationFrame(this.updateCall);
    }

    this.event = event;
    this.updateCall = requestAnimationFrame(this.updateBind);
  };

  VanillaTilt.prototype.onMouseLeave = function onMouseLeave(event) {
    this.setTransition();

    if (this.settings.reset) {
      this.reset();
    }
  };

  VanillaTilt.prototype.reset = function reset() {
    var _this = this;

    requestAnimationFrame(function () {
      _this.event = {
        pageX: _this.left + _this.width / 2,
        pageY: _this.top + _this.height / 2
      };

      _this.element.style.transform = "perspective(" + _this.settings.perspective + "px) " + "rotateX(0deg) " + "rotateY(0deg) " + "scale3d(1, 1, 1)";
    });
  };

  VanillaTilt.prototype.getValues = function getValues() {
    var x = (this.event.pageX - this.left) / this.width;
    var y = (this.event.pageY - this.top) / this.height;

    x = Math.min(Math.max(x, 0), 1);
    y = Math.min(Math.max(y, 0), 1);

    var tiltX = (this.settings.max / 2 - x * this.settings.max).toFixed(2);
    var tiltY = (y * this.settings.max - this.settings.max / 2).toFixed(2);

    return {
      tiltX: tiltX,
      tiltY: tiltY,
      percentageX: x * 100,
      percentageY: y * 100
    };
  };

  VanillaTilt.prototype.update = function update() {
    var values = this.getValues();

    this.element.style.transform = "perspective(" + this.settings.perspective + "px) " + "rotateX(" + (this.settings.axis === "x" ? 0 : values.tiltY) + "deg) " + "rotateY(" + (this.settings.axis === "y" ? 0 : values.tiltX) + "deg) " + "scale3d(" + this.settings.scale + ", " + this.settings.scale + ", " + this.settings.scale + ")";

    this.element.dispatchEvent(new CustomEvent("tiltChange", {
      "detail": values
    }));

    this.updateCall = null;
  };

  VanillaTilt.prototype.setTransition = function setTransition() {
    var _this2 = this;

    clearTimeout(this.transitionTimeout);
    this.element.style.transition = this.settings.speed + "ms " + this.settings.easing;
    this.transitionTimeout = setTimeout(function () {
      return _this2.element.style.transition = "";
    }, this.settings.speed);
  };

  VanillaTilt.prototype.extendSettings = function extendSettings(settings) {
    var defaultSettings = {
      max: 20,
      perspective: 1000,
      easing: "cubic-bezier(.03,.98,.52,.99)",
      scale: "1",
      speed: "300",
      transition: true,
      axis: null,
      reset: true
    };

    var newSettings = {};

    for (var property in defaultSettings) {
      if (property in settings) {
        newSettings[property] = settings[property];
      } else if (this.element.hasAttribute("data-tilt-" + property)) {
        var attribute = this.element.getAttribute("data-tilt-" + property);
        try {
          newSettings[property] = JSON.parse(attribute);
        } catch (e) {
          newSettings[property] = attribute;
        }
      } else {
        newSettings[property] = defaultSettings[property];
      }
    }

    return newSettings;
  };

  VanillaTilt.init = function init(elements, settings) {

    if (typeof elements === 'string') {
      elements = document.querySelectorAll(elements);
    }

    if (elements instanceof Node) {
      elements = [elements];
    } else if (elements instanceof NodeList) {
      elements = [].slice.call(elements);
    }

    if (!(elements instanceof Array)) {
      return;
    }

    elements.forEach(function (element) {
      if (!("vanillaTilt" in element)) {
        element.vanillaTilt = new VanillaTilt(element, settings);
      }
    });
  };

  return VanillaTilt;
}();

if (typeof document !== 'undefined') {
  window.VanillaTilt = VanillaTilt;
  VanillaTilt.init(document.querySelectorAll("[data-tilt]"));
}
module.exports = exports["default"];

return VanillaTilt;

}());