Showcase = new Meteor.Collection("showcase");

if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Showcase.find().count() === 0) {
      var names = ["Ada Lovelace",
                   "Grace Hopper",
                   "Marie Curie",
                   "Carl Friedrich Gauss",
                   "Nikola Tesla",
                   "Claude Shannon"];
      for (var i = 0; i < names.length; i++)
        Showcase.insert({name: names[i], score: Math.floor(Random.fraction()*10)*5, date: new Date()});
    }
  });
  Accounts.loginServiceConfiguration.insert({
    service: "github",
    clientId: (process.env.GITHUB_CLIENT || "cc02855bd41dbfc4be72"),
    secret: (process.env.GITHUB_SECRET || "443ea5d64be6afada4acd946cf5b49878f4af4c8")
  });

  Meteor.publish("showcase-items", function () {
    return Showcase.find(); // everything
  });
}

if (Meteor.isClient) {
  Meteor.subscribe("showcase-items");
  //Meteor.startup(function () {
    Session.set('nav_settings', {name: 1, date: -1, score:-1});
    Session.set('sort_by', "date"); // default to sorting by date, descending
  //});
  Template.list.items = function () {
    var nav_config = Session.get('nav_settings');
    var sort_by = Session.get('sort_by');
    var sort_order = {};
    sort_order[sort_by] = nav_config[sort_by] || -1;
    return Showcase.find({}, {sort: sort_order}).fetch();
  };
  Template.item.selected = function(){
    return Session.equals("selected_item", this._id) ? "selected" : '';
  };
  Template.submit.events({
    'click input.inc': function () {
      Showcase.update(Session.get("selected_item"), {$inc: {score: 5}});
    }   
  }); 
  Template.nav.name_active = function(){
    return Session.equals("sort_by", 'name') ? "active" : '';
  };
  Template.nav.date_active = function(){
    return Session.equals("sort_by", 'date') ? "active" : '';
  };
  Template.nav.score_active = function(){
    return Session.equals("sort_by", 'score') ? "active" : '';
  };
  Template.nav.name_dir = function(){
    return Template.nav.buttonLogo('name', 1);
  };
  Template.nav.date_dir = function(){
    return Template.nav.buttonLogo('date', -1);
  };
  Template.nav.score_dir = function(){
    return Template.nav.buttonLogo('score', -1);
  };
  Template.nav.events({
    'click #date_sort' : function (){
      Template.nav.toggleNav('date');
    },
    'click #score_sort' : function (){
      Template.nav.toggleNav('score');
    },
    'click #name_sort' : function (){
      Template.nav.toggleNav('name');
    },
    'click #logout_btn' : function () {
      Meteor.logout();
    },
    'click #login_btn' : function () {
      Meteor.loginWithGithub({
          requestPermissions: ['user:email']
        }, function (err) {
        if (err)
          Session.set('errorMessage', err.reason || 'Unknown error');
      });
    }
  });
  Template.list.events({
    'click': function () {
      Session.set("selected_item", this._id);
      console.log("selected_item: " + this._id)
    }   
  }); 
  Template.submit.username = function () {
    if(Meteor.user()){
      return Meteor.user().profile.name;
    }else{
      return '';
    }
  };
  Template.nav.buttonLogo = function (nav_button, direction) {
    var nav_controls = Session.get('nav_settings');
    if(nav_controls[nav_button] * direction == -1 ){
      return 'icon-chevron-up';
    }else{
      return 'icon-chevron-down';
    }
  };
  Template.nav.toggleNav = function (nav_sort) {
    var sort_by = Session.get('sort_by');
    if( nav_sort !== sort_by){
      // set the nav tab
      Session.set('sort_by', nav_sort);
    }else{
      // or, flip the sort order
      var nav_config = Session.get('nav_settings');
      nav_config[sort_by] = nav_config[sort_by] * -1;
      Session.set('nav_settings', nav_config);
    }
  };
}
