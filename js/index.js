Vue.component('version-item', {
    props: ['version', 'vid', 'show_id'],
    template: `
    <a href="#" class="list-group-item list-group-item-action flex-column align-items-start">
      <div class="d-flex justify-content-between">
          <h5 class="mb-1">{{ version.message }}</h5>
          <small>{{ show_id ? vid : '' }}</small>
          </div>
          <small class="text-muted"><b>{{ version.author }}</b> committed at {{ version.date }}.</small>
      </div>
    </a>
    `
})

var app = new Vue({
    el: '#app',
    data: {
      file_loaded: false,
      show_ids: true,
      active_branch: "master",
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
      }
    }
})

Vue.config.devtools = true