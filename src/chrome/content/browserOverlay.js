/* 
 * browserOverlay.js - TiltChrome namespace
 * version 0.1
 *
 * Copyright (c) 2011 Victor Porof
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 *    1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 *
 *    2. Altered source versions must be plainly marked as such, and must not
 *    be misrepresented as being the original software.
 *
 *    3. This notice may not be removed or altered from any source
 *    distribution.
 */
if ("undefined" == typeof(TiltChrome)) {
  var TiltChrome = {};
};

/**
 * Controls the browser overlay for the Tilt extension.
 */
TiltChrome.BrowserOverlay = {
  
  /**
   * The iframe containing the canvas element, used for rendering.
   */
  iframe: null,
  
  /*
   * Visualization logic and drawing loop.
   */
  visualization: null,
    
  /**
   * Initializes Tilt.
   * @param {object XULCommandEvent} aEvent: the event firing this function
   */
  initialize: function(aEvent) { 
    Components.utils.forceGC();
    
    // get the Tilt menu item, to change the title if the visualization is on
    var tiltMenu = document.getElementById("tilt-menuItemInitialize");  
    var that = this;
    
    // if the visualization is not currently running
    if (!this.iframe) {
      // change the menu label acrodingly
      tiltMenu.label = TiltUtils.StringBundle.get("menuItemHide.label");
      
      // use an extension to get the image representation of the document
      TiltExtensions.WebGL.initDocumentImage(function textureCallback(image) {
        // initialize an iframe containing a canvas element
        TiltUtils.Iframe.initCanvas(function initCallback(iframe, canvas) {
          // remember the iframe so that it can be destroyed later
          that.iframe = iframe;
          
          // set the width and height to mach the content window dimensions
          canvas.width = iframe.contentWindow.innerWidth;
          canvas.height = iframe.contentWindow.innerHeight;
          
          // construct the visualization using the dom image and the canvas
          that.visualization = new TiltVisualization(image, canvas);
          that.visualization.setup();
          that.visualization.loop();
        }, true);
      });
    }
    else {
      // if the visualization is running destroy it
      this.destroy();
      // change the menu label to the default initialization string
      tiltMenu.label = TiltUtils.StringBundle.get("menuItemInitialize.label");
    }
  },
  
  /**
   * Destroys Tilt, removing the iframe from the stack.
   */
  destroy: function() {  
    var that = this;
      
    // issue a destroy call through all the visualization children
    this.visualization.destroy(function destroyCallback() {
      that.visualization = null; // when done, do some cleanup

      // remove the iframe from the browser stack
      TiltUtils.Iframe.removeFromStack(that.iframe);
      that.iframe = null;

      // collect any remaining garbage
      Components.utils.forceGC();
    });
  }
};