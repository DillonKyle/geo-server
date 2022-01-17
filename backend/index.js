const express = require("express");
const multer = require("multer");
const upload = multer({ dest: 'uploads/'})
const fs = require('fs');
const util = require('util');
const unlinkFile = util.promisify(fs.unlink)
const path = require("path");
const spawn = require('child_process').spawn;

const { uploadFile, getFileStream } = require('./s3')
const { Analyze } = require('./c_node_modules/cut_fill_report');
const { resolve } = require("path");

// const PORT = process.env.PORT || 3001;

const app = express();

app.get('/upload/:key', (req, res) => {
  const key = req.params.key
  res.attachment(key)
  const readStream = getFileStream(key)
  let writeStream = fs.createWriteStream(path.join('./backend/downloads/', key));
  readStream.pipe(writeStream)
  res.send(res.body)
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
  // console.log(file)
  const result = await uploadFile(file)
  // console.log(result)
  await unlinkFile(file.path)
  const description = req.body.description
  res.send({filePath: `/upload/${result.Key}`})
})

app.listen(8080, () => {
  console.log(`Server listening on 8080`);
});