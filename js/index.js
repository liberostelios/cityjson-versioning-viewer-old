Vue.component('version-viewer', {
  props: ['version', 'vid'],
  template: `
  <div class="card mb-2">
    <h5 class="card-header bg-dark text-white">{{ vid | truncate }}</h5>
    <div class="card-body">
      <h5 class="card-title">{{ version.message }}</h5>
      <h6 class="card-subtitle text-muted">{{ version.author }}</h6>
      <p class="card-text my-2" v-show="'parents' in version && version.parents.length">Parents: <a href="#" class="card-link" v-for="parent in version.parents" v-on:click="select(parent)">{{ parent | truncate(7) }}</a></p>
      <a href="#" class="card-link text-danger" @click="select(null)">Close</a>
    </div>
  </div>
  `,
  methods: {
    select(vid) {
      this.$root.$emit('select_version', vid);
    }
  }
})

Vue.component('version-list-item', {
    props: ['version', 'vid', 'active'],
    template: `
    <a class="list-group-item list-group-item-action flex-column align-items-start" v-bind:class="{ 'text-white' : active, active : active }" v-on:click="select_this">
      <div class="d-flex justify-content-between">
        <div class="col-9">
          <h6 class="mb-1">{{ version.message }} <span class="badge" v-bind:class="[ active ? 'badge-light' : 'badge-success' ]">{{ version.objects.length }} objects</span></h6>
          <small v-bind:class="[ active ? 'text-white' : 'text-muted' ]"><b>{{ version.author }}</b> committed at {{ version.date | moment_from }}.</small>
        </div>
        <div class="col-3 pr-0 align-self-center">
          <div class="input-group input-group-sm justify-content-end">
            <span class="input-group-text text-monospace" id="basic-addon1"><small>{{ vid | truncate(7) }}</small></span>
            <div class="input-group-append">
              <button class="btn" v-bind:class="[ active ? 'btn-outline-light' : 'btn-outline-primary' ]" type="button" v-on:click="download_version(vid)"><i class="fas fa-download"></i></span></button>
            </div>
          </div>
        </div>
      </div>
    </a>
    `,
    methods: {
      download_version(vid) {
        this.$root.$emit('download_version', vid);
      },
      select_this() {
        this.$root.$emit('select_version', this.vid);
      },
      moment: function () {
        return moment();
      }
    },
    filters: {
      moment_from: function (date) {
        return moment(date).fromNow();
      }
    }
})

var app = new Vue({
    el: '#app',
    data: {
      file_loaded: false,
      active_branch: "master",
      active_version: null,
      citymodel: {},
      versioning: {
        versions: {
          "db244f6be3791d72c94b099fde8db2915c6a7041": { author: "Solid Snake", message: "Initial commit", date: new Date('2011-04-11T10:20:30Z'), parents: [] },
          "816590924a31e92959281353dda3ce5b3f70bf44": { author: "Liquid Snake", message: "Something fixed", date: new Date('2011-04-13T10:20:30Z'), parents: [ "db244f6be3791d72c94b099fde8db2915c6a7041" ] },
        },
        branches: {
          "master": "db244f6be3791d72c94b099fde8db2915c6a7041",
          "develop": "816590924a31e92959281353dda3ce5b3f70bf44"
        }
      }
    },
    created() {
      let self = this;

      this.$root.$on('download_version', (vid) => {
        console.log(self.file_loaded);
        self.downloadVersion(vid);
      });

      this.$root.$on('select_version', (vid) => {
        this.active_version = vid;
      });
    },
    computed: {
      activeVersionObject: function() {
        if (this.isVersionSelected)
          return this.versioning.versions[this.active_version];
        
        return {};
      },
      isVersionSelected: function() {
        return this.active_version !== null;
      },
      activeCityModel: function() {
        if (!this.isVersionSelected)
        {
          return {};
        }

        console.log(this.active_version);
        return this.extract_citymodel(this.active_version);
      }
    },
    methods: {
      orderedVersions(branch) {
        result = {};

        current_vid = this.versioning.branches[branch];
        result[current_vid] = this.versioning.versions[current_vid];

        var new_parents = [];
        
        if ("parents" in result[current_vid])
        {
          new_parents = new_parents.concat(result[current_vid].parents);
        }

        while (new_parents.length > 0)
        {
          current_vid = new_parents.pop();

          result[current_vid] = this.versioning.versions[current_vid];

          if ("parents" in result[current_vid])
          {
            new_parents = result[current_vid].parents.concat(new_parents);
          }
        }

        return result;
      },
      isActive(vid) {
        return this.active_version == vid;
      },
      reset() {
        this.versions = {};
        this.active_branch = "master";
        this.active_version = null;
        this.file_loaded = false;
      },
      selectedFile() {
        console.log("Selected a CityJSON file...");
        console.log(this.$refs.cityJSONFile.files[0]);

        let file = this.$refs.cityJSONFile.files[0];
        if (!file || file.type != "application/json")
        {
          console.log("This is not a JSON file at all!!!");
          return;
        }

        let reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = evt => {
          cm = JSON.parse(evt.target.result);

          this.citymodel = cm;

          if ("versioning" in cm)
          {
            versions = cm["versioning"]["versions"];
            for (var key in versions){
              versions[key]["date"] = new Date(versions[key]["date"]);
            }
            this.versioning.versions = versions;
            this.versioning.branches = cm.versioning.branches;
            this.file_loaded = true;
          }
          else
          {
            console.log("This is not a versioned CityJSON file!");
          }
        }
      },
      extract_citymodel(vid) {
        cityobjects = this.versioning.versions[vid].objects;

        var result = $.extend({}, this.citymodel);

        result["CityObjects"] = {};

        delete result["versioning"];

        for (var key in this.citymodel["CityObjects"])
        {
          if (cityobjects.indexOf(key) != -1)
          {
            var new_key = this.citymodel["CityObjects"][key]["cityobject_id"];
            result["CityObjects"][new_key] = $.extend({}, this.citymodel["CityObjects"][key]);;
            delete result["CityObjects"][new_key]["cityobject_id"];
          }
        }

        return result;
      },
      download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
      
        element.style.display = 'none';
        document.body.appendChild(element);
      
        element.click();
      
        document.body.removeChild(element);
      },
      downloadVersion(vid) {
        text = JSON.stringify(this.activeCityModel);

        this.download(vid + ".json", text);
      }
    }
})

// Vue.config.devtools = true