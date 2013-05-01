// if the database is empty on server start, create some sample data.
if (Meteor.isServer) {
Meteor.startup(function () {
  if (Showcase.find().count() === 0) {
    var instant_applications = [{ /* Notes */
      "name":"Etherpad",
      "description":"Collaborative document editing",
      "author":"community maintained",
      "date":"2013-04-21T23:03:14.580Z",
      "score": 25,
      "image_url":"http://upload.wikimedia.org/wikipedia/en/2/2a/Notepad.png",
      "demo_url":"http://etherpad.org/",
      "source_url":"https://github.com/openshift/etherpad-example.git",
      "cartridge_deps":"nodejs-0.6,mongodb-2.2"
    },
    { /* Slide presentations */
      "name":"Reveal.js",
      "description":"Reveal.js slide decks / online presentations. Optional support for broadcasting slide changes using node.js and socket.io - Nice Slides!!",
      "author":"community maintained",
      "date":"2013-04-21T23:03:14.580Z",
      "score":74,
      "image_url":"http://cdn.medleyweb.com/wp-content/uploads/2012/08/revealjs.png",
      "demo_url":"http://darkslides-rjdemo.rhcloud.com/",
      "source_url":"http://github.com/ryanj/darkslides.git",
      "cartridge_deps":"nodejs-0.6,mongodb-2.2"
    },
    { /* RSS Reader */
      "name":"TinyTinyRSS",
      "description":"RSS Reader",
      "author":"community maintained",
      "date":"2013-04-21T23:03:14.580Z",
      "score": 10,
      "image_url":"http://mini-rssl.overgrid.com/mini_rss.png",
      "demo_url":"http://tt-rss.org/",
      "source_url":"git://github.com/lulinqing/tiny_tiny_rss-openshift-quickstart.git",
      "cartridge_deps":"php-5,postgresql-8"
    },
    { /* wordpress - blog publishing */
      "name":"Wordpress",
      "description":"Blog like a pro",
      "author":"community maintained",
      "date":"2013-04-21T23:03:14.580Z",
      "score": 25,
      "image_url":"http://www.thinkbiglearnsmart.com/wp-content/uploads/2012/10/WordPress.jpg",
      "demo_url":"http://wordpress.org",
      "source_url":"git://github.com/openshift-quickstart/wordpress-example.git",
      "cartridge_deps":"php-5,mysql"
    },
    { /* Simple Surveys */
      "name":"LimeSurvey",
      "description":"The Open Source survey application ...refreshingly easy and free.",
      "author":"community maintained",
      "date":"2013-04-21T23:03:14.580Z",
      "score": 5,
      "image_url":"https://si0.twimg.com/profile_images/381313636/limesurvey_logo_444x444.png",
      "demo_url":"http://www.limesurvey.org/",
      "source_url":"https://github.com/openshift-quickstart/limesurvey-quickstart",
      "cartridge_deps":"php-5,mysql-5"
    },
    { /* Quake2 */
      "name":"Quake2",
      "description":"Classic FPS shooter, needs a medium-sized gear",
      "author":"community maintained",
      "date":"2013-04-21T23:03:14.580Z",
      "score": 50,
      "image_url":"http://upload.wikimedia.org/wikipedia/en/thumb/b/b5/Quake2box.jpg/250px-Quake2box.jpg",
      "demo_url":"http://www.youtube.com/watch?feature=player_embedded&v=fyfu4OwjUEI",
      "source_url":"https://github.com/openshift-quickstart/openshift-quickstart-quake2.git",
      "cartridge_deps":"jbossas-7"
    },
    { /* Draw / Sketch */
      "name":"Sketchboard",
      "description":"Collaborative Sketchboard. Application cloning is not currently working for this project.",
      "author":"community maintained",
      "date":"2013-04-21T23:03:14.580Z",
      "score": 5,
      "image_url":"http://ianli.com/projects/img/sketchpad.png",
      "demo_url":"http://tutorialzine.com/2012/08/nodejs-drawing-game/",
      "source_url":"https://github.com/ryanj/ethersketch.git",
      "cartridge_deps":"nodejs-0.6"
    },
    { /* StackOverflow / Forums */
      "name":"BufferOverflow",
      "description":"Colocate selected Stackoverflow content with this simple app.  App cloning is not currently working for this project.",
      "author":"ryan jarvinen",
      "date":"2013-04-21T23:03:14.580Z",
      "score": 10,
      "image_url":"http://www.iconsdb.com/icons/preview/gray/stackoverflow-2-xxl.png",
      "demo_url":"http://developer.eventbrite.com/discussion/",
      "source_url":"https://github.com/ryanj/StackUnderflow.js.git",
      "cartridge_deps":"node.js-0.6,mongodb-2.2"
    },
    { /* InstantApp Store / Quickstart Showcase (this app) */
      "name":"Instant App Store",
      "description":"Clone this application store to showcase your own favorite applications.  App cloning is not currently working for this project.",
      "author":"ryan jarvinen",
      "date":"2013-04-21T23:03:14.580Z",
      "score": 20,
      "image_url":"https://www.openshift.com/sites/default/files/redhat_shipment.png",
      "demo_url":"http://instantappstore-rjdemo.rhcloud.com/",
      "source_url":"https://github.com/ryanj/meteor-showcase.git",
      "cartridge_deps":"nodejs-0.6,mongodb-2.2"
    }];

    var timestamp = (new Date()).getTime();
    for (var i = 0; i < instant_applications.length; i++) {
      var app_id = Showcase.insert({
        name: instant_applications[i].name, 
        author: instant_applications[i].author, 
        image_url: instant_applications[i].image_url, 
        source_url: instant_applications[i].source_url, 
        demo_url: instant_applications[i].demo_url, 
        description: instant_applications[i].description, 
        cartridge_deps: instant_applications[i].cartridge_deps, 
        score: instant_applications[i].score, 
        date: timestamp 
      });
      timestamp += 1; // ensure a unique timestamp
    }
  }
});
}
