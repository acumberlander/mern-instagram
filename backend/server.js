import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Pusher from 'pusher';
import dbModel from './dbModel.js';

// app config
const app = express();
const port = process.env.PORT || 8080;

const pusher = new Pusher({
	appId: '1159347',
	key: 'fc8aa09307186f60e3af',
	secret: 'cbd221046f95085f1ced',
	cluster: 'mt1',
	useTLS: true,
});

// middlewares
app.use(express.json()); // allows us to process JSON files
app.use(cors()); // gives us all the CORS headers

// DB config
const connection_url =
	'mongodb+srv://acumberlander:AD3iaPK3PCb397ya@cluster0.0stth.mongodb.net/Cluster0?retryWrites=true&w=majority';

mongoose.connect(connection_url, {
	useCreateIndex: true,
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

mongoose.connection.once('open', () => {
	console.log('DB is Connected!');

	const changeStream = mongoose.connection.collection('posts').watch();

	changeStream.on('change', (change) => {
		console.log('Change Triggered on pusher...');
		console.log(change);
		console.log('Eng of Change');

		if (change.operationType === 'insert') {
			console.log('Triggering Pusher ***IMG UPLOAD***');
			const postDetails = change.fullDocument;
			pusher.trigger('posts', 'inserted', {
				user: postDetails.user,
				caption: postDetails.caption,
				image: postDetails.image,
			});
		} else {
			console.log('Unknown trigger from Pusher');
		}
	});
});

// api routes
app.get('/', (req, res) => {
	dbModel.find((err, data) => {
		if (err) {
			res.status(500).send(err);
		} else {
			res.status(200).send(data);
		}
	});
});

app.post('/upload', (req, res) => {
	const body = req.body;

	dbModel.create(body, (err, data) => {
		if (err) {
			res.status(500).send(err);
		} else {
			res.status(201).send(data);
		}
	});
});

app.patch('/:id', async (req, res) => {
	const body = req.body;

	const post = await dbModel.findById(req.params.id).exec();

	post
		.updateOne({
			comment: [...body],
		})
		.exec();

	res.send(post);
});

// listener
app.listen(port, () => console.log(`listening on localhost:${port}`));
