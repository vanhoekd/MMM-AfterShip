# MMM-AfterShip

This is a module for the [MagicMirror²](https://github.com/MichMich/MagicMirror/).

It displays all parcels from your AfterShip account.

This module is based on the AfterShip.com API <https://docs.aftership.com/api/4/overview>


## Example

![AfterShip](https://github.com/vanhoekd/MMM-AfterShip/blob/master/MMM-AfterShip.PNG)

### Installation

Navigate into your MagicMirror's modules folder:

```shell
cd ~/MagicMirror/modules
```
Clone this repository:
```shell
git clone https://github.com/vanhoekd/MMM-AfterShip
```
Configure the module in your config.js file.


## Using the module

To use this module, add the following configuration block to the modules array in the `config/config.js` file:
```js
modules: [
	{
		module: 'MMM-AfterShip',
		position: 'bottom_left',
			header: 'Tracking',
			config: {
				api_key: 'your key',
				maximumEntries: '15',
				show_delivered: 0,
				critical_time: 15,
			}
	},
]
```

## Configuration options

| Option           | Description
|----------------- |-----------
| `api_key`        | *Required* Your personal API key, which can be found here: <https://docs.aftership.com/api/4/overview>
| `maximumEntries `        | *Optional* Maximum number of entries in list <br><br>**Type:** `int` <br>Default 5
| `show_delivered`        | *Optional* Decides, if the deliviered parcels will be shown. 1 -> show the delivered parcels <br><br>**Type:** `bool` <br>Default 0
| `critical_time`        | *Optional* After this amount of days, the parcel will be highlighted in red if not delivered. Zero will disable the highlighting <br><br>**Type:** `int` <br>Default 0

## Dependencies

This module uses the <https://api.aftership.com/v4/trackings> API Which is free for normal usage.

## Troubleshooting

I try to maintain this module in best effort. If there is any Problem, please write a detailed description into this forum and i will try to look into it as soon as possible: <https://forum.magicmirror.builders/topic/6342/mmm-swissstationboard>
