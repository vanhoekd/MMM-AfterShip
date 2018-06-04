/* global Module */

/* Magic Mirror
 * Module: MMM-AfterShip
 *
 * By vanhoekd
 * 
 *
 * MIT Licensed.
 */

Module.register("MMM-AfterShip",{
	// Define module defaults
	defaults: {
		updateInterval: 2 * 60 * 1000, // Update every 2 minutes.
		animationSpeed: 2000,
		fade: true,
		fadePoint: 0.25, // Start on 1/4th of the list.
        initialLoadDelay: 0, // start delay seconds.
		
        domRefresh: 1000 * 30, // Refresh Dom each 30 s
		
        apiBase: 'https://api.aftership.com/v4/trackings',
        api_key: '',
		maximumEntries: 5,
		critical_time: 0,
		show_delivered: 0,
	},
	
	requiresVersion: "2.1.0", // Required version of MagicMirror

	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);

		// Set locale.
		moment.locale(config.language);

        this.shipments = [];
		this.loaded = false;
		this.scheduleUpdate(this.config.initialLoadDelay);

		// Update DOM seperatly and not only on schedule Update
		var self = this;
		setInterval(function() {
			self.updateDom(this.config.animationSpeed);
		}, this.config.domRefresh);

		this.updateTimer = null;

	},   
	
	// Define required scripts.
	getStyles: function() {
		return ["MMM-AfterShip.css", "font-awesome.css"];
	},

	// Define required scripts.
	getScripts: function() {
		return ["moment.js"];
	}, 
    
	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");

		var currentTime = moment();
		
		if (!this.config.api_key) {
			wrapper.innerHTML = "Invalid api key";
			wrapper.className = "dimmed light small";
			return wrapper;
		}
		
		
		
		if (!this.loaded) {
			wrapper.innerHTML = "Loading parcels ...";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (this.message) {
			wrapper.innerHTML = this.message;
			wrapper.className = "dimmed light small";
			return wrapper;
		}
		
		var table = document.createElement("table");
		table.className = "small";
		var displayedParcels = 0;
		var row_header = document.createElement("tr");
		table.appendChild(row_header);
		var nameCell = document.createElement("th");
		nameCell.className = "Name";
		nameCell.innerHTML = "Parcel";
		row_header.appendChild(nameCell);
		
		var statusCell = document.createElement("th");
		statusCell.className = "Status";
		statusCell.innerHTML = "Status";
		row_header.appendChild(statusCell);
		
		var timeCell = document.createElement("th");
		timeCell.className = "Time";
		timeCell.innerHTML = "Days";
		row_header.appendChild(timeCell);
		
		var deliveryCell = document.createElement("th");
		deliveryCell.className = "delivery";
		deliveryCell.innerHTML = "Expected";
		row_header.appendChild(deliveryCell);
		
		var messageCell = document.createElement("th");
		messageCell.className = "message";
		messageCell.innerHTML = "Last Checkpoint";
		row_header.appendChild(messageCell);
		
		for (var t in this.shipments) {
			var shipments = this.shipments[t];
			
		
			
			displayedParcels++;
			if (displayedParcels > this.config.maximumEntries){
				break;
			}
			var row = document.createElement("tr");
			table.appendChild(row);
			
			// Time
			

			var nameCell2 = document.createElement("td");
			nameCell2.className = "name2";
			nameCell2.innerHTML = shipments.name + ' ';
			row.appendChild(nameCell2);

			
			var statusCell2 = document.createElement("td");
			statusCell2.className = "status2";
			statusCell2.innerHTML =shipments.status;
			row.appendChild(statusCell2);
			
			/* var historyCell2 = document.createElement("td");
			depCell.className = "align-center history2";
			depCell.innerHTML =shipments.history[0].message;
			row.appendChild(historyCell2); */
			
			var timeCell2 = document.createElement("td");
			timeCell2.className = "time2";
			if (this.config.critical_time > 0){
				if (shipments.days > this.config.critical_time){
					if (shipments.status != 'Delivered'){
						timeCell2.className = "red time2";
					}
				}
			}
			timeCell2.innerHTML =shipments.days;
			row.appendChild(timeCell2);
			
			var expectedCell2 = document.createElement("td");
			expectedCell2.className = "expected2";
			expectedCell2.innerHTML =shipments.expected_delivery;
			row.appendChild(expectedCell2);
			
			var messageCell = document.createElement("td");
			messageCell.className = "expected2";
			messageCell.innerHTML =shipments.message;
			row.appendChild(messageCell);
		}

		return table;
	},

	/* getData(compliments)
	 * Calls processData on succesfull response.
	 */
	getData: function() {
		var url = this.config.apiBase + this.getParams();
		var self = this;
		var retry = true;
		

		var shipRequest = new XMLHttpRequest();
		shipRequest.open("GET", url, true);
                shipRequest.setRequestHeader("aftership-api-key",this.config.api_key);
                shipRequest.setRequestHeader("Content-Type","application/json");
		shipRequest.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status === 200) {
					self.processData(JSON.parse(this.response));
				} else if (this.status === 401) {
					self.config.station = "";
					self.updateDom(self.config.animationSpeed);

					Log.error(self.name + ": Incorrect what so ever...");
					retry = false;
				} else {
					Log.error(self.name + ": Could not load shipments.");
				}

				if (retry) {
					self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
				}
			}
		};
		shipRequest.send();
	},

	/* getParams(compliments)
	 * Generates an url with api parameters based on the config.
	 *
	 * return String - URL params.
	 */
	getParams: function() {
		var params = "?lang=en"
		return params;
	},

	/* processData(data)
	 * Uses the received data to set the various values.
	 *
	 *
	 */
	processData: function(data) {
		this.shipments = [];
		this.message = "";
		if ('trackings' in data.data) {
			for (var i = 0, count = data.data.trackings.length; i < count; i++) {
				var shipments = data.data.trackings[i];

				if('title' in shipments && 'tag' in shipments) {
					if (this.config.show_delivered != 1){
						if (shipments.tag == 'Delivered'){
							continue;						
						}
					}
					var parcel = {
						name: shipments.title,
						status: shipments.tag,
						history: shipments.checkpoints,
						number: shipments.tracking_number,
						carrier: shipments.slug,
						days: shipments.delivery_time,
						expected_delivery: shipments.expected_delivery,
						message:''
					};
					if (typeof parcel.number == null){
						parcel.number = '';
					}
					if (typeof parcel.carrier == null){
						parcel.carrier = '';
					}
					if (typeof parcel.days == null){
						parcel.days = '';
					}
					if (parcel.expected_delivery == null){
						parcel.expected_delivery = '';
					} else {
						parcel.expected_delivery = moment(parcel.expected_delivery).format("DD.MMM");
					}
					if (parcel.history != null){
						
						parcel.message = parcel.history[parcel.history.length -1].message;
						
					}
					this.shipments.push(parcel);
				}
			}
		}
		else {
			this.message = data.messages[0];
		}	

		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
	},

	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update. If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}

		var self = this;
		clearTimeout(this.updateTimer);
		this.updateTimer = setTimeout(function() {
			self.getData();
		}, nextLoad);
	},
});
