Vue.component('cityobject', {
  props: ['cityobject', 'cityobject_id'],
  data() {
    return {
      edit_mode: false
    }
  },
  template: `
  <div class="card mb-2 shadow" :id="cityobject_id">
    <div class="card-header">
      <div class="d-flex justify-content-between">
        <div>
          <a href="#" id="objicon" data-toggle="tooltip" data-placement="top" :title="cityobject.type"><i v-bind:class="iconType"></i></a> <a :href="'#' + cityobject_id + 'Body'" class="text-dark text-decoration-none" data-toggle="collapse">{{ cityobject_id }}</a>
        </div>
        <div>
          <a href="#" @click="edit_mode = !edit_mode"><i class="fas fa-pen mr-1" :class="[ edit_mode ? 'text-dark' : 'text-secondary' ]"></i></a>
        </div>
      </div>
      <small v-show="'parents' in cityobject">Parents: <a :href="'#' + parent_id" v-for="parent_id in cityobject.parents" data-toggle="tooltip" data-placement="top" :title="parent_id"><i class="text-danger" :class="getIconStyle(getObject(parent_id), false)"></i></a></small>
      <small v-show="'children' in cityobject">Children: <a :href="'#' + child_id" v-for="child_id in cityobject.children" data-toggle="tooltip" data-placement="top" :title="child_id"><i class="text-success" :class="getIconStyle(getObject(child_id), false)"></i></a></small>
    </div>
    <div class="card-body collapse show" :id="cityobject_id + 'Body'" v-if="hasAttributes || edit_mode">
      <dl class="row my-0" v-for="(value, key) in cityobject.attributes" v-show="edit_mode == false">
        <dt class="col-sm-4"><small class="font-weight-bold">{{ key }}</small></dt>
        <dd class="col-sm-8"><small>{{ value }}</small></dd>
      </dl>
      <div v-if="edit_mode">
        <textarea id="json_data" class="form-control" v-model="jsonString"></textarea>
        <div class="d-flex justify-content-end mt-2">
          <button type="button" class="btn btn-success btn-sm" @click="saveChanges">Save</button>
        </div>
      </div>
    </div>
  </div>
  `,
  async mounted() {
    var card_id = $.escapeSelector(this.cityobject_id);
    $(`#${card_id} [data-toggle="tooltip"]`).tooltip();
  },
  computed: {
    hasAttributes: function() {
      return "attributes" in this.cityobject && Object.keys(this.cityobject.attributes).length > 0;
    },
    iconType: function() {
      return this.getIconStyle(this.cityobject);
    },
    jsonString: {
      get: function() {
        return JSON.stringify(this.cityobject, undefined, 4);
      }
    }
  },
  methods: {
    getObject(objid) {
      return this.$root.citymodel.CityObjects[objid];
    },
    getIconStyle(cityobj, with_colour=true) {
      type_icons = {
        "Building": ['fas', 'fa-building', 'text-danger', 'mr-1'],
        "BuildingPart": ['far', 'fa-building', 'text-danger', 'mr-1'],
        "BuildingInstallation": ['fas', 'fa-city', 'text-danger', 'mr-1'],
        "Bridge": ['fas', 'fa-archway', 'text-dark', 'mr-1'],
        "BridgePart": ['fas', 'fa-archway', 'text-secondary', 'mr-1'],
        "BridgeInstallation": ['fas', 'fa-archway', 'text-primary', 'mr-1'],
        "BridgeConstructionElement": ['fas', 'fa-archway', 'text-warning', 'mr-1'],
        "CityObjectGroup": ['fas', 'fa-cubes', 'text-dark', 'mr-1'],
        "CityFurniture": ['fas', 'fa-store-alt', 'text-danger', 'mr-1'],
        "GenericCityObject": ['fas', 'fa-cube', 'text-danger', 'mr-1'],
        "LandUse": ['fas', 'fa-chart-area', 'text-success', 'mr-1'],
        "PlantCover": ['fas', 'fa-leaf', 'text-success', 'mr-1'],
        "Railway": ['fas', 'fa-train', 'text-primary', 'mr-1'],
        "Road": ['fas', 'fa-road', 'text-dark', 'mr-1'],
        "SolitaryVegetationObject": ['fas', 'fa-tree', 'text-success', 'mr-1'],
        "TINRelief": ['fas', 'fa-mountain', 'text-success', 'mr-1'],
        "TransportSquare": ['fas', 'fa-circle-notch', 'text-dark', 'mr-1'],
        "Tunnel": ['fas', 'fa-dot-circle', 'text-dark', 'mr-1'],
        "TunnelPart": ['fas', 'fa-dot-circle', 'text-dark', 'mr-1'],
        "TunnelInstallation": ['fas', 'fa-dot-circle', 'text-warning', 'mr-1'],
        "WaterBody": ['fas', 'fa-water', 'text-primary', 'mr-1']
      };

      if (cityobj.type in type_icons)
      {
        var icon_style = type_icons[cityobj.type];
        if (!with_colour)
        {
          icon_style.splice(2, 1);
        } 
        return icon_style;
      }
      else
      {
        return ['fas', 'fa-question', 'text-secondary', 'mr-1'];
      }
    },
    saveChanges() {
      var card_id = $.escapeSelector(this.cityobject_id);
      var new_json = $(`#${card_id} #json_data`).val();
      this.cityobject = JSON.parse(new_json);

      this.$emit('input', this.cityobject);
    }
  }
})

