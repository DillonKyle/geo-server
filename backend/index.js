const express = require("express");
const multer = require("multer");
// const upload = multer({ dest: 'uploads/'})
const fs = require('fs');
const util = require('util');
const unlinkFile = util.promisify(fs.unlink)
const path = require("path");
const spawn = require('child_process').spawn;

const { file_sync } = require('./file_sync')
const { uploadFile, getFileStream, upload_large_file } = require('./s3')
const { Analyze } = require('./c_node_modules/cut_fill_report');
const { resolve } = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
const upload = multer({storage: storage})

// const PORT = process.env.PORT || 3001;

const app = express();

app.get('/download/:key', (req, res) => {
  const key = req.params.key
  res.attachment(key)
  const readStream = getFileStream(key)
  let writeStream = fs.createWriteStream(path.join('./backend/downloads/', key));
  readStream.pipe(writeStream)
  res.send(res.body)
})

app.post("/epsg/:tif", (req, res) => {
  let promises = []
  
  const tif_streamToFile = () => {
    return new Promise((resolve, reject) => {
      const p_tif = `${req.params.tif}`
      const tif_readStream = getFileStream(p_tif)
      let w_tif = fs.createWriteStream(path.join('./backend/downloads/', p_tif));
      tif_readStream.pipe(w_tif).on("close", () => {
        resolve(w_tif.path)
      }).on("error", reject)
    })
  }

  promises.push(tif_streamToFile())

  Promise.all(promises).then(async() => {
      const tif = await tif_streamToFile();
      return tif
  }).then(async (tif) => {
    const pythonProcess = spawn('python',['./backend/python_modules/get_epsg.py', tif]);
    pythonProcess.stdout.on('data', (data) => {
      epsg = JSON.parse(data.toString())
      res.json({EPSG_Code: epsg})
    })
  })
})

app.post("/cut-fill/:topo/:base", (req, res) => {

  let promises = []
  
  const t_streamToFile = () => {
    return new Promise((resolve, reject) => {
      const p_topo_dem = `${req.params.topo}`
      // const topo_dem = `./downloads/${p_topo_dem}`
      const t_readStream = getFileStream(p_topo_dem)
      let w_topo_dem = fs.createWriteStream(path.join('./backend/downloads/', p_topo_dem));
      t_readStream.pipe(w_topo_dem).on("close", () => {resolve(w_topo_dem)}).on("error", reject)
    })
  }

  const b_streamToFile = () => {
    return new Promise((resolve, reject) => {
      const p_base_dem = `${req.params.base}`
      // const base_dem = `./downloads/${p_base_dem}`
      const b_readStream = getFileStream(p_base_dem)
      let w_base_dem = fs.createWriteStream(path.join('./backend/downloads/', p_base_dem));
      b_readStream.pipe(w_base_dem).on("close", () => {resolve(w_base_dem)}).on("error", reject)
    })
  }

  promises.push(t_streamToFile())
  promises.push(b_streamToFile())
  Promise.all(promises).then(async() => {
      const topo_dem = await t_streamToFile();
      const base_dem = await b_streamToFile();
      return {topo_dem: topo_dem.path, base_dem: base_dem.path}
  }).then(async ({ topo_dem, base_dem} ) =>{
        var elev_val = await Analyze(base_dem, topo_dem);
        unlinkFile(topo_dem)
        unlinkFile(base_dem)
        return elev_val;
  }).then(async (elev_val) => {
    const pythonProcess = spawn('python',['./backend/python_modules/csv_report.py', elev_val.neg_elev_val, elev_val.pos_elev_val]);
    pythonProcess.stdout.on('data', (data) => {
        output = JSON.parse(data.toString())
        res.json(output)
    })
  })
})

app.post("/upload", upload.single('geo_file'), async (req, res) => {
  const file = req.file
  console.log(file)
  const result = await uploadFile(file)
  // console.log(result)
  await unlinkFile(file.path)
  const description = req.body.description
  res.send({filePath: `/upload/${result.Key}`})
})

//upload_dir route works and synchroniously uploads files. Can we get it to run asynchroniously? 
//Current Speed = 5:37.801 (m:ss.mmm) for 847.9 MB

app.post("/upload_dir", upload.any('upload_images'), async (req, res) => {
  var files = req.files
  res.setHeader('Content-Type', 'text/html');
  console.time('upload_timer')
  for(i = 0; i < files.length; i++){
    console.log(files[i].path)
    const result = await upload_large_file(files[i].path, 'dir/')
    console.log(result)
    res.write("<h4>Uploaded: " + files[i].filename + "</h4>")
    fs.unlink(files[i].path, (err) => {
      if(err){
        throw err
      }
    })
  }
  console.timeEnd('upload_timer')
  res.end()
})

app.listen(8080, () => {
  console.log(`Server listening on 8080`);
});