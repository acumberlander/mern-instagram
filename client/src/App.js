import React, { useState, useEffect } from 'react';
import './App.css';
import Post from './Post';
import ImageUpload from './ImageUpload';
import { db, auth } from './firebase';
import { Button, Avatar, makeStyles, Modal, Input } from '@material-ui/core';
import Zoom from 'react-reveal/Zoom';
import InstagramEmbed from 'react-instagram-embed';
import { getPostsFromDatabase } from './axios';
import Pusher from 'pusher-js';
import CircularProgress from '@material-ui/core/CircularProgress';

function getModalStyle() {
	const top = 50;
	const left = 50;

	return {
		height: '300px',
		top: `${top}%`,
		left: `${left}%`,
		transform: `translate(-${top}%, -${left}%)`,
	};
}

const useStyles = makeStyles((theme) => ({
	paper: {
		position: 'absolute',
		width: 400,
		height: 200,
		backgroundColor: theme.palette.background.paper,
		border: '2px solid #000',
		boxShadow: theme.shadows[5],
		padding: theme.spacing(2, 4, 3),
	},
}));

function App() {
	const classes = useStyles();
	const [modalStyle] = useState(getModalStyle);
	const [posts, setPosts] = useState([]);
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [user, setUser] = useState(null);
	const [open, setOpen] = useState(false);
	const [registerOpen, setRegisterOpen] = useState(false);
	const [uploading, setUploading] = useState(false);

	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged((authUser) => {
			if (authUser) {
				// user is logged in...
				setUser(authUser);

				if (authUser.displayName) {
					// dont update username
				} else {
					return authUser.updateProfile({
						displayName: username,
					});
				}
			} else {
				setUser(null);
			}
		});

		return () => {
			unsubscribe();
		};
	}, [user, username]);

	const fetchPosts = async () =>
		await getPostsFromDatabase().then((results) => setPosts(results));

	useEffect(() => {
		const pusher = new Pusher('fc8aa09307186f60e3af', {
			cluster: 'mt1',
		});

		const channel = pusher.subscribe('posts');
		channel.bind('inserted', (data) => {
			console.log('data received', data);
			fetchPosts();
		});
	}, [setUploading]);

	useEffect(() => {
		fetchPosts();
	}, []);

	const handleLogin = (e) => {
		e.preventDefault();
		auth
			.signInWithEmailAndPassword(email, password)
			.catch((error) => alert(error.message));

		setOpen(false);
	};

	const handleRegister = (e) => {
		e.preventDefault();
		auth
			.createUserWithEmailAndPassword(email, password)
			.catch((error) => alert(error.message));

		setRegisterOpen(false);
	};

	return (
		<div className="app">
			<Modal open={open} onClose={() => setOpen(false)}>
				<div style={modalStyle} className={classes.paper}>
					<form className="app__login">
						<center>
							<img
								className="app__headerImage"
								src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
								alt=""
							/>
						</center>

						<Input
							placeholder="email"
							type="text"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
						<Input
							placeholder="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
						<Button onClick={handleLogin}>Login</Button>
					</form>
				</div>
			</Modal>

			<Modal open={registerOpen} onClose={() => setRegisterOpen(false)}>
				<div style={modalStyle} className={classes.paper}>
					<form className="app__login">
						<center>
							<img
								className="app__headerImage"
								src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
								alt=""
							/>
						</center>
						<Input
							type="text"
							placeholder="username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
						/>
						<Input
							placeholder="email"
							type="text"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
						<Input
							placeholder="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
						<Button onClick={handleRegister}>Register</Button>
					</form>
				</div>
			</Modal>
			<div className="app__header">
				<img
					className="app__headerImage"
					src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
					alt=""
				/>
				{user?.displayName ? (
					<div className="app__headerRight">
						<Button onClick={() => auth.signOut()}>Logout</Button>
						<Avatar
							className="app__headerAvatar"
							alt={user.displayName}
							src="/static/images/avatar/1.jpg"
						/>
					</div>
				) : (
					<form className="app__loginHome">
						<Button onClick={() => setOpen(true)}>Login</Button>
						<Button onClick={() => setRegisterOpen(true)}>Sign Up</Button>
					</form>
				)}
			</div>

			<div className="app__posts">
				<div className="app__postsLeft">
					<Zoom>
						<>
							{React.Children.toArray(
								posts.map((post) => {
									return (
										<Post
											key={post.id}
											user={user}
											postId={post._id}
											username={post.user}
											caption={post.caption}
											imageUrl={post.image}
										/>
									);
								})
							)}
						</>
					</Zoom>
					{uploading ? (
						<>
							<CircularProgress />
						</>
					) : null}
				</div>
				<div className="app__postsRight">
					<InstagramEmbed
						url="https://www.instagram.com/p/B_uf9dmAGPw/"
						accesstoken="894585704416506|0e498ece5331662fa05a27ec88d72e03"
						maxWidth={320}
						hideCaption={false}
						containerTagName="div"
						protocol=""
						injectScript
						onLoading={() => {}}
						onSuccess={() => {}}
						onAfterRender={() => {}}
						onFailure={() => {}}
					/>
				</div>
			</div>

			{user?.displayName ? (
				<div className="app__upload">
					<ImageUpload
						username={user.displayName}
						setUploading={setUploading}
					/>
				</div>
			) : (
				<center>
					<h3>Login to upload</h3>
				</center>
			)}
		</div>
	);
}

export default App;
