import './App.css';
import RenderReviews from './components/Render-Reviews';
import RenderItems from './components/Render-Items';

function App() {
	return (
		<div className="main-container">
			<h1>Тестовое задание</h1>
			<RenderReviews />
			<RenderItems />
		</div>
	);
}

export default App;
