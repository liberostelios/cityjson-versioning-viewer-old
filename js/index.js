Vue.component('version-item', {
    props: ['version', 'vid'],
    template: `
    <div class="list-group-item list-group-item-action flex-column align-items-start">
      <div class="d-flex justify-content-between">
        <div class="col-9">
          <h6 class="mb-1">{{ version.message }} <span class="badge badge-primary">{{ version.objects.length }} objects</span></h6>
          <small class="text-muted"><b>{{ version.author }}</b> committed at {{ version.date }}.</small>
        </div>
        <div class="col-3 pr-0 align-self-center">
          <div class="input-group input-group-sm justify-content-end">
            <span class="input-group-text text-monospace" id="basic-addon1"><small>{{ vid | truncate(7) }}</small></span>
            <div class="input-group-append">
              <button class="btn btn-outline-primary" type="button" v-on:click="download_version(vid)"><i class="fas fa-download"></i></span></button>
            </div>
          </div>
        </div>
      </div>
    </div>
    `,
    methods: {
      download_version(vid) {
        this.$root.$emit('download_version', vid);
      }
    }
})

var app = new Vue({
    el: '#app',
    data: {
      file_loaded: false,
      active_branch: "master",
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
    },
    methods: {
      orderedVersions(branch) {
        result = {};

        current_vid = this.versioning.branches[branch];
        result[current_vid] = this.versioning.versions[current_vid];

        while ("parents" in result[current_vid] && result[current_vid].parents.length > 0)
        {
          current_vid = result[current_vid].parents[0];
          result[current_vid] = this.versioning.versions[current_vid];
        }

        return result;
      },
      reset() {
        this.versions = {};
        this.active_branch = "master";
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
        cityobjects = this.versioning.versions[vid].objects;

        var result = $.extend({}, this.citymodel);

        result["CityObjects"] = {};

        delete result["versioning"];

        for (var key in this.citymodel["CityObjects"])
        {
          if (cityobjects.indexOf(key) != -1)
          {
            var new_key = this.citymodel["CityObjects"][key]["cityobject_id"];
            result["CityObjects"][new_key] = this.citymodel["CityObjects"][key];
            delete result["CityObjects"][new_key]["cityobject_id"];
          }
        }

        text = JSON.stringify(result);

        this.download(vid + ".json", text);
      }
    }
})

Vue.config.devtools = true