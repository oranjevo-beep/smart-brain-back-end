const { ClarifaiStub, grpc } = require('clarifai-nodejs-grpc');
// const Clarifai = require('clarifai');
const PAT = '981e9e4c64504e9ea20b68908fb60552';
const USER_ID = '7bw8yfvn31nd';
const APP_ID = 'test';

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
