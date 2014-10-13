Showcase = new Meteor.Collection("showcase");

if (Meteor.isServer) {
  //var github_client_id = 'd351a0b78c1c05cb2730';
  var github_client_id = process.env.GITHUB_CLIENT || 'cc02855bd41dbfc4be72';
  //var github_client_secret = 'f5b6451e1af9ea6f6becdf1e2156cf8e2cab467d';
  var github_client_secret = process.env.GITHUB_SECRET || '443ea5d64be6afada4acd946cf5b49878f4af4c8';
  ServiceConfiguration.configurations.remove({
    service: "github"
  });
  ServiceConfiguration.configurations.insert({
    service: "github",
    clientId: github_client_id,
    secret: github_client_secret
  });

  Meteor.publish("showcase-items", function () {
    return Showcase.find(); // share everything in the showcase
  });
  Showcase.allow({
    remove: function (userId, item) {
      var username = false;
      if(userId){
        username = Meteor.users.findOne(userId).profile.name;
      }
      return (item.author == username || username == 'ryan jarvinen');
    },
    insert: function (userId, item) {
      return (userId) ? true : false;
    },
    update: function (userId, item, fieldNames, modifier) {
      var username = false;
      if(userId){
        username = Meteor.users.findOne(userId).profile.name;
      }
      if(item.score > 9000){
        // OVER 9000?!?!
        return false;
      }else if( _.isEqual(modifier, {$inc:{score: +5}})){
        //allow voting by anyone
        console.log('option1 - voter');
        return true;
      }else if( _.isEqual(modifier, {$inc:{score: -5}}) && item.score > 4 ){
        //allow voting by anyone
        console.log('option1 - voter');
        return true;
      }else if(username == 'ryan jarvinen') {
        //allow updates by admins (me) :-P
        console.log('option2 - admin');
        return true;
      }else{
        //allow updates by owners
        console.log('option3 - owner');
        return ( username == item.author ) ? true : false;
      }
    }
  });
}

