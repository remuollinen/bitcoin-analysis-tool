import "./App.css";
import React, { Component } from "react";
import Numeral from "react-numeral";

export default class App extends Component {
	state = {
		from: "",
		to: "",
		bearish: "",
		volumeData: [],
		highestDay: "",
		buyAndSell: [],
	};

	getBitcoinData = (e) => {
		e.preventDefault();
		fetch(
			`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=eur&from=${
				this.state.from - 2 * 3600 // this returns the first data of the day i.e. Wed Dec 01 2021 00:02:00 GMT+0200 if the input is Dec 1st 2021
			}&to=${this.state.to}`
		)
			.then((res) => res.json())
			.then((data) => {
				// longest bearish trend
				let differenceInDays = (this.state.to - this.state.from) / 3600 / 24; // difference between given inputs
				let priceArray = [];
				let dayAndPriceArray = [];
				data.prices.forEach((item) => {
					if (differenceInDays <= 90 && new Date(item[0]).getHours() === 0) {
						priceArray.push(item[1]);
						dayAndPriceArray.push({ day: item[0], price: item[1] });
					} else if (differenceInDays > 90) {
						priceArray.push(item[1]);
						dayAndPriceArray.push({ day: item[0], price: item[1] });
					}
				});
				this.calculateBearishTrend(priceArray);

				// highest volume
				this.getHighestVolumeDay(data.total_volumes);

				// buy and sell dates (time machine)
				this.maximizeProfits(dayAndPriceArray);
			});
	};

	calculateBearishTrend = (array) => {
		let stack = [];
		let record = [];
		stack.push(array[0]);
		for (let i = 1; i < array.length; i++) {
			if (array[i] < array[i - 1]) {
				stack.push(array[i]);
				if (record.length === 0 || record.length < stack.length) {
					record = stack;
				}
			} else {
				stack = [];
				stack.push(array[i]);
			}
		}
		this.setState({
			bearish: record.length - 1,
		});
	};

	getHighestVolumeDay = (array) => {
		let sortedData = array.sort((a, b) => b[1] - a[1]); // sorts the data in desc order
		let highestVolumeDay = new Date(sortedData[1][0]).toDateString(); // converts date from UNIX to readable date
		this.setState({
			volumeData: sortedData[0], // sets highest volume data (includes timestamp and volume)
			highestDay: highestVolumeDay, // sets the date of the highest volume
		});
	};

	maximizeProfits = (array) => {
		let buyDate;
		let sellDate;
		// store a pair of days
		let dates = [];
		// store maximum profit
		let maxProfit = 0;
		for (let i = 0; i < array.length; i++) {
			let buyingPrice = array[i].price;
			for (let j = i + 1; j < array.length; j++) {
				let sellingPrice = array[j].price;
				if (sellingPrice > buyingPrice) {
					let profit = sellingPrice - buyingPrice;
					if (profit > maxProfit) {
						maxProfit = profit;
						dates = [];
						// convert UNIX timestamps to readable dates
						buyDate = new Date(array[i].day).toDateString();
						sellDate = new Date(array[j].day).toDateString();
						dates.push(buyDate, sellDate);
					}
				}
			}
		}
		if (dates.length > 0) {
			this.setState({
				buyAndSell: dates,
			});
		} else {
			this.setState({
				buyAndSell: ["Don't buy", "Or sell"],
			});
		}
	};

	dateHandler = (e) => {
		// checks which input is triggered and coverts the date to UNIX code to use when fetching bitcoin data from API
		if (e.target.id === "fromDate") {
			this.setState({
				from: Date.parse(e.target.value) / 1000,
			});
		} else if (e.target.id === "toDate") {
			this.setState({
				to: Date.parse(e.target.value) / 1000,
			});
		}
	};

	render() {
		return (
			<div className="app">
				<h1> Help Scrooge McDuck to invest in Bitcoin!</h1>
				<p>
					Select your date range from the inputs below and get analytics from
					the market data.
				</p>
				<form>
					<label htmlFor="fromDate">
						From:{" "}
						<input
							type="date"
							id="fromDate"
							required
							onChange={this.dateHandler}
						/>
					</label>
					<label htmlFor="toDate">
						To:{" "}
						<input
							type="date"
							id="toDate"
							required
							onChange={this.dateHandler}
						/>
					</label>
					<button type="submit" onClick={this.getBitcoinData}>
						Get data
					</button>
				</form>
				<div className="result-container">
					<div className="result-card">
						<h2>Longest bearish trend</h2>
						<div className="result">
							<h3>Days in a row</h3>
							<span>{this.state.bearish} days</span>
						</div>
					</div>
					<div className="result-card">
						<h2>Highest volume</h2>
						<div className="result">
							<h3>Highest Volume Day</h3>
							<span>{this.state.highestDay || "-"}</span>
							<h3>Volume in euros (€)</h3>
							<span>
								{
									<Numeral
										value={this.state.volumeData?.[1]}
										format={"(0,00)"}
									/>
								}
								€
							</span>
						</div>
					</div>
					<div className="result-card">
						<h2>Buy & Sell</h2>
						<div className="result">
							<h3>Buy</h3>
							<span>
								{this.state.buyAndSell.length > 0
									? this.state.buyAndSell[0]
									: "-"}
							</span>
							<h3>Sell</h3>
							<span>
								{this.state.buyAndSell.length > 0
									? this.state.buyAndSell[1]
									: "-"}
							</span>
						</div>
					</div>
				</div>
				<footer>
					<a
						href="https://github.com/remuollinen/bitcoin-analysis-tool"
						target="_blank"
						rel="noreferrer"
					>
						Link to GitHub repo
					</a>
					<p>
						<small>Copyright &copy; Remu Ollinen 2021</small>
					</p>
				</footer>
			</div>
		);
	}
}
