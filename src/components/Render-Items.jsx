import { useState, useEffect, useRef, useCallback } from 'react';
import InputMask from 'react-input-mask';
import '../styles/items.css';
import '../styles/cart.css';

function RenderItems() {
	const [items, setItems] = useState([]);
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [initialLoad, setInitialLoad] = useState(true);
	const [cartArray, setCartArray] = useState([]);
	const [popUp, setPopUp] = useState(false);
	const [isValidPhone, setIsValidPhone] = useState(true);

	const loaderRef = useRef();
	const [phoneNumber, setPhoneNumber] = useState('');

	async function fetchItems(page) {
		if (loading) return;
		setLoading(true);
		const response = await fetch(
			`http://o-complex.com:1337/products?page=${page}&page_size=20`
		);
		const itemsData = await response.json();

		const itemsWithBuy = itemsData.products.map((item) => ({
			...item,
			buy: false,
			quantity: 0,
		}));

		setItems((prevItems) => [...prevItems, ...itemsWithBuy]);
		setTotal(itemsData.total);
		setLoading(false);
		console.log(itemsData);
	}

	const lastItemRef = useCallback(
		(node) => {
			if (loading || !node || items.length >= total) return;
			if (loaderRef.current) loaderRef.current.disconnect();
			loaderRef.current = new IntersectionObserver((entries) => {
				if (entries[0].isIntersecting) {
					console.log('visible');
					console.log(entries[0]);
					setPage(page + 1);
				}
			});
			loaderRef.current.observe(node);
		},
		[loading, items.length, total, page]
	);

	useEffect(() => {
		if (initialLoad) {
			setInitialLoad(false);
		} else {
			fetchItems(page);
		}
	}, [page, initialLoad]);

	function addItemToCart(item) {
		const existingItemIndex = cartArray.findIndex(
			(cartItem) => cartItem.id === item.id
		);

		if (existingItemIndex !== -1) {
			const updatedCart = [...cartArray];
			updatedCart[existingItemIndex].quantity += 1;
			setCartArray(updatedCart);
		} else {
			setCartArray((prevCart) => [...prevCart, { ...item }]);
			incrementItemQuantity(item.id);
		}
	}

	function incrementItemQuantity(itemId) {
		setCartArray((prevCart) =>
			prevCart.map((item) =>
				item.id === itemId
					? { ...item, quantity: item.quantity + 1 }
					: item
			)
		);
	}
	function decrementItemQuantity(itemId) {
		setCartArray((prevCart) =>
			prevCart
				.map((cartItem) =>
					cartItem.id === itemId
						? { ...cartItem, quantity: cartItem.quantity - 1 }
						: cartItem
				)
				.filter((cartItem) => cartItem.quantity > 0)
		);
	}

	const updateItemBuyState = (id, buy) => {
		setItems((prevItems) =>
			prevItems.map((item) => (item.id === id ? { ...item, buy } : item))
		);
	};

	function checkOut() {
		if (cartArray.length <= 0) {
			return;
		} else {
			return (
				<div className="checkout-container">
					{phoneNumberInput()}
					<button type="button" onClick={() => handlePlaceOrder()}>
						Заказать
					</button>
				</div>
			);
		}
	}

	function resetCart() {
		setCartArray([]);
	}
	function manualQuantityInput(e, itemId) {
		const newQuantity = e.target.value.trim();

		if (newQuantity === '' || isNaN(newQuantity)) {
			setCartArray((prevCart) =>
				prevCart.map((item) =>
					item.id === itemId
						? { ...item, buy: false, quantity: 0 }
						: item
				)
			);
		} else {
			setCartArray((prevCart) =>
				prevCart.map((item) =>
					item.id === itemId
						? { ...item, quantity: parseInt(newQuantity) }
						: item
				)
			);
		}
	}

	function phoneNumberInput() {
		return (
			<div className="phoneNumber-wrapper">
				<InputMask
					mask="+7 (999) 999-99-99"
					placeholder="+7 (___) ___-__-__"
					maskChar="_"
					value={phoneNumber}
					className={isValidPhone ? 'input valid' : 'input invalid'}
					onChange={(e) => setPhoneNumber(e.target.value)}
				>
					{(inputProps) => <input {...inputProps} />}
				</InputMask>
				{!isValidPhone && (
					<p className="error-message">
						Введите номер телефона целиком
					</p>
				)}
			</div>
		);
	}

	function resetPhoneNumberInput() {
		setPhoneNumber('');
	}

	function validatePhoneNumber() {
		const phoneNumberInput = phoneNumber.replace(/\D/g, '');
		setIsValidPhone(true);
		console.log(isValidPhone);

		if (!phoneNumberInput || !/^\d+$/.test(phoneNumberInput)) {
			setIsValidPhone(false);
			console.log(isValidPhone);
			return false;
		}

		if (phoneNumberInput.length !== 11) {
			setIsValidPhone(false);
			console.log(isValidPhone);
			return false;
		}
		return true;
	}

	function handlePlaceOrder() {
		const url = 'http://o-complex.com:1337/order';
		const phoneNumberInput = phoneNumber.replace(/\D/g, '');

		if (validatePhoneNumber()) {
			const cart = cartArray.map((item) => ({
				id: item.id,
				quantity: item.quantity,
			}));

			const requestBody = {
				phone: phoneNumberInput,
				cart: cart,
			};

			fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(requestBody),
			})
				.then((response) => response.json())
				.then((data) => {
					if (data.success === 1) {
						console.log('Заказ успешно размещен');
						setPopUp(true);
						resetPhoneNumberInput();
						resetCart();
						setIsValidPhone(true);
					} else {
						console.error(
							'Не удалось разместить заказ:',
							data.error
						);
					}
				})
				.catch((error) => {
					console.error('Ошибка в ращмещении заказа:', error);
				});
		}
	}
	function runPopUp() {
		if (popUp) {
			return (
				<div className="pop-up">
					<h1>Ваш заказ успешно размещен!</h1>
					<button onClick={() => setPopUp(false)}>
						Вернуться в магазин
					</button>
				</div>
			);
		}
		return null;
	}

	function cart() {
		return (
			<>
				{cartArray.map((item) => (
					<div key={item.id} className="cart-item">
						<p>{item.title}</p>
						<span>x{item.quantity}</span>
						<span>{item.price * item.quantity}</span>
					</div>
				))}
			</>
		);
	}

	return (
		<>
			<div className="cart-section">
				<div className="cart-container">
					<h1>Добавленные товары:</h1>
					<div className="cart-items">{cart()}</div>
					{checkOut()}
					{runPopUp()}
				</div>
			</div>
			<div className="items-section">
				{items.map((item, index) => (
					<div key={index} className="item-card">
						<img src={item.image_url} alt="item image" />
						<h1>Товар {index + 1}</h1>
						<p className="description">{item.description}</p>
						<span className="price">
							Цена: {item.price}&#x20bd;
						</span>

						{cartArray.map((cartItem) => {
							if (cartItem.id === item.id) {
								return (
									<div
										key={cartItem.id}
										className="more-less-buttons"
									>
										<button
											onClick={() =>
												decrementItemQuantity(
													cartItem.id
												)
											}
										>
											-
										</button>
										<input
											className="quantity"
											value={String(cartItem.quantity)}
											onChange={(e) => {
												manualQuantityInput(
													e,
													cartItem.id
												);
											}}
										/>

										<button
											onClick={() => addItemToCart(item)}
										>
											+
										</button>
									</div>
								);
							}
						})}
						{!cartArray.some(
							(cartItem) => cartItem.id === item.id
						) && (
							<button
								id="buy-button"
								onClick={() => {
									updateItemBuyState(item.id, true);
									addItemToCart(item);
									console.log(cartArray);
								}}
							>
								Купить
							</button>
						)}

						<div ref={lastItemRef} id="loader"></div>
					</div>
				))}
			</div>
		</>
	);
}

export default RenderItems;