if (Meteor.isClient) {
  Meteor.subscribe("showcase-items");
  Session.set('nav_settings', {name: 1, date: -1, score:-1});
  Session.set('sort_by', "date"); // default to sorting by date, descending
  Session.set('filter', '');
  $('#modal_edit').modal('show').on('shown', function(){
    $('#modal_view').modal('hide');
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
  Template.nav.username = function () {
    var u = Meteor.user();
    return u && u.profile && u.profile.name;
  };

  Template.list.items = function () {
    var nav_config = Session.get('nav_settings');
    var sort_by = Session.get('sort_by');
    var sort_order = {};
    var filter = Session.get('filter');
    if (!filter || filter == undefined){ filter = '' };
    sort_order[sort_by] = nav_config[sort_by] || -1;
    return Showcase.find({ name: { $regex: filter, $options: 'i'}}, {sort: sort_order}).fetch();
  };
  Template.item.events({
    'click a.inc': function () {
      Showcase.update(Session.get("selected_item"), {$inc: {score: 5}});
    },
    'click a.dec': function () {
      Showcase.update(Session.get("selected_item"), {$inc: {score: -5}});
    },
    'dblclick': function () {
      $('#modal_view').modal('show');
    },   
    'click a.view': function () {
      $('#modal_view').modal('show');
    },   
    'click': function () {
      var item = Showcase.findOne({_id: this._id});
      Session.set("selected_item", this._id);
      console.log("selected_item: " + this._id)
      console.log(item);
      Session.set("name", (item.name) ? item.name : "App Name");
      Session.set("description", (item.description) ? item.description : "foobar");
      Session.set("image_url", item.image_url || "");
      Session.set("source_url", item.source_url|| "");
      Session.set("demo_url", item.demo_url || "");
      Session.set("date", item.date || "");
      Session.set("score", item.score || "");
      Session.set("cartridge_deps", item.cartridge_deps || "");
      Session.set("author", item.author || "");
    }   
  }); 
  Template.item.timestring = function(){
    var time = new Date(this.date);
    var time_string = '';
    var minutes = time.getMinutes();
    var hours = time.getHours();
    var ampm = 'am';
    if( minutes < 10 ){
      minutes = '0' + minutes;
    }
    if( hours === 0 ){
        hours = 12;
      } else if ( hours >= 12 ){
        ampm = 'pm';
      if( hours !== 12){
        hours = hours - 12;
      }
    }
    return time_string += hours + ':' + minutes + ampm;
  };
  Template.item.datestring = function(){
    var date = new Date(this.date);
    return date.toDateString();
  };
  Template.item.selected = function(){
    return Session.equals("selected_item", this._id) ? "selected" : '';
  };

  Template.itemview.events({
    'click a.edit' : function (){
      $('#modal_edit').modal('show');
      $('#modal_view').modal('hide');
    }
  });
  Template.itemview.description = function(){
    return Session.get('description');
  };
  Template.itemview.app_name = function(){
    return Session.get('name');
  };
  Template.itemview.score = function(){
    return Session.get('score');
  };
  Template.itemview.image_url = function(){
    return Session.get('image_url');
  };
  Template.itemview.date = function(){
    var s= new Date(Session.get('date'));
    return s.toDateString();
  };
  Template.itemview.source_url = function(){
    return Session.get('source_url');
  };
  Template.itemview.demo_url = function(){
    return Session.get('demo_url');
  };
  Template.itemview.cartridge_deps = function(){
    return Session.get('cartridge_deps');
  };
  Template.itemview.clone_url = function(){
    try{
      var name = Session.get('name');
      var source = Session.get('source_url');
      var cart_deps = Session.get('cartridge_deps');
      var carts = cart_deps.split(',');
      var cartstring = '';
      carts.forEach(function(cart){
        cartstring += "&cartridges[]="+cart;
      });
      var link = "https://openshift.redhat.com/app/console/application_types/custom?name="+name+"&initial_git_url="+source+cartstring;
    }catch(err){
      var link = "#";
    }
    return link;
  };
  Template.itemview.author = function(){
    return Session.get('author');
  };
  
  Template.edit.events({
    'click a.save' : function (){
      $('#modal_edit').modal('hide');
      var validation_passed = true;
      //ask for auth, redirect away?
      //read fields (use jquery)
      //validate data and error back, or

      var form_data = {};
      var image_url = $('.edit .image_url').val() || "";
      var score = Number($('.edit .score').val());
      var author = Session.get('author');
      form_data.name = $('.edit .name').val() || "";
      form_data.description = $('.edit .description').val() || "&nbsp;";
      form_data.score = (isNaN(score)) ? 0 : score;
      form_data.image_url = (image_url.search('http') == 0) ? image_url : "https://www.openshift.com/sites/default/files/redhat_shipment.png";
      form_data.source_url = $('.edit .source_url').val() || "https://github.com/openshift-quickstart";
      form_data.demo_url = $('.edit .demo_url').val() || "";
      form_data.cartridge_deps = $('.edit .cartridge_deps').val() || "";
      form_data.author = author || "anonymous";
      form_data._id = Session.get('selected_item');
      form_data.date = new Date(Session.get('date'));
      console.log("form_data:");
      console.log(form_data);

      //load to 'View' modal
      if(validation_passed){
        //insert new data
        console.log(form_data);

        var item = Showcase.update({_id: form_data._id}, { $set: { 
          name: form_data.name,
          description: form_data.description,
          image_url: form_data.image_url,
          source_url: form_data.source_url,
          demo_url: form_data.demo_url,
          score: form_data.score,
          cartridge_deps: form_data.cartridge_deps,
          author: form_data.author,
        }});
        console.log("selected_item: " + form_data._id)
        console.log(item);
        Session.set("name", form_data.name);
        Session.set("description", form_data.description);
        Session.set("image_url", form_data.image_url);
        Session.set("source_url", form_data.source_url);
        Session.set("demo_url", form_data.demo_url);
        Session.set("score", form_data.score);
        Session.set("cartridge_deps", form_data.cartridge_deps);
        Session.set("author", form_data.author);
      }else{
        //highlight errors
        $('#modal_edit').modal('show');
        return false;
      }
    },
    'click a.delete' : function (){
      //ask for auth, redirect away?
      $('#modal_edit').modal('hide');
      var id = Session.get('selected_item');
      Showcase.remove(id);
      Session.set('selected_item', '');
    }
  });
  Template.itemedit.description = function(){
    return Session.get('description');
  };
  Template.itemedit.app_name = function(){
    return Session.get('name');
  };
  Template.itemedit.score = function(){
    return Session.get('score');
  };
  Template.itemedit.image_url = function(){
    return Session.get('image_url');
  };
  Template.itemedit.source_url = function(){
    return Session.get('source_url');
  };
  Template.itemedit.demo_url = function(){
    return Session.get('demo_url');
  };
  Template.itemedit.cartridge_deps = function(){
    return Session.get('cartridge_deps');
  };
  Template.itemedit.author = function(){
    return Session.get('author');
  };

  Template.itemsubmit.events({
    'click .submit' : function (){
      $('#modal_create').modal('hide');
      var form_data = {};
      var validation_passed = true;
      //save everything in localstorage?
      //ask for auth, redirect away?
      var u = Meteor.user();
      //read fields (use jquery)
      //validate data and error back, or
      var score = Number($('.create .score').val());
      var image_url = $('.create .image_url').val();
      if( u && u.profile && u.profile.name){
        form_data.author = u.profile.name;
      }else{
        form_data.author = "anonymous";
      }
      form_data.name = $('.create .name').val() || "";
      form_data.description = $('.create .description').val() || "";
      form_data.score = isNaN(score) ? 0 : score;
      form_data.image_url = (image_url.search('http') == 0) ? image_url : "https://www.openshift.com/sites/default/files/redhat_shipment.png";
      form_data.source_url = $('.create .source_url').val() || "https://github.com/openshift-quickstart";
      form_data.demo_url = $('.create .demo_url').val() || "/";
      form_data.cartridge_deps = $('.create .cartridge_deps').val() || "";
      form_data.date = new Date();

      //load to 'View' modal
      if(validation_passed){
        //insert new data
        console.log(form_data);
        var id = Showcase.insert(form_data, function(err, id){
          Session.set("selected_item", id);
          Session.set("name", form_data.name);
          Session.set("description", form_data.description);
          Session.set("image_url", form_data.image_url);
          Session.set("source_url", form_data.source_url);
          Session.set("demo_url", form_data.demo_url);
          Session.set("date", form_data.date);
          Session.set("score", form_data.score);
          Session.set("cartridge_deps", form_data.cartridge_deps);
          Session.set("author", form_data.author);
          $('#modal_view').modal('show');
        });
      }else{
        //highlight errors
        $('#modal_create').modal('show');
        return false;
      }
    }
  });
}