Vue.component('citymodel-viewer', {
  props: ['citymodel'],
  template: `
  <div id="viewer" class="col-12 px-0 h-100"></div>
  `,
  data() {
    return {
      camera_init: false,
      ALLCOLOURS: {
        "Building": 0xcc0000,
        "BuildingPart": 0xcc0000,
        "BuildingInstallation": 0xcc0000,
        "Bridge": 0x999999,
        "BridgePart": 0x999999,
        "BridgeInstallation": 0x999999,
        "BridgeConstructionElement": 0x999999,
        "CityObjectGroup": 0xffffb3,
        "CityFurniture": 0xcc0000,
        "GenericCityObject": 0xcc0000,
        "LandUse": 0xffffb3,
        "PlantCover": 0x39ac39,
        "Railway": 0x000000,
        "Road": 0x999999,
        "SolitaryVegetationObject": 0x39ac39,
        "TINRelief": 0x3FD43F,
        "TransportSquare": 0x999999,
        "Tunnel": 0x999999,
        "TunnelPart": 0x999999,
        "TunnelInstallation": 0x999999,
        "WaterBody": 0x4da6ff
      }
    }
  },
  beforeCreate() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.raycaster = null;
    this.mouse = null;
    this.geoms = {};
    this.meshes = [];
  },
  async mounted() {
    this.initScene();

    if (Object.keys(this.citymodel).length > 0)
    {
      await this.loadCityObjects(this.citymodel);
    }
        
    this.renderer.render( this.scene, this.camera );

    let self = this;

    $("#viewer").mousedown(function(eventData) {
      if (eventData.button == 0) { //leftClick
        self.handleClick(eventData)
      }
    });
  },
  watch: { 
    citymodel: {
      handler: async function(newVal, oldVal) {
        this.clearScene();

        if (Object.keys(newVal).length > 0)
        {
          await this.loadCityObjects(newVal);
        }

        this.renderer.render(this.scene, this.camera);
      },
      deep: true
    }
  },
  methods: {
    handleClick(e) {
      var rect = this.renderer.domElement.getBoundingClientRect();
      //get mouseposition
      this.mouse.x = ((event.clientX - rect.left) / this.renderer.domElement.clientWidth) * 2 - 1;
      this.mouse.y = -( (event.clientY - rect.top) / this.renderer.domElement.clientHeight) * 2 + 1;

      //get cameraposition
      this.raycaster.setFromCamera(this.mouse, this.camera);

      //calculate intersects
      var intersects = this.raycaster.intersectObjects(this.meshes);

      //if clicked on nothing return
      if (intersects.length == 0) {
        return
      }

      //get the id of the first object that intersects (equals the clicked object)
      var cityObjId = intersects[0].object.name;
      console.log(cityObjId);
      this.$root.move_to_object(cityObjId);
      this.$root.$emit('clicked_obj', cityObjId);
    },
    initScene() {
      this.scene = new THREE.Scene();
      var ratio = $("#viewer").width() / $("#viewer").height();
      this.camera = new THREE.PerspectiveCamera( 60, ratio, 0.001, 1000 );
      
      this.renderer = new THREE.WebGLRenderer({
        antialias: true
      });
      viewer = document.getElementById("viewer");
      viewer.appendChild( this.renderer.domElement );
      this.renderer.setSize($("#viewer").width(), $("#viewer").height());
      this.renderer.setClearColor(0xd9eefc);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            
      let self = this;

      // add raycaster and mouse (for clickable objects)
      this.raycaster = new THREE.Raycaster()
      this.mouse = new THREE.Vector2();

      //add AmbientLight (light that is only there that there's a minimum of light and you can see color)
      //kind of the natural daylight
      var am_light = new THREE.AmbientLight(0xFFFFFF, 0.7); // soft white light
      this.scene.add(am_light);

      // Add directional light
      var spot_light = new THREE.SpotLight(0xDDDDDD);
      spot_light.position.set(84616, -1, 447422);
      spot_light.target = this.scene;
      spot_light.castShadow = true;
      spot_light.intensity = 0.4
      spot_light.position.normalize()
      this.scene.add(spot_light);
      
      //render & orbit controls
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.addEventListener('change', function() {
        self.renderer.render(self.scene, self.camera);
      });
    },
    clearScene() {
      while(this.scene.children.length > 0){ 
        this.scene.remove(this.scene.children[0]); 
      }

      var am_light = new THREE.AmbientLight(0xFFFFFF, 0.7); // soft white light
      this.scene.add(am_light);

      // Add directional light
      var spot_light = new THREE.SpotLight(0xDDDDDD);
      spot_light.position.set(84616, -1, 447422);
      spot_light.target = this.scene;
      spot_light.castShadow = true;
      spot_light.intensity = 0.4
      spot_light.position.normalize()
      this.scene.add(spot_light);
    },
    //convert CityObjects to mesh and add them to the viewer
    async loadCityObjects(json) {      
      //create one geometry that contains all vertices (in normalized form)
      //normalize must be done for all coordinates as otherwise the objects are at same pos and have the same size
      var normGeom = new THREE.Geometry()
      for (var i = 0; i < json.vertices.length; i++) {
        var point = new THREE.Vector3(
          json.vertices[i][0],
          json.vertices[i][1],
          json.vertices[i][2]
          );
          normGeom.vertices.push(point)
      }
      normGeom.normalize()
      
      for (var i = 0; i < json.vertices.length; i++) {
        json.vertices[i][0] = normGeom.vertices[i].x;
        json.vertices[i][1] = normGeom.vertices[i].y;
        json.vertices[i][2] = normGeom.vertices[i].z;
      }
      
      var stats = this.getStats(json.vertices)
      var minX = stats[0]
      var minY = stats[1]
      var minZ = stats[2]
      var avgX = stats[3]
      var avgY = stats[4]
      var avgZ = stats[5]
      
      if (!this.camera_init)
      {
        this.camera.position.set(0, 0, 2);
        this.camera.lookAt(avgX, avgY, avgZ);
        
        this.controls.target.set(avgX,
          avgY,
          avgZ);
        
        //enable movement parallel to ground
        this.controls.screenSpacePanning = true;

        this.camera_init = true;
      }

      //count number of objects
      var totalco = Object.keys(json.CityObjects).length;
      console.log("Total # City Objects: ", totalco);
      
      //create dictionary
      var children = {}
      
      //iterate through all cityObjects
      for (var cityObj in json.CityObjects) {
        
        // try {
          //parse cityObj that it can be displayed in three js
          var returnChildren = await this.parseObject(cityObj, json)
          
          //if object has children add them to the childrendict
          for (var i in returnChildren) {
            children[returnChildren[i]] = cityObj
          }
          
        // } catch (e) {
        //   console.log("ERROR at creating: " + cityObj + "\n" + e.message);
        //   continue
        // }
        
        //set color of object
        var coType = json.CityObjects[cityObj].type;
        var material = new THREE.MeshLambertMaterial();
        material.color.setHex(this.ALLCOLOURS[coType]);
        
        //create mesh
        //geoms[cityObj].normalize()
        var _id = cityObj
        var coMesh = new THREE.Mesh(this.geoms[_id], material)
        coMesh.name = cityObj;
        coMesh.castShadow = true;
        coMesh.receiveShadow = true;
        this.scene.add(coMesh);
        this.meshes.push(coMesh);
      }
    },
      //convert json file to viwer-object
      async parseObject(cityObj, json) {          
        if (json.CityObjects[cityObj].children != undefined) {
          return (json.CityObjects[cityObj].children)
        };
        
        //create geometry and empty list for the vertices
        var geom = new THREE.Geometry()
        
        //each geometrytype must be handled different
        var geomType = json.CityObjects[cityObj].geometry[0].type
        if (geomType == "Solid") {
          boundaries = json.CityObjects[cityObj].geometry[0].boundaries[0];
        } else if (geomType == "MultiSurface" || geomType == "CompositeSurface") {
          boundaries = json.CityObjects[cityObj].geometry[0].boundaries;
        } else if (geomType == "MultiSolid" || geomType == "CompositeSolid") {
          boundaries = json.CityObjects[cityObj].geometry[0].boundaries;
        }
        
        //needed for assocation of global and local vertices
        var verticeId = 0
        
        var vertices = [] //local vertices
        var indices = [] //global vertices
        var boundary = [];
        
        //contains the boundary but with the right verticeId
        for (var i = 0; i < boundaries.length; i++) {
          
          for (var j = 0; j < boundaries[i][0].length; j++) {
            
            //the original index from the json file
            var index = boundaries[i][0][j];
            
            //if this index is already there
            if (vertices.includes(index)) {
              
              var vertPos = vertices.indexOf(index)
              indices.push(vertPos)
              boundary.push(vertPos)
              
            } else {
              
              //add vertice to geometry
              var point = new THREE.Vector3(
                json.vertices[index][0],
                json.vertices[index][1],
                json.vertices[index][2]
                );
                geom.vertices.push(point)
                
                vertices.push(index)
                indices.push(verticeId)
                boundary.push(verticeId)
                
                verticeId = verticeId + 1
              }
              
            }
            
            /*
            console.log("Vert", vertices);
            console.log("Indi", indices);
            console.log("bound", boundary);
            console.log("geom", geom.vertices);
            */
            
            //create face
            //triangulated faces
            if (boundary.length == 3) {
              geom.faces.push(
                new THREE.Face3(boundary[0], boundary[1], boundary[2])
                )
                
                //non triangulated faces
              } else if (boundary.length > 3) {
                
                //create list of points
                var pList = []
                for (var j = 0; j < boundary.length; j++) {
                  pList.push({
                    x: json.vertices[vertices[boundary[j]]][0],
                    y: json.vertices[vertices[boundary[j]]][1],
                    z: json.vertices[vertices[boundary[j]]][2]
                  })
                }
                //get normal of these points
                var normal = await this.get_normal_newell(pList)
                
                //convert to 2d (for triangulation)
                var pv = []
                for (var j = 0; j < pList.length; j++) {
                  var re = await this.to_2d(pList[j], normal)
                  pv.push(re.x)
                  pv.push(re.y)
                }
                
                //triangulate
                var tr = await earcut(pv, null, 2);
                
                //create faces based on triangulation
                for (var j = 0; j < tr.length; j += 3) {
                  geom.faces.push(
                    new THREE.Face3(
                      boundary[tr[j]],
                      boundary[tr[j + 1]],
                      boundary[tr[j + 2]]
                      )
                      )
                    }
                    
                  }
                  
                  //reset boundaries
                  boundary = []
                  
                }
                
                //needed for shadow
                geom.computeFaceNormals();
                
                //add geom to the list
                var _id = cityObj
                this.geoms[_id] = geom
                
                return ("")
                
              },
              getStats(vertices) {
                
                var minX = Number.MAX_VALUE;
                var minY = Number.MAX_VALUE;
                var minZ = Number.MAX_VALUE;
                
                var sumX = 0;
                var sumY = 0;
                var sumZ = 0
                var counter = 0
                
                for (var i in vertices){
                  sumX = sumX + vertices[i][0]
                  if (vertices[i][0] < minX){
                    minX = vertices[i][0]
                  }
                  
                  sumY = sumY + vertices[i][1]
                  if (vertices[i][1] < minY){
                    minY = vertices[i][1]
                  }
                  
                  if (vertices[i][2] < minZ){
                    minZ = vertices[i][2]
                  }
                  
                  sumZ = sumZ + vertices[i][2]
                  counter = counter + 1
                }
                
                var avgX = sumX/counter
                var avgY = sumY/counter
                var avgZ = sumZ/counter
                
                return ([minX, minY, minZ, avgX, avgY, avgZ])
                
              },
              //-- calculate normal of a set of points
              get_normal_newell(indices) {
                
                // find normal with Newell's method
                var n = [0.0, 0.0, 0.0];
                
                for (var i = 0; i < indices.length; i++) {
                  var nex = i + 1;
                  if ( nex == indices.length) {
                    nex = 0;
                  };
                  n[0] = n[0] + ( (indices[i].y - indices[nex].y) * (indices[i].z + indices[nex].z) );
                  n[1] = n[1] + ( (indices[i].z - indices[nex].z) * (indices[i].x + indices[nex].x) );
                  n[2] = n[2] + ( (indices[i].x - indices[nex].x) * (indices[i].y + indices[nex].y) );
                };
                var b = new THREE.Vector3(n[0], n[1], n[2]);
                return(b.normalize())
              },
              to_2d(p, n) {
                p = new THREE.Vector3(p.x, p.y, p.z)
                var x3 = new THREE.Vector3(1.1, 1.1, 1.1);
                if ( x3.distanceTo(n) < 0.01 ) {
                  x3.add(new THREE.Vector3(1.0, 2.0, 3.0));
                }
                var tmp = x3.dot(n);
                var tmp2 = n.clone();
                tmp2.multiplyScalar(tmp);
                x3.sub(tmp2);
                x3.normalize();
                var y3 = n.clone();
                y3.cross(x3);
                let x = p.dot(x3);
                let y = p.dot(y3);
                var re = {x: x, y: y};
                return re;
              }
            }
          })