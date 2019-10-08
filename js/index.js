Vue.component('version-item', {
    props: ['version', 'vid', 'show_id'],
    template: `
    <div class="vertcal-timeline-item vertical-timeline-element">
      <div>
        <span class="vertical-timeline-element-icon">
          <i class="badge-timeline badge-dot badge-dot-xl badge-success"></i>
        </span>
        <div class="vertical-timeline-element-content">
          <h4 class="timeline-title">"{{ version.message }}" <span class="version-id">{{ show_id ? vid : '' }}</span></h4>
          <p><b>{{ version.author }}</b> committed at {{ version.date }}</p>
        </div>
      </div>
    </div>
    `
})

var app = new Vue({
    el: '#app',
    data: {
      file_loaded: false,
      show_ids: false,
      versions: {
        "db244f6be3791d72c94b099fde8db2915c6a7041": { author: "Solid Snake", message: "Initial commit", date: new Date('2011-04-11T10:20:30Z') },
        "816590924a31e92959281353dda3ce5b3f70bf44": { author: "Liquid Snake", message: "Something fixed", date: new Date('2011-04-13T10:20:30Z') },
      }
    },
    computed: {
        orderedVersions: function() {
            return _.chain(this.versions)
            .map(function (val, key) {
              return { version_id: key, version_info: val };
            })
            .sortBy(function(o) {
              return o.version_info.date;
            })
            .reverse()
            .keyBy('version_id')
            .mapValues('version_info')
            .value();
        }
    },
    methods: {
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
            this.versions = cm["versioning"]["versions"];
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