import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import Jimp = require('jimp')
import fs = require('fs')

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  //! END @TODO1
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  app.get("/filteredimage", async function(req , res){
     let url = req.query.image_url;
     if(!url)
       return res.status(400).send("Image URL not found!");

     var exp = "^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$"
     var regex = new RegExp(exp);
     if(!url.match(regex))
     {
        return res.status(400).send("URL is not valid!");
     }     

     var imgData;     
     try
     {
       imgData = await Jimp.read(url)
     }
     catch(e)
     {
        return res.status(404).send("Image not found!")
     }     

     var resp = await filterImageFromURL(url);
     var path = __dirname + "/util/tmp/";
     console.log(path);
     fs.readdir(path , async function(err , readres)
       {        

         readres = readres.map(function (item) {           
            return path + item;
         });

         if(err) 
         {        
           return res.status(404).send(err)
         }         

         return res.status(200).sendFile(resp);

         res.on('finish' , function() {           
           deleteLocalFiles(readres);
         })         
         

       });

     


  });

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();