import "./App.css";
import React, { Component } from "react";
import Numeral from "react-numeral";

export default class App extends Component {
	state = {
		from: "",
		to: "",
		data: [],
		highest: "",
	};

	getBitcoinData = (e) => {
		e.preventDefault();
		fetch(
			`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=eur&from=${
				this.state.from - 2 * 3600 // this returns the first data of the day i.e. Wed Dec 01 2021 00:02:00 GMT+0200 in the input is Dec 1st 2021
			}&to=${this.state.to}`
		)
			.then((res) => res.json())
			.then((data) => {
				let sortedData = data.total_volumes.sort((a, b) => b[1] - a[1]); // sorts the data in desc order
				console.log(sortedData[0]);
				let highestVolumeDay = new Date(sortedData[1][0]); // converts date from UNIX to readable date
				this.setState({
					data: sortedData[0], // sets highest volume data
					highest: highestVolumeDay, // sets the date of the highest volume
				});
			});
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
				<form>
					<h2>Select a date range</h2>
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
				<div>
					<h3>
						The day with the highest volume:{" "}
						<span>
							{this.state.highest.toLocaleString("en-GB", {
								weekday: "long",
								day: "numeric",
								month: "long",
								year: "numeric",
							})}
						</span>
					</h3>
					<h3>
						Volume on that day in euros (€):
						<span>
							{<Numeral value={this.state.data[1]} format={"(0,00)"} />} €
						</span>
					</h3>
				</div>
			</div>
		);
	}
}
