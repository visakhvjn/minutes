import { Injectable } from "@nestjs/common";
import Config from "./config/constants";

@Injectable()
export class FCMService
{
	async send(title: string, message: string)
	{
		var FCM = require('fcm-node');
		let serverKey = Config.fcm.server.key;
		let fcm = new FCM(serverKey);		

		console.log(fcm);

		var sample = 
		{
			to: "/topics/news",
			collapse_key: "minute_group",	
			data: 
			{
				click_action:"FLUTTER_NOTIFICATION_CLICK"
			},
			notification: 
			{
				title: title,
				body: message
			}
		};

		fcm.send(sample, function(err, response)
		{
			if (err) 
			{
				console.log(err);
			} 
			else 
			{
				console.log("Successfully sent with response: ", response);
			}
		});
	}	
}