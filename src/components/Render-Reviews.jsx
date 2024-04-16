import { useState, useEffect } from 'react';
import '../styles/reviews.css';
import { RotatingLines } from 'react-loader-spinner';

function RenderReviews() {
	const [review, setReview] = useState(null);
	const [loader, setLoader] = useState(false);

	async function fetchReviews() {
		setLoader(true);
		const response = await fetch('http://o-complex.com:1337/reviews');
		const reviewData = await response.json();
		setReview(reviewData);
		setLoader(false);
	}

	useEffect(() => {
		fetchReviews();
	}, []);

	function reviewCard() {
		if (!review) {
			return (
				<div>
					{
						<RotatingLines
							strokeColor="grey"
							strokeWidth="5"
							animationDuration="0.75"
							width="96"
							visible={loader}
						/>
					}
				</div>
			);
		}
		return (
			<div className="reviews-section">
				{review.map((card, index) => (
					<div key={index} className="review-card">
						<h1>Отзыв {index + 1}</h1>
						<h3>Полученный с api HTML</h3>
						<p>{card.text}</p>
					</div>
				))}
			</div>
		);
	}

	return reviewCard();
}

export default RenderReviews;
