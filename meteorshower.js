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
    clientId: 'cc02855bd41dbfc4be72',
    secret: '443ea5d64be6afada4acd946cf5b49878f4af4c8'
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
    Session.set('filter', '');
  //});
  Template.list.items = function () {
    var nav_config = Session.get('nav_settings');
    var sort_by = Session.get('sort_by');
    var sort_order = {};
    var filter = Session.get('filter');
    if (!filter || filter == undefined){ filter = '' };
    sort_order[sort_by] = nav_config[sort_by] || -1;
    return Showcase.find({ name: { $regex: filter, $options: 'i'}}, {sort: sort_order}).fetch();
  };
  Template.item.selected = function(){
    return Session.equals("selected_item", this._id) ? "selected" : '';
  };
  Template.item.events({
    'click a.inc': function () {
      Showcase.update(Session.get("selected_item"), {$inc: {score: 5}});
    },
    'click a.dec': function () {
      Showcase.update(Session.get("selected_item"), {$inc: {score: -5}});
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
    return Template.nav.buttonLogo('name', -1);
  };
  Template.nav.date_dir = function(){
    return Template.nav.buttonLogo('date', -1);
  };
  Template.nav.score_dir = function(){
    return Template.nav.buttonLogo('score', -1);
  };
  Template.edit.events({
    'click a.save' : function (){
      $('#modal_edit').modal('hide');
      var validation_passed = true;
      //ask for auth, redirect away?
      //read fields (use jquery)
      //validate data and error back, or

      //load to 'View' modal
      if(validation_passed){
        //insert new data

        $('#modal_view').modal('show');
      }else{
        //highlight errors
        $('#modal_edit').modal('show');
        return false;
      }
    },
    'click a.delete' : function (){
      //ask for auth, redirect away?
    }
  });
  Template.submit.events({
    'click .submit' : function (){
      $('#modal_create').modal('hide');
      var validation_passed = true;
      //save everything in localstorage?
      //ask for auth, redirect away?
      //read fields (use jquery)
      //validate data and error back, or

      //load to 'View' modal
      if(validation_passed){
        //insert new data
        //Session.set("selected_item", this._id);
        $('#modal_view').modal('show');
      }else{
        //highlight errors
        $('#modal_create').modal('show');
        return false;
      }
    }
  });
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
    'dblclick': function () {
      $('#modal_view').modal('show');
    },   
    'click': function () {
      Session.set("selected_item", this._id);
      console.log("selected_item: " + this._id)
    }   
  }); 
  Template.nav.username = function () {
    var u = Meteor.user();
    return u && u.profile && u.profile.name;
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
