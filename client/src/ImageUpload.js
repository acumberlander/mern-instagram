import React, { useState } from 'react';
import firebase from 'firebase';
import { storage, db } from './firebase';
import './ImageUpload.css';
import { Input, Button } from '@material-ui/core';
import { postToDatabase } from './axios';

const ImageUpload = ({ username, setUploading }) => {
	const [image, setImage] = useState(null);
	const [url, setUrl] = useState('');
	const [progress, setProgress] = useState(0);
	const [caption, setCaption] = useState('');

	const handleChange = (e) => {
		if (e.target.files[0]) {
			setImage(e.target.files[0]);
		}
	};

	const handleUpload = () => {
		setUploading(true);
		const uploadTask = storage.ref(`images/${image.name}`).put(image);
		const timestampValue = firebase.firestore.FieldValue.serverTimestamp();
		uploadTask.on(
			'state_changed',
			(snapshot) => {
				// progress function ...
				const progress = Math.round(
					(snapshot.bytesTransferred / snapshot.totalBytes) * 100
				);
				setProgress(progress);
			},
			(error) => {
				// Error function ...
				console.log(error);
			},
			() => {
				// complete function ...
				storage
					.ref('images')
					.child(image.name)
					.getDownloadURL()
					.then((url) => {
						setUrl(url);

						postToDatabase(caption, username, url);

						// post image inside db
						db.collection('posts').add({
							imageUrl: url,
							caption: caption,
							username: username,
						});

						setProgress(0);
						setCaption('');
						setImage(null);
					});
			}
		);
	};

	return (
		<div className="imageupload">
			<progress className="imageupload__progress" value={progress} max="100" />
			<Input
				placeholder="Enter a caption"
				value={caption}
				onChange={(e) => setCaption(e.target.value)}
			/>
			<div>
				<input type="file" onChange={handleChange} />
				<Button className="imageupload__button" onClick={handleUpload}>
					Upload
				</Button>
			</div>

			<br />
		</div>
	);
};

export default ImageUpload;
