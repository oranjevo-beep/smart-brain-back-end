const { ClarifaiStub, grpc } = require('clarifai-nodejs-grpc');
// const Clarifai = require('clarifai');
const PAT = process.env.API_KEY;
// Specify the correct user_id/app_id pairings
// Since you're making inferences outside your app's scope
const USER_ID = process.env.USER_ID;
const APP_ID = process.env.APP_ID;
// Change these to whatever model and image URL you want to use

// const raw = JSON.stringify({
//   user_app_id: {
//     user_id: USER_ID,
//     app_id: APP_ID,
//   },
//   inputs: [
//     {
//       data: {
//         image: {
//           url: IMAGE_URL,
//           // "base64": IMAGE_BYTES_STRING
//         },
//       },
//     },
//   ],
// });
// const requestOptions = {
//   method: 'POST',
//   headers: {
//     Accept: 'application/json',
//     Authorization: 'Key ' + PAT,
//   },
//   body: raw,
// };
// console.log(Clarifai);
const stub = ClarifaiStub.grpc();

const metadata = new grpc.Metadata();
metadata.set('authorization', 'Key ' + PAT);

const handleApiCall = (req, res) => {
  stub.PostModelOutputs(
    {
      user_app_id: {
        user_id: USER_ID,
        app_id: APP_ID,
      },
      // aaa03c23b3724a16a56b629203edc62c is the general model.
      model_id: 'aaa03c23b3724a16a56b629203edc62c',
      inputs: [{ data: { image: { url: req.body.input } } }],
    },
    metadata,
    (err, response) => {
      if (err) {
        console.log('Error: ' + err);
        return;
      }

      if (response.status.code !== 10000) {
        console.log(
          'Received failed status: ' +
            response.status.description +
            '\n' +
            response.status.details
        );
        return;
      }

      console.log('Predicted concepts, with confidence values:');
      for (const c of response.outputs[0].data.concepts) {
        console.log(c.name + ': ' + c.value);
      }
      res.json(response);
    }
  );
};
const handleImage = (req, res, db) => {
  const { id } = req.body;
  db('users')
    .where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then((entries) => {
      res.json(entries[0]);
    })
    .catch((err) => res.status(400).json('unable to get entries'));
};
module.exports = {
  handleImage,
  handleApiCall,
};
