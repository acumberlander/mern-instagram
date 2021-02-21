import axios from 'axios';
import moment from 'moment';

const baseUrl = 'http://localhost:8080';

/** Post photo to mongoDB */
export const postToDatabase = (caption, username, url) =>
	axios.post(`${baseUrl}/upload`, {
		caption: caption,
		user: username,
		image: url,
		timestamp: moment(new Date().getDate()).format('LL'),
	});

/** Get posts from mongoDB */
export const getPostsFromDatabase = () =>
	axios.get(`${baseUrl}`).then((response) => {
		return response.data;
	});

/** Post comment on post to mongoDB */
export const postCommentToMongoDB = (postId, comment) =>
	axios.patch(`${baseUrl}/${postId}`, {
		comments: [comment],
	});
